from typing import List, Dict, Any, Optional
from .gemini_service import gemini_service


class HealthcareService:
    """Service for healthcare/wellness AI operations"""
    
    async def generate_workout_plan(
        self,
        goal: str,
        fitness_level: str,
        days_per_week: int,
        time_per_session: int,
        equipment: List[str],
        injuries: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a personalized workout plan"""
        prompt = f"""
Create a detailed workout plan with the following parameters:
- Goal: {goal}
- Fitness Level: {fitness_level}
- Days per week: {days_per_week}
- Time per session: {time_per_session} minutes
- Available equipment: {', '.join(equipment)}
- Injuries/Limitations: {injuries or 'None'}

Provide a structured plan with:
1. Weekly schedule with specific exercises for each day
2. Sets, reps, and rest periods
3. Warm-up and cool-down routines
4. Safety tips

Format as JSON with:
- description: Overview of the plan
- weekly_schedule: Array of days with exercises
- warmup: Warm-up instructions
- cooldown: Cool-down instructions
- tips: Array of safety tips
"""
        
        schema = {
            "description": "",
            "weekly_schedule": [
                {
                    "day": "Monday",
                    "focus": "",
                    "exercises": [
                        {"name": "", "sets": 0, "reps": "", "rest_seconds": 0, "notes": ""}
                    ],
                    "duration_minutes": 0
                }
            ],
            "warmup": "",
            "cooldown": "",
            "tips": []
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def generate_nutrition_plan(
        self,
        goal: str,
        diet_type: Optional[str],
        allergies: List[str],
        meals_per_day: int,
        cooking_time: str,
        calorie_target: Optional[int]
    ) -> Dict[str, Any]:
        """Generate a personalized nutrition plan"""
        calorie_str = f"Target calories: {calorie_target}" if calorie_target else "Calculate appropriate calories"
        
        prompt = f"""
Create a detailed nutrition plan with:
- Goal: {goal}
- Diet type: {diet_type or 'No preference'}
- Allergies/Restrictions: {', '.join(allergies) if allergies else 'None'}
- Meals per day: {meals_per_day}
- Cooking time available: {cooking_time}
- {calorie_str}

Provide:
1. A 7-day meal plan with specific meals
2. Portion sizes and nutritional info
3. A shopping list organized by category
4. Meal prep tips

Format as JSON with:
- description: Overview
- daily_plans: Array of 7 days with meals
- shopping_list: Array of categories with items
- guidelines: Array of dietary guidelines
"""
        
        schema = {
            "description": "",
            "daily_plans": [
                {
                    "day": "Day 1",
                    "meals": [
                        {
                            "meal_type": "breakfast",
                            "items": [{"name": "", "portion": "", "calories": 0}],
                            "total_calories": 0
                        }
                    ],
                    "daily_totals": {"calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0}
                }
            ],
            "shopping_list": [{"category": "", "items": []}],
            "guidelines": [],
            "hydration_tips": ""
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def assess_health_risks(
        self,
        assessment_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Assess health risks based on user data"""
        prompt = f"""
Based on the following health assessment data, identify potential health risks:
{str(assessment_data)}

For each risk identified, provide:
- risk_type: Type of risk (cardiovascular, diabetes, etc.)
- risk_level: low, moderate, or high
- risk_score: 0-100
- factors: Contributing factors
- recommendations: Ways to mitigate

Format as JSON array of risks.
Include a disclaimer that this is not medical advice.
"""
        
        schema = {
            "risks": [
                {
                    "risk_type": "",
                    "risk_level": "",
                    "risk_score": 0,
                    "factors": [],
                    "recommendations": [],
                    "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
                }
            ]
        }
        
        result = await gemini_service.generate_structured(prompt, schema)
        return result.get("risks", [])
    
    async def get_symptom_guidance(
        self,
        symptoms: List[str],
        duration: Optional[str],
        severity: Optional[str]
    ) -> Dict[str, Any]:
        """Get AI guidance for symptoms"""
        prompt = f"""
Provide general wellness guidance for the following symptoms:
Symptoms: {', '.join(symptoms)}
Duration: {duration or 'Not specified'}
Severity: {severity or 'Not specified'}

Provide:
1. General self-care suggestions
2. Possible red flags that require medical attention
3. When to consult a healthcare professional

IMPORTANT: This is NOT medical advice. Include a strong disclaimer.

Format as JSON with:
- guidance: General information
- self_care_suggestions: Array of suggestions
- red_flags: Array of warning signs
- disclaimer: Required medical disclaimer
"""
        
        schema = {
            "guidance": "",
            "self_care_suggestions": [],
            "red_flags": [],
            "disclaimer": "This is not medical advice. Consult a healthcare professional for proper diagnosis and treatment."
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def generate_daily_wellness_tips(
        self,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate daily wellness recommendations"""
        context_str = str(user_context) if user_context else "General wellness"
        
        prompt = f"""
Generate personalized daily wellness tips for: {context_str}

Provide recommendations for:
1. Hydration
2. Sleep
3. Movement/Exercise
4. Stress management

Format as JSON with:
- hydration: Hydration reminder/tip
- sleep: Sleep suggestion
- movement: Movement suggestion
- stress: Stress management tip
"""
        
        schema = {
            "hydration": "",
            "sleep": "",
            "movement": "",
            "stress": ""
        }
        
        return await gemini_service.generate_structured(prompt, schema)


healthcare_service = HealthcareService()
