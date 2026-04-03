from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


def _read_env_file_values() -> dict[str, str]:
    if not ENV_FILE.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip("'\"")

    return values


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Civic Hub"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/civichub"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # AI APIs
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEYS: str = ""
    GEMINI_API_KEY_2: str = ""
    GEMINI_API_KEY_3: str = ""
    GEMINI_API_KEY_4: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    CLAUDE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    KIMI_API_KEY: str = ""
    KIMI_BASE_URL: str = "https://api.moonshot.cn/v1/chat/completions"
    KIMI_MODEL: str = "moonshot-v1-8k"
    
    # Email
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@civichub.app"
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = str(ENV_FILE)

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

    def get_gemini_api_keys(self) -> list[str]:
        env_values = _read_env_file_values()
        raw_candidates = [
            self.GEMINI_API_KEY,
            self.GEMINI_API_KEY_2,
            self.GEMINI_API_KEY_3,
            self.GEMINI_API_KEY_4,
        ]

        configured_key_list = env_values.get("GEMINI_API_KEYS") or self.GEMINI_API_KEYS
        if configured_key_list:
            raw_candidates.extend(part.strip() for part in configured_key_list.split(","))

        for name, value in env_values.items():
            normalized_name = name.strip().upper().replace("-", "_")
            is_numbered_key = normalized_name.startswith("GEMINI_API_KEY_")
            is_suffix_key = normalized_name.startswith("GEMINI_API_KEY") and normalized_name[len("GEMINI_API_KEY"):].isdigit()
            if normalized_name == "GEMINI_API_KEY" or is_numbered_key or is_suffix_key:
                raw_candidates.append(value)

        ordered_keys: list[str] = []
        for candidate in raw_candidates:
            cleaned = candidate.strip().strip("'\"")
            if cleaned and cleaned not in ordered_keys:
                ordered_keys.append(cleaned)

        return ordered_keys


@lru_cache()
def get_settings() -> Settings:
    return Settings()
