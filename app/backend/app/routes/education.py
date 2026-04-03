from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import logging
import shutil
import os
from datetime import datetime

from ..core.database import get_db
from ..core.config import get_settings
from ..routes.auth import get_current_active_user
from ..models.user import User
from ..models.education import (
    StudyMaterial, Flashcard, Cheatsheet, GeneratedSummary,
    MockTest, MockTestQuestion, MockTestAttempt, MockTestAnswer,
    InterviewSession, InterviewResponse, WeakTopic, TriviaQuestion, TriviaAttempt
)
from ..schemas.education import (
    StudyMaterialCreate, StudyMaterialResponse,
    FlashcardResponse, FlashcardGenerateRequest,
    CheatsheetResponse, SummaryResponse, SummaryGenerateRequest,
    MockTestCreate, MockTestResponse, MockTestSubmit, MockTestResult,
    InterviewStartRequest, InterviewAnswerSubmit, InterviewResult,
    WeakTopicResponse, TriviaQuestionResponse, TriviaSubmitRequest, TriviaSessionResult
)
from ..services.study_service import study_service
from ..services.file_service import file_service

router = APIRouter(prefix="/education", tags=["Education"])
settings = get_settings()
logger = logging.getLogger(__name__)
PLACEHOLDER_TEST_QUESTION = "What is one key concept from the material?"
PLACEHOLDER_TEST_OPTION = "A detail that matches the topic"

def _question_has_real_content(question_text: str, options: List[str], correct_answer: str) -> bool:
    looks_like_placeholder = (
        question_text == PLACEHOLDER_TEST_QUESTION
        and PLACEHOLDER_TEST_OPTION in options
    )
    return bool(question_text and correct_answer and len(options) >= 4 and correct_answer in options and not looks_like_placeholder)


def _get_valid_generated_questions(test_data: dict) -> List[dict]:
    valid_questions: List[dict] = []
    for raw_question in test_data.get("questions", []):
        if not isinstance(raw_question, dict):
            continue

        question_text = str(raw_question.get("question_text", "")).strip()
        options = [
            str(option).strip()
            for option in raw_question.get("options", [])
            if str(option).strip()
        ] if isinstance(raw_question.get("options"), list) else []
        correct_answer = str(raw_question.get("correct_answer", "")).strip()

        if not _question_has_real_content(question_text, options, correct_answer):
            continue

        valid_questions.append({
            **raw_question,
            "question_text": question_text,
            "options": options,
            "correct_answer": correct_answer,
        })

    return valid_questions


def _mock_test_has_real_questions(mock_test: MockTest) -> bool:
    for question in mock_test.questions:
        question_text = (question.question_text or "").strip()
        options = [
            option.strip()
            for option in (question.options or [])
            if isinstance(option, str) and option.strip()
        ]
        correct_answer = (question.correct_answer or "").strip()
        if _question_has_real_content(question_text, options, correct_answer):
            return True

    return False


def _get_latest_saved_mock_test(db: Session, material_id: int) -> Optional[MockTest]:
    saved_tests = db.query(MockTest).filter(
        MockTest.study_material_id == material_id
    ).order_by(MockTest.created_at.desc()).all()

    for saved_test in saved_tests:
        if _mock_test_has_real_questions(saved_test):
            return saved_test

    return None


# Study Materials
@router.get("/materials", response_model=List[StudyMaterialResponse])
async def get_study_materials(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all study materials for current user"""
    materials = db.query(StudyMaterial).filter(
        StudyMaterial.user_id == current_user.id
    ).order_by(StudyMaterial.created_at.desc()).all()
    return materials


@router.post("/materials", response_model=StudyMaterialResponse)
async def create_study_material(
    material: StudyMaterialCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new study material"""
    new_material = StudyMaterial(
        user_id=current_user.id,
        title=material.title,
        content=material.content,
        source_type=material.source_type,
        subject=material.subject,
        tags=material.tags
    )
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material


@router.post("/materials/upload")
async def upload_study_material(
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a file as study material"""
    # Save file and extract text
    file_path, content = await file_service.save_and_extract(file, settings.UPLOAD_DIR)
    
    new_material = StudyMaterial(
        user_id=current_user.id,
        title=title,
        content=content,
        source_type="pdf" if file.filename.endswith('.pdf') else "text",
        file_path=file_path,
        subject=subject
    )
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material


@router.get("/materials/{material_id}", response_model=StudyMaterialResponse)
async def get_study_material(
    material_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific study material"""
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")
    
    return material


# Flashcards
@router.post("/materials/{material_id}/flashcards", response_model=List[FlashcardResponse])
async def generate_flashcards(
    material_id: int,
    request: FlashcardGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate flashcards from study material"""
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")
    
    # Generate flashcards using AI
    flashcards_data = await study_service.generate_flashcards(
        material.content, 
        count=request.count,
        difficulty=request.difficulty
    )
    
    # Save to database
    created_flashcards = []
    for card_data in flashcards_data:
        flashcard = Flashcard(
            study_material_id=material_id,
            front=card_data.get("front", ""),
            back=card_data.get("back", ""),
            difficulty=card_data.get("difficulty", "medium")
        )
        db.add(flashcard)
        created_flashcards.append(flashcard)
    
    db.commit()
    for card in created_flashcards:
        db.refresh(card)
    
    return created_flashcards


@router.get("/materials/{material_id}/flashcards", response_model=List[FlashcardResponse])
async def get_flashcards(
    material_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get flashcards for a study material"""
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")
    
    return material.flashcards


# Cheatsheets
@router.post("/materials/{material_id}/cheatsheet", response_model=CheatsheetResponse)
async def generate_cheatsheet(
    material_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a cheatsheet from study material"""
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")
    
    cheatsheet_data = await study_service.generate_cheatsheet(
        material.content,
        title=f"Cheatsheet: {material.title}"
    )
    
    cheatsheet = Cheatsheet(
        study_material_id=material_id,
        title=cheatsheet_data.get("title", "Cheatsheet"),
        content=cheatsheet_data.get("content", ""),
        key_points=cheatsheet_data.get("key_points", []),
        formulas=cheatsheet_data.get("formulas", [])
    )
    db.add(cheatsheet)
    db.commit()
    db.refresh(cheatsheet)
    
    return cheatsheet


# Summaries
@router.post("/materials/{material_id}/summary", response_model=SummaryResponse)
async def generate_summary(
    material_id: int,
    request: SummaryGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a summary from study material"""
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")
    
    summary_data = await study_service.generate_summary(
        material.content,
        max_length=request.max_length
    )
    
    summary = GeneratedSummary(
        study_material_id=material_id,
        summary=summary_data.get("summary", ""),
        key_takeaways=summary_data.get("key_takeaways", []),
        reading_time_minutes=summary_data.get("reading_time_minutes")
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    
    return summary


# Mock Tests
@router.post("/materials/{material_id}/mock-test", response_model=MockTestResponse)
async def generate_mock_test(
    material_id: int,
    request: MockTestCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a mock test from study material"""
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")
    
    requested_question_count = max(request.question_count, 1)
    latest_saved_test = _get_latest_saved_mock_test(db, material_id)

    try:
        test_data = await study_service.generate_mock_test(
            material.content,
            question_count=requested_question_count,
            difficulty=request.difficulty
        )
    except Exception as exc:
        logger.warning("Mock test generation failed for material %s: %s", material_id, exc)
        if latest_saved_test:
            return latest_saved_test
        raise HTTPException(
            status_code=503,
            detail="Civic Hub could not generate a new quiz right now, and there is no saved quiz for this material yet."
        ) from exc

    valid_questions = _get_valid_generated_questions(test_data)
    minimum_questions = max(1, min(requested_question_count, 3))
    if len(valid_questions) < minimum_questions:
        if latest_saved_test:
            return latest_saved_test
        raise HTTPException(
            status_code=503,
            detail="Civic Hub could not generate a usable quiz right now, and there is no saved quiz for this material yet."
        )
    
    mock_test = MockTest(
        study_material_id=material_id,
        title=test_data.get("title", "Mock Test"),
        description=test_data.get("description", ""),
        time_limit_minutes=request.time_limit_minutes or 30,
        total_questions=len(valid_questions),
        difficulty=request.difficulty
    )
    db.add(mock_test)
    db.commit()
    db.refresh(mock_test)
    
    # Add questions
    for idx, q_data in enumerate(valid_questions):
        question = MockTestQuestion(
            mock_test_id=mock_test.id,
            question_text=q_data.get("question_text", ""),
            question_type=q_data.get("question_type", "multiple_choice"),
            options=q_data.get("options", []),
            correct_answer=q_data.get("correct_answer", ""),
            explanation=q_data.get("explanation", ""),
            points=q_data.get("points", 1),
            topic=q_data.get("topic", ""),
            order_index=idx
        )
        db.add(question)
    
    db.commit()
    db.refresh(mock_test)
    return mock_test


@router.get("/materials/{material_id}/mock-tests", response_model=List[MockTestResponse])
async def get_mock_tests_for_material(
    material_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get saved mock tests for a study material."""
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.user_id == current_user.id
    ).first()

    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")

    return db.query(MockTest).filter(
        MockTest.study_material_id == material_id
    ).order_by(MockTest.created_at.desc()).all()


@router.post("/mock-tests/{test_id}/submit", response_model=MockTestResult)
async def submit_mock_test(
    test_id: int,
    submission: MockTestSubmit,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit answers for a mock test"""
    mock_test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not mock_test:
        raise HTTPException(status_code=404, detail="Mock test not found")
    
    # Create attempt
    attempt = MockTestAttempt(
        mock_test_id=test_id,
        user_id=current_user.id,
        status="completed"
    )
    db.add(attempt)
    db.commit()
    
    # Process answers
    total_points = 0
    earned_points = 0
    incorrect_topics = []
    
    answer_responses = []
    
    for answer_data in submission.answers:
        question = db.query(MockTestQuestion).filter(
            MockTestQuestion.id == answer_data.question_id,
            MockTestQuestion.mock_test_id == test_id
        ).first()
        
        if not question:
            continue
        
        total_points += question.points
        is_correct = answer_data.answer.strip().lower() == question.correct_answer.strip().lower()
        points_earned = question.points if is_correct else 0
        earned_points += points_earned
        
        if not is_correct and question.topic:
            incorrect_topics.append({
                "topic": question.topic,
                "question": question.question_text
            })
        
        answer = MockTestAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            user_answer=answer_data.answer,
            is_correct=is_correct,
            points_earned=points_earned
        )
        db.add(answer)
        
        answer_responses.append({
            "question_id": question.id,
            "user_answer": answer_data.answer,
            "correct_answer": question.correct_answer,
            "is_correct": is_correct,
            "points_earned": points_earned,
            "explanation": question.explanation
        })
    
    # Update attempt
    percentage = (earned_points / total_points * 100) if total_points > 0 else 0
    attempt.score = percentage
    attempt.total_points = total_points
    attempt.earned_points = earned_points
    attempt.percentage = percentage
    db.commit()
    
    # Track weak topics
    weak_topics = []
    for topic_data in incorrect_topics:
        # Check if weak topic exists
        weak_topic = db.query(WeakTopic).filter(
            WeakTopic.user_id == current_user.id,
            WeakTopic.topic == topic_data["topic"]
        ).first()
        
        if weak_topic:
            weak_topic.miss_count += 1
            weak_topic.last_seen_at = datetime.utcnow()
        else:
            weak_topic = WeakTopic(
                user_id=current_user.id,
                topic=topic_data["topic"],
                miss_count=1
            )
            db.add(weak_topic)
        
        weak_topics.append(topic_data["topic"])
    
    db.commit()
    
    return MockTestResult(
        attempt_id=attempt.id,
        score=percentage,
        total_points=total_points,
        earned_points=earned_points,
        percentage=percentage,
        time_taken_minutes=0,
        answers=answer_responses,
        weak_topics=list(set(weak_topics))
    )


# Weak Topics
@router.get("/weak-topics", response_model=List[WeakTopicResponse])
async def get_weak_topics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's weak topics"""
    topics = db.query(WeakTopic).filter(
        WeakTopic.user_id == current_user.id
    ).order_by(WeakTopic.miss_count.desc()).all()
    return topics


# Interview Mode
@router.post("/interview/start")
async def start_interview(
    request: InterviewStartRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Start an interview practice session"""
    material_content = None
    if request.study_material_id:
        material = db.query(StudyMaterial).filter(
            StudyMaterial.id == request.study_material_id,
            StudyMaterial.user_id == current_user.id
        ).first()
        if material:
            material_content = material.content
    
    questions_data = await study_service.generate_interview_questions(
        topic=request.topic,
        count=request.question_count,
        difficulty=request.difficulty,
        material_content=material_content
    )
    
    session = InterviewSession(
        user_id=current_user.id,
        topic=request.topic,
        difficulty=request.difficulty,
        total_questions=len(questions_data)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Create responses (questions)
    for idx, q_data in enumerate(questions_data):
        response = InterviewResponse(
            session_id=session.id,
            question=q_data.get("question", ""),
            order_index=idx
        )
        db.add(response)
    
    db.commit()
    
    return {
        "session_id": session.id,
        "questions": [{"id": r.id, "question": r.question, "order_index": r.order_index} 
                      for r in session.responses]
    }


@router.post("/interview/{response_id}/answer")
async def submit_interview_answer(
    response_id: int,
    answer: InterviewAnswerSubmit,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit an answer for an interview question"""
    response = db.query(InterviewResponse).filter(
        InterviewResponse.id == response_id
    ).first()
    
    if not response:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Get session to check user
    session = db.query(InterviewSession).filter(
        InterviewSession.id == response.session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Evaluate answer
    evaluation = await study_service.evaluate_interview_answer(
        question=response.question,
        answer=answer.answer
    )
    
    response.user_answer = answer.answer
    response.ai_feedback = evaluation.get("feedback", "")
    response.improved_answer = evaluation.get("improved_answer", "")
    response.score = evaluation.get("score", 0)
    response.strengths = evaluation.get("strengths", [])
    response.areas_for_improvement = evaluation.get("areas_for_improvement", [])
    response.answered_at = datetime.utcnow()
    
    db.commit()
    db.refresh(response)
    
    return {
        "score": response.score,
        "feedback": response.ai_feedback,
        "improved_answer": response.improved_answer,
        "strengths": response.strengths,
        "areas_for_improvement": response.areas_for_improvement
    }


# Trivia
@router.get("/trivia/questions", response_model=List[TriviaQuestionResponse])
async def get_trivia_questions(
    category: str = "ai_ml",
    count: int = 5,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get trivia questions"""
    questions = db.query(TriviaQuestion).filter(
        TriviaQuestion.category == category
    ).order_by(func.random()).limit(count).all()
    
    if not questions:
        # Generate questions using AI if none in DB
        from ..services.sustainability_service import sustainability_service
        questions_data = await sustainability_service.generate_eco_trivia_questions(
            category=category,
            count=count
        )
        return questions_data
    
    return questions


@router.post("/trivia/submit")
async def submit_trivia_answer(
    submission: TriviaSubmitRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit a trivia answer"""
    question = db.query(TriviaQuestion).filter(
        TriviaQuestion.id == submission.question_id
    ).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_correct = submission.answer.strip().lower() == question.correct_answer.strip().lower()
    
    return {
        "is_correct": is_correct,
        "correct_answer": question.correct_answer,
        "explanation": question.explanation
    }
