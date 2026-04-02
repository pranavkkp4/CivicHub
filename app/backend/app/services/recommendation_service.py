from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..models.shared import Recommendation
from ..models.education import StudyMaterial, MockTestAttempt, WeakTopic
from ..models.healthcare import WorkoutPlan, NutritionPlan
from ..models.sustainability import SustainabilityLog
from ..models.shared import Notification


class RecommendationService:
    """Service for generating cross-module personalized recommendations"""
    
    async def generate_recommendations(
        self,
        user_id: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """Generate personalized recommendations based on user activity"""
        recommendations = []
        
        # Education recommendations
        edu_recs = await self._generate_education_recommendations(user_id, db)
        recommendations.extend(edu_recs)
        
        # Healthcare recommendations
        health_recs = await self._generate_healthcare_recommendations(user_id, db)
        recommendations.extend(health_recs)
        
        # Sustainability recommendations
        sustain_recs = await self._generate_sustainability_recommendations(user_id, db)
        recommendations.extend(sustain_recs)
        
        # Save recommendations to database
        saved_recs = []
        for rec_data in recommendations:
            rec = Recommendation(
                user_id=user_id,
                title=rec_data["title"],
                description=rec_data["description"],
                module=rec_data["module"],
                priority=rec_data.get("priority", "medium"),
                reason=rec_data.get("reason"),
                action_link=rec_data.get("action_link")
            )
            db.add(rec)
            saved_recs.append(rec)
        
        db.commit()
        return saved_recs
    
    async def _generate_education_recommendations(
        self,
        user_id: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """Generate education-related recommendations"""
        recommendations = []
        
        # Check for weak topics
        weak_topics = db.query(WeakTopic).filter(
            WeakTopic.user_id == user_id,
            WeakTopic.miss_count >= 2
        ).order_by(WeakTopic.miss_count.desc()).limit(3).all()
        
        if weak_topics:
            topic_names = ", ".join([wt.topic for wt in weak_topics[:2]])
            recommendations.append({
                "title": "Review Your Weak Topics",
                "description": f"You need more practice with: {topic_names}. Review these topics before your next test.",
                "module": "education",
                "priority": "high",
                "reason": "Multiple incorrect answers on these topics",
                "action_link": "/education/weak-topics"
            })
        
        # Check for study materials without tests
        materials = db.query(StudyMaterial).filter(
            StudyMaterial.user_id == user_id
        ).limit(5).all()
        
        for material in materials:
            if not material.mock_tests:
                recommendations.append({
                    "title": f"Test Your Knowledge: {material.title[:30]}...",
                    "description": "You've studied this material but haven't taken a test yet. Generate a mock test to check your understanding.",
                    "module": "education",
                    "priority": "medium",
                    "reason": "Study material without assessment",
                    "action_link": f"/education/materials/{material.id}"
                })
                break  # Only one recommendation of this type
        
        # Check for recent low test scores
        recent_tests = db.query(MockTestAttempt).filter(
            MockTestAttempt.user_id == user_id,
            MockTestAttempt.status == "completed"
        ).order_by(MockTestAttempt.created_at.desc()).limit(3).all()
        
        if recent_tests and any(t.percentage < 70 for t in recent_tests):
            recommendations.append({
                "title": "Practice with Flashcards",
                "description": "Your recent test scores suggest you could benefit from more practice. Try reviewing with flashcards.",
                "module": "education",
                "priority": "medium",
                "reason": "Recent test scores below 70%",
                "action_link": "/education/flashcards"
            })
        
        return recommendations
    
    async def _generate_healthcare_recommendations(
        self,
        user_id: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """Generate healthcare-related recommendations"""
        recommendations = []
        
        # Check for active plans
        active_workouts = db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.is_active == True
        ).all()
        
        if active_workouts:
            recommendations.append({
                "title": "Start Your Workout Plan",
                "description": f"You have an active workout plan: {active_workouts[0].title}. Start with Day 1 today!",
                "module": "healthcare",
                "priority": "high",
                "reason": "Active workout plan not started",
                "action_link": "/healthcare/workout-plans"
            })
        else:
            recommendations.append({
                "title": "Create a Workout Plan",
                "description": "You don't have an active workout plan. Create one to start your fitness journey.",
                "module": "healthcare",
                "priority": "medium",
                "reason": "No active workout plan",
                "action_link": "/healthcare/workout-planner"
            })
        
        # Check for nutrition plans
        active_nutrition = db.query(NutritionPlan).filter(
            NutritionPlan.user_id == user_id,
            NutritionPlan.is_active == True
        ).all()
        
        if not active_nutrition:
            recommendations.append({
                "title": "Plan Your Meals",
                "description": "Create a personalized nutrition plan to support your health goals.",
                "module": "healthcare",
                "priority": "medium",
                "reason": "No active nutrition plan",
                "action_link": "/healthcare/nutrition-planner"
            })
        
        return recommendations
    
    async def _generate_sustainability_recommendations(
        self,
        user_id: int,
        db: Session
    ) -> List[Dict[str, Any]]:
        """Generate sustainability-related recommendations"""
        recommendations = []
        
        # Check for recent eco actions
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_logs = db.query(SustainabilityLog).filter(
            SustainabilityLog.user_id == user_id,
            SustainabilityLog.logged_at >= week_ago
        ).count()
        
        if recent_logs == 0:
            recommendations.append({
                "title": "Log Your First Eco Action",
                "description": "You haven't logged any eco actions this week. Start by logging a simple action like recycling!",
                "module": "sustainability",
                "priority": "medium",
                "reason": "No eco actions logged this week",
                "action_link": "/sustainability/tracker"
            })
        elif recent_logs < 3:
            recommendations.append({
                "title": "Complete an Eco Challenge",
                "description": "Great start! Complete a weekly eco challenge to boost your impact.",
                "module": "sustainability",
                "priority": "low",
                "reason": "Few eco actions logged",
                "action_link": "/sustainability/challenges"
            })
        
        # Suggest trying the recycling game
        recommendations.append({
            "title": "Test Your Recycling Knowledge",
            "description": "Play the recycling sorting game and learn how to properly sort waste!",
            "module": "sustainability",
            "priority": "low",
            "reason": "Educational game available",
            "action_link": "/sustainability/recycling-game"
        })
        
        return recommendations


recommendation_service = RecommendationService()
