from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..core.database import get_db
from ..routes.auth import get_current_active_user
from ..models.user import User
from ..models.shared import Recommendation
from ..schemas.shared import RecommendationCreate, RecommendationResponse, RecommendationStatusUpdate
from ..services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/", response_model=List[RecommendationResponse])
async def get_recommendations(
    module: str = None,
    status: str = "pending",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's recommendations"""
    query = db.query(Recommendation).filter(Recommendation.user_id == current_user.id)
    
    if module:
        query = query.filter(Recommendation.module == module)
    
    if status:
        query = query.filter(Recommendation.status == status)
    
    recommendations = query.order_by(Recommendation.priority.desc(), Recommendation.created_at.desc()).all()
    return recommendations


@router.post("/generate")
async def generate_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate personalized recommendations for the user"""
    recommendations = await recommendation_service.generate_recommendations(
        user_id=current_user.id,
        db=db
    )
    serialized = [RecommendationResponse.model_validate(rec).model_dump() for rec in recommendations]
    return {"message": f"Generated {len(serialized)} recommendations", "recommendations": serialized}


@router.post("/", response_model=RecommendationResponse)
async def create_recommendation(
    recommendation: RecommendationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a recommendation (for testing/admin)"""
    new_rec = Recommendation(
        user_id=current_user.id,
        title=recommendation.title,
        description=recommendation.description,
        module=recommendation.module,
        priority=recommendation.priority,
        reason=recommendation.reason,
        action_link=recommendation.action_link
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec


@router.put("/{recommendation_id}/status", response_model=RecommendationResponse)
async def update_recommendation_status(
    recommendation_id: int,
    status_update: RecommendationStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update recommendation status"""
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    recommendation.status = status_update.status
    db.commit()
    db.refresh(recommendation)
    return recommendation


@router.delete("/{recommendation_id}")
async def delete_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a recommendation"""
    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    db.delete(recommendation)
    db.commit()
    
    return {"message": "Recommendation deleted"}
