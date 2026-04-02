from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from ..core.database import get_db
from ..routes.auth import get_current_active_user
from ..models.user import User
from ..models.sustainability import (
    SustainabilityLog, SustainabilityEvent, VolunteerSignup,
    ImpactReport, EcoTriviaScore, RecyclingGameAttempt, EcoChallenge
)
from ..schemas.sustainability import (
    SustainabilityLogCreate, SustainabilityLogResponse, SustainabilityLogStats,
    SustainabilityEventResponse, VolunteerSignupCreate, VolunteerSignupResponse,
    ImpactReportResponse, EcoTriviaQuestion, EcoTriviaSubmit, EcoTriviaResult,
    RecyclingGameResult, RecyclingGameAttemptResponse,
    LeaderboardResponse, LeaderboardEntry, EcoCoachResponse, EcoChallengeResponse
)
from ..services.sustainability_service import sustainability_service

router = APIRouter(prefix="/sustainability", tags=["Sustainability"])


# Sustainability Logs
@router.post("/logs", response_model=SustainabilityLogResponse)
async def create_sustainability_log(
    log: SustainabilityLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Log a sustainability action"""
    # Calculate impact
    impact = await sustainability_service.calculate_impact_metrics(
        action_type=log.action_type,
        quantity=log.quantity or 1,
        unit=log.unit or "action"
    )
    
    new_log = SustainabilityLog(
        user_id=current_user.id,
        action_type=log.action_type,
        category=log.category,
        quantity=log.quantity,
        unit=log.unit,
        co2_saved_kg=impact.get("co2_saved_kg"),
        notes=log.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.get("/logs", response_model=List[SustainabilityLogResponse])
async def get_sustainability_logs(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's sustainability logs"""
    logs = db.query(SustainabilityLog).filter(
        SustainabilityLog.user_id == current_user.id
    ).order_by(SustainabilityLog.logged_at.desc()).limit(limit).all()
    return logs


@router.get("/impact-summary", response_model=SustainabilityLogStats)
async def get_impact_summary(
    period: str = "all",  # all, week, month, year
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get sustainability impact summary"""
    query = db.query(SustainabilityLog).filter(
        SustainabilityLog.user_id == current_user.id
    )
    
    if period == "week":
        week_ago = datetime.utcnow() - timedelta(days=7)
        query = query.filter(SustainabilityLog.logged_at >= week_ago)
    elif period == "month":
        month_ago = datetime.utcnow() - timedelta(days=30)
        query = query.filter(SustainabilityLog.logged_at >= month_ago)
    elif period == "year":
        year_ago = datetime.utcnow() - timedelta(days=365)
        query = query.filter(SustainabilityLog.logged_at >= year_ago)
    
    logs = query.all()
    
    # Calculate totals
    total_actions = len(logs)
    co2_saved = sum(log.co2_saved_kg or 0 for log in logs)
    waste_diverted = sum(log.quantity or 0 for log in logs if log.category == "waste")
    water_saved = sum(log.quantity or 0 for log in logs if log.category == "water")
    energy_saved = sum(log.quantity or 0 for log in logs if log.category == "energy")
    
    # Breakdown by category
    breakdown = {}
    for log in logs:
        cat = log.category
        if cat not in breakdown:
            breakdown[cat] = {"count": 0, "co2_saved": 0}
        breakdown[cat]["count"] += 1
        breakdown[cat]["co2_saved"] += log.co2_saved_kg or 0
    
    return SustainabilityLogStats(
        total_actions=total_actions,
        co2_saved_kg=round(co2_saved, 2),
        waste_diverted_kg=round(waste_diverted, 2),
        water_saved_liters=round(water_saved, 2),
        energy_saved_kwh=round(energy_saved, 2),
        breakdown_by_category=breakdown
    )


# Events
@router.get("/events", response_model=List[SustainabilityEventResponse])
async def get_events(
    upcoming: bool = True,
    db: Session = Depends(get_db)
):
    """Get sustainability events"""
    query = db.query(SustainabilityEvent)
    
    if upcoming:
        query = query.filter(SustainabilityEvent.start_date >= datetime.utcnow())
    
    events = query.order_by(SustainabilityEvent.start_date).all()
    return events


@router.post("/events/{event_id}/signup", response_model=VolunteerSignupResponse)
async def signup_for_event(
    event_id: int,
    signup: VolunteerSignupCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sign up for a sustainability event"""
    event = db.query(SustainabilityEvent).filter(SustainabilityEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already signed up
    existing = db.query(VolunteerSignup).filter(
        VolunteerSignup.user_id == current_user.id,
        VolunteerSignup.event_id == event_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already signed up for this event")
    
    signup_record = VolunteerSignup(
        user_id=current_user.id,
        event_id=event_id,
        notes=signup.notes
    )
    db.add(signup_record)
    
    # Update event participant count
    event.current_participants += 1
    
    db.commit()
    db.refresh(signup_record)
    return signup_record


# Eco Coach
@router.get("/eco-coach", response_model=EcoCoachResponse)
async def get_eco_coach_tips(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get personalized eco coach tips"""
    # Get recent logs
    recent_logs = db.query(SustainabilityLog).filter(
        SustainabilityLog.user_id == current_user.id
    ).order_by(SustainabilityLog.logged_at.desc()).limit(10).all()
    
    # Generate tips
    tips = await sustainability_service.generate_eco_tips(
        recent_logs=[{"action_type": log.action_type, "quantity": log.quantity, "unit": log.unit} for log in recent_logs]
    )
    
    # Get challenge recommendations
    challenges = await sustainability_service.recommend_challenges(
        user_logs=[{"action_type": log.action_type} for log in recent_logs]
    )
    
    return EcoCoachResponse(
        personalized_tip=tips[0] if tips else {"category": "general", "tip": "Start by logging your first eco action!", "impact": "Every action counts", "difficulty": "easy"},
        challenge_recommendations=challenges,
        based_on_recent_logs=len(recent_logs) > 0,
        generated_at=datetime.utcnow()
    )


# Trivia
@router.get("/trivia/questions")
async def get_eco_trivia_questions(
    mode: str = "normal",
    count: int = 5,
    current_user: User = Depends(get_current_active_user)
):
    """Get eco trivia questions"""
    questions = await sustainability_service.generate_eco_trivia_questions(
        count=count,
        mode=mode
    )
    return questions


@router.post("/trivia/submit")
async def submit_eco_trivia(
    results: EcoTriviaResult,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit eco trivia results"""
    score_record = EcoTriviaScore(
        user_id=current_user.id,
        mode=results.mode,
        score=results.score,
        total_questions=results.total_questions,
        correct_answers=results.correct_answers,
        streak=results.streak
    )
    db.add(score_record)
    db.commit()
    
    return {"message": "Score saved", "score": results.score}


# Recycling Game
@router.post("/recycling-game/submit")
async def submit_recycling_game(
    result: RecyclingGameResult,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit recycling game score"""
    attempt = RecyclingGameAttempt(
        user_id=current_user.id,
        score=result.score,
        items_sorted=result.items_sorted,
        correct_sorts=result.correct_sorts,
        accuracy_percentage=result.accuracy_percentage,
        time_taken_seconds=result.time_taken_seconds
    )
    db.add(attempt)
    db.commit()
    
    return {"message": "Score saved", "score": result.score}


# Leaderboard
@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    category: str = "overall",  # overall, trivia, recycling
    period: str = "all_time",  # all_time, weekly, monthly
    db: Session = Depends(get_db)
):
    """Get sustainability leaderboard"""
    # This is a simplified implementation
    # In production, you'd calculate scores based on various activities
    
    if category == "trivia":
        scores = db.query(
            EcoTriviaScore.user_id,
            func.sum(EcoTriviaScore.score).label("total_score")
        ).group_by(EcoTriviaScore.user_id).order_by(func.sum(EcoTriviaScore.score).desc()).limit(10).all()
    elif category == "recycling":
        scores = db.query(
            RecyclingGameAttempt.user_id,
            func.sum(RecyclingGameAttempt.score).label("total_score")
        ).group_by(RecyclingGameAttempt.user_id).order_by(func.sum(RecyclingGameAttempt.score).desc()).limit(10).all()
    else:
        # Overall - combine logs
        scores = db.query(
            SustainabilityLog.user_id,
            func.count(SustainabilityLog.id).label("total_score")
        ).group_by(SustainabilityLog.user_id).order_by(func.count(SustainabilityLog.id).desc()).limit(10).all()
    
    entries = []
    for idx, (user_id, score) in enumerate(scores):
        user = db.query(User).filter(User.id == user_id).first()
        entries.append(LeaderboardEntry(
            user_id=user_id,
            user_name=user.first_name or user.email if user else "Unknown",
            score=score,
            rank=idx + 1
        ))
    
    return LeaderboardResponse(
        category=category,
        period=period,
        entries=entries
    )


# Challenges
@router.get("/challenges", response_model=List[EcoChallengeResponse])
async def get_challenges(
    active_only: bool = True,
    target_audience: str = "all",
    db: Session = Depends(get_db)
):
    """Get eco challenges"""
    query = db.query(EcoChallenge)
    
    if active_only:
        query = query.filter(EcoChallenge.is_active == True)
    
    if target_audience != "all":
        query = query.filter(EcoChallenge.target_audience.in_([target_audience, "all"]))
    
    challenges = query.all()
    return challenges
