from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

# Association table for many-to-many relationship
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    
    # Education
    study_materials = relationship("StudyMaterial", back_populates="user", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="user", cascade="all, delete-orphan")
    mock_test_attempts = relationship("MockTestAttempt", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    trivia_attempts = relationship("TriviaAttempt", back_populates="user", cascade="all, delete-orphan")
    trivia_scores = relationship("TriviaScore", back_populates="user", cascade="all, delete-orphan")
    weak_topics = relationship("WeakTopic", back_populates="user", cascade="all, delete-orphan")
    
    # Healthcare
    health_assessments = relationship("HealthAssessment", back_populates="user", cascade="all, delete-orphan")
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    nutrition_plans = relationship("NutritionPlan", back_populates="user", cascade="all, delete-orphan")
    symptom_checks = relationship("SymptomCheck", back_populates="user", cascade="all, delete-orphan")
    wellness_recommendations = relationship("WellnessRecommendation", back_populates="user", cascade="all, delete-orphan")
    
    # Sustainability
    sustainability_logs = relationship("SustainabilityLog", back_populates="user", cascade="all, delete-orphan")
    volunteer_signups = relationship("VolunteerSignup", back_populates="user", cascade="all, delete-orphan")
    eco_trivia_scores = relationship("EcoTriviaScore", back_populates="user", cascade="all, delete-orphan")
    recycling_attempts = relationship("RecyclingGameAttempt", back_populates="user", cascade="all, delete-orphan")
    
    # Accessibility
    accessibility_transforms = relationship("AccessibilityTransform", back_populates="user", cascade="all, delete-orphan")


class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")


class UserRole(Base):
    """For teacher/student/admin role management"""
    __tablename__ = "user_role_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_type = Column(String(50), nullable=False)  # student, teacher, admin, parent
    assigned_at = Column(DateTime, default=datetime.utcnow)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
