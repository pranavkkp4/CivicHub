from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from ..core.database import get_db
from ..routes.auth import get_current_active_user
from ..models.user import User
from ..models.education import StudyMaterial, MockTestAttempt, WeakTopic
from ..models.healthcare import WorkoutPlan, NutritionPlan
from ..models.sustainability import SustainabilityLog
from ..models.shared import ActivityLog
from ..services.agent_service import agent_service

router = APIRouter(prefix="/agents", tags=["AI Agents"])


class AgentRunRequest(BaseModel):
    current_page: Optional[str] = None
    selected_material_id: Optional[int] = None
    content_context: Optional[str] = None


@router.post("/education/run")
async def run_education_agent(
    request: AgentRunRequest | None = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Run the education agent for personalized guidance"""
    request = request or AgentRunRequest()
    selected_material_context = None
    if request.selected_material_id is not None:
        selected_material = db.query(StudyMaterial).filter(
            StudyMaterial.id == request.selected_material_id,
            StudyMaterial.user_id == current_user.id
        ).first()

        if selected_material is not None:
            selected_material_context = {
                "id": selected_material.id,
                "title": selected_material.title,
                "subject": selected_material.subject,
                "source_type": selected_material.source_type,
                "content_preview": selected_material.content[:1200],
            }

    # Gather user context
    study_materials_count = db.query(StudyMaterial).filter(
        StudyMaterial.user_id == current_user.id
    ).count()
    
    weak_topics = db.query(WeakTopic).filter(
        WeakTopic.user_id == current_user.id
    ).order_by(WeakTopic.miss_count.desc()).limit(5).all()
    
    recent_tests = db.query(MockTestAttempt).filter(
        MockTestAttempt.user_id == current_user.id
    ).order_by(MockTestAttempt.started_at.desc()).limit(5).all()
    
    recent_activity = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.module == "education"
    ).order_by(ActivityLog.created_at.desc()).limit(10).all()
    
    user_context = {
        "study_materials_count": study_materials_count,
        "weak_topics": [wt.topic for wt in weak_topics],
        "recent_test_scores": [t.percentage for t in recent_tests if t.percentage],
        "selected_material": selected_material_context,
    }
    
    activity_list = [{"action": a.action, "created_at": a.created_at.isoformat()} for a in recent_activity]
    
    result = await agent_service.run_education_agent(
        user_context=user_context,
        recent_activity=activity_list,
        current_page=request.current_page,
        selected_material_id=request.selected_material_id
    )
    
    return result


@router.post("/wellness/run")
async def run_wellness_agent(
    request: AgentRunRequest | None = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Run the wellness agent for health guidance"""
    request = request or AgentRunRequest()
    # Gather user context
    active_plans = []
    
    workout_plans = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.is_active == True
    ).all()
    
    nutrition_plans = db.query(NutritionPlan).filter(
        NutritionPlan.user_id == current_user.id,
        NutritionPlan.is_active == True
    ).all()
    
    active_plans = [f"Workout: {wp.title}" for wp in workout_plans] + [f"Nutrition: {np.title}" for np in nutrition_plans]
    
    recent_activity = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.module == "healthcare"
    ).order_by(ActivityLog.created_at.desc()).limit(5).all()
    
    user_context = {
        "active_plans": active_plans,
        "wellness_goals": []
    }
    
    activity_list = [{"action": a.action, "created_at": a.created_at.isoformat()} for a in recent_activity]
    
    result = await agent_service.run_wellness_agent(
        user_context=user_context,
        recent_activity=activity_list,
        current_page=request.current_page
    )
    
    return result


@router.post("/sustainability/run")
async def run_sustainability_agent(
    request: AgentRunRequest | None = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Run the sustainability agent for eco guidance"""
    request = request or AgentRunRequest()
    # Gather user context
    from sqlalchemy import func
    
    total_actions = db.query(SustainabilityLog).filter(
        SustainabilityLog.user_id == current_user.id
    ).count()
    
    co2_saved = db.query(func.sum(SustainabilityLog.co2_saved_kg)).filter(
        SustainabilityLog.user_id == current_user.id
    ).scalar() or 0
    
    # Get favorite categories
    category_counts = db.query(
        SustainabilityLog.category,
        func.count(SustainabilityLog.id).label("count")
    ).filter(
        SustainabilityLog.user_id == current_user.id
    ).group_by(SustainabilityLog.category).order_by(func.count(SustainabilityLog.id).desc()).all()
    
    favorite_categories = [cat for cat, _ in category_counts[:3]]
    
    recent_logs = db.query(SustainabilityLog).filter(
        SustainabilityLog.user_id == current_user.id
    ).order_by(SustainabilityLog.logged_at.desc()).limit(10).all()
    
    user_context = {
        "total_actions": total_actions,
        "co2_saved_kg": co2_saved,
        "favorite_categories": favorite_categories
    }
    
    logs_list = [{"action_type": log.action_type, "quantity": log.quantity, "unit": log.unit} for log in recent_logs]
    
    result = await agent_service.run_sustainability_agent(
        user_context=user_context,
        recent_logs=logs_list,
        current_page=request.current_page
    )
    
    return result


@router.post("/accessibility/run")
async def run_accessibility_agent(
    request: AgentRunRequest | None = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Run the accessibility agent for accessibility guidance"""
    request = request or AgentRunRequest()
    from ..models.accessibility import AccessibilityTransform
    
    # Get recent transforms
    recent_transforms = db.query(AccessibilityTransform).filter(
        AccessibilityTransform.user_id == current_user.id
    ).order_by(AccessibilityTransform.created_at.desc()).limit(10).all()
    
    user_context = {
        "preferred_complexity": "intermediate",
        "preferred_language": "en"
    }
    
    transforms_list = [{"transform_type": t.transform_type, "created_at": t.created_at.isoformat()} for t in recent_transforms]
    
    result = await agent_service.run_accessibility_agent(
        user_context=user_context,
        recent_transforms=transforms_list,
        current_page=request.current_page,
        content_context=request.content_context
    )
    
    return result
