# NPTEL Conservation Geography — Quiz & Exam Simulator

[![Live Production](https://img.shields.io/badge/Live-conservation--economics.jeeva.website-0f766e?style=for-the-badge&logo=vercel)](https://conservation-economics.jeeva.website)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-success?style=for-the-badge)](https://web.dev/progressive-web-apps/)

> A zero-backend, zero-database, statically generated quiz and exam preparation platform for **13 assignments of NPTEL Conservation Geography** (130 questions).

---

## 🚀 Live Application

- **Primary Custom Domain:** [https://conservation-economics.jeeva.website](https://conservation-economics.jeeva.website)
- **Vercel Mirror:** [https://conservation-economics-nine.vercel.app](https://conservation-economics-nine.vercel.app)
- **Developer Profile:** [Jeeva (@jeeva-m-21)](https://github.com/jeeva-m-21)

---

## 🏛️ Architectural Highlights

1. **Zero Database / Zero Server Cost:** 100% statically generated and hosted on Vercel Edge CDN with infinite scaling.
2. **Local-First Persistence:** User attempts, score histories, question statistics, and Leitner memory box states are stored exclusively on the client device via **IndexedDB** (`idb-keyval`) with graceful in-memory fallback.
3. **Pure TypeScript Engine:** All quiz state machines, seeded PRNG (`mulberry32`), option remapping, and scoring math live in pure TS (`src/lib/engine/`) with zero React or DOM dependencies.
4. **Data Portability:** Single-click JSON backup export/import (`nptel-progress.json`) strictly validated with Zod schemas.
5. **Progressive Web App (PWA):** Service worker precaching of the app shell and question JSONs for seamless offline study.
6. **WCAG AA Accessibility:** Full keyboard operability (`1-4` options, `F` flag, `B` bookmark, `←/→` navigation, `Enter` advance/submit) and global shortcuts modal (`?`).

---

## 📚 Study Modes

| Mode | Route | Purpose |
| :--- | :--- | :--- |
| **Dashboard** | `/` | Executive progress ledger, Readiness Score, and curriculum matrix |
| **Weekly Quiz** | `/quiz/weekly/[week]` | Timed 15-minute simulation of weekly assignments (Weeks 1 to 12) |
| **Learn Mode** | `/learn?week=[week]` | Untimed study with instant correct/incorrect feedback and explanations |
| **Exam Simulator** | `/quiz/overall` | 30 / 50 / 100 question mock exam with real -0.25 negative marking |
| **Spaced Revision** | `/revision` | 5-box Leitner spaced repetition flashcard deck |
| **Mistakes Drill** | `/practice?mode=mistakes` | Targeted practice targeting frequently missed questions |
| **Analytics** | `/analytics` | Week accuracy breakdown, score trendlines, and coverage analytics |
| **Bookmarks** | `/bookmarks` | Filterable catalog of user-flagged questions |
| **Settings** | `/settings` | Timer rules, negative marking preferences, and JSON backup export/import |

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/jeeva-m-21/conservation-economics.git
cd conservation-economics

# Install dependencies
npm install

# Run question data validation
npm run validate:questions

# Start development server
npm run dev
# Open http://localhost:3000
```

---

## 🧪 Testing & Verification

```bash
# Run strict TypeScript check
npm run type-check

# Run Vitest unit tests (34 tests)
npm run test:unit

# Run Playwright end-to-end journeys
npm run test:e2e

# Build static production bundle
npm run build
```

---

## 👤 Author

Developed by **Jeeva**
- GitHub: [@jeeva-m-21](https://github.com/jeeva-m-21)
- Portfolio & Projects: [https://github.com/jeeva-m-21](https://github.com/jeeva-m-21)
