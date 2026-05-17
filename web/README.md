# LearnLoop AI Web

Next.js App Router frontend for LearnLoop AI, a guided-learning platform built around:

- Ask
- Think
- Try
- Hint
- Reflect
- Improve

## Stack

- Next.js 16
- React 19
- TypeScript strict mode
- Tailwind CSS
- shadcn-style UI primitives
- TanStack Query
- Supabase Auth
- React Hook Form + Zod
- Framer Motion
- Recharts

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.local.example .env.local
```

3. Fill the required values in `.env.local`:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

Default backend:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://learnloop-wpdv.onrender.com
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Auth flow

- Google login uses Supabase OAuth.
- Email login uses Supabase magic-link auth.
- The callback route checks for an existing backend profile.
- If no backend profile exists yet, the web app creates a `pending` profile and routes the user to `/pending`.
- Role routing:
  - `student` -> `/student`
  - `teacher` -> `/teacher`
  - `school_admin` -> `/admin`
  - `platform_admin` -> `/admin`
  - `parent` -> `/parent`
  - `pending` -> `/pending`

## OAuth configuration

For your current Supabase project:

- `NEXT_PUBLIC_SUPABASE_URL=https://jafvclvcipybinssrmka.supabase.co`
- Google OAuth callback URL at the provider must be:

```text
https://jafvclvcipybinssrmka.supabase.co/auth/v1/callback
```

Important:

- That Supabase callback URL is configured in Google Cloud OAuth, not in the Next.js app.
- The frontend app itself should still redirect users to `/auth/callback` on your own site after Supabase finishes the provider flow.

Recommended Supabase Auth URL settings:

- Site URL for local:

```text
http://localhost:3000
```

- Additional redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-frontend-domain.com/auth/callback
```

Recommended frontend env for local:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://jafvclvcipybinssrmka.supabase.co
```

## Route areas

- Public: `/`, `/about`, `/login`
- Student: `/student`, `/student/companion`, `/student/homework`, `/student/focus`, `/student/progress`, `/student/growth`
- Teacher: `/teacher`, `/teacher/classes`, `/teacher/homework`, `/teacher/content`, `/teacher/analytics`
- Admin: `/admin`, `/admin/users`, `/admin/classes`, `/admin/settings`
- Placeholder: `/parent`

## Notes

- The UI is wired to the live backend contract at `learnloop-wpdv.onrender.com`.
- Where the backend is still incomplete or returns `404/501`, the UI shows a friendly fallback instead of crashing.
- Teacher content upload currently registers metadata and supports text-based processing flow; direct binary storage upload can plug in next.
- Homework and companion UIs reinforce attempt-first learning by design.
