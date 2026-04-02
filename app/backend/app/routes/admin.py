from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from datetime import datetime, timedelta

from ..core.database import get_db
from ..routes.auth import get_current_active_user, require_role
from ..models.user import User
from ..models.education import StudyMaterial, MockTestAttempt
from ..models.sustainability import SustainabilityLog
from ..models.shared import Notification, Recommendation, EmailLog

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
async def get_admin_overview(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Get admin dashboard overview"""
    # User stats
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # New users this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_this_week = db.query(User).filter(User.created_at >= week_ago).count()
    
    # Content stats
    total_study_materials = db.query(StudyMaterial).count()
    total_mock_tests = db.query(MockTestAttempt).count()
    
    # Sustainability stats
    total_sustainability_logs = db.query(SustainabilityLog).count()
    total_co2_saved = db.query(func.sum(SustainabilityLog.co2_saved_kg)).scalar() or 0
    
    # Engagement stats
    total_notifications = db.query(Notification).count()
    total_recommendations = db.query(Recommendation).count()
    total_emails_sent = db.query(EmailLog).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "new_this_week": new_users_this_week
        },
        "content": {
            "study_materials": total_study_materials,
            "mock_tests_taken": total_mock_tests
        },
        "sustainability": {
            "total_actions": total_sustainability_logs,
            "co2_saved_kg": round(total_co2_saved, 2)
        },
        "engagement": {
            "notifications": total_notifications,
            "recommendations": total_recommendations,
            "emails_sent": total_emails_sent
        }
    }


@router.get("/analytics")
async def get_admin_analytics(
    period: str = "month",
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Get detailed analytics"""
    # Determine time range
    if period == "week":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif period == "month":
        start_date = datetime.utcnow() - timedelta(days=30)
    elif period == "year":
        start_date = datetime.utcnow() - timedelta(days=365)
    else:
        start_date = datetime.utcnow() - timedelta(days=30)
    
    # Module usage (based on activity logs - simplified)
    module_usage = {
        "education": db.query(StudyMaterial).filter(StudyMaterial.created_at >= start_date).count(),
        "healthcare": db.query(User).filter(User.created_at >= start_date).count(),  # Placeholder
        "sustainability": db.query(SustainabilityLog).filter(SustainabilityLog.logged_at >= start_date).count(),
        "accessibility": 0  # Would need proper tracking
    }
    
    # User growth over time
    user_growth = []
    for i in range(7):
        day_start = start_date + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        count = db.query(User).filter(
            User.created_at >= day_start,
            User.created_at < day_end
        ).count()
        user_growth.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "new_users": count
        })
    
    # Most active users
    active_users = db.query(
        User.id,
        User.email,
        User.first_name,
        func.count(StudyMaterial.id).label("material_count")
    ).outerjoin(StudyMaterial).group_by(User.id).order_by(func.count(StudyMaterial.id).desc()).limit(10).all()
    
    return {
        "period": period,
        "module_usage": module_usage,
        "user_growth": user_growth,
        "top_active_users": [
            {
                "id": user.id,
                "email": user.email,
                "name": user.first_name or "Unknown",
                "activity_score": user.material_count
            }
            for user in active_users
        ]
    }


@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "created_at": user.created_at,
            "last_login": user.last_login
        }
        for user in users
    ]


@router.post("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Toggle user active status"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}
