# LearnLoop AI Backend

FastAPI backend for LearnLoop AI.

## Stack

- FastAPI
- Pydantic v2
- SQLAlchemy 2 async
- Alembic
- PostgreSQL / Supabase
- httpx

## Local Setup

1. Copy `.env.example` to `.env`
2. Fill Supabase, database, and Gemma values
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

## Render Production Settings

Backend base URL:

```text
https://learnloop-wpdv.onrender.com
```

Frontend production URL:

```text
https://learnloop-drab.vercel.app
```

Set these Render environment variables:

```env
APP_ENV=production
APP_DEBUG=false
DEMO_MODE=false
LOG_LEVEL=INFO

FRONTEND_URL=https://learnloop-drab.vercel.app
CORS_ALLOWED_ORIGINS=https://learnloop-drab.vercel.app,http://localhost:3000
CORS_ALLOWED_ORIGIN_REGEX=

SUPABASE_URL=https://jafvclvcipybinssrmka.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...

LLM_PROVIDER=gemma
LLM_ALLOWED_PROVIDERS=gemma
GEMMA_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
GEMMA_API_KEY=...
GEMMA_MODEL=gemma-4-31b-it
GEMMA_TEMPERATURE=0.4
GEMMA_MAX_TOKENS=1024
GEMMA_TIMEOUT_SECONDS=60
```

Important:

- `FRONTEND_URL` is now automatically added to the backend CORS allowlist in code.
- `CORS_ALLOWED_ORIGINS` should still include both production and local development origins.
- If you use Vercel preview URLs or multiple frontend domains, set `CORS_ALLOWED_ORIGIN_REGEX`.
  Example:

```env
CORS_ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app
```

- After changing Render env vars, redeploy the backend.

## Demo Mode

Enable backend demo mode only when you intentionally want seeded demo access:

```env
DEMO_MODE=true
```

When enabled:

- demo schools, users, classes, relations, homework, focus areas, growth activities, and events are seeded on startup
- known demo bearer tokens are accepted before the normal Supabase JWT flow

Example demo bearer tokens:

```text
learnloop-demo-student-aarav
learnloop-demo-teacher-priya
learnloop-demo-parent-rohan
learnloop-demo-admin-green
learnloop-demo-master-admin
```

These tokens are demo-only. Do not enable `DEMO_MODE` in a real production environment.

## Supabase And OAuth

Supabase `Authentication -> URL Configuration` should include:

- `Site URL`

```text
https://learnloop-drab.vercel.app
```

- `Redirect URLs`

```text
http://localhost:3000/auth/callback
https://learnloop-drab.vercel.app/auth/callback
```

Google OAuth provider callback must remain:

```text
https://jafvclvcipybinssrmka.supabase.co/auth/v1/callback
```

## Current API Areas

- `GET /api/v1/health`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/bootstrap`
- `POST /api/v1/auth/onboarding`
- `GET /api/v1/schools`
- `GET /api/v1/schools/search`
- `GET /api/v1/school-admin/overview`
- `GET /api/v1/school-admin/approvals`
- `POST /api/v1/school-admin/approvals/{id}/approve`
- `POST /api/v1/school-admin/approvals/{id}/reject`
- `GET /api/v1/school-admin/students`
- `GET /api/v1/school-admin/teachers`
- `GET /api/v1/school-admin/parents`
- `GET /api/v1/school-admin/classes`
- `POST /api/v1/school-admin/classes`
- `GET /api/v1/school-admin/relations`
- `POST /api/v1/school-admin/relations/teacher-students`
- `DELETE /api/v1/school-admin/relations/teacher-students`
- `POST /api/v1/school-admin/relations/parent-students`
- `DELETE /api/v1/school-admin/relations/parent-students`
- `GET /api/v1/master/overview`
- `GET /api/v1/master/schools`
- `POST /api/v1/master/schools`
- `PATCH /api/v1/master/schools/{id}`
- `GET /api/v1/master/users`
- `GET /api/v1/master/school-admins`
- `POST /api/v1/master/school-admins/assign`

## Verification

```bash
python -m compileall app alembic
```
