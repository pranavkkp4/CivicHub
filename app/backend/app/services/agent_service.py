from typing import Dict, Any, List, Optional
from .gemini_service import gemini_service
from .study_service import study_service
from .healthcare_service import healthcare_service
from .sustainability_service import sustainability_service
from .accessibility_service import accessibility_service


class AgentService:
    """Service for specialized domain agents"""
    
    async def run_education_agent(
        self,
        user_context: Dict[str, Any],
        recent_activity: List[Dict],
        current_page: Optional[str] = None,
        selected_material_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Run the education agent to provide personalized guidance"""
        activity_summary = "\n".join([
            f"- {a.get('action', 'Action')} on {a.get('created_at', 'recently')}"
            for a in recent_activity[:5]
        ])
        
        weak_topics = user_context.get('weak_topics', [])
        study_materials_count = user_context.get('study_materials_count', 0)
        recent_test_scores = user_context.get('recent_test_scores', [])
        
        prompt = f"""
You are the Education Agent for Impact OS. Analyze the user's learning context and provide personalized guidance.

User Context:
- Study materials: {study_materials_count}
- Weak topics: {', '.join(weak_topics) if weak_topics else 'None identified'}
- Recent test scores: {recent_test_scores}

Recent Activity:
{activity_summary}

Current page: {current_page or 'Education dashboard'}
Selected material ID: {selected_material_id or 'None'}

Provide:
1. Next recommended action (specific and actionable)
2. Brief summary of learning status
3. 2-3 personalized recommendations
4. Optional follow-up prompts for the user
5. Links to relevant pages/tools

Format as JSON with:
- action: Primary recommended action
- summary: Brief status summary
- recommendations: Array of recommendation objects {{title, description, link}}
- follow_up_prompts: Array of suggested user queries
- relevant_links: Array of {{label, url}}
"""
        
        schema = {
            "action": "",
            "summary": "",
            "recommendations": [
                {"title": "", "description": "", "link": ""}
            ],
            "follow_up_prompts": [],
            "relevant_links": [{"label": "", "url": ""}]
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def run_wellness_agent(
        self,
        user_context: Dict[str, Any],
        recent_activity: List[Dict],
        current_page: Optional[str] = None
    ) -> Dict[str, Any]:
        """Run the wellness agent to provide health guidance"""
        active_plans = user_context.get('active_plans', [])
        recent_symptoms = user_context.get('recent_symptoms', [])
        wellness_goals = user_context.get('wellness_goals', [])
        
        prompt = f"""
You are the Wellness Agent for Impact OS. Provide personalized wellness guidance.

User Context:
- Active plans: {active_plans}
- Recent symptoms: {recent_symptoms}
- Wellness goals: {wellness_goals}

Recent Activity:
{recent_activity[:3]}

Current page: {current_page or 'Healthcare dashboard'}

Provide:
1. Today's wellness priority
2. Personalized suggestions (hydration, sleep, movement, stress)
3. Recommendations based on active plans
4. Safety-conscious guidance

Format as JSON with:
- priority: Today's main wellness focus
- suggestions: Object with hydration, sleep, movement, stress keys
- plan_recommendations: Array of plan-related suggestions
- safety_note: Any safety considerations
"""
        
        schema = {
            "priority": "",
            "suggestions": {
                "hydration": "",
                "sleep": "",
                "movement": "",
                "stress": ""
            },
            "plan_recommendations": [],
            "safety_note": ""
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def run_sustainability_agent(
        self,
        user_context: Dict[str, Any],
        recent_logs: List[Dict],
        current_page: Optional[str] = None
    ) -> Dict[str, Any]:
        """Run the sustainability agent to provide eco guidance"""
        total_actions = user_context.get('total_actions', 0)
        co2_saved = user_context.get('co2_saved_kg', 0)
        favorite_categories = user_context.get('favorite_categories', [])
        
        logs_summary = "\n".join([
            f"- {log.get('action_type', 'Action')}: {log.get('quantity', '')} {log.get('unit', '')}"
            for log in recent_logs[:5]
        ])
        
        prompt = f"""
You are the Sustainability Agent for Impact OS. Provide personalized eco guidance.

User Context:
- Total eco actions: {total_actions}
- CO2 saved: {co2_saved} kg
- Favorite categories: {favorite_categories}

Recent Activity:
{logs_summary}

Current page: {current_page or 'Sustainability dashboard'}

Provide:
1. Personalized eco tip based on recent activity
2. Challenge recommendations
3. Event suggestions
4. Impact summary and encouragement

Format as JSON with:
- personalized_tip: Object with category, tip, impact, difficulty
- challenge_recommendations: Array of challenge suggestions
- event_suggestions: Array of suggested event types
- impact_summary: Encouraging summary of their impact
"""
        
        schema = {
            "personalized_tip": {
                "category": "",
                "tip": "",
                "impact": "",
                "difficulty": "easy"
            },
            "challenge_recommendations": [],
            "event_suggestions": [],
            "impact_summary": ""
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def run_accessibility_agent(
        self,
        user_context: Dict[str, Any],
        recent_transforms: List[Dict],
        current_page: Optional[str] = None,
        content_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Run the accessibility agent to provide accessibility guidance"""
        preferred_complexity = user_context.get('preferred_complexity', 'intermediate')
        preferred_language = user_context.get('preferred_language', 'en')
        
        prompt = f"""
You are the Accessibility Agent for Impact OS. Help users make content more accessible.

User Context:
- Preferred complexity: {preferred_complexity}
- Preferred language: {preferred_language}
- Recent transforms: {len(recent_transforms)} in the last 30 days

Content context: {content_context or 'None provided'}
Current page: {current_page or 'Accessibility dashboard'}

Provide:
1. Recommended transformation for current content
2. Accessibility suggestions
3. Tool recommendations
4. Study content accessibility tips

Format as JSON with:
- recommended_transformation: Suggested transform type and settings
- accessibility_suggestions: Array of suggestions
- tool_recommendations: Array of recommended tools
- study_content_tips: Tips for making study materials accessible
"""
        
        schema = {
            "recommended_transformation": {
                "type": "",
                "settings": {}
            },
            "accessibility_suggestions": [],
            "tool_recommendations": [],
            "study_content_tips": []
        }
        
        return await gemini_service.generate_structured(prompt, schema)


agent_service = AgentService()
