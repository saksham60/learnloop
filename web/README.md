# LearnLoop AI Web

Next.js App Router frontend for LearnLoop AI.

## Stack

- Next.js 16
- React 19
- TypeScript strict mode
- Tailwind CSS
- shadcn-style UI primitives
- TanStack Query
- Supabase Auth

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.local.example .env.local
```

3. Fill the required values in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://learnloop-wpdv.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://jafvclvcipybinssrmka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Start the app:

```bash
npm run dev
```

## Production Setup For Vercel

Current frontend domain:

```text
https://learnloop-drab.vercel.app
```

Set these Vercel environment variables:

```env
NEXT_PUBLIC_APP_NAME=LearnLoop AI
NEXT_PUBLIC_APP_URL=https://learnloop-drab.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://learnloop-wpdv.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://jafvclvcipybinssrmka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
NEXT_PUBLIC_ENABLE_EMAIL_AUTH=true
NEXT_PUBLIC_ENABLE_STUDENT_APP=true
NEXT_PUBLIC_ENABLE_TEACHER_DASHBOARD=true
NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD=true
NEXT_PUBLIC_ENABLE_PARENT_DASHBOARD=false
NEXT_PUBLIC_ENABLE_SOCRATIC_MODE=true
NEXT_PUBLIC_ENABLE_HOMEWORK=true
NEXT_PUBLIC_ENABLE_LEARNING_COMPASS=true
NEXT_PUBLIC_ENABLE_PROGRESS_QA=true
NEXT_PUBLIC_ENABLE_GROWTH_MODULES=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=false
```

## Supabase Auth Configuration

In Supabase `Authentication -> URL Configuration`:

- `Site URL`

```text
https://learnloop-drab.vercel.app
```

- `Redirect URLs`

```text
http://localhost:3000/auth/callback
https://learnloop-drab.vercel.app/auth/callback
```

Google OAuth provider callback in Google Cloud must stay:

```text
https://jafvclvcipybinssrmka.supabase.co/auth/v1/callback
```

Important:

- Google redirects to Supabase
- Supabase redirects back to your app `/auth/callback`

## Auth And Routing

After sign-in:

- active `student` -> `/student`
- active `teacher` -> `/teacher`
- active `parent` -> `/parent`
- active `school_admin` -> `/school-admin`
- active `platform_admin` -> `/master`
- `pending` role -> `/onboarding/role`
- `pending_approval` -> `/onboarding/pending-approval`
- `rejected` -> `/onboarding/rejected`
- `suspended` -> `/onboarding/suspended`

## Demo Mode

Demo mode is frontend-only and must be enabled explicitly:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

When enabled:

- the login page shows a `Demo Access` section
- you can jump into demo `student`, `teacher`, `parent`, `school_admin`, or `platform_admin` sessions
- the top bar shows a `Demo Mode` badge with `Switch Demo Role` and `Exit Demo Mode`
- demo sessions automatically attach a demo bearer token for matching backend requests
- school admin and master admin pages use seeded demo data instead of crashing if backend endpoints are unavailable

When disabled:

- demo buttons disappear from `/login`
- demo role switching is hidden
- seeded demo data is not used

The seeded demo dataset lives in:

```text
src/lib/demo/demo-data.ts
```

The local demo session helper lives in:

```text
src/lib/demo/demo-auth.ts
```

To let protected backend APIs accept those demo sessions too, enable backend:

```env
DEMO_MODE=true
```

## Route Areas

- Public: `/`, `/about`, `/login`
- Onboarding: `/onboarding/role`, `/onboarding/school`, `/onboarding/pending-approval`, `/onboarding/rejected`, `/onboarding/suspended`
- Student: `/student`, `/student/companion`, `/student/homework`, `/student/focus`, `/student/progress`, `/student/growth`
- Teacher: `/teacher`, `/teacher/classes`, `/teacher/homework`, `/teacher/content`, `/teacher/analytics`
- School admin: `/school-admin`, `/school-admin/approvals`, `/school-admin/students`, `/school-admin/teachers`, `/school-admin/parents`, `/school-admin/classes`, `/school-admin/relations`
- Platform admin: `/master`, `/master/schools`, `/master/school-admins`, `/master/users`, `/master/settings`
- Parent: `/parent`

## Verification

```bash
npx next typegen
npm run typecheck
npm run lint
npm run build
```

## Notes

- The UI is wired to the live backend at `https://learnloop-wpdv.onrender.com`.
- If a backend route returns `404` or `501`, the UI shows a graceful “being connected” state instead of crashing.
- The onboarding and admin panels are structured for the full role-governed flow even when some backend datasets are still sparse.
