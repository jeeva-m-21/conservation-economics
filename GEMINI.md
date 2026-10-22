# GEMINI.md — Instructions for Gemini & Antigravity Agents

> This file provides project-specific context and operational guidelines for Gemini and Antigravity agents working on the **NPTEL Quiz App**.

## Reference Documents
- **Architecture Specification:** [architecture.md](file:///home/jeeva/projects/conservation-economics/architecture.md)
- **Agent Guidelines & Tooling:** [AGENTS.md](file:///home/jeeva/projects/conservation-economics/AGENTS.md)
- **Sprint Backlog & Progress:** [backlog.md](file:///home/jeeva/projects/conservation-economics/backlog.md)

## Core Mission
Build a static-first, zero-database, production-quality NPTEL Quiz Platform for 12 weeks of course material (120 questions).

## Key Architectural Rules
1. **Zero Database / Zero Server:** Everything runs in the browser. Statically exportable on Vercel.
2. **IndexedDB for User Data:** User attempts and question stats live in IndexedDB via `ProgressRepository`. Gracefully fall back to in-memory if blocked.
3. **Pure Engine Separation:** Keep all quiz logic, session generation, seeded PRNG shuffling, and scoring in `src/lib/engine/` with pure TypeScript and no React/DOM dependencies.
4. **Zod Validation at Boundaries:** Build-time validation for questions (`scripts/validate-questions.ts`) and runtime validation for imported progress backups (`nptel-progress.json`).
5. **Strict Typing:** No `any`. Strict TypeScript configuration.
6. **Build Loop (Red-Green-Gate-Commit):** Write unit tests first, pass them, run type checks/linters, make atomic commits with ticket IDs (`SPRINT-N.X`), and update `backlog.md`.
