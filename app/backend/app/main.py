from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.database import engine, Base
from .core.config import get_settings

# Import routes
from .routes import (
    auth, dashboard, notifications, recommendations,
    education, healthcare, sustainability, accessibility,
    agents, ml, admin, email
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    # Create database tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
    
    yield
    
    # Shutdown
    print("Application shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI Platform for Social Good - Education, Healthcare, Sustainability, and Accessibility",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(recommendations.router)
app.include_router(education.router)
app.include_router(healthcare.router)
app.include_router(sustainability.router)
app.include_router(accessibility.router)
app.include_router(agents.router)
app.include_router(ml.router)
app.include_router(admin.router)
app.include_router(email.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "description": "AI Platform for Social Good",
        "modules": ["education", "healthcare", "sustainability", "accessibility"],
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/api/modules")
async def get_modules():
    """Get available modules"""
    return {
        "modules": [
            {
                "id": "education",
                "name": "Education",
                "description": "AI-powered learning tools, flashcards, mock tests, and interview practice",
                "features": ["Study Materials", "Flashcards", "Mock Tests", "Interview Mode", "Weak Topics"]
            },
            {
                "id": "healthcare",
                "name": "Healthcare & Wellness",
                "description": "Personalized workout plans, nutrition guidance, and wellness tracking",
                "features": ["Workout Planner", "Nutrition Plans", "Symptom Guide", "Wellness Coach"]
            },
            {
                "id": "sustainability",
                "name": "Sustainability",
                "description": "Track eco actions, participate in challenges, and measure your impact",
                "features": ["Action Tracker", "Eco Coach", "Trivia", "Recycling Game", "Leaderboard"]
            },
            {
                "id": "accessibility",
                "name": "Accessibility",
                "description": "Text transformation tools for better readability and comprehension",
                "features": ["Text Simplifier", "Translator", "Summarizer", "Read Assist"]
            }
        ]
    }
