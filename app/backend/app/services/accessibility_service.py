from typing import Dict, Any, Optional, List
from .gemini_service import gemini_service


class AccessibilityService:
    """Service for accessibility text transformation AI operations"""
    
    async def simplify_text(
        self,
        text: str,
        level: str = "intermediate",
        max_sentences: Optional[int] = None
    ) -> Dict[str, Any]:
        """Simplify complex text for easier reading"""
        sentence_limit = f" Use maximum {max_sentences} sentences." if max_sentences else ""
        
        prompt = f"""
Simplify the following text to {level} reading level.{sentence_limit}

Original text:
{text[:5000]}

Provide:
1. Simplified version of the text
2. 3-5 key points extracted
3. Reading level achieved

Format as JSON with:
- simplified_text: The simplified version
- key_points: Array of key points
- reading_level: The achieved reading level
- word_count_original: Original word count
- word_count_simplified: Simplified word count
"""
        
        schema = {
            "simplified_text": "",
            "key_points": [],
            "reading_level": level,
            "word_count_original": 0,
            "word_count_simplified": 0
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def translate_text(
        self,
        text: str,
        target_language: str,
        source_language: Optional[str] = None,
        simplify: bool = False
    ) -> Dict[str, Any]:
        """Translate text to target language"""
        simplify_instruction = " Simplify the translation for easier understanding." if simplify else ""
        source = f" from {source_language}" if source_language else ""
        
        prompt = f"""
Translate the following text{source} to {target_language}.{simplify_instruction}

Text to translate:
{text[:3000]}

Provide:
1. The translated text
2. Detected source language (if not specified)
3. Word count

Format as JSON with:
- translated_text: The translation
- detected_source_language: Source language code
- target_language: Target language code
- word_count: Number of words
"""
        
        schema = {
            "translated_text": "",
            "detected_source_language": source_language or "auto",
            "target_language": target_language,
            "word_count": 0
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def summarize_text(
        self,
        text: str,
        max_length: int = 200,
        style: str = "concise"
    ) -> Dict[str, Any]:
        """Summarize long text"""
        style_instructions = {
            "concise": "Create a brief, concise summary.",
            "detailed": "Create a comprehensive summary with key details.",
            "bullet_points": "Create a bulleted list of key points."
        }
        
        style_prompt = style_instructions.get(style, style_instructions["concise"])
        
        prompt = f"""
Summarize the following text in approximately {max_length} words.
{style_prompt}

Text to summarize:
{text[:8000]}

Provide:
1. The summary
2. 3-5 key takeaways
3. Compression ratio (summary length / original length)
4. Reading time saved

Format as JSON with:
- summary: The summarized text
- key_takeaways: Array of key points
- compression_ratio: Float between 0 and 1
- reading_time_saved_minutes: Estimated minutes saved
"""
        
        schema = {
            "summary": "",
            "key_takeaways": [],
            "compression_ratio": 0.0,
            "reading_time_saved_minutes": 0
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def read_assist(
        self,
        text: str,
        highlight_key_terms: bool = True,
        add_phonetics: bool = False,
        break_into_chunks: bool = True
    ) -> Dict[str, Any]:
        """Transform text for easier reading assistance"""
        prompt = f"""
Transform the following text for reading assistance:

Original text:
{text[:3000]}

Provide:
1. A version with key terms highlighted/explained
2. Break into manageable chunks if long
3. Identify key terms with brief definitions
4. Estimate reading level

Format as JSON with:
- assisted_text: Transformed text
- key_terms: Array of {{term, definition, phonetic}}
- chunks: Array of text chunks
- estimated_reading_level: Reading level description
"""
        
        schema = {
            "assisted_text": "",
            "key_terms": [
                {"term": "", "definition": "", "phonetic": ""}
            ],
            "chunks": [],
            "estimated_reading_level": ""
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    async def process_voice_command(
        self,
        command_text: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a voice command and determine action"""
        context_str = f"\nContext: {context}" if context else ""
        
        prompt = f"""
Process this voice command from the user:
"{command_text}"{context_str}

The app has these modules: education, healthcare, sustainability, accessibility

Determine:
1. The user's intent
2. Any parameters extracted
3. The appropriate action/page to navigate to
4. A response message

Format as JSON with:
- command: Normalized command
- intent: Primary intent
- parameters: Extracted parameters as object
- action: Recommended action
- redirect_url: URL to navigate to (if applicable)
- message: Response to user
"""
        
        schema = {
            "command": "",
            "intent": "",
            "parameters": {},
            "action": "",
            "redirect_url": "",
            "message": ""
        }
        
        return await gemini_service.generate_structured(prompt, schema)
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages for translation"""
        return [
            {"code": "en", "name": "English"},
            {"code": "es", "name": "Spanish"},
            {"code": "fr", "name": "French"},
            {"code": "de", "name": "German"},
            {"code": "it", "name": "Italian"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "zh", "name": "Chinese"},
            {"code": "ja", "name": "Japanese"},
            {"code": "ko", "name": "Korean"},
            {"code": "ar", "name": "Arabic"},
            {"code": "hi", "name": "Hindi"},
            {"code": "ru", "name": "Russian"},
        ]


accessibility_service = AccessibilityService()
