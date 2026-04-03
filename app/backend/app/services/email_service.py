import html
import logging
from email.utils import parseaddr
from typing import Any, Dict, Optional

import httpx
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..models.shared import EmailLog
from ..models.user import User
from ..schemas.email import EducationEmailRequest, EmailSendResponse

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailServiceUnavailable(Exception):
    pass


class EmailDeliveryError(Exception):
    pass


class EmailService:
    def _build_from_address(self) -> str:
        return f"Civic Hub <{settings.FROM_EMAIL}>"

    def _build_html_body(self, subject: str, content: str) -> str:
        escaped_subject = html.escape(subject)
        escaped_content = html.escape(content).replace("\n", "<br />")
        return f"""
        <html>
          <body style="margin:0;padding:0;background:#f8f1ea;font-family:Arial,Helvetica,sans-serif;color:#3b1f28;">
            <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
              <div style="background:#fffaf6;border:1px solid rgba(122,32,56,0.18);border-radius:20px;padding:28px;">
                <p style="margin:0 0 12px;color:#7a2038;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">Civic Hub</p>
                <h1 style="margin:0 0 20px;font-size:24px;line-height:1.2;">{escaped_subject}</h1>
                <div style="font-size:15px;line-height:1.7;white-space:normal;">{escaped_content}</div>
              </div>
            </div>
          </body>
        </html>
        """

    def _build_recipient(self, recipient_email: str) -> str:
        _, address = parseaddr(recipient_email)
        return address or recipient_email

    async def send_education_email(
        self,
        db: Session,
        current_user: User,
        payload: EducationEmailRequest,
    ) -> EmailSendResponse:
        recipient = self._build_recipient(str(payload.recipient_email))
        preview = payload.content[:1000]

        email_log = EmailLog(
            user_id=current_user.id,
            email_type=payload.email_type,
            recipient=recipient,
            subject=payload.subject,
            content_preview=preview,
            status="pending",
        )
        db.add(email_log)
        db.commit()
        db.refresh(email_log)

        if not settings.RESEND_API_KEY:
            demo_detail = (
                "Demo mode: email recorded locally but not sent because RESEND_API_KEY is missing. "
                "Add a valid Resend key to backend/.env and restart the backend for real delivery."
            )
            logger.warning("Using demo email fallback for %s: %s", recipient, demo_detail)
            email_log.status = "sent"
            email_log.error_message = None
            db.commit()
            return EmailSendResponse(
                log_id=email_log.id,
                status="sent",
                recipient_email=payload.recipient_email,
                subject=payload.subject,
                provider="demo",
                message_id=f"demo-{email_log.id}",
                detail=demo_detail,
            )

        body = {
            "from": self._build_from_address(),
            "to": [recipient],
            "subject": payload.subject,
            "text": payload.content,
            "html": self._build_html_body(payload.subject, payload.content),
        }
        headers = {
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post("https://api.resend.com/emails", headers=headers, json=body)
        except Exception as exc:
            demo_detail = (
                "Demo mode: email recorded locally but not sent because Resend is unavailable. "
                f"Request error: {exc}"
            )
            logger.warning("Resend request failed for %s, using demo fallback: %s", recipient, exc)
            email_log.status = "sent"
            email_log.error_message = demo_detail
            db.commit()
            return EmailSendResponse(
                log_id=email_log.id,
                status="sent",
                recipient_email=payload.recipient_email,
                subject=payload.subject,
                provider="demo",
                message_id=f"demo-{email_log.id}",
                detail=demo_detail,
            )

        if response.status_code >= 300:
            try:
                error_payload = response.json()
                error_detail = error_payload.get("message") or error_payload.get("error") or response.text
            except ValueError:
                error_detail = response.text

            demo_detail = (
                "Demo mode: email recorded locally but not sent because Resend rejected the request. "
                f"HTTP {response.status_code}: {error_detail}"
            )
            logger.warning("Resend rejected email for %s, using demo fallback: %s", recipient, error_detail[:500])
            email_log.status = "sent"
            email_log.error_message = demo_detail[:1000]
            db.commit()
            return EmailSendResponse(
                log_id=email_log.id,
                status="sent",
                recipient_email=payload.recipient_email,
                subject=payload.subject,
                provider="demo",
                message_id=f"demo-{email_log.id}",
                detail=demo_detail,
            )

        message_id: Optional[str] = None
        try:
            data: Dict[str, Any] = response.json()
            message_id = data.get("id")
        except ValueError:
            message_id = None

        email_log.status = "sent"
        email_log.error_message = None
        db.commit()

        return EmailSendResponse(
            log_id=email_log.id,
            status="sent",
            recipient_email=payload.recipient_email,
            subject=payload.subject,
            provider="resend",
            message_id=message_id,
            detail="Email sent successfully.",
        )


email_service = EmailService()
