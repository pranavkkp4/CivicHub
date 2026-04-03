from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.user import User
from ..routes.auth import get_current_active_user
from ..schemas.email import EducationEmailRequest, EmailSendResponse
from ..services.email_service import (
    EmailDeliveryError,
    EmailServiceUnavailable,
    email_service,
)

router = APIRouter(prefix="/email", tags=["Email"])


@router.post("/send", response_model=EmailSendResponse)
async def send_education_email(
    payload: EducationEmailRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        return await email_service.send_education_email(
            db=db,
            current_user=current_user,
            payload=payload,
        )
    except EmailServiceUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
