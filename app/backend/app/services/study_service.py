from typing import List, Dict, Any, Optional
import json
from .llm_router import llm_router

PLACEHOLDER_TEST_QUESTION = "What is one key concept from the material?"
PLACEHOLDER_TEST_OPTION = "A detail that matches the topic"


class StudyService:
    """Service for education/study-related AI operations"""
    
    async def generate_flashcards(
        self, 
        content: str, 
        count: int = 10, 
        difficulty: str = "medium",
        service_name: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Generate flashcards from study material"""
        resolved_service_name = service_name or "flashcards"
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
        
        result = await llm_router.generate_structured(
            prompt,
            schema,
            max_tokens=4096,
            service_name=resolved_service_name,
        )
        return result.get("flashcards", [])
    
    async def generate_cheatsheet(
        self, 
        content: str, 
        title: str = "Study Cheatsheet",
        service_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a cheatsheet from study material"""
        resolved_service_name = service_name or "materials"
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
        
        return await llm_router.generate_structured(
            prompt,
            schema,
            service_name=resolved_service_name,
        )
    
    async def generate_summary(
        self, 
        content: str, 
        max_length: int = 500,
        service_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a summary from study material"""
        resolved_service_name = service_name or "review"
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
        
        return await llm_router.generate_structured(
            prompt,
            schema,
            service_name=resolved_service_name,
        )
    
    async def generate_mock_test(
        self, 
        content: str, 
        question_count: int = 10,
        difficulty: str = "medium",
        service_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a mock test from study material"""
        resolved_service_name = service_name or "tests"
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
        
        result = await llm_router.generate_structured(
            prompt,
            schema,
            service_name=resolved_service_name,
        )
        if not self.is_valid_mock_test_payload(result):
            raise RuntimeError("The AI provider did not return a usable mock test.")
        return result
    
    async def generate_interview_questions(
        self, 
        topic: str, 
        count: int = 5,
        difficulty: str = "medium",
        material_content: Optional[str] = None,
        service_name: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Generate interview questions"""
        resolved_service_name = service_name or "interview"
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
        
        result = await llm_router.generate_structured(
            prompt,
            schema,
            service_name=resolved_service_name,
        )
        return result.get("questions", [])

    def is_valid_mock_test_payload(self, payload: Optional[Dict[str, Any]]) -> bool:
        if not isinstance(payload, dict):
            return False

        questions = payload.get("questions")
        if not isinstance(questions, list) or not questions:
            return False

        meaningful_questions = 0
        for question in questions:
            if not isinstance(question, dict):
                continue

            question_text = str(question.get("question_text", "")).strip()
            options = [
                str(option).strip()
                for option in question.get("options", [])
                if str(option).strip()
            ] if isinstance(question.get("options"), list) else []
            correct_answer = str(question.get("correct_answer", "")).strip()

            looks_like_placeholder = (
                question_text == PLACEHOLDER_TEST_QUESTION
                and PLACEHOLDER_TEST_OPTION in options
            )
            if question_text and correct_answer and len(options) >= 2 and not looks_like_placeholder:
                meaningful_questions += 1

        return meaningful_questions > 0
    
    async def evaluate_interview_answer(
        self, 
        question: str, 
        answer: str,
        context: Optional[str] = None,
        service_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Evaluate an interview answer"""
        resolved_service_name = service_name or "interview"
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
        
        return await llm_router.generate_structured(
            prompt,
            schema,
            service_name=resolved_service_name,
        )
    
    async def identify_weak_topics(
        self,
        incorrect_answers: List[Dict[str, str]],
        service_name: Optional[str] = None
    ) -> List[str]:
        """Identify weak topics from incorrect answers"""
        resolved_service_name = service_name or "review"
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
        result = await llm_router.generate_structured(
            prompt,
            schema,
            service_name=resolved_service_name,
        )
        return result.get("weak_topics", [])


study_service = StudyService()
