from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class EducationEmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=20000)
    email_type: str = Field(default="education_content", max_length=100)
    source_page: Optional[str] = Field(default=None, max_length=100)

    @field_validator("subject", "content", "email_type", "source_page", mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("content")
    @classmethod
    def ensure_content_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("content cannot be empty")
        return value


class EmailSendResponse(BaseModel):
    log_id: int
    status: Literal["sent"]
    recipient_email: EmailStr
    subject: str
    provider: str = "resend"
    message_id: Optional[str] = None
    detail: str
