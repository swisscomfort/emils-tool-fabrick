# Copilot Instructions

## Architecture Overview
**Next.js 16 App Router** project targeting German no-code developers. Built in TypeScript with NextAuth GitHub SSO and Tailwind CSS v4. The app structure separates:
- **Public routes** (`src/app/page.tsx`) – marketing/landing
- **Protected dashboard** (`src/app/dashboard/**`) – tool hub with sidebar nav inherited from layout
- **API routes** (`src/app/api/**`) – server-side logic, auth handlers

**Server vs Client**: All routes default to server components; add `"use client"` directive only when using hooks (`useSession`, `useState`, etc). See `src/app/dashboard/github/page.tsx` for client pattern with NextAuth hooks.

## Project Structure Conventions
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout wraps with Providers (SessionProvider)
│   ├── providers.tsx      # Client wrapper for NextAuth SessionProvider
│   ├── page.tsx           # Public landing page
│   ├── api/               # Server-side routes (auth callbacks, future integrations)
│   └── dashboard/         # Protected area (requires GitHub login)
│       ├── layout.tsx     # Sidebar nav for all /dashboard/* routes
│       └── [feature]/     # Feature pages (github, projects, supabase, etc.)
├── auth.ts                # NextAuth config (GitHub provider only)
├── middleware.ts          # Protects /dashboard/* via NextAuth matcher
└── lib/                   # Shared utilities (supabaseClient.ts)
```

**Import Pattern**: Use `@/*` path alias from `tsconfig.json` (e.g., `import { supabase } from "@/lib/supabaseClient"`) instead of relative paths.

## Styling with Tailwind CSS v4
- `src/app/globals.css` imports Tailwind via `@import "tailwindcss"` and defines custom tokens in `@theme inline` (e.g., `--color-background`, `--font-sans`).
- **No separate `tailwind.config.js`** – all config is inline in CSS or via PostCSS (`postcss.config.mjs`).
- Prefer utility classes in JSX over custom CSS. Example from dashboard: `className="w-64 bg-white shadow-lg p-6"`.
- Dark mode uses `prefers-color-scheme` media query; CSS variables switch automatically.

## Authentication Flow (NextAuth + GitHub)
1. **Config** (`src/auth.ts`): Single GitHub provider reads `GH_CLIENT_ID`, `GH_CLIENT_SECRET`, `NEXTAUTH_SECRET` from env.
2. **API Route** (`src/app/api/auth/[...nextauth]/route.ts`): Exports NextAuth handlers; imports `authConfig` from `src/auth.ts`. **Never redefine providers here** – extend `authConfig` in `src/auth.ts` instead.
3. **Middleware** (`src/middleware.ts`): Protects `/dashboard/*` routes. Adjust `matcher` array to allow public dashboard routes if needed.
4. **Client Usage** (`src/app/dashboard/github/page.tsx`): 
   ```tsx
   "use client";
   import { signIn, signOut, useSession } from "next-auth/react";
   const { data: session } = useSession();
   // Then: signIn("github") to login, signOut() to logout
   ```
5. **Session Access in Server Components**: Import `getServerSession` from `next-auth/next` and pass `authConfig` to read session server-side.

**GitHub Token Storage**: Currently auth stops at login. To fetch GitHub API data, extend `authConfig.callbacks.jwt` and `authConfig.callbacks.session` to persist `access_token` in session (see NextAuth docs for pattern).

## Environment Variables
Required in `.env.local` (auto-generated in Codespaces, manual locally):
- `NEXTAUTH_URL` – full app URL (e.g., `https://mycodespace-3000.app.github.dev`)
- `NEXTAUTH_SECRET` – random 32-char hex (use `openssl rand -hex 32`)
- `GH_CLIENT_ID`, `GH_CLIENT_SECRET` – GitHub OAuth app credentials
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase project keys (public, can expose in client)

**Codespace OAuth Workflow**: Codespace URL changes on rebuild. Run `npm run update-oauth` (calls `scripts/update-oauth.sh`) to regenerate `NEXTAUTH_URL` in `.env.local`. `.devcontainer/postCreateCommand.sh` does this automatically on container start.

## Data & Integrations
- **Supabase Client** (`src/lib/supabaseClient.ts`): Uses `NEXT_PUBLIC_*` keys → safe to import in client components. For sensitive ops, create API routes that use service role key (never expose service role to client).
- **Mocked Data Example**: `src/app/dashboard/projects/page.tsx` uses `useState` + `useEffect` with hardcoded project array. Replace with fetch to `/api/projects` route that calls GitHub API server-side.
- **API Route Pattern**: Place new integrations in `src/app/api/[service]/route.ts` to keep secrets (API keys, service role keys) off client. Client components fetch these routes via standard `fetch()`.

## UI Language & Tone
All user-facing text is **German** (e.g., "Willkommen Emil 👋", "Projekte", "Mit GitHub einloggen"). Maintain informal German ("deine", "du") consistent with existing dashboard copy in `src/app/dashboard/page.tsx`.

## Development Workflow
1. **Install**: `npm install` (only needed once or after `package.json` changes).
2. **Dev Server**: `npm run dev` → http://localhost:3000 (auto-reloads on file changes).
3. **OAuth Refresh** (Codespaces): `npm run update-oauth` if Codespace URL changes (rebuilds `.env.local`).
4. **Linting**: `npm run lint` runs ESLint with Next.js core-web-vitals preset (`eslint.config.mjs`). Auto-fixes many issues.
5. **Build Test**: `npm run build` before deploying to catch TypeScript/build errors. NextAuth needs env vars at build time too.

**Debugging Auth**: If login fails, check:
- `.env.local` has correct `NEXTAUTH_URL` (matches browser URL).
- GitHub OAuth app callback URL matches `{NEXTAUTH_URL}/api/auth/callback/github`.
- `GH_CLIENT_ID` and `GH_CLIENT_SECRET` are valid.

## Adding Dashboard Features
1. Create `src/app/dashboard/[feature]/page.tsx` (inherits sidebar from `dashboard/layout.tsx`).
2. Add navigation link in `src/app/dashboard/layout.tsx` nav list (e.g., `<a href="/dashboard/feature">Feature</a>`).
3. Use `"use client"` directive if page needs interactivity (hooks, event handlers).
4. For API calls, create `src/app/api/[feature]/route.ts` and fetch from client component.

**Example**: New Vercel integration page would be `src/app/dashboard/vercel/page.tsx` (client) + `src/app/api/vercel/deployments/route.ts` (server endpoint reading Vercel API token from env).

---

## GitHub API Integration
**Purpose**: Full repo management (create, commit, push, PR, branch operations, file uploads).

### Required Environment Variables
```
GITHUB_TOKEN=ghp_xxxxx  # Personal Access Token with repo scope
```

### Server-Side Pattern (API Routes)
```typescript
// src/app/api/github/repos/route.ts
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function GET() {
  const { data } = await octokit.repos.listForAuthenticatedUser();
  return Response.json(data);
}

export async function POST(req: Request) {
  const { name, description } = await req.json();
  const { data } = await octokit.repos.createForAuthenticatedUser({
    name,
    description,
    auto_init: true,
  });
  return Response.json(data);
}
```

### Client Usage
```typescript
// src/app/dashboard/projects/page.tsx
const response = await fetch("/api/github/repos");
const repos = await response.json();
```

### Key Operations
- **Create Repo**: `POST /api/github/repos`
- **Push Files**: Use `octokit.repos.createOrUpdateFileContents()`
- **Create PR**: `octokit.pulls.create()`
- **Branch Management**: `octokit.git.createRef()` / `getRef()` / `updateRef()`

**Never** expose `GITHUB_TOKEN` to client – always proxy through API routes.

---

## Vercel Integration
**Purpose**: Auto-deploy from GitHub, sync ENV vars, handle OAuth redirects.

### Required Environment Variables
```
VERCEL_TOKEN=xxxxx           # Vercel API token
VERCEL_TEAM_ID=team_xxxxx    # Optional: for team projects
```

### Deployment Flow
1. **GitHub Push** → triggers Vercel build via webhook
2. **ENV Sync**: Use Vercel API to inject `NEXTAUTH_URL` dynamically
3. **OAuth Redirect Proxy**: Codespace URL → Vercel production URL

### API Route Pattern
```typescript
// src/app/api/vercel/deploy/route.ts
export async function POST(req: Request) {
  const { projectId, gitBranch } = await req.json();
  
  const response = await fetch(
    `https://api.vercel.com/v13/deployments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectId,
        gitSource: { type: "github", ref: gitBranch },
      }),
    }
  );
  
  return Response.json(await response.json());
}
```

### ENV Variable Sync
```typescript
// src/app/api/vercel/env/route.ts
export async function POST(req: Request) {
  const { projectId, key, value, target } = await req.json();
  
  await fetch(
    `https://api.vercel.com/v10/projects/${projectId}/env`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        type: "encrypted",
        target: target || ["production", "preview"],
      }),
    }
  );
}
```

**Production URL Pattern**: `https://{project-name}.vercel.app`

---

## Supabase Data Layer
**Purpose**: Central persistence for projects, actions, builds, user settings.

### Schema Conventions
- **Naming**: `snake_case` for tables and columns
- **Timestamps**: Always include `created_at` (immutable), `updated_at` (auto-update)
- **RLS**: Row Level Security enabled on all tables
- **Primary Keys**: `id` (UUID) via `gen_random_uuid()`

### Core Tables
```sql
-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  repo_url TEXT,
  owner TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions (Traycer/Copilot logs)
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'create_repo', 'deploy', 'build_mobile'
  payload JSONB,
  result JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Builds (Mobile/Web)
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'android', 'ios', 'web'
  status TEXT DEFAULT 'queued',
  output_url TEXT,
  logs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  theme TEXT DEFAULT 'light',
  locale TEXT DEFAULT 'de',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies Example
```sql
-- Users can only see their own projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Client-Side Usage (Safe)
```typescript
// src/app/dashboard/projects/actions.ts
"use server";
import { supabase } from "@/lib/supabaseClient";

export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### Server-Side Usage (Service Role Key)
For admin operations (e.g., bypassing RLS), create `src/lib/supabaseAdmin.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Never expose to client
  { auth: { persistSession: false } }
);
```

**Never import `supabaseAdmin` in client components** – use only in API routes or server actions.

---

## Traycer Integration
**Purpose**: AI-driven task automation (Generate → Build → Deploy → Test flows).

### Task Organization
Traycer tasks are defined in `traycer.config.json` (create if missing):
```json
{
  "version": "1.0",
  "tasks": [
    {
      "name": "create-nextjs-app",
      "trigger": "user_command",
      "steps": [
        { "action": "github_create_repo", "params": { "template": "next" } },
        { "action": "vercel_deploy", "params": { "branch": "main" } },
        { "action": "supabase_log", "params": { "type": "create_repo" } }
      ]
    }
  ]
}
```

### Copilot ↔ Traycer Collaboration
- **Copilot writes code** in `src/app/**`
- **Traycer orchestrates** multi-step workflows (create repo → push code → deploy)
- **Logs stored** in Supabase `actions` table

### Agent Flow Pattern
1. **User Request**: "Erstelle eine Dating App"
2. **Copilot**: Generates `src/app/dating-app/**` code
3. **Traycer**: Runs `create-nextjs-app` task
4. **Result**: GitHub repo created, Vercel deployed, Supabase logged

### File Permissions
Traycer **may modify**:
- `src/app/dashboard/**/*.tsx` (new feature pages)
- `src/app/api/**/*.ts` (new API routes)
- `public/**` (static assets)

Traycer **must not modify**:
- `src/auth.ts` (auth config locked)
- `src/middleware.ts` (security-critical)
- `.env.local` (manual only)

### Output Conventions
Traycer logs to console with prefix:
```
🤖 [Traycer] Starting task: create-nextjs-app
✅ [Traycer] Repo created: https://github.com/user/repo
🚀 [Traycer] Deployed: https://repo.vercel.app
```

---

## GPT Assistant Integration
**Purpose**: In-app AI chat that triggers actions (create projects, deploy, generate code).

### Architecture
- **Chat UI**: `src/app/dashboard/assistant/page.tsx` (client component)
- **Proxy Route**: `src/app/api/gpt/chat/route.ts` (server-side OpenAI calls)
- **Action Executor**: `src/lib/gpt-actions.ts` (maps GPT commands to API calls)

### Environment Variables
```
OPENAI_API_KEY=sk-xxxxx
```

### Chat Proxy Pattern
```typescript
// src/app/api/gpt/chat/route.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
    functions: [
      {
        name: "create_project",
        description: "Creates a new project in GitHub and Vercel",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string" },
            template: { type: "string", enum: ["next", "react", "vue"] },
          },
          required: ["name", "template"],
        },
      },
    ],
  });
  
  // Handle function calls
  const message = completion.choices[0].message;
  if (message.function_call) {
    const { name, arguments: args } = message.function_call;
    // Execute action via internal API
    const result = await fetch(`/api/actions/${name}`, {
      method: "POST",
      body: args,
    });
    return Response.json({ result: await result.json() });
  }
  
  return Response.json(message);
}
```

### Action Executor
```typescript
// src/lib/gpt-actions.ts
export async function executeAction(action: string, params: any) {
  switch (action) {
    case "create_project":
      // 1. Create GitHub repo
      await fetch("/api/github/repos", {
        method: "POST",
        body: JSON.stringify(params),
      });
      // 2. Deploy to Vercel
      await fetch("/api/vercel/deploy", {
        method: "POST",
        body: JSON.stringify({ projectId: params.name }),
      });
      // 3. Log to Supabase
      await fetch("/api/supabase/actions", {
        method: "POST",
        body: JSON.stringify({
          type: "create_project",
          payload: params,
        }),
      });
      break;
    // Add more actions...
  }
}
```

### Client Usage
```typescript
// src/app/dashboard/assistant/page.tsx
"use client";
import { useState } from "react";

export default function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  const sendMessage = async () => {
    const response = await fetch("/api/gpt/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [...messages, { role: "user", content: input }] }),
    });
    const data = await response.json();
    setMessages([...messages, { role: "user", content: input }, data]);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">GPT-Assistent</h1>
      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            {m.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="w-full p-2 border rounded"
        placeholder="Was soll ich bauen?"
      />
    </div>
  );
}
```

---

## Capacitor Mobile Builds
**Purpose**: Generate native Android/iOS apps from Next.js projects.

### Setup (One-Time Per Project)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```

### Project Structure
```
capacitor.config.ts       # Capacitor config
android/                  # Native Android project
ios/                      # Native iOS project (macOS only)
```

### Build Pipeline
```typescript
// src/app/api/mobile/build/route.ts
export async function POST(req: Request) {
  const { projectId, platform } = await req.json(); // 'android' or 'ios'
  
  // 1. Build Next.js static export
  await exec("npm run build && npx next export");
  
  // 2. Sync to Capacitor
  await exec(`npx cap sync ${platform}`);
  
  // 3. Build native app
  if (platform === "android") {
    await exec("cd android && ./gradlew assembleRelease");
  } else if (platform === "ios") {
    await exec("cd ios && xcodebuild -scheme App -configuration Release");
  }
  
  // 4. Log to Supabase
  await fetch("/api/supabase/builds", {
    method: "POST",
    body: JSON.stringify({
      project_id: projectId,
      platform,
      status: "completed",
      output_url: `./android/app/build/outputs/apk/release/app-release.apk`,
    }),
  });
  
  return Response.json({ success: true });
}
```

### Custom Plugins
Create native bridge plugins in `src/plugins/`:
```typescript
// src/plugins/FileUploader.ts
import { registerPlugin } from "@capacitor/core";

export interface FileUploaderPlugin {
  upload(options: { url: string; filePath: string }): Promise<{ success: boolean }>;
}

const FileUploader = registerPlugin<FileUploaderPlugin>("FileUploader");
export default FileUploader;
```

### Mobile Auth Redirect Handling
Update `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.emil.toolfabrick",
  appName: "Emils Tool Fabrick",
  webDir: "out",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
```

For OAuth redirect, use custom URL scheme:
```typescript
// src/auth.ts (extend authConfig)
callbacks: {
  async redirect({ url, baseUrl }) {
    // Allow mobile deep links
    if (url.startsWith("emilstool://")) return url;
    return baseUrl;
  },
}
```

### Build Commands
- **Android**: `npm run build:android` → `npx cap sync android && cd android && ./gradlew assembleRelease`
- **iOS**: `npm run build:ios` → `npx cap sync ios && cd ios && xcodebuild`

**Store APK/IPA** outputs in Supabase Storage for download via dashboard.

---

## Multi-Platform Deployment Strategy

### Primary: Vercel (Web)
- **Target**: Production web app
- **Trigger**: Git push to `main` branch
- **URL**: `https://emils-tool-fabrick.vercel.app`
- **ENV Sync**: Automated via Vercel API

### Secondary: GitHub Pages (Static Exports)
- **Target**: Public marketing site or docs
- **Build**: `npm run build && npx next export`
- **Deploy**: GitHub Actions workflow pushes to `gh-pages` branch
- **URL**: `https://swisscomfort.github.io/emils-tool-fabrick`

### Mobile: EAS Build (Expo Application Services)
- **Target**: App Store & Play Store submissions
- **Setup**: `npm install -g eas-cli && eas init`
- **Build**: `eas build --platform android` or `--platform ios`
- **Distribution**: Internal testing via EAS or public store

### Local/Offline: Docker
For CI/CD or local agent testing:
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build: `docker build -t emils-tool-fabrick .`  
Run: `docker run -p 3000:3000 --env-file .env.local emils-tool-fabrick`

---

## Testing Strategy

### Framework Selection
- **E2E**: Playwright (browser automation, real OAuth flows)
- **Unit**: Vitest (fast, ESM-native, Next.js compatible)
- **API**: MSW (Mock Service Worker for API route testing)

### Directory Structure
```
src/
├── tests/
│   ├── e2e/              # Playwright tests
│   │   ├── auth.spec.ts
│   │   ├── dashboard.spec.ts
│   │   └── projects.spec.ts
│   ├── unit/             # Vitest tests
│   │   ├── github-api.test.ts
│   │   ├── supabase.test.ts
│   │   └── auth-callbacks.test.ts
│   └── fixtures/         # Test data (mock repos, users)
└── mocks/                # MSW handlers
    └── handlers.ts
```

### E2E Testing (Playwright)
```typescript
// src/tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("GitHub login flow", async ({ page }) => {
  // Navigate to app
  await page.goto("http://localhost:3000");
  
  // Click login button
  await page.click('a[href*="github"]');
  
  // Mock GitHub OAuth (or use real test account)
  await page.waitForURL("**/dashboard");
  
  // Verify logged in
  await expect(page.locator("text=Willkommen Emil")).toBeVisible();
});

test("Create project flow", async ({ page }) => {
  // Login first
  await page.goto("http://localhost:3000/dashboard/projects");
  
  // Fill form
  await page.fill('input[name="name"]', "test-project");
  await page.click('button[type="submit"]');
  
  // Verify project created
  await expect(page.locator("text=test-project")).toBeVisible();
});
```

### Unit Testing (Vitest)
```typescript
// src/tests/unit/github-api.test.ts
import { describe, it, expect, vi } from "vitest";
import { Octokit } from "@octokit/rest";

vi.mock("@octokit/rest");

describe("GitHub API", () => {
  it("creates repository", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ data: { name: "test-repo" } });
    Octokit.prototype.repos = {
      createForAuthenticatedUser: mockCreate,
    } as any;
    
    const octokit = new Octokit();
    const result = await octokit.repos.createForAuthenticatedUser({
      name: "test-repo",
    });
    
    expect(mockCreate).toHaveBeenCalled();
    expect(result.data.name).toBe("test-repo");
  });
});
```

### API Route Testing (MSW)
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/github/repos", () => {
    return HttpResponse.json([
      { name: "repo1", description: "Test repo 1" },
      { name: "repo2", description: "Test repo 2" },
    ]);
  }),
  
  http.post("/api/vercel/deploy", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ deploymentId: "dpl_123", url: `https://${body.projectId}.vercel.app` });
  }),
];
```

### Test Conventions
- **Naming**: `*.spec.ts` for E2E, `*.test.ts` for unit
- **Structure**: Arrange / Act / Assert (AAA pattern)
- **BDD Style**: Given / When / Then comments for complex flows
- **Mocks**: Always mock external APIs (GitHub, Vercel, Supabase) in unit tests
- **Fixtures**: Store test data in `src/tests/fixtures/`

### Automatic Test Generation Rule
**When creating a new API route**, Copilot/Traycer must generate:
1. Unit test covering success/error cases
2. MSW handler for mocking in other tests
3. E2E test if route affects UI workflow

Example:
```typescript
// Created: src/app/api/github/repos/route.ts
// Auto-generate: src/tests/unit/github-repos.test.ts
// Auto-generate: src/mocks/handlers.ts (add handler)
```

### Running Tests
```bash
# Unit tests
npm run test              # Vitest watch mode
npm run test:unit         # Single run

# E2E tests
npm run test:e2e          # Playwright all browsers
npm run test:e2e:headed   # With visible browser

# Coverage
npm run test:coverage     # Generate coverage report
```

### CI Integration
Add to `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:unit
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:e2e
```

**Quality Gate**: All tests must pass before merging to `main`.
