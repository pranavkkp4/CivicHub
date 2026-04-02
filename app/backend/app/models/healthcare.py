from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class HealthAssessment(Base):
    __tablename__ = "health_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    activity_level = Column(String(50), nullable=True)  # sedentary, light, moderate, active, very_active
    smoking_status = Column(String(50), nullable=True)
    alcohol_consumption = Column(String(50), nullable=True)
    medical_conditions = Column(JSON, nullable=True)
    family_history = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="health_assessments")
    risk_predictions = relationship("RiskPrediction", back_populates="assessment", cascade="all, delete-orphan")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("health_assessments.id"), nullable=False)
    risk_type = Column(String(100), nullable=False)  # cardiovascular, diabetes, etc.
    risk_level = Column(String(50), nullable=False)  # low, moderate, high
    risk_score = Column(Float, nullable=True)  # 0-100
    factors = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    disclaimer = Column(Text, default="This is not a medical diagnosis. Please consult a healthcare professional.")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    assessment = relationship("HealthAssessment", back_populates="risk_predictions")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    goal = Column(String(100), nullable=False)  # weight_loss, muscle_gain, endurance, flexibility, general
    fitness_level = Column(String(50), nullable=False)  # beginner, intermediate, advanced
    days_per_week = Column(Integer, default=3)
    time_per_session_minutes = Column(Integer, default=30)
    equipment_available = Column(JSON, nullable=True)
    injuries_or_limitations = Column(Text, nullable=True)
    plan_content = Column(JSON, nullable=False)  # Structured workout plan
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="workout_plans")


class NutritionPlan(Base):
    __tablename__ = "nutrition_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    goal = Column(String(100), nullable=False)  # weight_loss, muscle_gain, maintenance, health
    diet_type = Column(String(50), nullable=True)  # omnivore, vegetarian, vegan, keto, paleo, etc.
    allergies = Column(JSON, nullable=True)
    meals_per_day = Column(Integer, default=3)
    cooking_time_available = Column(String(50), nullable=True)  # minimal, moderate, extensive
    calorie_target = Column(Integer, nullable=True)
    macro_targets = Column(JSON, nullable=True)  # protein, carbs, fat percentages
    plan_content = Column(JSON, nullable=False)  # Structured meal plan
    shopping_list = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="nutrition_plans")


class SymptomCheck(Base):
    __tablename__ = "symptom_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symptoms = Column(JSON, nullable=False)
    duration = Column(String(100), nullable=True)
    severity = Column(String(50), nullable=True)  # mild, moderate, severe
    ai_guidance = Column(Text, nullable=True)
    self_care_suggestions = Column(JSON, nullable=True)
    red_flags = Column(JSON, nullable=True)
    disclaimer = Column(Text, default="This is not medical advice. Consult a healthcare professional for proper diagnosis.")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="symptom_checks")


class WellnessRecommendation(Base):
    __tablename__ = "wellness_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False)  # hydration, sleep, movement, stress, nutrition
    recommendation = Column(Text, nullable=False)
    priority = Column(String(20), default="medium")
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="wellness_recommendations")
