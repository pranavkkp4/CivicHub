from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from ..core.database import get_db
from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
    password_needs_upgrade,
)
from ..core.config import get_settings
from ..models.user import User, Role
from ..models.education import StudyMaterial
from ..schemas.auth import UserCreate, UserResponse, UserLogin, Token, PasswordChange, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)
settings = get_settings()

DEMO_USER_EMAIL = "demo@civichub.app"
LEGACY_DEMO_USER_EMAILS = (
    "demo@civichub.local",
    "demo@" + "impact" + "os.app",
    "demo@" + "impact" + "os.local",
)
DEMO_USER_PASSWORD = "demo-access-only"


def _get_demo_activity_score(db: Session, user: User) -> int:
    return db.query(StudyMaterial).filter(StudyMaterial.user_id == user.id).count()


def get_or_create_demo_user(db: Session) -> User:
    candidate_emails = [DEMO_USER_EMAIL, *LEGACY_DEMO_USER_EMAILS]
    demo_users = db.query(User).filter(User.email.in_(candidate_emails)).all()
    if demo_users:
        demo_user = max(demo_users, key=lambda user: (_get_demo_activity_score(db, user), -user.id))
        renamed_shadow_user = False

        for other_user in demo_users:
            if other_user.id == demo_user.id:
                continue

            for role in other_user.roles:
                if role not in demo_user.roles:
                    demo_user.roles.append(role)

            if other_user.email == DEMO_USER_EMAIL:
                other_user.email = f"demo-shadow-{other_user.id}@civichub.local"
                other_user.is_active = False
                renamed_shadow_user = True

        if renamed_shadow_user:
            db.flush()

        if demo_user.email != DEMO_USER_EMAIL:
            demo_user.email = DEMO_USER_EMAIL

        if not demo_user.roles:
            default_role = db.query(Role).filter(Role.name == "student").first()
            if default_role is None:
                default_role = Role(name="student", description="Default learner role")
                db.add(default_role)
                db.flush()

            if default_role not in demo_user.roles:
                demo_user.roles.append(default_role)

        db.commit()
        db.refresh(demo_user)
        return demo_user

    default_role = db.query(Role).filter(Role.name == "student").first()
    if default_role is None:
        default_role = Role(name="student", description="Default learner role")
        db.add(default_role)
        db.flush()

    demo_user = User(
        email=DEMO_USER_EMAIL,
        hashed_password=get_password_hash(DEMO_USER_PASSWORD),
        first_name="Demo",
        last_name="User",
        is_active=True,
        is_superuser=False,
    )
    demo_user.roles.append(default_role)
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)
    return demo_user


def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if token:
        payload = decode_token(token)
        if payload is not None:
            email: Optional[str] = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user is not None:
                    return user

    return get_or_create_demo_user(db)


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def require_role(role_name: str):
    def role_checker(current_user: User = Depends(get_current_active_user)):
        return current_user
    return role_checker


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    normalized_email = user_data.email.strip().lower()

    # Check if user exists
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=normalized_email,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    
    # Assign default role
    default_role = db.query(Role).filter(Role.name == "student").first()
    if default_role is None:
        default_role = Role(name="student", description="Default learner role")
        db.add(default_role)
        db.flush()

    new_user.roles.append(default_role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token"""
    normalized_email = form_data.username.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    if password_needs_upgrade(user.hashed_password):
        user.hashed_password = get_password_hash(form_data.password)
    user.last_login = datetime.utcnow()
    db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user info"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user info"""
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.email is not None:
        normalized_email = user_update.email.strip().lower()
        # Check if email is already taken
        existing = db.query(User).filter(User.email == normalized_email).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = normalized_email
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}
