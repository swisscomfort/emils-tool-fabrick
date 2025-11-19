# Copilot Instructions

## Project Snapshot
- Next.js 16 App Router project in TypeScript; routes live in `src/app` and default to server components unless a file starts with `"use client"`.
- Global layout in `src/app/layout.tsx` wraps children with `src/app/providers.tsx` to supply `SessionProvider`; add new global providers there.
- Dashboard shell is defined in `src/app/dashboard/layout.tsx` and renders the sidebar navigation; new dashboard pages belong under `src/app/dashboard/**` to inherit it.
- Styling relies on Tailwind CSS v4 via `src/app/globals.css` (`@import "tailwindcss"` plus `@theme inline` tokens); prefer Tailwind classes in JSX over bespoke CSS.
- UI copy targets German-speaking users (e.g. "Willkommen Emil 👋"); keep tone and language consistent when adding text.

## Authentication
- NextAuth config in `src/auth.ts` registers only the GitHub provider and reads `GH_CLIENT_ID`, `GH_CLIENT_SECRET`, and `NEXTAUTH_SECRET` from the environment.
- `src/app/api/auth/[...nextauth]/route.ts` exposes the NextAuth handler; reuse `authConfig` rather than redefining providers when extending auth.
- `src/middleware.ts` applies NextAuth middleware to `/dashboard/*`; adjust `matcher` if you need public dashboard routes or protection elsewhere.
- Client login flow in `src/app/dashboard/github/page.tsx` uses `signIn("github")`, `signOut()`, and `useSession()` from `next-auth/react`; mirror this pattern in other interactive auth-aware views.
- `.env.local` must supply `NEXTAUTH_URL` and `NEXTAUTH_SECRET`; Codespace scripts create these automatically, but local workstations need manual values.

## Data & Integrations
- `src/app/dashboard/projects/page.tsx` is a client component with mocked project data; replace the placeholder array via an API route or server action so tokens stay off the client.
- GitHub integration currently stops at authentication; to fetch user data, extend `authConfig` callbacks to persist access tokens in the session before calling GitHub APIs.
- Supabase bootstrap lives in `src/lib/supabaseClient.ts`, expecting `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; import from `@/lib/supabaseClient` only for data safe to expose publicly.
- Use the `@/*` path alias from `tsconfig.json` for intra-project imports instead of long relative paths.
- Place new sensitive integrations in `src/app/api/**` route handlers to keep secrets server-side while client components call those routes.

## Local Dev Workflow
- Run `npm install` once, then `npm run dev` to start Next.js on port 3000.
- Use `npm run update-oauth` to regenerate `.env.local`; it executes `scripts/update-oauth.sh` to capture the active Codespace URL.
- `.devcontainer/postCreateCommand.sh` already runs the OAuth updater and kills stray `next dev` processes after container rebuilds.
- Execute `npm run build` before deployment; NextAuth requires `NEXTAUTH_URL` and `NEXTAUTH_SECRET` at both build- and run-time.
- `npm run lint` uses `eslint.config.mjs` (Next core-web-vitals rules); run it after touching React or TypeScript files to catch regressions.
