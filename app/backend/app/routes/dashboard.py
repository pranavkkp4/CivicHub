from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..core.database import get_db
from ..routes.auth import get_current_active_user
from ..models.user import User
from ..models.education import StudyMaterial, MockTestAttempt, WeakTopic
from ..models.healthcare import WorkoutPlan, NutritionPlan
from ..models.sustainability import SustainabilityLog
from ..models.shared import Notification, Recommendation
from ..schemas.shared import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get dashboard summary for current user"""
    
    # Education stats
    study_materials_count = db.query(StudyMaterial).filter(
        StudyMaterial.user_id == current_user.id
    ).count()
    
    mock_tests = db.query(MockTestAttempt).filter(
        MockTestAttempt.user_id == current_user.id,
        MockTestAttempt.status == "completed"
    ).all()
    
    avg_test_score = 0
    if mock_tests:
        avg_test_score = sum(t.percentage or 0 for t in mock_tests) / len(mock_tests)
    
    weak_topics_count = db.query(WeakTopic).filter(
        WeakTopic.user_id == current_user.id
    ).count()
    
    # Healthcare stats
    active_workouts = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.is_active == True
    ).count()
    
    active_nutrition = db.query(NutritionPlan).filter(
        NutritionPlan.user_id == current_user.id,
        NutritionPlan.is_active == True
    ).count()
    
    # Sustainability stats - last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    sustainability_actions = db.query(SustainabilityLog).filter(
        SustainabilityLog.user_id == current_user.id,
        SustainabilityLog.logged_at >= week_ago
    ).count()
    
    co2_saved = db.query(func.sum(SustainabilityLog.co2_saved_kg)).filter(
        SustainabilityLog.user_id == current_user.id
    ).scalar() or 0
    
    # Notifications and recommendations
    unread_notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    pending_recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id,
        Recommendation.status == "pending"
    ).count()
    
    return DashboardSummary(
        total_study_materials=study_materials_count,
        total_mock_tests_taken=len(mock_tests),
        average_test_score=round(avg_test_score, 1),
        weak_topics_count=weak_topics_count,
        active_workout_plans=active_workouts,
        active_nutrition_plans=active_nutrition,
        sustainability_actions_this_week=sustainability_actions,
        co2_saved_kg=round(co2_saved, 2),
        unread_notifications=unread_notifications,
        pending_recommendations=pending_recommendations
    )
