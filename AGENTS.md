# AGENTS.md — Developer and AI Agent Guidelines

> Operating manual, technical contracts, and development protocols for the **NPTEL Quiz App** codebase.

---

## 1. System Overview & Core Philosophy

The NPTEL Quiz App is a **zero-backend, zero-database, statically generated quiz platform** built to practice 12 weeks of NPTEL questions.
- **Hosting:** Static deployment on Vercel Edge CDN (free-tier, infinite scale, 0 server cost).
- **Core Principle:** **No database.** All question data is static JSON bundled/fetched on demand. All user progress, attempts, stats, and settings are stored locally in the browser via **IndexedDB** (with localStorage for settings and in-memory fallback).
- **Data Portability:** User progress can be backed up or transferred across devices using a single validated export/import file (`nptel-progress.json`).

---

## 2. Tech Stack & Directory Structure

```
├── data/
│   └── questions/             # Standardized question JSON (week-01.json .. week-12.json)
├── raw/                       # Original markdown quiz source files
├── scripts/
│   ├── parse_raw.py           # Markdown to JSON parser
│   ├── validate-questions.ts  # Zod question integrity validator (runs in prebuild)
│   └── build-index.ts         # Generates question manifest/index
├── src/
│   ├── app/                   # Next.js App Router pages and routes
│   │   ├── page.tsx           # Home / Dashboard summary
│   │   ├── learn/             # Learn mode (immediate feedback)
│   │   ├── practice/          # Practice mode (filters, mistake drill)
│   │   ├── quiz/              # Weekly and Overall exam runner
│   │   ├── revision/          # Spaced repetition (Leitner 5-box)
│   │   ├── review/            # Post-attempt review screens
│   │   ├── analytics/         # Full score analysis dashboard
│   │   ├── bookmarks/         # Saved questions
│   │   └── settings/          # Config, export/import, reset
│   ├── components/            # UI components (quiz, charts, ui)
│   ├── lib/
│   │   ├── engine/            # PURE TypeScript quiz logic (zero React dependencies)
│   │   ├── storage/           # IndexedDB repository, localStorage, export/import
│   │   ├── analytics/         # Client-side analytics math & scoring
│   │   └── schema/            # Zod schemas (Question, Attempt, Progress)
│   └── store/                 # Zustand client stores
└── tests/                     # Unit tests (Vitest) & E2E tests (Playwright)
```

---

## 3. Engineering Non-Negotiables

1. **Strict Typing:** No `any` or untyped escape hatches without an explicit comment explaining why. Strict TypeScript (`strict: true`) is mandatory.
2. **Pure Quiz Engine:** Code in `src/lib/engine/` must be 100% pure TypeScript. **Never** import React, JSX, or browser globals directly into the engine.
3. **Deterministic Randomness:** Quiz shuffling must use seeded PRNG (`mulberry32` with a session seed) so order can be reproduced upon page refresh or resume.
4. **Answer Remapping:** When options are shuffled for a quiz session, the engine must store original option indices so analytics and reviews remain consistent.
5. **No Swallowed Errors:** Validate at boundaries (file loading, user input, imports) with Zod. Catch only what can be recovered; log or rethrow with context.
6. **No Breaking Changes to Question IDs:** IDs follow `wXX-qYYY` (e.g., `w01-q001`). User attempt records link to these IDs; never renumber existing questions.
7. **Answer Format:** `answer` is always an array of 0-based option indices (`[1]`), supporting single and multi-select formats.

---

## 4. Build Loop & Ticket Workflow

Every task must follow the **Red-Green-Gate-Commit** protocol defined in `backlog.md`:

```
1. RED:    Write failing tests for acceptance criteria and edge cases. Confirm test fails.
2. GREEN:  Write minimal implementation passing all tests.
3. GATE:   Run native checks: `npm run type-check`, `npm run lint`, `npm test:unit`.
4. COMMIT: Atomic commit referencing ticket ID: `feat(SPRINT-N.X): message`.
5. MARK:   Update ticket status in backlog.md to `[x] DONE`.
```

---

## 5. Storage Contract (`ProgressRepository`)

All browser storage operations must go through the repository interface defined in `src/lib/storage/repository.ts`:
- **IndexedDB:** Stores `attempts` and `questionStats` (unlimited, structured, async).
- **Fallback:** In private browsing or when IndexedDB is blocked, fall back gracefully to an in-memory store and alert the user.
- **LocalStorage:** Only for lightweight user settings (theme, timer preference, negative marking).
- **Export/Import:** Must validate schema with Zod and reject corrupted payloads before persisting.

---

## 6. Common Commands

```bash
# Development server
npm run dev

# Native Type-checking
npm run type-check

# Run question data validation
npm run validate:questions

# Run unit tests (Vitest)
npm run test:unit

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests (Playwright)
npx playwright test

# Build for production
npm run build
```

---

## 7. Tool Routing Matrix

Use the right tool for the job:
- **`context7`:** Consult before implementing Next.js 14 App Router patterns, Tailwind v3/v4 configurations, or Recharts client component integrations.
- **`sequential-thinking`:** Use for complex multi-file architectural refactors (e.g. storage migrations, state store rewrites).
- **`playwright`:** Use for creating and verifying end-to-end user quiz journeys.
- **`emil-design-eng` skill:** Must be consulted for all UI polish, transitions, typography, spacing, and micro-interactions.
