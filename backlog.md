# NPTEL Quiz App — Development Backlog

> Tracking implementation progress according to [architecture.md](file:///home/jeeva/projects/conservation-economics/architecture.md).  
> **Status Legend:**  
> `[ ] TODO` — Not started  
> `[/] IN_PROGRESS` — Currently being implemented  
> `[x] DONE` — Verified, tested, and committed  

---

## Sprint 0: Project Setup, Tooling & Question Data Pipeline
*Objective: Initialize Next.js project with TypeScript, configure Tailwind/shadcn, define Zod question contracts, and build prebuild validation & manifest generators.*

- [x] **SPRINT-0.1: Raw Question Data Ingestion & Sanitization**
  - Acceptance Criteria: All 12 weeks of markdown questions parsed into `questions/week-01.json` through `week-12.json` with 120 validated questions and 0-based option index answers.
  - Output: `scripts/parse_raw.py`, `questions/`, `json/`.

- [x] **SPRINT-0.2: Next.js + TypeScript + Tailwind Setup**
  - Acceptance Criteria: Next.js App Router project initialized with strict TypeScript (`tsconfig.json` `strict: true`), Tailwind CSS, Lucide icons, and path aliases (`@/*`).
  - Native Checks: `npm run build` succeeds cleanly.

- [x] **SPRINT-0.3: Zod Schema Definition & Build-Time Question Validator**
  - Acceptance Criteria: Zod schema in `src/lib/schema/question.ts` validating `week`, `title`, `questions` (stable ID `wXX-qYYY`, question text, >=2 options, answer indices within bounds). Script `scripts/validate-questions.ts` runs on `npm run validate:questions` and fails build if invalid.
  - Native Checks: Validation script runs and passes on all 12 week JSON files.

- [x] **SPRINT-0.4: Question Manifest Generator & Data Pipeline Integration**
  - Acceptance Criteria: `scripts/build-index.ts` creates `data/manifest.json` (listing week metadata, question counts, topic breakdowns). Wired into `package.json` `prebuild` hook.
  - Native Checks: `npm run build` triggers prebuild validation and manifest generation.

- [x] **SPRINT-0.5: Test Framework Bootstrap (Vitest)**
  - Acceptance Criteria: Vitest configured with `@testing-library/react` and happy-dom/jsdom. Initial tests verifying question validation logic pass.
  - Native Checks: `npm run test:unit` passes.

---

## Sprint 1: Core Engine & Storage Foundation
*Objective: Build pure TypeScript quiz session engine, scoring algorithms, storage abstraction with IndexedDB, and state stores.*

- [x] **SPRINT-1.1: Pure TS Quiz Engine (Session Creation & Shuffling)**
  - Acceptance Criteria: `src/lib/engine/quiz.ts` implementing `buildQuiz(config, questionBank, history)`. Deterministic seeded PRNG (mulberry32) for question/option shuffle, tracking original option indices for consistent analytics.
  - Tests: Failing tests written first for seed reproducibility, option remapping, and sampling strategies (`even`, `proportional`, `weak-weighted`).

- [x] **SPRINT-1.2: Session Answering, Timers & Scoring Logic**
  - Acceptance Criteria: Pure functions `answerQuestion(session, qid, selected)` and `scoreSession(session, scoringRules)`. Supports positive marks, optional negative marking, unanswered handling, and accurate duration math.
  - Tests: Comprehensive unit tests covering negative marking edge cases, multi-select, and partial scoring if applicable.

- [x] **SPRINT-1.3: Storage Layer Abstraction (`ProgressRepository`)**
  - Acceptance Criteria: Interface `ProgressRepository` in `src/lib/storage/repository.ts`. Implementation using IndexedDB (via `idb-keyval`) for `attempts` and `questionStats`, and `localStorage` for lightweight `Settings`. In-memory fallback if IndexedDB is blocked.
  - Tests: Unit tests for repository methods (saveAttempt, getAttempts, getStats, updateStats).

- [x] **SPRINT-1.4: Progress Export / Import Engine**
  - Acceptance Criteria: Functions `exportProgress()` and `importProgress(fileContent)` in `src/lib/storage/backup.ts`. Validated with Zod schema (`nptel-progress.json`). Rejects corrupted or malicious payloads gracefully.
  - Tests: Unit tests for export formatting and invalid payload rejection.

- [x] **SPRINT-1.5: Zustand Client Stores**
  - Acceptance Criteria: Zustand stores (`useQuizStore`, `useSettingsStore`, `useProgressStore`) wiring the engine and storage layer with reactive state for the UI.

---

## Sprint 2: UI Design System & App Shell
*Objective: Establish responsive, accessible layout, dark/light theme switcher, dashboard shell, and settings page.*

- [x] **SPRINT-2.1: Design Tokens, Theme Provider & Global Layout**
  - Acceptance Criteria: Theme provider (`next-themes` or custom) supporting light, dark, and system modes. Root layout with responsive header, navigation links, and accessible landmark elements.
  - Tests/Gates: Visual check, no hydration mismatch, strict contrast compliance.

- [x] **SPRINT-2.2: Reusable UI Component Primitives**
  - Acceptance Criteria: Button, Card, Badge, Progress Bar, Dialog/Modal, Tabs, Dropdown, Tooltip with keyboard accessibility and fluid animations.
  - Tests/Gates: Components render cleanly across screen sizes.

- [x] **SPRINT-2.3: Landing Page & Dashboard (`/`)**
  - Acceptance Criteria: Modern dashboard displaying readiness score overview, quick action buttons ("Start Weekly Quiz", "Exam Simulator", "Practice Weak Areas", "Review Mistakes"), and week progress cards (Week 1–12).
  - Tests/Gates: Page renders statically with client-side hydration of local progress.

- [x] **SPRINT-2.4: Settings Page (`/settings`)**
  - Acceptance Criteria: UI controls for theme switcher, default quiz timer, negative marking toggle, shuffle options toggle, one-click progress export, JSON import with confirmation modal, and reset data with safety prompt.
  - Tests/Gates: Settings persist across browser reload.

---

## Sprint 3: Quiz Execution Flow & Modes
*Objective: Implement the full interactive quiz runner for Learn, Weekly Assignment, and Overall Exam modes.*

- [x] **SPRINT-3.1: Question Card Component**
  - Acceptance Criteria: Displays question text, options with single/multi-choice selection, clear selected state, flag/bookmark toggle, keyboard shortcut listeners (`1`-`4` for options, `F` for flag).
  - Tests/Gates: Keyboard navigation works cleanly without focus trapping.

- [x] **SPRINT-3.2: Quiz Navigator & Progress Bar**
  - Acceptance Criteria: Side panel / collapsible drawer displaying all question numbers with color codes: answered, unanswered, flagged, current. One-click jump to any question.
  - Tests/Gates: Smooth navigation and state synchronization.

- [x] **SPRINT-3.3: Resilient Quiz Timer**
  - Acceptance Criteria: Timestamp-based timer (`startedAt`, `targetEndAt`) that remains accurate even across browser tab sleep, minimize, or page refresh. Warning state when under 2 minutes remaining.
  - Tests: Unit tests for timestamp delta calculations.

- [x] **SPRINT-3.4: Weekly Quiz Mode (`/quiz/weekly/[week]`)**
  - Acceptance Criteria: Setup modal (timer toggle, shuffle options), quiz execution flow with autosave after every answer, confirmation modal on submit, answers hidden until completion.
  - Tests/Gates: Reloading tab restores exact session progress.

- [x] **SPRINT-3.5: Learn Mode (`/learn`)**
  - Acceptance Criteria: Immediate feedback on option selection (green for correct, red for incorrect), explanation display, no timer pressure, next/previous question controls.
  - Tests/Gates: Instant visual feedback, no progress degradation.

- [x] **SPRINT-3.6: Overall Quiz / Exam Simulator (`/quiz/overall`)**
  - Acceptance Criteria: Configurable final exam simulation: questions sampled across all 12 weeks, customizable question count (e.g., 50 or 100), sampling strategy (`even`, `proportional`, `weak-weighted`), timed exam conditions.
  - Tests/Gates: Verification of question sampling across all weeks.

---

## Sprint 4: Result Analysis & Review Engine
*Objective: Deliver post-quiz score summaries, question-by-question review, and bookmark management.*

- [x] **SPRINT-4.1: Attempt Results Summary (`/review/[attemptId]`)**
  - Acceptance Criteria: Score, percentage, pass/mastery badge, time taken, average time per question, correct/incorrect/skipped counters, comparison against prior attempts.
  - Tests/Gates: Calculations match scoring rules.

- [x] **SPRINT-4.2: Full Question Review Interface**
  - Acceptance Criteria: Filterable review (all, incorrect only, flagged only), showing user's selected choice vs accepted answer, full explanation, and one-click bookmark.
  - Tests/Gates: Clear visual indicators for correct vs incorrect options.

- [x] **SPRINT-4.3: Bookmarks Page (`/bookmarks`)**
  - Acceptance Criteria: Listing of all user-bookmarked questions across weeks, filterable by week, with option to start a focused practice session on bookmarked questions.
  - Tests/Gates: Bookmark state updates immediately in storage.

---

## Sprint 5: Analytics Dashboard & Learning Retention
*Objective: Deliver score analysis, week-wise accuracy charts, Leitner spaced repetition, and mistake drill mode.*

- [x] **SPRINT-5.1: Client Analytics Calculation Engine**
  - Acceptance Criteria: Pure TS engine in `src/lib/analytics/` calculating: Overall Readiness Score (blended accuracy, recency, coverage), Week-wise accuracy, Topic breakdown, Average response time, and Weak-spot identification.
  - Tests: Unit tests for analytics mathematical edge cases (0 attempts, 100% attempts, mixed weeks).

- [x] **SPRINT-5.2: Analytics Dashboard Page (`/analytics`)**
  - Acceptance Criteria: Lazy-loaded charts with Recharts:
    - Week-wise Accuracy Bar Chart with weakest week highlight.
    - Score Trendline over historical attempts.
    - Coverage gauge (percentage of total questions seen per week).
    - Weak spots list with "Practice These Now" CTA.
  - Tests/Gates: Lightweight bundle (Recharts loaded dynamically), responsive on mobile.

- [x] **SPRINT-5.3: Activity & Streak Heatmap**
  - Acceptance Criteria: GitHub-style contribution calendar displaying daily practice activity and streak counter.
  - Tests/Gates: Date binning handles local time zones accurately.

- [x] **SPRINT-5.4: Spaced Repetition Revision Mode (`/revision`)**
  - Acceptance Criteria: 5-box Leitner system implementation in `src/lib/engine/spaced-repetition.ts`. Correct answers advance to next box; incorrect answers drop to Box 1. Generates daily revision queue.
  - Tests: Unit tests for box promotion/demotion logic.

- [x] **SPRINT-5.5: Review Mistakes Mode (`/practice?mode=mistakes`)**
  - Acceptance Criteria: Auto-generated quiz session consisting of questions answered incorrectly in recent attempts, ordered by error frequency.
  - Tests/Gates: Empty state handled gracefully when no mistakes exist.

---

## Sprint 6: Polish, Offline PWA, Accessibility & E2E Testing
*Objective: Provide production-grade reliability, WCAG AA accessibility, offline support, and full E2E test coverage.*

- [x] **SPRINT-6.1: Keyboard Shortcuts & WCAG AA Accessibility Audit**
  - Acceptance Criteria: Full keyboard navigation (`1-4` options, `Enter` next/submit, `F` bookmark, `←/→` navigation), screen reader aria-labels, focus indicators, color contrast AA compliance.
  - Tests/Gates: Automated axe-core / a11y checks pass.

- [x] **SPRINT-6.2: Offline PWA & Service Worker**
  - Acceptance Criteria: PWA manifest (`manifest.json`), service worker precaching static application shell and question JSON files. Offline indicator banner when disconnected.
  - Tests/Gates: App loads and runs quizzes when offline in Chrome DevTools network throttle (offline).

- [x] **SPRINT-6.3: Playwright E2E Test Suite**
  - Acceptance Criteria: Automated end-to-end journeys covering:
    1. Complete weekly quiz -> verify result page and storage save.
    2. Start overall quiz -> navigate, answer questions -> submit.
    3. Practice mode -> instant feedback.
    4. Export progress -> verify downloaded JSON -> import progress on clean profile.
  - Native Checks: `npx playwright test` passes in CI.

- [x] **SPRINT-6.4: Performance Optimization & Vercel Production Build**
  - Acceptance Criteria: Lighthouse score 95+ on Performance, Accessibility, Best Practices, and SEO. Zero TypeScript or ESLint warnings.
  - Native Checks: `npm run build` succeeds with zero errors.
