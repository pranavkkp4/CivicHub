from typing import List, Dict, Any, Optional
import json
from .gemini_service import gemini_service


class StudyService:
    """Service for education/study-related AI operations"""
    
    async def generate_flashcards(
        self, 
        content: str, 
        count: int = 10, 
        difficulty: str = "medium"
    ) -> List[Dict[str, str]]:
        """Generate flashcards from study material"""
        prompt = f"""
Create {count} flashcards from the following study material.
Difficulty level: {difficulty}

Material:
{content[:5000]}

For each flashcard, provide:
- front: The question or prompt
- back: The answer or explanation
- difficulty: easy, medium, or hard

Format as JSON array.
"""
        
        schema = {
            "flashcards": [
                {"front": "", "back": "", "difficulty": "medium"}
            ]
        }
        
        result = await gemini_service.generate_structured(prompt, schema)
        return result.get("flashcards", [])
    
    async def generate_cheatsheet(
        self, 
        content: str, 
        title: str = "Study Cheatsheet"
    ) -> Dict[str, Any]:
        """Generate a cheatsheet from study material"""
        prompt = f"""
Create a comprehensive cheatsheet from the following material.
Title: {title}

Material:
{content[:8000]}

Provide:
1. A concise summary of key concepts
2. Important formulas (if applicable)
3. Key points to remember
4. Quick reference information

Format as JSON with fields: title, content (markdown), key_points (array), formulas (array).
"""
        
        schema = {
            "title": "",
            "content": "",
            "key_points": [],
            "formulas": []
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def generate_summary(
        self, 
        content: str, 
        max_length: int = 500
    ) -> Dict[str, Any]:
        """Generate a summary from study material"""
        prompt = f"""
Summarize the following material in approximately {max_length} words.

Material:
{content[:10000]}

Provide:
1. A concise summary
2. 3-5 key takeaways
3. Estimated reading time in minutes

Format as JSON with fields: summary, key_takeaways (array), reading_time_minutes.
"""
        
        schema = {
            "summary": "",
            "key_takeaways": [],
            "reading_time_minutes": 0
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def generate_mock_test(
        self, 
        content: str, 
        question_count: int = 10,
        difficulty: str = "medium"
    ) -> Dict[str, Any]:
        """Generate a mock test from study material"""
        prompt = f"""
Create a mock test with {question_count} multiple-choice questions based on the following material.
Difficulty: {difficulty}

Material:
{content[:8000]}

For each question, provide:
- question_text: The question
- options: Array of 4 possible answers
- correct_answer: The correct option (exact match from options)
- explanation: Brief explanation of the answer
- topic: The topic/category this question covers
- points: Point value (1-3 based on difficulty)

Format as JSON with title, description, and questions array.
"""
        
        schema = {
            "title": "Mock Test",
            "description": "",
            "questions": [
                {
                    "question_text": "",
                    "options": ["", "", "", ""],
                    "correct_answer": "",
                    "explanation": "",
                    "topic": "",
                    "points": 1
                }
            ]
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def generate_interview_questions(
        self, 
        topic: str, 
        count: int = 5,
        difficulty: str = "medium",
        material_content: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Generate interview questions"""
        material_context = f"\nBased on this material:\n{material_content[:3000]}" if material_content else ""
        
        prompt = f"""
Generate {count} interview questions about: {topic}
Difficulty: {difficulty}
{material_context}

Provide questions that test understanding, not just memorization.
Format as JSON array with question field.
"""
        
        schema = {
            "questions": [{"question": ""}]
        }
        
        result = await gemini_service.generate_structured(prompt, schema)
        return result.get("questions", [])
    
    async def evaluate_interview_answer(
        self, 
        question: str, 
        answer: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Evaluate an interview answer"""
        context_prompt = f"\nContext from study material:\n{context[:2000]}" if context else ""
        
        prompt = f"""
Evaluate the following interview answer:

Question: {question}

User's Answer: {answer}
{context_prompt}

Provide:
1. Score (0-100)
2. Constructive feedback
3. An improved version of the answer
4. Key strengths (2-3 points)
5. Areas for improvement (2-3 points)

Format as JSON with fields: score, feedback, improved_answer, strengths (array), areas_for_improvement (array).
"""
        
        schema = {
            "score": 0,
            "feedback": "",
            "improved_answer": "",
            "strengths": [],
            "areas_for_improvement": []
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def identify_weak_topics(
        self, 
        incorrect_answers: List[Dict[str, str]]
    ) -> List[str]:
        """Identify weak topics from incorrect answers"""
        answers_text = "\n".join([
            f"Q: {a.get('question', '')}\nTopic: {a.get('topic', 'Unknown')}"
            for a in incorrect_answers
        ])
        
        prompt = f"""
Based on these incorrect answers, identify the weak topics that need more study:

{answers_text}

List the top 5 weak topics as a JSON array of strings.
"""
        
        schema = {"weak_topics": [""]}
        result = await gemini_service.generate_structured(prompt, schema)
        return result.get("weak_topics", [])


study_service = StudyService()
