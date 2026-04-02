from .user import User, Role, UserRole
from .shared import Notification, ActivityLog, Recommendation, EmailLog
from .education import (
    Assignment, StudyMaterial, Flashcard, Cheatsheet, GeneratedSummary,
    MockTest, MockTestQuestion, MockTestAttempt, MockTestAnswer,
    InterviewSession, InterviewResponse, WeakTopic, TriviaQuestion, 
    TriviaScore, TriviaAttempt
)
from .healthcare import (
    HealthAssessment, RiskPrediction, WorkoutPlan, NutritionPlan,
    SymptomCheck, WellnessRecommendation
)
from .sustainability import (
    SustainabilityLog, SustainabilityEvent, VolunteerSignup, ImpactReport,
    EcoTriviaScore, RecyclingGameAttempt, EcoChallenge
)
from .accessibility import AccessibilityTransform

__all__ = [
    "User", "Role", "UserRole",
    "Notification", "ActivityLog", "Recommendation", "EmailLog",
    "Assignment", "StudyMaterial", "Flashcard", "Cheatsheet", "GeneratedSummary",
    "MockTest", "MockTestQuestion", "MockTestAttempt", "MockTestAnswer",
    "InterviewSession", "InterviewResponse", "WeakTopic", "TriviaQuestion",
    "TriviaScore", "TriviaAttempt",
    "HealthAssessment", "RiskPrediction", "WorkoutPlan", "NutritionPlan",
    "SymptomCheck", "WellnessRecommendation",
    "SustainabilityLog", "SustainabilityEvent", "VolunteerSignup", "ImpactReport",
    "EcoTriviaScore", "RecyclingGameAttempt", "EcoChallenge",
    "AccessibilityTransform"
]
