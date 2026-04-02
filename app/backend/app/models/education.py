from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=True)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, overdue
    priority = Column(String(20), default="medium")  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="assignments")


class StudyMaterial(Base):
    __tablename__ = "study_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source_type = Column(String(50), default="text")  # text, pdf, url
    file_path = Column(String(500), nullable=True)
    subject = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="study_materials")
    flashcards = relationship("Flashcard", back_populates="study_material", cascade="all, delete-orphan")
    cheatsheets = relationship("Cheatsheet", back_populates="study_material", cascade="all, delete-orphan")
    summaries = relationship("GeneratedSummary", back_populates="study_material", cascade="all, delete-orphan")
    mock_tests = relationship("MockTest", back_populates="study_material", cascade="all, delete-orphan")


class Flashcard(Base):
    __tablename__ = "flashcards"
    
    id = Column(Integer, primary_key=True, index=True)
    study_material_id = Column(Integer, ForeignKey("study_materials.id"), nullable=False)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    study_material = relationship("StudyMaterial", back_populates="flashcards")


class Cheatsheet(Base):
    __tablename__ = "cheatsheets"
    
    id = Column(Integer, primary_key=True, index=True)
    study_material_id = Column(Integer, ForeignKey("study_materials.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    key_points = Column(JSON, nullable=True)
    formulas = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    study_material = relationship("StudyMaterial", back_populates="cheatsheets")


class GeneratedSummary(Base):
    __tablename__ = "generated_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    study_material_id = Column(Integer, ForeignKey("study_materials.id"), nullable=False)
    summary = Column(Text, nullable=False)
    key_takeaways = Column(JSON, nullable=True)
    reading_time_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    study_material = relationship("StudyMaterial", back_populates="summaries")


class MockTest(Base):
    __tablename__ = "mock_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    study_material_id = Column(Integer, ForeignKey("study_materials.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    time_limit_minutes = Column(Integer, nullable=True)
    total_questions = Column(Integer, default=0)
    difficulty = Column(String(20), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    study_material = relationship("StudyMaterial", back_populates="mock_tests")
    questions = relationship("MockTestQuestion", back_populates="mock_test", cascade="all, delete-orphan")
    attempts = relationship("MockTestAttempt", back_populates="mock_test", cascade="all, delete-orphan")


class MockTestQuestion(Base):
    __tablename__ = "mock_test_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    mock_test_id = Column(Integer, ForeignKey("mock_tests.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice")  # multiple_choice, true_false, short_answer
    options = Column(JSON, nullable=True)  # For multiple choice
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    points = Column(Integer, default=1)
    topic = Column(String(100), nullable=True)
    order_index = Column(Integer, default=0)
    
    # Relationships
    mock_test = relationship("MockTest", back_populates="questions")
    answers = relationship("MockTestAnswer", back_populates="question", cascade="all, delete-orphan")


class MockTestAttempt(Base):
    __tablename__ = "mock_test_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    mock_test_id = Column(Integer, ForeignKey("mock_tests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)
    total_points = Column(Integer, nullable=True)
    earned_points = Column(Integer, nullable=True)
    percentage = Column(Float, nullable=True)
    time_taken_minutes = Column(Integer, nullable=True)
    status = Column(String(50), default="in_progress")  # in_progress, completed, abandoned
    
    # Relationships
    mock_test = relationship("MockTest", back_populates="attempts")
    user = relationship("User", back_populates="mock_test_attempts")
    answers = relationship("MockTestAnswer", back_populates="attempt", cascade="all, delete-orphan")


class MockTestAnswer(Base):
    __tablename__ = "mock_test_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("mock_test_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("mock_test_questions.id"), nullable=False)
    user_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    points_earned = Column(Float, default=0)
    answered_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    attempt = relationship("MockTestAttempt", back_populates="answers")
    question = relationship("MockTestQuestion", back_populates="answers")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(255), nullable=False)
    difficulty = Column(String(20), default="medium")
    total_questions = Column(Integer, default=5)
    current_question_index = Column(Integer, default=0)
    status = Column(String(50), default="in_progress")  # in_progress, completed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    overall_score = Column(Float, nullable=True)
    feedback_summary = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="interview_sessions")
    responses = relationship("InterviewResponse", back_populates="session", cascade="all, delete-orphan")


class InterviewResponse(Base):
    __tablename__ = "interview_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    improved_answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)  # 0-100
    strengths = Column(JSON, nullable=True)
    areas_for_improvement = Column(JSON, nullable=True)
    answered_at = Column(DateTime, nullable=True)
    order_index = Column(Integer, default=0)
    
    # Relationships
    session = relationship("InterviewSession", back_populates="responses")


class WeakTopic(Base):
    __tablename__ = "weak_topics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=True)
    miss_count = Column(Integer, default=1)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    related_material_id = Column(Integer, ForeignKey("study_materials.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="weak_topics")


class TriviaQuestion(Base):
    __tablename__ = "trivia_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # ai_ml, sustainability, general
    difficulty = Column(String(20), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)


class TriviaAttempt(Base):
    __tablename__ = "trivia_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="trivia_attempts")


class TriviaScore(Base):
    __tablename__ = "trivia_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False)
    total_attempts = Column(Integer, default=0)
    total_correct = Column(Integer, default=0)
    high_score = Column(Integer, default=0)
    average_score = Column(Float, default=0)
    last_played_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="trivia_scores")
