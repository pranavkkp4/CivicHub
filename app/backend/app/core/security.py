from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.hash import pbkdf2_sha256

from .config import get_settings

try:
    import bcrypt
except ImportError:  # pragma: no cover - optional compatibility path
    bcrypt = None


settings = get_settings()


def _is_bcrypt_hash(hashed_password: str) -> bool:
    return hashed_password.startswith("$2a$") or hashed_password.startswith("$2b$") or hashed_password.startswith("$2y$")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if _is_bcrypt_hash(hashed_password):
            if bcrypt is None:
                return False
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

        return pbkdf2_sha256.verify(plain_password, hashed_password)
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    return pbkdf2_sha256.hash(password)


def password_needs_upgrade(hashed_password: str) -> bool:
    return _is_bcrypt_hash(hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
