from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from .gemini_service import gemini_service


class SustainabilityService:
    """Service for sustainability/eco AI operations"""
    
    async def generate_eco_tips(
        self,
        recent_logs: Optional[List[Dict]] = None,
        user_preferences: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Generate personalized eco tips based on user activity"""
        logs_summary = ""
        if recent_logs:
            logs_summary = f"\nRecent user activities:\n"
            for log in recent_logs[:5]:
                logs_summary += f"- {log.get('action_type', 'Action')}: {log.get('quantity', '')} {log.get('unit', '')}\n"
        
        prompt = f"""
Generate 5 personalized eco-friendly tips for the user.{logs_summary}

For each tip, provide:
- category: waste, energy, water, transportation, or food
- tip: The actionable suggestion
- impact: Estimated environmental impact
- difficulty: easy, medium, or hard

Format as JSON array of tips.
"""
        
        schema = {
            "tips": [
                {
                    "category": "",
                    "tip": "",
                    "impact": "",
                    "difficulty": "easy"
                }
            ]
        }
        
        result = await gemini_service.generate_structured(prompt, schema)
        return result.get("tips", [])
    
    async def generate_impact_summary(
        self,
        logs: List[Dict[str, Any]],
        period: str = "monthly"
    ) -> Dict[str, Any]:
        """Generate an AI summary of environmental impact"""
        logs_text = "\n".join([
            f"- {log.get('action_type', 'Action')}: {log.get('quantity', 0)} {log.get('unit', '')} (CO2: {log.get('co2_saved_kg', 0)} kg)"
            for log in logs
        ])
        
        prompt = f"""
Generate an environmental impact summary for the {period} period based on these activities:

{logs_text}

Provide:
1. A narrative summary of the user's impact
2. 3-5 personalized recommendations for improvement
3. Positive reinforcement for good actions

Format as JSON with:
- summary: Narrative summary
- recommendations: Array of suggestions
- encouragement: Positive message
"""
        
        schema = {
            "summary": "",
            "recommendations": [],
            "encouragement": ""
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def generate_eco_trivia_questions(
        self,
        category: str = "general",
        count: int = 5,
        mode: str = "normal"
    ) -> List[Dict[str, Any]]:
        """Generate eco trivia questions"""
        difficulty = "easy" if mode == "kids" else "medium"
        
        prompt = f"""
Generate {count} eco-trivia questions for {mode} mode.
Category: {category}
Difficulty: {difficulty}

For each question, provide:
- question: The question text
- options: Array of 4 possible answers
- correct_answer: The correct option
- explanation: Brief explanation of the answer

Make questions educational and engaging.
Format as JSON array.
"""
        
        schema = {
            "questions": [
                {
                    "question": "",
                    "options": ["", "", "", ""],
                    "correct_answer": "",
                    "explanation": "",
                    "difficulty": difficulty
                }
            ]
        }
        
        result = await gemini_service.generate_structured(prompt, schema)
        return result.get("questions", [])
    
    async def recommend_challenges(
        self,
        user_logs: Optional[List[Dict]] = None,
        completed_challenges: Optional[List[int]] = None
    ) -> List[str]:
        """Recommend eco challenges based on user history"""
        history = ""
        if user_logs:
            actions = {}
            for log in user_logs:
                action = log.get('action_type', 'other')
                actions[action] = actions.get(action, 0) + 1
            history = f"User's common actions: {str(actions)}"
        
        prompt = f"""
Recommend 3 eco-challenges for the user based on their activity.
{history}

Suggest challenges that:
1. Build on existing habits
2. Introduce new sustainable practices
3. Are achievable and motivating

Format as JSON array of challenge descriptions.
"""
        
        schema = {"challenges": [""]}
        result = await gemini_service.generate_structured(prompt, schema)
        return result.get("challenges", [])
    
    async def calculate_impact_metrics(
        self,
        action_type: str,
        quantity: float,
        unit: str
    ) -> Dict[str, float]:
        """Calculate environmental impact metrics for an action"""
        # Simplified calculations - in production, use proper emission factors
        impact = {
            "co2_saved_kg": 0.0,
            "water_saved_liters": 0.0,
            "energy_saved_kwh": 0.0,
            "waste_diverted_kg": 0.0
        }
        
        if action_type == "recycling":
            impact["co2_saved_kg"] = quantity * 0.5  # Approximate
            impact["waste_diverted_kg"] = quantity
        elif action_type == "composting":
            impact["co2_saved_kg"] = quantity * 0.3
            impact["waste_diverted_kg"] = quantity
        elif action_type == "energy_saving":
            if unit.lower() in ["kwh", "kwh"]:
                impact["energy_saved_kwh"] = quantity
                impact["co2_saved_kg"] = quantity * 0.4
        elif action_type == "water_saving":
            if unit.lower() in ["liters", "l"]:
                impact["water_saved_liters"] = quantity
        elif action_type == "transportation":
            if unit.lower() in ["km", "miles"]:
                impact["co2_saved_kg"] = quantity * 0.12  # Walking/biking instead of driving
        
        return impact


sustainability_service = SustainabilityService()
