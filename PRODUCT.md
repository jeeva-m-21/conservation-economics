# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14 (App Router), TypeScript (strict mode), Tailwind CSS, Zustand, IndexedDB (idb-keyval), Zod, Recharts, Vitest

## Users

Learners, students, and professionals taking the NPTEL Conservation Economics certification course who need to practice assignments across all 12 weeks, master difficult topics, simulate real exam conditions, and track learning progress.

## Product Purpose

Provide a distraction-free, zero-backend, zero-database static web application that enables full mastery of 12 weeks of course questions through Learn Mode (instant explanations), Practice Mode (mistake drills and filters), Weekly Assignment Quizzes, and a Cumulative Overall Final Exam Simulator with rich score analytics.

## Positioning

Unlike server-backed, account-heavy quiz portals with ads or paywalls, this platform is:
1. 100% client-side and static: deployed free on Vercel Edge CDN with zero server cost and infinite scale.
2. Completely private: user progress never leaves their device.
3. Fully portable: single-click validated export and import (`nptel-progress.json`) across any browser or device.
4. Deterministic and resilient: seeded PRNG (`mulberry32`) guarantees reproducible question order across reloads, and timestamp-based timers prevent tab sleep drift.

## Operating Context

- **Devices:** Mobile phones (frequent study on the go) and desktop/laptop browsers (focused exam simulations).
- **Environment:** Runs locally in modern browsers, works offline once loaded via Service Worker, and operates seamlessly even in private browsing (via in-memory fallback).
- **Rhythm:** Daily 5-minute spaced repetition reviews, weekly 10-question assignments, and comprehensive 50-100 question overall exam drills.

## Capabilities and Constraints

- **Question Bank:** 12 weeks of curated questions (10 questions per week, 120 total), strictly validated at build-time with Zod.
- **Stable IDs:** Question IDs follow immutable format `wXX-qYYY` (e.g. `w01-q001`).
- **Answer Format:** `answer` is an array of 0-based option indices (`[1]`), supporting single-choice and multi-select formats.
- **Engine Purity:** All quiz state transitions and scoring live in `src/lib/engine/` as pure TypeScript functions with zero React or DOM dependencies.
- **Storage Contract:** `ProgressRepository` handles IndexedDB for attempts and Leitner question stats, with graceful in-memory fallback and localStorage for UI settings.

## Brand Commitments

- **Name:** NPTEL Conservation Economics Quiz & Exam Simulator.
- **Voice:** Calm, academic, direct, distraction-free. No superficial gamification, badges, or cartoon noise.
- **Aesthetic:** Achromatic Ledger with a low-chroma Sage ground (`#f4f6f4` light / `#0a0c0a` dark) rooted in forestry and ecology. The one primary data hue is Forest Teal (`#0f766e` / `#2dd4bf`).

## Evidence on Hand

- 12 raw course assignment markdown files in `raw/` (Weeks 1 to 12).
- Standardized, validated question JSON files in `questions/week-01.json` through `questions/week-12.json` (120 questions total).
- Full architectural specification in `architecture.md`.
- Complete design engineering contract in `design.md`.

## Product Principles

1. **Local-First & Zero-Cost:** User state lives on the device; the site is pre-rendered and served from CDN edge.
2. **Data Integrity & Portability:** Schema validation at all boundaries; one-click export/import for backup.
3. **Pure Engine Separation:** Quiz generation, shuffling, and scoring are pure functions with 100% test coverage.
4. **Calm Focus & Anti-Slop:** Color goes on data, not chrome; typography over icon tiles; instant keyboard navigation.
5. **Resilient Execution:** Timers calculate from timestamps; autosave preserves every answer against accidental tab close.

## Accessibility & Inclusion

- WCAG AA compliant with minimum 4.5:1 text contrast on light and dark surfaces.
- Full keyboard operability (`1-4` for options, `F` for flag, `Enter` for next, `Space` for flip).
- `touch-action: manipulation` and 16px inputs to prevent mobile tap latency and unwanted zoom.
- `prefers-reduced-motion` compliance across all transitions.
