from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class SustainabilityLog(Base):
    __tablename__ = "sustainability_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(100), nullable=False)  # recycling, composting, energy_saving, water_saving, etc.
    category = Column(String(50), nullable=False)  # waste, energy, water, transportation, food
    quantity = Column(Float, nullable=True)  # Amount (kg, liters, kWh, etc.)
    unit = Column(String(50), nullable=True)
    co2_saved_kg = Column(Float, nullable=True)  # Estimated CO2 savings
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="sustainability_logs")


class SustainabilityEvent(Base):
    __tablename__ = "sustainability_events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String(100), nullable=False)  # cleanup, workshop, tree_planting, etc.
    location = Column(String(500), nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    max_participants = Column(Integer, nullable=True)
    current_participants = Column(Integer, default=0)
    organizer = Column(String(255), nullable=True)
    contact_info = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    signups = relationship("VolunteerSignup", back_populates="event", cascade="all, delete-orphan")


class VolunteerSignup(Base):
    __tablename__ = "volunteer_signups"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("sustainability_events.id"), nullable=False)
    status = Column(String(50), default="registered")  # registered, attended, cancelled, no_show
    notes = Column(Text, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="volunteer_signups")
    event = relationship("SustainabilityEvent", back_populates="signups")


class ImpactReport(Base):
    __tablename__ = "impact_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_period = Column(String(50), nullable=False)  # weekly, monthly, yearly
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    total_actions = Column(Integer, default=0)
    co2_saved_kg = Column(Float, default=0)
    waste_diverted_kg = Column(Float, default=0)
    water_saved_liters = Column(Float, default=0)
    energy_saved_kwh = Column(Float, default=0)
    breakdown_by_category = Column(JSON, nullable=True)
    ai_summary = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EcoTriviaScore(Base):
    __tablename__ = "eco_trivia_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mode = Column(String(50), default="normal")  # normal, kids, expert
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="eco_trivia_scores")


class RecyclingGameAttempt(Base):
    __tablename__ = "recycling_game_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, default=0)
    items_sorted = Column(Integer, default=0)
    correct_sorts = Column(Integer, default=0)
    accuracy_percentage = Column(Float, default=0)
    time_taken_seconds = Column(Integer, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="recycling_attempts")


class EcoChallenge(Base):
    __tablename__ = "eco_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    challenge_type = Column(String(100), nullable=False)  # daily, weekly, monthly
    difficulty = Column(String(20), default="easy")  # easy, medium, hard
    points = Column(Integer, default=10)
    requirements = Column(JSON, nullable=True)
    target_audience = Column(String(50), default="all")  # all, kids, families, businesses
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
