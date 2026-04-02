import httpx
import json
from typing import Optional, List, Dict, Any
from ..core.config import get_settings

settings = get_settings()

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = GEMINI_API_URL
    
    async def generate_content(
        self, 
        prompt: str, 
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate content using Gemini API"""
        if not self.api_key:
            return self._get_fallback_response(prompt)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}?key={self.api_key}",
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
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                
                return self._get_fallback_response(prompt)
            except Exception as e:
                print(f"Gemini API error: {e}")
                return self._get_fallback_response(prompt)
    
    async def generate_structured(
        self, 
        prompt: str, 
        output_schema: Dict[str, Any],
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """Generate structured JSON output"""
        structured_prompt = f"""
{prompt}

You must respond with a valid JSON object following this exact schema:
{json.dumps(output_schema, indent=2)}

Respond ONLY with the JSON object, no additional text.
"""
        
        response_text = await self.generate_content(structured_prompt, temperature)
        
        try:
            # Extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            return json.loads(response_text)
        except json.JSONDecodeError:
            return output_schema  # Return empty schema on error
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Provide fallback responses when API is unavailable"""
        prompt_lower = prompt.lower()
        
        if "flashcard" in prompt_lower:
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
        elif "eco" in prompt_lower or "sustainability" in prompt_lower:
            return "Try reducing single-use plastics and using public transportation when possible."
        elif "simplify" in prompt_lower:
            return "This is a simplified version of the text."
        elif "translate" in prompt_lower:
            return "This is the translated text."
        else:
            return "I'm here to help! (AI service is currently using fallback mode)"


# Singleton instance
gemini_service = GeminiService()
