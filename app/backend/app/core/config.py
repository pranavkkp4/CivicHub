from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import field_validator


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Impact OS"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/impactos"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # AI APIs
    GEMINI_API_KEY: str = ""
    CLAUDE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Email
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@impactos.ai"
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def normalize_debug(cls, value):
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "prod", "production", "0", "false", "no"}:
                return False
            if normalized in {"dev", "development", "debug", "1", "true", "yes"}:
                return True
        return value


@lru_cache()
def get_settings() -> Settings:
    return Settings()
