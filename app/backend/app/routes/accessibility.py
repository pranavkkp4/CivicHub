from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..routes.auth import get_current_active_user
from ..models.user import User
from ..models.accessibility import AccessibilityTransform
from ..schemas.accessibility import (
    SimplifyRequest, SimplifyResponse,
    TranslateRequest, TranslateResponse,
    SummarizeRequest, SummarizeResponse,
    ReadAssistRequest, ReadAssistResponse,
    VoiceCommandRequest, VoiceCommandResponse,
    AccessibilityTransformHistory, AccessibilityProfile
)
from ..services.accessibility_service import accessibility_service

router = APIRouter(prefix="/accessibility", tags=["Accessibility"])


# Text Simplification
@router.post("/simplify", response_model=SimplifyResponse)
async def simplify_text(
    request: SimplifyRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Simplify complex text"""
    result = await accessibility_service.simplify_text(
        text=request.text,
        level=request.level,
        max_sentences=request.max_sentences
    )
    
    # Save transform
    transform = AccessibilityTransform(
        user_id=current_user.id,
        transform_type="simplify",
        original_text=request.text[:1000],
        transformed_text=result.get("simplified_text", "")[:1000],
        complexity_level=request.level,
        word_count_original=result.get("word_count_original", 0),
        word_count_transformed=result.get("word_count_simplified", 0)
    )
    db.add(transform)
    db.commit()
    
    return SimplifyResponse(
        original_text=request.text,
        simplified_text=result.get("simplified_text", ""),
        key_points=result.get("key_points", []),
        reading_level=result.get("reading_level", request.level),
        word_count_original=result.get("word_count_original", 0),
        word_count_simplified=result.get("word_count_simplified", 0)
    )


# Translation
@router.post("/translate", response_model=TranslateResponse)
async def translate_text(
    request: TranslateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Translate text to target language"""
    result = await accessibility_service.translate_text(
        text=request.text,
        target_language=request.target_language,
        source_language=request.source_language,
        simplify=request.simplify
    )
    
    # Save transform
    transform = AccessibilityTransform(
        user_id=current_user.id,
        transform_type="translate",
        original_text=request.text[:1000],
        transformed_text=result.get("translated_text", "")[:1000],
        source_language=result.get("detected_source_language"),
        target_language=request.target_language,
        word_count_original=result.get("word_count", 0),
        word_count_transformed=result.get("word_count", 0)
    )
    db.add(transform)
    db.commit()
    
    return TranslateResponse(
        original_text=request.text,
        translated_text=result.get("translated_text", ""),
        detected_source_language=result.get("detected_source_language"),
        target_language=request.target_language,
        word_count=result.get("word_count", 0)
    )


# Summarization
@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(
    request: SummarizeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Summarize long text"""
    result = await accessibility_service.summarize_text(
        text=request.text,
        max_length=request.max_length,
        style=request.style
    )
    
    # Save transform
    transform = AccessibilityTransform(
        user_id=current_user.id,
        transform_type="summarize",
        original_text=request.text[:1000],
        transformed_text=result.get("summary", "")[:1000],
        word_count_original=len(request.text.split()),
        word_count_transformed=len(result.get("summary", "").split())
    )
    db.add(transform)
    db.commit()
    
    return SummarizeResponse(
        original_text=request.text,
        summary=result.get("summary", ""),
        key_takeaways=result.get("key_takeaways", []),
        compression_ratio=result.get("compression_ratio", 0),
        reading_time_saved_minutes=result.get("reading_time_saved_minutes", 0)
    )


# Read Assist
@router.post("/read-assist", response_model=ReadAssistResponse)
async def read_assist(
    request: ReadAssistRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Transform text for reading assistance"""
    result = await accessibility_service.read_assist(
        text=request.text,
        highlight_key_terms=request.highlight_key_terms,
        add_phonetics=request.add_phonetics,
        break_into_chunks=request.break_into_chunks
    )
    
    # Save transform
    transform = AccessibilityTransform(
        user_id=current_user.id,
        transform_type="read_assist",
        original_text=request.text[:1000],
        transformed_text=result.get("assisted_text", "")[:1000],
        word_count_original=len(request.text.split()),
        word_count_transformed=len(result.get("assisted_text", "").split())
    )
    db.add(transform)
    db.commit()
    
    return ReadAssistResponse(
        original_text=request.text,
        assisted_text=result.get("assisted_text", ""),
        key_terms=result.get("key_terms", []),
        chunks=result.get("chunks", []),
        estimated_reading_level=result.get("estimated_reading_level", "")
    )


# Transform History
@router.get("/history", response_model=List[AccessibilityTransformHistory])
async def get_transform_history(
    limit: int = 20,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's accessibility transform history"""
    transforms = db.query(AccessibilityTransform).filter(
        AccessibilityTransform.user_id == current_user.id
    ).order_by(AccessibilityTransform.created_at.desc()).limit(limit).all()
    
    return [
        AccessibilityTransformHistory(
            id=t.id,
            transform_type=t.transform_type,
            original_preview=t.original_text[:100] + "..." if len(t.original_text) > 100 else t.original_text,
            transformed_preview=t.transformed_text[:100] + "..." if len(t.transformed_text) > 100 else t.transformed_text,
            created_at=t.created_at
        )
        for t in transforms
    ]


# Supported Languages
@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for translation"""
    return accessibility_service.get_supported_languages()


# Voice Commands
@router.post("/voice-command", response_model=VoiceCommandResponse)
async def process_voice_command(
    request: VoiceCommandRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Process a voice command"""
    result = await accessibility_service.process_voice_command(
        command_text=request.command_text,
        context=request.context
    )
    
    return VoiceCommandResponse(
        command=result.get("command", ""),
        intent=result.get("intent", ""),
        parameters=result.get("parameters", {}),
        action=result.get("action", ""),
        redirect_url=result.get("redirect_url"),
        message=result.get("message", "")
    )


# User Profile
@router.get("/profile", response_model=AccessibilityProfile)
async def get_accessibility_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get user's accessibility preferences"""
    # In a full implementation, this would be stored in the database
    return AccessibilityProfile(
        preferred_complexity="intermediate",
        preferred_language="en",
        highlight_key_terms=True,
        large_text=False,
        high_contrast=False,
        screen_reader_optimized=False
    )
