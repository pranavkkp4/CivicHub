from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..core.database import get_db
from ..routes.auth import get_current_active_user
from ..models.user import User
from ..models.healthcare import (
    HealthAssessment, RiskPrediction, WorkoutPlan, 
    NutritionPlan, SymptomCheck, WellnessRecommendation
)
from ..schemas.healthcare import (
    HealthAssessmentCreate, HealthAssessmentResponse,
    RiskPredictionResponse, RiskAssessmentRequest,
    WorkoutPlanCreate, WorkoutPlanResponse, WorkoutPlanGenerateRequest,
    NutritionPlanCreate, NutritionPlanResponse, NutritionPlanGenerateRequest,
    SymptomCheckRequest, SymptomCheckResponse,
    WellnessRecommendationResponse, DailyWellnessSummary
)
from ..services.healthcare_service import healthcare_service

router = APIRouter(prefix="/healthcare", tags=["Healthcare"])


# Health Assessment
@router.post("/assessment", response_model=HealthAssessmentResponse)
async def create_health_assessment(
    assessment: HealthAssessmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a health assessment"""
    new_assessment = HealthAssessment(
        user_id=current_user.id,
        age=assessment.age,
        gender=assessment.gender,
        height_cm=assessment.height_cm,
        weight_kg=assessment.weight_kg,
        activity_level=assessment.activity_level,
        smoking_status=assessment.smoking_status,
        alcohol_consumption=assessment.alcohol_consumption,
        medical_conditions=assessment.medical_conditions,
        family_history=assessment.family_history
    )
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    return new_assessment


@router.get("/assessments", response_model=List[HealthAssessmentResponse])
async def get_health_assessments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's health assessments"""
    assessments = db.query(HealthAssessment).filter(
        HealthAssessment.user_id == current_user.id
    ).order_by(HealthAssessment.created_at.desc()).all()
    return assessments


# Risk Assessment
@router.post("/risk-assessment", response_model=List[RiskPredictionResponse])
async def assess_health_risks(
    request: RiskAssessmentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Assess health risks based on assessment data"""
    # Create assessment
    assessment = HealthAssessment(
        user_id=current_user.id,
        age=request.assessment_data.age,
        gender=request.assessment_data.gender,
        height_cm=request.assessment_data.height_cm,
        weight_kg=request.assessment_data.weight_kg,
        activity_level=request.assessment_data.activity_level,
        smoking_status=request.assessment_data.smoking_status,
        alcohol_consumption=request.assessment_data.alcohol_consumption,
        medical_conditions=request.assessment_data.medical_conditions,
        family_history=request.assessment_data.family_history
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    
    # Generate risk predictions using AI
    risks_data = await healthcare_service.assess_health_risks(
        assessment_data=request.assessment_data.dict()
    )
    
    # Save predictions
    predictions = []
    for risk_data in risks_data:
        prediction = RiskPrediction(
            assessment_id=assessment.id,
            risk_type=risk_data.get("risk_type", ""),
            risk_level=risk_data.get("risk_level", ""),
            risk_score=risk_data.get("risk_score"),
            factors=risk_data.get("factors", []),
            recommendations=risk_data.get("recommendations", [])
        )
        db.add(prediction)
        predictions.append(prediction)
    
    db.commit()
    return predictions


# Workout Plans
@router.post("/workout-plan", response_model=WorkoutPlanResponse)
async def create_workout_plan(
    request: WorkoutPlanGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a personalized workout plan"""
    plan_data = await healthcare_service.generate_workout_plan(
        goal=request.goal,
        fitness_level=request.fitness_level,
        days_per_week=request.days_per_week,
        time_per_session=request.time_per_session_minutes,
        equipment=request.equipment_available,
        injuries=request.injuries_or_limitations
    )
    
    plan = WorkoutPlan(
        user_id=current_user.id,
        title=f"{request.goal.replace('_', ' ').title()} Plan - {request.fitness_level.title()}",
        goal=request.goal,
        fitness_level=request.fitness_level,
        days_per_week=request.days_per_week,
        time_per_session_minutes=request.time_per_session_minutes,
        equipment_available=request.equipment_available,
        injuries_or_limitations=request.injuries_or_limitations,
        plan_content=plan_data
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get("/workout-plans", response_model=List[WorkoutPlanResponse])
async def get_workout_plans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's workout plans"""
    plans = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id
    ).order_by(WorkoutPlan.created_at.desc()).all()
    return plans


@router.get("/workout-plans/{plan_id}", response_model=WorkoutPlanResponse)
async def get_workout_plan(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific workout plan"""
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    
    return plan


# Nutrition Plans
@router.post("/nutrition-plan", response_model=NutritionPlanResponse)
async def create_nutrition_plan(
    request: NutritionPlanGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a personalized nutrition plan"""
    plan_data = await healthcare_service.generate_nutrition_plan(
        goal=request.goal,
        diet_type=request.diet_type,
        allergies=request.allergies or [],
        meals_per_day=request.meals_per_day,
        cooking_time=request.cooking_time_available,
        calorie_target=request.calorie_target
    )
    
    plan = NutritionPlan(
        user_id=current_user.id,
        title=f"{request.goal.replace('_', ' ').title()} Nutrition Plan",
        goal=request.goal,
        diet_type=request.diet_type,
        allergies=request.allergies,
        meals_per_day=request.meals_per_day,
        cooking_time_available=request.cooking_time_available,
        calorie_target=request.calorie_target,
        plan_content=plan_data,
        shopping_list=plan_data.get("shopping_list", []),
        macro_targets=plan_data.get("macro_targets", {})
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get("/nutrition-plans", response_model=List[NutritionPlanResponse])
async def get_nutrition_plans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's nutrition plans"""
    plans = db.query(NutritionPlan).filter(
        NutritionPlan.user_id == current_user.id
    ).order_by(NutritionPlan.created_at.desc()).all()
    return plans


# Symptom Checker
@router.post("/symptom-check", response_model=SymptomCheckResponse)
async def check_symptoms(
    request: SymptomCheckRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI guidance for symptoms"""
    guidance = await healthcare_service.get_symptom_guidance(
        symptoms=request.symptoms,
        duration=request.duration,
        severity=request.severity
    )
    
    symptom_check = SymptomCheck(
        user_id=current_user.id,
        symptoms=request.symptoms,
        duration=request.duration,
        severity=request.severity,
        ai_guidance=guidance.get("guidance"),
        self_care_suggestions=guidance.get("self_care_suggestions", []),
        red_flags=guidance.get("red_flags", [])
    )
    db.add(symptom_check)
    db.commit()
    db.refresh(symptom_check)
    return symptom_check


@router.get("/symptom-history", response_model=List[SymptomCheckResponse])
async def get_symptom_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's symptom check history"""
    history = db.query(SymptomCheck).filter(
        SymptomCheck.user_id == current_user.id
    ).order_by(SymptomCheck.created_at.desc()).limit(10).all()
    return history


# Daily Wellness
@router.get("/daily-wellness", response_model=DailyWellnessSummary)
async def get_daily_wellness(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get daily wellness recommendations"""
    tips = await healthcare_service.generate_daily_wellness_tips()
    
    # Get active recommendations
    recommendations = db.query(WellnessRecommendation).filter(
        WellnessRecommendation.user_id == current_user.id,
        WellnessRecommendation.is_completed == False
    ).order_by(WellnessRecommendation.created_at.desc()).limit(5).all()
    
    return DailyWellnessSummary(
        date=datetime.utcnow().strftime("%Y-%m-%d"),
        recommendations=recommendations,
        hydration_reminder=tips.get("hydration"),
        sleep_suggestion=tips.get("sleep"),
        movement_suggestion=tips.get("movement"),
        stress_suggestion=tips.get("stress")
    )
