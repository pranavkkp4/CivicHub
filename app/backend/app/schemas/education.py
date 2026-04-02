from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# Assignment Schemas
class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    priority: Optional[str] = None


class AssignmentResponse(AssignmentBase):
    id: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Study Material Schemas
class StudyMaterialBase(BaseModel):
    title: str
    content: str
    source_type: str = "text"
    subject: Optional[str] = None
    tags: Optional[List[str]] = None


class StudyMaterialCreate(StudyMaterialBase):
    pass


class StudyMaterialResponse(StudyMaterialBase):
    id: int
    file_path: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Flashcard Schemas
class FlashcardBase(BaseModel):
    front: str
    back: str
    difficulty: str = "medium"
    tags: Optional[List[str]] = None


class FlashcardCreate(FlashcardBase):
    pass


class FlashcardResponse(FlashcardBase):
    id: int
    study_material_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class FlashcardGenerateRequest(BaseModel):
    study_material_id: int
    count: int = 10
    difficulty: str = "medium"


# Cheatsheet Schemas
class CheatsheetBase(BaseModel):
    title: str
    content: str
    key_points: Optional[List[str]] = None
    formulas: Optional[List[str]] = None


class CheatsheetCreate(CheatsheetBase):
    pass


class CheatsheetResponse(CheatsheetBase):
    id: int
    study_material_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Summary Schemas
class SummaryResponse(BaseModel):
    id: int
    summary: str
    key_takeaways: Optional[List[str]]
    reading_time_minutes: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


class SummaryGenerateRequest(BaseModel):
    study_material_id: int
    max_length: Optional[int] = 500


# Mock Test Schemas
class MockTestQuestionBase(BaseModel):
    question_text: str
    question_type: str = "multiple_choice"
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = None
    points: int = 1
    topic: Optional[str] = None


class MockTestQuestionCreate(MockTestQuestionBase):
    pass


class MockTestQuestionResponse(MockTestQuestionBase):
    id: int
    order_index: int
    
    class Config:
        from_attributes = True


class MockTestBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    difficulty: str = "medium"


class MockTestCreate(MockTestBase):
    study_material_id: int
    question_count: int = 10


class MockTestResponse(MockTestBase):
    id: int
    study_material_id: int
    total_questions: int
    created_at: datetime
    questions: List[MockTestQuestionResponse] = []
    
    class Config:
        from_attributes = True


class MockTestAnswerSubmit(BaseModel):
    question_id: int
    answer: str


class MockTestSubmit(BaseModel):
    answers: List[MockTestAnswerSubmit]


class MockTestAnswerResponse(BaseModel):
    question_id: int
    user_answer: str
    correct_answer: str
    is_correct: bool
    points_earned: float
    explanation: Optional[str]


class MockTestResult(BaseModel):
    attempt_id: int
    score: float
    total_points: int
    earned_points: int
    percentage: float
    time_taken_minutes: int
    answers: List[MockTestAnswerResponse]
    weak_topics: List[str]


# Interview Schemas
class InterviewStartRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    question_count: int = 5
    study_material_id: Optional[int] = None


class InterviewQuestionResponse(BaseModel):
    id: int
    question: str
    order_index: int


class InterviewAnswerSubmit(BaseModel):
    answer: str


class InterviewAnswerResponse(BaseModel):
    question: str
    user_answer: str
    ai_feedback: str
    improved_answer: str
    score: float
    strengths: List[str]
    areas_for_improvement: List[str]


class InterviewResult(BaseModel):
    session_id: int
    overall_score: float
    feedback_summary: str
    responses: List[InterviewAnswerResponse]


# Weak Topic Schemas
class WeakTopicResponse(BaseModel):
    id: int
    topic: str
    subject: Optional[str]
    miss_count: int
    last_seen_at: datetime
    
    class Config:
        from_attributes = True


# Trivia Schemas
class TriviaQuestionResponse(BaseModel):
    id: int
    question: str
    options: List[str]
    explanation: Optional[str]
    difficulty: str


class TriviaSubmitRequest(BaseModel):
    question_id: int
    answer: str


class TriviaSessionResult(BaseModel):
    score: int
    total_questions: int
    correct_answers: int
    percentage: float
    streak: int


class TriviaScoreResponse(BaseModel):
    category: str
    total_attempts: int
    total_correct: int
    high_score: int
    average_score: float
    last_played_at: Optional[datetime]
    
    class Config:
        from_attributes = True
