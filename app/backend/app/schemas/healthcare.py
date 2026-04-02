from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Health Assessment Schemas
class HealthAssessmentBase(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    smoking_status: Optional[str] = None
    alcohol_consumption: Optional[str] = None
    medical_conditions: Optional[List[str]] = None
    family_history: Optional[List[str]] = None


class HealthAssessmentCreate(HealthAssessmentBase):
    pass


class HealthAssessmentResponse(HealthAssessmentBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Risk Prediction Schemas
class RiskPredictionResponse(BaseModel):
    id: int
    risk_type: str
    risk_level: str
    risk_score: Optional[float]
    factors: Optional[List[str]]
    recommendations: Optional[List[str]]
    disclaimer: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class RiskAssessmentRequest(BaseModel):
    assessment_data: HealthAssessmentCreate


# Workout Plan Schemas
class WorkoutPlanBase(BaseModel):
    title: str
    goal: str
    fitness_level: str
    days_per_week: int = 3
    time_per_session_minutes: int = 30
    equipment_available: Optional[List[str]] = None
    injuries_or_limitations: Optional[str] = None


class WorkoutPlanCreate(WorkoutPlanBase):
    pass


class WorkoutExercise(BaseModel):
    name: str
    sets: Optional[int] = None
    reps: Optional[str] = None
    duration_minutes: Optional[int] = None
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None


class WorkoutDay(BaseModel):
    day: str
    focus: str
    exercises: List[WorkoutExercise]
    duration_minutes: int


class WorkoutPlanContent(BaseModel):
    description: str
    weekly_schedule: List[WorkoutDay]
    warmup: Optional[str] = None
    cooldown: Optional[str] = None
    tips: Optional[List[str]] = None


class WorkoutPlanResponse(WorkoutPlanBase):
    id: int
    plan_content: WorkoutPlanContent
    notes: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class WorkoutPlanGenerateRequest(BaseModel):
    goal: str
    fitness_level: str
    days_per_week: int
    time_per_session_minutes: int
    equipment_available: List[str]
    injuries_or_limitations: Optional[str] = None


# Nutrition Plan Schemas
class NutritionPlanBase(BaseModel):
    title: str
    goal: str
    diet_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    meals_per_day: int = 3
    cooking_time_available: Optional[str] = None
    calorie_target: Optional[int] = None


class NutritionPlanCreate(NutritionPlanBase):
    pass


class MealItem(BaseModel):
    name: str
    portion: str
    calories: Optional[int] = None
    protein_g: Optional[int] = None
    carbs_g: Optional[int] = None
    fat_g: Optional[int] = None


class Meal(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack
    items: List[MealItem]
    total_calories: Optional[int] = None
    prep_time_minutes: Optional[int] = None


class DailyMealPlan(BaseModel):
    day: str
    meals: List[Meal]
    daily_totals: Optional[Dict[str, int]] = None


class NutritionPlanContent(BaseModel):
    description: str
    daily_plans: List[DailyMealPlan]
    guidelines: Optional[List[str]] = None
    hydration_tips: Optional[str] = None


class ShoppingListItem(BaseModel):
    category: str
    items: List[str]


class NutritionPlanResponse(NutritionPlanBase):
    id: int
    plan_content: NutritionPlanContent
    shopping_list: Optional[List[ShoppingListItem]]
    macro_targets: Optional[Dict[str, int]]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class NutritionPlanGenerateRequest(BaseModel):
    goal: str
    diet_type: Optional[str] = None
    allergies: List[str] = Field(default_factory=list)
    meals_per_day: int = 3
    cooking_time_available: str = "moderate"
    calorie_target: Optional[int] = None


# Symptom Check Schemas
class SymptomCheckRequest(BaseModel):
    symptoms: List[str]
    duration: Optional[str] = None
    severity: Optional[str] = None


class SymptomCheckResponse(BaseModel):
    id: int
    symptoms: List[str]
    duration: Optional[str]
    severity: Optional[str]
    ai_guidance: Optional[str]
    self_care_suggestions: Optional[List[str]]
    red_flags: Optional[List[str]]
    disclaimer: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Wellness Recommendation Schemas
class WellnessRecommendationResponse(BaseModel):
    id: int
    category: str
    recommendation: str
    priority: str
    is_completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class WellnessRecommendationCreate(BaseModel):
    category: str
    recommendation: str
    priority: str = "medium"


class DailyWellnessSummary(BaseModel):
    date: str
    recommendations: List[WellnessRecommendationResponse]
    hydration_reminder: Optional[str]
    sleep_suggestion: Optional[str]
    movement_suggestion: Optional[str]
    stress_suggestion: Optional[str]
