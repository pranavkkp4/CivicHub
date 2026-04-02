from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class AccessibilityTransform(Base):
    __tablename__ = "accessibility_transforms"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transform_type = Column(String(100), nullable=False)  # simplify, summarize, translate, read_assist
    original_text = Column(Text, nullable=False)
    transformed_text = Column(Text, nullable=False)
    source_language = Column(String(10), nullable=True)
    target_language = Column(String(10), nullable=True)
    complexity_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    reading_time_minutes = Column(Integer, nullable=True)
    word_count_original = Column(Integer, nullable=True)
    word_count_transformed = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="accessibility_transforms")
