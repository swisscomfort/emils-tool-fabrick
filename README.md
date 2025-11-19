# Emils Tool Fabrick 🏭

**No-Code Entwickler-Schaltzentrale** – Eine vollautomatische App-Factory mit GitHub, Vercel, Supabase, GPT-Assistant und Mobile Builds.

## ✨ Features

- 🔐 **GitHub OAuth** – Single Sign-On mit NextAuth
- 📦 **GitHub API Integration** – Repos erstellen, Files pushen, Branches verwalten
- 🚀 **Vercel Deployment** – Auto-Deploy + ENV Sync
- 💾 **Supabase Datenbank** – Projects, Actions, Builds, User Settings
- 🤖 **GPT Assistant** – In-App AI Chat mit Function Calling
- 📱 **Mobile Builds** – Capacitor Android/iOS Integration
- 🎯 **Traycer Workflows** – Multi-Step Automation (Generate → Build → Deploy)
- ✅ **Testing** – Vitest (Unit) + Playwright (E2E) + MSW (API Mocking)

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Kopiere `.env.example` zu `.env.local` und fülle alle Werte aus:

```bash
cp .env.example .env.local
```

**Wichtig für Codespaces**: Nach Rebuild automatisch ENV aktualisieren:
```bash
npm run update-oauth
```

### 3. Supabase Setup

Führe das Schema in deinem Supabase Projekt aus:

```bash
# Kopiere Inhalt von supabase-schema.sql
# Füge es in Supabase Dashboard → SQL Editor ein
# Führe aus
```

### 4. Development Server

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## 📂 Projektstruktur

```
src/
├── app/
│   ├── api/                    # Server-Side API Routes
│   │   ├── github/            # GitHub Integration (Repos, Files, Branches)
│   │   ├── vercel/            # Vercel Deployment + ENV Sync
│   │   ├── mobile/            # Mobile Build Pipeline
│   │   ├── gpt/               # OpenAI Chat Proxy
│   │   └── traycer/           # Workflow Executor
│   ├── dashboard/             # Protected Dashboard
│   │   ├── projects/          # GitHub Repo Management
│   │   ├── github/            # GitHub OAuth Status
│   │   ├── assistant/         # GPT Chat Interface
│   │   ├── vercel/            # Vercel Integration UI
│   │   ├── traycer/           # Workflow Manager
│   │   └── mobile/            # Mobile Build UI
│   └── layout.tsx             # Root Layout + SessionProvider
├── lib/
│   ├── supabaseClient.ts      # Public Supabase Client
│   ├── supabaseAdmin.ts       # Admin Client (Service Role)
│   └── supabaseActions.ts     # Server Actions für DB Operations
├── tests/
│   ├── unit/                  # Vitest Unit Tests
│   ├── e2e/                   # Playwright E2E Tests
│   └── setup.ts               # Test Config
└── mocks/
    └── handlers.ts            # MSW API Mocks
```

---

## 🔧 Verfügbare Scripts

```bash
npm run dev              # Development Server
npm run build            # Production Build
npm run start            # Production Server
npm run lint             # ESLint Check
npm run update-oauth     # Codespace OAuth URL Update

# Testing
npm run test             # Vitest Watch Mode
npm run test:unit        # Unit Tests (Single Run)
npm run test:e2e         # Playwright E2E Tests
npm run test:e2e:headed  # E2E mit Browser UI
npm run test:coverage    # Coverage Report
```

---

## 🎯 Workflows

### Vollständige App erstellen

**Via GPT Assistant:**
```
"Erstelle eine Dating App namens LoveMatch"
```

**Via Traycer API:**
```bash
POST /api/traycer/execute
{
  "taskName": "create-full-app",
  "params": {
    "project_name": "lovematch",
    "project_description": "Dating App"
  }
}
```

**Was passiert:**
1. ✅ GitHub Repo erstellt
2. ✅ Code generiert & gepusht
3. ✅ Vercel Deployment gestartet
4. ✅ Supabase Log erstellt

---

## 🔐 Environment Variables Guide

### GitHub OAuth Setup

1. Gehe zu [GitHub Developer Settings](https://github.com/settings/developers)
2. Erstelle neue OAuth App
3. **Homepage URL**: `https://your-codespace-url-3000.app.github.dev`
4. **Callback URL**: `https://your-codespace-url-3000.app.github.dev/api/auth/callback/github`
5. Kopiere Client ID + Secret zu `.env.local`

### GitHub Token (für API)

1. [Personal Access Token erstellen](https://github.com/settings/tokens/new)
2. Scopes: `repo`, `workflow`, `write:packages`
3. Kopiere Token zu `GITHUB_TOKEN` in `.env.local`

### Vercel Token

1. [Vercel Settings → Tokens](https://vercel.com/account/tokens)
2. Erstelle neuen Token
3. Kopiere zu `VERCEL_TOKEN`

### Supabase Keys

1. [Supabase Dashboard](https://supabase.com/dashboard)
2. Project Settings → API
3. Kopiere `URL`, `anon key` und `service_role key`

### OpenAI API Key

1. [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Erstelle neuen Secret Key
3. Kopiere zu `OPENAI_API_KEY`

---

## 📱 Mobile Build Setup

### Voraussetzungen

**Android:**
- Java SDK 17+
- Android Studio oder Android SDK CLI Tools

**iOS (nur macOS):**
- Xcode 14+
- CocoaPods

### Installation

```bash
# Capacitor Setup
npm install @capacitor/core @capacitor/cli
npx cap init

# Platforms hinzufügen
npx cap add android
npx cap add ios
```

### Build Starten

```bash
# Via API
POST /api/mobile/build
{
  "projectId": "my-project",
  "platform": "android"  # oder "ios"
}

# Manuell
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm run test              # Watch Mode
npm run test:unit         # Single Run
npm run test:coverage     # Mit Coverage
```

**Beispiel Test:**
```typescript
// src/tests/unit/github-api.test.ts
import { describe, it, expect } from "vitest";

describe("GitHub API", () => {
  it("should create repository", async () => {
    // Test Code
  });
});
```

### E2E Tests (Playwright)

```bash
npm run test:e2e          # Headless
npm run test:e2e:headed   # Mit Browser
```

**Beispiel Test:**
```typescript
// src/tests/e2e/dashboard.spec.ts
import { test, expect } from "@playwright/test";

test("should load dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.locator("h1")).toContainText("Willkommen");
});
```

---

## 🤖 Traycer Workflows

Traycer orchestriert Multi-Step-Workflows automatisch.

**Config:** `traycer.config.json`

**Verfügbare Tasks:**

### create-full-app
Erstellt komplette App (Repo + Deploy + Log)

### deploy-existing
Deployed existierendes Projekt

### build-mobile
Erstellt Mobile Build (Android/iOS)

**Nutzung:**
```typescript
POST /api/traycer/execute
{
  "taskName": "create-full-app",
  "params": { "project_name": "myapp" },
  "projectId": "uuid"
}
```

---

## 📚 Weitere Dokumentation

- [Copilot Instructions](.github/copilot-instructions.md) – Vollständige Entwickler-Guidelines für AI-Agents
- [Supabase Schema](supabase-schema.sql) – Datenbank-Struktur mit RLS Policies

---

## 🚨 Troubleshooting

### OAuth Login funktioniert nicht

**Problem:** Redirect nach GitHub kehrt nicht zurück

**Lösung:**
1. Prüfe `NEXTAUTH_URL` in `.env.local` (muss exakte Codespace URL sein)
2. Prüfe GitHub OAuth App Callback URL
3. Führe `npm run update-oauth` aus

### Vercel Deployment fehlgeschlagen

**Problem:** API gibt 403 Forbidden

**Lösung:**
- Prüfe `VERCEL_TOKEN` Gültigkeit
- Token braucht Deployment-Permissions
- Bei Team-Projekten: `VERCEL_TEAM_ID` setzen

### Supabase Queries schlagen fehl

**Problem:** RLS Policies verhindern Zugriff

**Lösung:**
- Nutze `supabaseAdmin` für Admin-Operationen (nur Server-Side)
- Prüfe RLS Policies in Supabase Dashboard
- User muss in `auth.users` Tabelle existieren

---

## 📄 Lizenz

MIT

---

**Built with ❤️ by Emil** 🚀
