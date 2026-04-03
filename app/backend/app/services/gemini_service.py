import httpx
import json
import logging
from typing import Optional, List, Dict, Any
from ..core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
GEMINI_FALLBACK_MODELS = ("gemini-flash-latest",)


class GeminiService:
    def __init__(self):
        self.base_url = GEMINI_API_BASE
        self.api_keys = settings.get_gemini_api_keys()
        self.api_key = self.api_keys[0] if self.api_keys else ""
        self.model = settings.GEMINI_MODEL

    def _get_model_name(self) -> str:
        return self.model.replace("models/", "").strip() or "gemini-2.5-flash"

    def has_credentials(self) -> bool:
        return bool(self.api_keys)

    def _get_candidate_api_keys(self) -> List[str]:
        return self.api_keys

    def _get_candidate_models(self) -> List[str]:
        primary = self._get_model_name()
        ordered_models = [primary, *GEMINI_FALLBACK_MODELS]
        unique_models: List[str] = []
        for model in ordered_models:
            cleaned = model.replace("models/", "").strip()
            if cleaned and cleaned not in unique_models:
                unique_models.append(cleaned)
        return unique_models
    
    async def generate_content(
        self, 
        prompt: str, 
        temperature: float = 0.7,
        max_tokens: int = 2048,
        service_name: Optional[str] = None,
        allow_fallback: bool = True
    ) -> str:
        """Generate content using Gemini API"""
        if not self.api_keys:
            if allow_fallback:
                return self._get_fallback_response(prompt)
            raise RuntimeError(f"Gemini API key is not configured for {service_name or 'general'}")
        
        last_error: Optional[Exception] = None

        async with httpx.AsyncClient() as client:
            for key_index, api_key in enumerate(self._get_candidate_api_keys(), start=1):
                for model_name in self._get_candidate_models():
                    try:
                        response = await client.post(
                            f"{self.base_url}/{model_name}:generateContent?key={api_key}",
                            json={
                                "contents": [{"parts": [{"text": prompt}]}],
                                "generationConfig": {
                                    "temperature": temperature,
                                    "maxOutputTokens": max_tokens,
                                }
                            },
                            timeout=60.0
                        )

                        if response.status_code == 200:
                            data = response.json()
                            if "candidates" in data and len(data["candidates"]) > 0:
                                parts = data["candidates"][0].get("content", {}).get("parts", [])
                                if parts and isinstance(parts[0].get("text"), str):
                                    return parts[0]["text"]

                            raise RuntimeError(
                                f"Gemini model {model_name} returned no usable content for {service_name or 'general'}"
                            )

                        raise RuntimeError(
                            f"Gemini model {model_name} returned HTTP {response.status_code} for {service_name or 'general'}: {response.text[:500]}"
                        )
                    except Exception as e:
                        last_error = e
                        logger.warning(
                            "Gemini API error for %s with key #%s using %s: %s",
                            service_name or "general",
                            key_index,
                            model_name,
                            e,
                        )
                        continue

        if allow_fallback:
            return self._get_fallback_response(prompt)

        raise RuntimeError(f"Gemini API request failed for {service_name or 'general'}") from last_error
    
    async def generate_structured(
        self, 
        prompt: str, 
        output_schema: Dict[str, Any],
        temperature: float = 0.3,
        max_tokens: int = 2048,
        service_name: Optional[str] = None,
        allow_fallback: bool = True
    ) -> Dict[str, Any]:
        """Generate structured JSON output"""
        structured_prompt = f"""
{prompt}

You must respond with a valid JSON object following this exact schema:
{json.dumps(output_schema, indent=2)}

Respond ONLY with the JSON object, no additional text.
"""
        
        response_text = await self.generate_content(
            structured_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            service_name=service_name,
            allow_fallback=allow_fallback,
        )
        
        try:
            # Extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            return json.loads(response_text)
        except json.JSONDecodeError:
            if allow_fallback:
                return output_schema  # Return empty schema on error
            raise ValueError(f"Gemini returned non-JSON output for {service_name or 'general'}")
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Provide fallback responses when API is unavailable"""
        prompt_lower = prompt.lower()
        
        if "education agent" in prompt_lower:
            return json.dumps({
                "action": "Review one study material and generate a quick mock test.",
                "summary": "You are in a good position to reinforce what you've already saved and identify any weak topics.",
                "recommendations": [
                    {
                        "title": "Open Study Materials",
                        "description": "Review your latest notes or readings before taking a short practice test.",
                        "link": "/education/materials",
                    },
                    {
                        "title": "Generate Flashcards",
                        "description": "Turn your strongest study material into quick review cards.",
                        "link": "/education/flashcards",
                    }
                ],
                "follow_up_prompts": [
                    "What should I review next?",
                    "Generate a practice test for my latest notes."
                ],
                "relevant_links": [
                    {"label": "Education Dashboard", "url": "/education"},
                    {"label": "Weak Topics", "url": "/education/weak-topics"}
                ]
            })
        elif "mock test" in prompt_lower or "practice test" in prompt_lower:
            return json.dumps({
                "title": "Mock Test",
                "description": "Practice with a short, focused check of your study material.",
                "questions": [
                    {
                        "question_text": "What is one key concept from the material?",
                        "options": [
                            "A detail that matches the topic",
                            "An unrelated idea",
                            "A contradiction",
                            "A random guess"
                        ],
                        "correct_answer": "A detail that matches the topic",
                        "explanation": "The best answer should reflect the material you are studying.",
                        "topic": "Core concept",
                        "points": 1
                    }
                ]
            })
        elif "evaluate the following interview answer" in prompt_lower or (
            "interview answer" in prompt_lower and "improved_answer" in prompt_lower
        ):
            return json.dumps({
                "score": 82,
                "feedback": "Your answer has a clear opening and a solid direction. Make it stronger by adding one concrete example and closing with the impact of your decision.",
                "improved_answer": "I would start by defining the goal, identifying the user need, and comparing the main tradeoffs. Then I would choose the direction that best balances user value, feasibility, and measurable impact.",
                "strengths": [
                    "You lead with a clear high-level approach.",
                    "The answer shows structured thinking under pressure."
                ],
                "areas_for_improvement": [
                    "Add a specific example to make the answer feel grounded.",
                    "End with the outcome or metric you would optimize for."
                ]
            })
        elif "interview" in prompt_lower:
            return json.dumps({
                "questions": [
                    {"question": "Explain the core idea in your own words."},
                    {"question": "How would you apply this concept in a real scenario?"}
                ]
            })
        elif "summary" in prompt_lower:
            return json.dumps({
                "summary": "A concise summary is unavailable, so review the main idea and key terms from the source material.",
                "key_takeaways": ["Review the original notes", "Focus on the central formulas or definitions"],
                "reading_time_minutes": 5
            })
        elif "cheatsheet" in prompt_lower:
            return json.dumps({
                "title": "Study Cheatsheet",
                "content": "Use this space for a compact review of the most important ideas.",
                "key_points": ["Key definition", "Important example", "Common pitfall"],
                "formulas": []
            })
        elif "weak topics" in prompt_lower:
            return json.dumps({
                "weak_topics": ["Review the topic again", "Try a shorter practice set"]
            })
        elif "wellness agent" in prompt_lower or "healthcare dashboard" in prompt_lower:
            return json.dumps({
                "priority": "Focus on a simple, sustainable wellness routine today.",
                "suggestions": {
                    "hydration": "Drink water regularly throughout the day.",
                    "sleep": "Aim for a consistent sleep window tonight.",
                    "movement": "Take a short walk or light mobility break.",
                    "stress": "Pause for a few minutes of intentional breathing."
                },
                "plan_recommendations": [
                    "Create a workout plan if you do not have one yet."
                ],
                "safety_note": "This is general wellness guidance and is not a substitute for medical advice."
            })
        elif "sustainability agent" in prompt_lower or "eco guidance" in prompt_lower:
            return json.dumps({
                "personalized_tip": {
                    "category": "daily habit",
                    "tip": "Choose one low-effort eco action and track it today.",
                    "impact": "Builds momentum and keeps your sustainability streak active.",
                    "difficulty": "easy"
                },
                "challenge_recommendations": [
                    "Log a recycling or energy-saving action.",
                    "Complete one short eco challenge."
                ],
                "event_suggestions": [
                    "Community clean-up",
                    "Recycling awareness activity"
                ],
                "impact_summary": "Small consistent actions create visible progress over time."
            })
        elif "eco" in prompt_lower or "sustainability" in prompt_lower:
            return "Try reducing single-use plastics and using public transportation when possible."
        elif "accessibility agent" in prompt_lower or "make content more accessible" in prompt_lower:
            return json.dumps({
                "recommended_transformation": {
                    "type": "simplify",
                    "settings": {"level": "intermediate"}
                },
                "accessibility_suggestions": [
                    "Use shorter sentences and clear headings.",
                    "Break long passages into smaller sections."
                ],
                "tool_recommendations": [
                    "Text Simplifier",
                    "Summarizer"
                ],
                "study_content_tips": [
                    "Keep one idea per paragraph.",
                    "Highlight key terms before sharing."
                ]
            })
        elif "flashcard" in prompt_lower:
            return json.dumps({
                "flashcards": [
                    {"front": "Sample Question 1", "back": "Sample Answer 1", "difficulty": "medium"},
                    {"front": "Sample Question 2", "back": "Sample Answer 2", "difficulty": "medium"},
                ]
            })
        elif "workout" in prompt_lower:
            return json.dumps({
                "weekly_schedule": [
                    {"day": "Monday", "focus": "Cardio", "exercises": [{"name": "Running", "duration_minutes": 30}]}
                ]
            })
        elif "nutrition" in prompt_lower or "meal" in prompt_lower:
            return json.dumps({
                "daily_plans": [
                    {"day": "Day 1", "meals": [{"meal_type": "Breakfast", "items": [{"name": "Oatmeal", "portion": "1 bowl"}]}]}
                ]
            })
        elif "simplify" in prompt_lower:
            return "This is a simplified version of the text."
        elif "translate" in prompt_lower:
            return "This is the translated text."
        else:
            return "I'm here to help! (AI service is currently using fallback mode)"


# Singleton instance
gemini_service = GeminiService()
