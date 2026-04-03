# Civic Hub

Civic Hub is a full-stack AI application for social-good workflows. It combines a React frontend with a FastAPI backend and currently focuses its main routed user experience on education features such as study materials, flashcards, mock tests, weak-topic review, interview-prep content, and a handwritten digit recognizer.

The repository root is `../`, and the main git root README lives at [../README.md](../README.md). This file is the detailed app-level guide for the code inside `app/`.

## What The Project Does

Civic Hub is designed to turn user input into practical follow-through:

- Education: save study material, generate flashcards and mock tests, surface weak topics, draft interview-prep content, and email generated study artifacts
- Healthcare and wellness: backend routes exist for assessments, workout plans, nutrition plans, symptom checks, and daily wellness summaries
- Sustainability: backend routes exist for eco logging, challenges, recycling/trivia flows, coaching, events, and leaderboards
- Accessibility: backend routes exist for simplification, translation, summarization, read-assist, voice-command, and accessibility-profile workflows

## Current Implementation Status

- The main frontend router currently redirects `/` to `/education`
- The active frontend navigation is education-first
- Additional domain pages exist in `src/pages`, but they are not the primary routed experience in `src/App.tsx` right now
- The backend includes all major module routers: auth, dashboard, notifications, recommendations, education, healthcare, sustainability, accessibility, agents, ML, admin, and email
- The frontend auth experience is demo-oriented today, and the backend auto-creates a demo user when requests arrive without a valid bearer token
- Database tables are created on startup through SQLAlchemy metadata; there is no checked-in Alembic migration flow wired up in this repo yet

## Tech Stack

### Frontend

- React 19
- TypeScript 5
- Vite 7
- React Router 6
- Tailwind CSS 3
- shadcn/ui and Radix UI primitives
- Axios for API calls
- GSAP with ScrollTrigger
- Lenis for smooth scrolling
- Lucide React icons
- Recharts for data visualizations
- React Hook Form and Zod

### Backend

- FastAPI
- SQLAlchemy 2
- Pydantic 2 and pydantic-settings
- Python-JOSE for JWT handling
- Passlib and bcrypt for password hashing
- httpx for outbound API calls
- Resend email integration

### AI And ML

- Gemini API integration
- Kimi API integration through a lightweight router
- Built-in fallback responses when AI keys are missing
- scikit-learn digit classification demo
- Pillow and NumPy for image preprocessing

## Project Structure

```text
app/
  backend/
    app/
      core/            Config, database, security
      models/          SQLAlchemy models
      routes/          FastAPI route modules
      schemas/         Pydantic request/response models
      services/        AI, email, file, and recommendation services
      main.py          FastAPI entry point
    requirements.txt
  src/
    api/               Frontend API client
    components/        Shared and education-specific UI
    context/           Demo auth context
    hooks/             Frontend hooks
    pages/             Routed pages and module views
    sections/          Marketing/editorial sections from the earlier site shell
    types/             Shared TypeScript types
    App.tsx            Main frontend router
```

## Running Locally

### Frontend

From `app/`:

```bash
npm install
npm run dev
```

Optional frontend environment variable:

```env
VITE_API_URL=http://localhost:8000
```

If `VITE_API_URL` is not set, the frontend uses `http://localhost:8000`.

### Backend

From `app/backend/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend serves API docs at:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Backend Environment Variables

Create `app/backend/.env` if you want to override defaults:

```env
APP_NAME=Civic Hub
DEBUG=true
DATABASE_URL=sqlite:///./civichub.db
SECRET_KEY=change-me
GEMINI_API_KEY=
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=
GEMINI_API_KEY_4=
KIMI_API_KEY=
RESEND_API_KEY=
FROM_EMAIL=noreply@civichub.app
```

Notes:

- `DATABASE_URL` defaults to PostgreSQL in code, but SQLite is also supported and is usually the easiest local option
- `GEMINI_API_KEY` is the primary Gemini key, and `GEMINI_API_KEY_2` through `GEMINI_API_KEY_4` can be added as ordered fallbacks
- `KIMI_API_KEY` is optional; if Gemini and Kimi are both unavailable, some AI flows fall back to built-in demo responses
- `RESEND_API_KEY` is required only if you want the email-sending features to actually deliver mail

## Education Workflow That Exists Today

1. Add or seed study material in the materials page
2. Generate flashcards or a mock test from saved material
3. Review weak topics surfaced from practice results
4. Open interview prep and email generated study artifacts
5. Try the digit recognizer demo from the education navigation

## Practical Notes

- The education UI is the most complete part of the current frontend
- Auth is intentionally friction-light for local development because of the demo-user fallback
- The backend is broader than the current frontend routing, so some capabilities are easier to discover through API docs than through the visible navigation
- `info.md` documents an older site-template setup and should not be treated as the source of truth for the product state
