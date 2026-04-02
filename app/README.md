# Impact OS - AI Platform for Social Good

A full-stack, AI-powered platform combining education, wellness, sustainability, and accessibility tools through specialized domain agents and structured AI workflows.

![Impact OS](https://img.shields.io/badge/Impact%20OS-AI%20Platform-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

## Overview

Impact OS is a production-style AI platform that uses specialized domain agents and structured AI pipelines to transform uploaded content, generate personalized plans, track user activity, and surface actionable insights across learning, health, sustainability, and accessibility.

Unlike generic chatbot platforms, Impact OS features:
- **Structured AI Workflows**: Purpose-built AI pipelines for specific tasks
- **Specialized Domain Agents**: Education, Wellness, Sustainability, and Accessibility agents
- **Cross-Module Recommendations**: Personalized suggestions based on activity across all modules
- **Persistent Generated Content**: All AI-generated artifacts are saved and retrievable

## Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- GSAP for animations
- shadcn/ui components

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- Pydantic for validation
- JWT authentication
- PostgreSQL database

**AI/ML:**
- Gemini API for text generation
- scikit-learn for ML demos (digit recognition)
- Structured output schemas for consistent results

### Project Structure

```
app/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic & AI services
│   │   └── main.py       # Application entry point
│   └── requirements.txt
├── src/                  # React frontend
│   ├── api/              # API client
│   ├── components/       # React components
│   ├── context/          # React context (Auth)
│   ├── pages/            # Page components
│   ├── types/            # TypeScript types
│   └── config.ts         # Site configuration
└── dist/                 # Built frontend
```

## Features

### Education Module
- **Study Materials**: Upload and manage study content
- **Flashcards**: AI-generated flashcards from any material
- **Mock Tests**: Generate practice tests with scoring
- **Interview Practice**: AI-driven interview simulations with feedback
- **Weak Topics**: Track and focus on areas needing improvement
- **Digit Recognizer**: ML demo using scikit-learn

### Healthcare Module
- **Workout Planner**: Personalized workout plans based on goals
- **Nutrition Planner**: Customized meal plans with shopping lists
- **Symptom Checker**: AI wellness guidance (with medical disclaimer)
- **Wellness History**: Track your health journey

### Sustainability Module
- **Eco Tracker**: Log sustainable actions and measure impact
- **Eco Coach**: Personalized eco tips and recommendations
- **Eco Trivia**: Test your environmental knowledge
- **Recycling Game**: Learn proper waste sorting
- **Leaderboard**: Compete with other users

### Accessibility Module
- **Text Simplifier**: Reduce text complexity
- **Translator**: Translate between 12+ languages
- **Summarizer**: Condense long texts
- **Read Assist**: Enhanced reading with key term highlights

### Platform Features
- **Specialized AI Agents**: Domain-aware agents for each module
- **Recommendation Engine**: Cross-module personalized suggestions
- **Notification System**: Stay updated on your progress
- **Activity Tracking**: Comprehensive activity history
- **Role-Based Access**: Student, teacher, admin roles

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL (or SQLite for development)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/impactos

# Security
SECRET_KEY=your-secret-key-here

# AI APIs
GEMINI_API_KEY=your-gemini-api-key

# Email (optional)
RESEND_API_KEY=your-resend-api-key
```

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Workflows

### Education Workflow
1. Upload study material (text or PDF)
2. Generate flashcards, cheat sheets, or mock tests
3. Take tests and review weak topics
4. Practice with interview mode

### Healthcare Workflow
1. Create workout or nutrition plan
2. Specify goals, constraints, and preferences
3. Receive AI-generated personalized plan
4. Track progress over time

### Sustainability Workflow
1. Log eco actions (recycling, energy saving, etc.)
2. View impact metrics (CO₂ saved, etc.)
3. Get personalized tips from Eco Coach
4. Compete on the leaderboard

### Accessibility Workflow
1. Paste text to transform
2. Choose transformation type (simplify, translate, summarize)
3. Get structured output with key points
4. Copy or save the result

## AI-First Design Principles

Impact OS follows these AI-first principles:

1. **Structured Generation**: Flashcards, tests, plans with consistent formats
2. **AI Evaluation**: Intelligent feedback on answers and progress
3. **Text Transformation**: Simplify, translate, summarize on demand
4. **Cross-Module Recommendations**: Contextual suggestions based on all activity
5. **Specialized Agents**: Domain-aware agents with memory and context

## Screenshots

*Coming soon*

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Animations powered by [GSAP](https://greensock.com/gsap/)
- Icons from [Lucide](https://lucide.dev/)

---

**Impact OS** - Technology for Social Good
