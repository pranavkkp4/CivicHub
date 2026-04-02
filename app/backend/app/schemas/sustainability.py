from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# Sustainability Log Schemas
class SustainabilityLogBase(BaseModel):
    action_type: str
    category: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    co2_saved_kg: Optional[float] = None
    notes: Optional[str] = None


class SustainabilityLogCreate(SustainabilityLogBase):
    pass


class SustainabilityLogResponse(SustainabilityLogBase):
    id: int
    logged_at: datetime
    
    class Config:
        from_attributes = True


class SustainabilityLogStats(BaseModel):
    total_actions: int
    co2_saved_kg: float
    waste_diverted_kg: float
    water_saved_liters: float
    energy_saved_kwh: float
    breakdown_by_category: Dict[str, Any]


# Event Schemas
class SustainabilityEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str
    location: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    max_participants: Optional[int] = None
    organizer: Optional[str] = None
    contact_info: Optional[str] = None
    image_url: Optional[str] = None


class SustainabilityEventCreate(SustainabilityEventBase):
    pass


class SustainabilityEventResponse(SustainabilityEventBase):
    id: int
    current_participants: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Volunteer Signup Schemas
class VolunteerSignupCreate(BaseModel):
    event_id: int
    notes: Optional[str] = None


class VolunteerSignupResponse(BaseModel):
    id: int
    event_id: int
    status: str
    registered_at: datetime
    event: SustainabilityEventResponse
    
    class Config:
        from_attributes = True


# Impact Report Schemas
class ImpactReportResponse(BaseModel):
    id: int
    report_period: str
    period_start: datetime
    period_end: datetime
    total_actions: int
    co2_saved_kg: float
    waste_diverted_kg: float
    water_saved_liters: float
    energy_saved_kwh: float
    breakdown_by_category: Optional[Dict[str, Any]]
    ai_summary: Optional[str]
    recommendations: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Eco Trivia Schemas
class EcoTriviaQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    explanation: Optional[str]
    difficulty: str


class EcoTriviaSubmit(BaseModel):
    question_id: int
    answer: str


class EcoTriviaResult(BaseModel):
    score: int
    total_questions: int
    correct_answers: int
    streak: int


class EcoTriviaScoreResponse(BaseModel):
    mode: str
    score: int
    total_questions: int
    correct_answers: int
    streak: int
    completed_at: datetime
    
    class Config:
        from_attributes = True


# Recycling Game Schemas
class RecyclingGameStart(BaseModel):
    difficulty: str = "medium"


class RecyclingItem(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None
    category: str  # recyclable, compost, landfill, hazardous


class RecyclingGameSubmit(BaseModel):
    item_id: int
    user_category: str
    time_taken_seconds: int


class RecyclingGameResult(BaseModel):
    score: int
    items_sorted: int
    correct_sorts: int
    accuracy_percentage: float
    time_taken_seconds: int


class RecyclingGameAttemptResponse(BaseModel):
    id: int
    score: int
    items_sorted: int
    correct_sorts: int
    accuracy_percentage: float
    time_taken_seconds: Optional[int]
    completed_at: datetime
    
    class Config:
        from_attributes = True


# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    user_id: int
    user_name: str
    score: int
    rank: int


class LeaderboardResponse(BaseModel):
    category: str  # trivia, recycling, overall
    period: str  # weekly, monthly, all_time
    entries: List[LeaderboardEntry]


# Eco Coach Schemas
class EcoCoachTip(BaseModel):
    category: str
    tip: str
    impact: Optional[str] = None
    difficulty: str = "easy"


class EcoCoachResponse(BaseModel):
    personalized_tip: EcoCoachTip
    challenge_recommendations: List[str]
    based_on_recent_logs: bool
    generated_at: datetime


# Eco Challenge Schemas
class EcoChallengeBase(BaseModel):
    title: str
    description: Optional[str] = None
    challenge_type: str
    difficulty: str = "easy"
    points: int = 10
    target_audience: str = "all"


class EcoChallengeResponse(EcoChallengeBase):
    id: int
    requirements: Optional[Dict[str, Any]]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserChallengeProgress(BaseModel):
    challenge_id: int
    challenge_title: str
    progress_percentage: float
    completed: bool
    points_earned: int
