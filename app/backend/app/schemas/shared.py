from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str = "info"
    link: Optional[str] = None


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    link: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ActivityLogCreate(BaseModel):
    activity_type: str
    action: str
    details: Optional[Dict[str, Any]] = None
    module: str


class ActivityLogResponse(BaseModel):
    id: int
    activity_type: str
    action: str
    details: Optional[Dict[str, Any]]
    module: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class RecommendationCreate(BaseModel):
    title: str
    description: str
    module: str
    priority: str = "medium"
    reason: Optional[str] = None
    action_link: Optional[str] = None


class RecommendationResponse(BaseModel):
    id: int
    title: str
    description: str
    module: str
    priority: str
    status: str
    reason: Optional[str]
    action_link: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RecommendationStatusUpdate(BaseModel):
    status: str  # pending, done, saved, dismissed


class DashboardSummary(BaseModel):
    total_study_materials: int
    total_mock_tests_taken: int
    average_test_score: float
    weak_topics_count: int
    active_workout_plans: int
    active_nutrition_plans: int
    sustainability_actions_this_week: int
    co2_saved_kg: float
    unread_notifications: int
    pending_recommendations: int
