from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class TextTransformRequest(BaseModel):
    text: str
    complexity_level: Optional[str] = "medium"  # beginner, intermediate, advanced
    target_language: Optional[str] = None
    max_length: Optional[int] = None


class TextTransformResponse(BaseModel):
    original_text: str
    transformed_text: str
    transform_type: str
    word_count_original: int
    word_count_transformed: int
    reading_time_minutes: Optional[int]
    created_at: datetime


class SimplifyRequest(BaseModel):
    text: str
    level: str = "intermediate"  # beginner, intermediate
    max_sentences: Optional[int] = None


class SimplifyResponse(BaseModel):
    original_text: str
    simplified_text: str
    key_points: List[str]
    reading_level: str
    word_count_original: int
    word_count_simplified: int


class TranslateRequest(BaseModel):
    text: str
    source_language: Optional[str] = None  # auto-detect if None
    target_language: str
    simplify: bool = False


class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    detected_source_language: Optional[str]
    target_language: str
    word_count: int


class SummarizeRequest(BaseModel):
    text: str
    max_length: int = 200
    style: str = "concise"  # concise, detailed, bullet_points


class SummarizeResponse(BaseModel):
    original_text: str
    summary: str
    key_takeaways: List[str]
    compression_ratio: float
    reading_time_saved_minutes: int


class ReadAssistRequest(BaseModel):
    text: str
    highlight_key_terms: bool = True
    add_phonetics: bool = False
    break_into_chunks: bool = True


class AccessibilityKeyTerm(BaseModel):
    term: str
    definition: str
    phonetic: Optional[str] = None


class ReadAssistResponse(BaseModel):
    original_text: str
    assisted_text: str
    key_terms: List[AccessibilityKeyTerm]
    chunks: List[str]
    estimated_reading_level: str


class AccessibilityTransformHistory(BaseModel):
    id: int
    transform_type: str
    original_preview: str
    transformed_preview: str
    created_at: datetime

    class Config:
        from_attributes = True


class AccessibilityProfile(BaseModel):
    preferred_complexity: str = "intermediate"
    preferred_language: str = "en"
    highlight_key_terms: bool = True
    large_text: bool = False
    high_contrast: bool = False
    screen_reader_optimized: bool = False


class VoiceCommandRequest(BaseModel):
    command_text: str
    context: Optional[str] = None


class VoiceCommandResponse(BaseModel):
    command: str
    intent: str
    parameters: Dict[str, Any]
    action: str
    redirect_url: Optional[str] = None
    message: str
