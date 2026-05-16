# AI Student Companion Backend

Clean-architecture FastAPI backend for an AI student companion platform with event-centric learning telemetry, deterministic rule engines, and a Gemma-only model gateway.

## Stack

- FastAPI
- Pydantic v2
- SQLAlchemy 2 async
- Alembic
- PostgreSQL / Supabase
- httpx
- pytest

## Architecture

- `app/core`: configuration, logging, security, exceptions, enums.
- `app/db`: async session, ORM models, repositories, Alembic metadata source.
- `app/api/v1`: versioned route surface and request/response schemas.
- `app/features`: business services and deterministic rule engines.
- `app/agents`: agent loop, specialists, tools, orchestrator, tracing.
- `app/llm`: Gemma-only gateway and prompts.
- `app/workers`: async job placeholders for future queue workers.

## Key design choices

- `learning_events` is the central source of truth for learning telemetry.
- Rule engines decide what is allowed; the LLM only turns structured context into student-friendly language.
- The agent loop is explicit: `PLAN -> ACT -> OBSERVE -> REFLECT -> UPDATE_EVENTS -> NEXT_STEP`.
- Agent tools access data; specialist agents coordinate.
- Content chunk storage is pgvector-ready through a custom `VECTOR` column type.
- The backend is web-first but keeps sync and device fields ready for later offline/local evolution.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill all Supabase, database, and Gemma gateway values.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run migrations:

```bash
alembic upgrade head
```

5. Start the API:

```bash
uvicorn app.main:app --reload
```

## Commands

```bash
ruff check .
black --check .
pytest
```

## API surface

- `GET /api/v1/health`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/profile`
- `PATCH /api/v1/auth/profile`
- `GET /api/v1/students/me`
- `GET /api/v1/students/me/dashboard`
- `GET /api/v1/students/me/events`
- `GET /api/v1/students/me/focus`
- `POST /api/v1/learning/chat`
- `POST /api/v1/learning/attempt`
- `POST /api/v1/learning/hint`
- `POST /api/v1/learning/explain-after-effort`
- `POST /api/v1/homework`
- `GET /api/v1/homework`
- `GET /api/v1/homework/{homework_id}`
- `POST /api/v1/homework/{homework_id}/attempt`
- `POST /api/v1/homework/{homework_id}/submit`
- `GET /api/v1/homework/{homework_id}/analytics`
- `POST /api/v1/progress/ask`
- `GET /api/v1/progress/summary`
- `GET /api/v1/progress/weak-topics`
- `GET /api/v1/focus/today`
- `POST /api/v1/focus/refresh`
- `GET /api/v1/teachers/me/classes`
- `GET /api/v1/teachers/classes/{class_id}/analytics`
- `GET /api/v1/teachers/classes/{class_id}/weak-topics`
- `GET /api/v1/teachers/classes/{class_id}/misconceptions`
- `POST /api/v1/content/upload`
- `GET /api/v1/content`
- `POST /api/v1/content/{content_id}/process`
- `GET /api/v1/content/{content_id}/chunks`
- `POST /api/v1/growth/activity`
- `GET /api/v1/growth/activities`
- `POST /api/v1/growth/activity/{activity_id}/complete`
- `POST /api/v1/agents/run`
- `GET /api/v1/agents/runs/{run_id}`
- `GET /api/v1/agents/runs/{run_id}/steps`

## Testing focus

- health endpoint
- homework attempt-first rules
- focus scoring
- agent loop trace creation
- Gemma-only provider enforcement

