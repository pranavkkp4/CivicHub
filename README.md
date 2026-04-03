# Civic Hub

Civic Hub is an AI-assisted platform for social-good workflows across education, wellness, sustainability, and accessibility.

The current frontend experience is centered on the education workflow, while the backend already exposes APIs for the broader multi-domain platform.

## What The Project Does

- Turns saved study material into flashcards, mock tests, review summaries, and interview-prep content
- Tracks weak topics based on practice performance
- Includes a handwritten digit recognition demo powered by scikit-learn
- Exposes backend routes for healthcare, sustainability, accessibility, recommendations, notifications, admin, and AI-agent workflows
- Supports emailing education artifacts through Resend when configured

## Current State

- The main routed frontend experience currently lives under `/education`
- Additional domain pages exist in the codebase, but they are not the primary routed experience in `app/src/App.tsx` today
- Local development is demo-friendly: the backend auto-provisions a demo user when no auth token is present
- AI generation can use Gemini and Kimi when keys are configured, and falls back to built-in responses when they are not

## Repo Layout

```text
CivicHub/
  app/                  Frontend + backend application workspace
    src/                React frontend
    backend/            FastAPI backend
    README.md           Detailed app setup and architecture notes
```

## Quick Start

From the repo root:

```bash
cd app
npm install
npm run dev
```

In a second terminal:

```bash
cd app/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend defaults to `http://localhost:5173` and the API client defaults to `http://localhost:8000`.

For the full tech stack, environment variables, and implementation notes, see [app/README.md](./app/README.md).
