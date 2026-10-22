"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import manifestData from "@/data/manifest.json";
import { useProgressStore } from "@/store/useProgressStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Play,
  Repeat,
  Compass,
  Bookmark,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { attempts, questionStats, loadProgress } = useProgressStore();
  const [filterMode, setFilterMode] = useState<"all" | "unattempted" | "review">("all");

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Compute metrics from stored attempts
  const totalQuestions = manifestData.totalQuestions;
  const seenQuestionIds = useMemo(() => {
    return new Set(
      Object.values(questionStats).filter((s) => s.seen > 0).map((s) => s.qid)
    );
  }, [questionStats]);

  const coveragePercent = Math.round((seenQuestionIds.size / totalQuestions) * 100);

  // Overall accuracy across all attempts
  let totalScoreAttempted = 0;
  let totalMaxAttempted = 0;
  for (const a of attempts) {
    totalScoreAttempted += a.score;
    totalMaxAttempted += a.maxScore;
  }
  const avgAccuracy =
    totalMaxAttempted > 0
      ? Math.round((totalScoreAttempted / totalMaxAttempted) * 100)
      : 0;

  // Readiness weighted formula: 50% accuracy + 30% coverage + 20% active attempts factor
  const activityFactor = Math.min(100, attempts.length * 10);
  const readinessScore = Math.round(
    0.5 * avgAccuracy + 0.3 * coveragePercent + 0.2 * activityFactor
  );

  // Map best scores per week
  const weekBestScores = useMemo(() => {
    const scores: Record<number, number> = {};
    for (const a of attempts) {
      if (a.week !== undefined) {
        const prev = scores[a.week] || 0;
        if (a.percentage > prev) {
          scores[a.week] = a.percentage;
        }
      }
    }
    return scores;
  }, [attempts]);

  // Filter weeks
  const filteredWeeks = useMemo(() => {
    return manifestData.weeks.filter((week) => {
      const best = weekBestScores[week.week];
      if (filterMode === "unattempted") return best === undefined;
      if (filterMode === "review") return best !== undefined && best < 75;
      return true;
    });
  }, [filterMode, weekBestScores]);

  // Count bookmarked questions
  const bookmarkedCount = Object.values(questionStats).filter((s) => s.bookmarked).length;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 md:py-10 space-y-10 page-enter">
      {/* Executive SaaS Hero Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-control bg-surface border border-border text-xs text-ink-muted font-medium shadow-2xs">
            <span className="text-data font-semibold">13 Assignments</span>
            <span className="text-border">·</span>
            <span>130 Course Questions (Weeks 0–12)</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink font-sans">
            Conservation Economics
          </h1>

          <p className="text-sm text-ink-muted leading-relaxed">
            Focused self-study console for NPTEL Conservation Economics. Work through weekly problem sets, drill difficult concepts in practice mode, and simulate timed certification exams.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/quiz/overall">
            <Button
              variant="data"
              size="md"
              className="shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Exam Simulator</span>
            </Button>
          </Link>
          <Link href="/practice">
            <Button variant="outline" size="md">
              <Compass className="w-3.5 h-3.5" />
              <span>Practice Mode</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Achromatic Progress Ledger (4-Metric Grid) */}
      <section aria-label="Progress Overview">
        <div className="grid grid-cols-2 lg:grid-cols-4 rounded-card border border-border bg-surface divide-y sm:divide-y-0 sm:divide-x divide-rule overflow-hidden shadow-xs">
          {/* Readiness Score */}
          <div className="p-5 md:p-6 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Readiness Score
            </span>
            <div className="my-2">
              <span className="text-3xl md:text-4xl font-mono font-bold text-ink tabular tracking-tight">
                {readinessScore}
                <span className="text-lg text-ink-muted font-normal">%</span>
              </span>
            </div>
            <span className="text-xs text-ink-muted">
              {readinessScore >= 80 ? "Mastery achieved" : "80%+ recommended"}
            </span>
          </div>

          {/* Question Coverage */}
          <div className="p-5 md:p-6 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Course Coverage
            </span>
            <div className="my-2">
              <span className="text-3xl md:text-4xl font-mono font-bold text-ink tabular tracking-tight">
                {seenQuestionIds.size}
                <span className="text-lg text-ink-muted font-normal"> / {totalQuestions}</span>
              </span>
            </div>
            <span className="text-xs text-ink-muted">
              {coveragePercent}% of question bank seen
            </span>
          </div>

          {/* Accuracy Rate */}
          <div className="p-5 md:p-6 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Average Accuracy
            </span>
            <div className="my-2">
              <span className="text-3xl md:text-4xl font-mono font-bold text-ink tabular tracking-tight">
                {avgAccuracy}
                <span className="text-lg text-ink-muted font-normal">%</span>
              </span>
            </div>
            <span className="text-xs text-ink-muted">
              Calculated across {attempts.length} attempts
            </span>
          </div>

          {/* Total Attempts & Storage */}
          <div className="p-5 md:p-6 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Attempts Stored
            </span>
            <div className="my-2">
              <span className="text-3xl md:text-4xl font-mono font-bold text-ink tabular tracking-tight">
                {attempts.length}
              </span>
            </div>
            <span className="text-xs text-ink-muted">
              IndexedDB local persistence
            </span>
          </div>
        </div>
      </section>

      {/* Focus Console Rail (Targeted Workflows) */}
      <section
        aria-label="Quick Actions"
        className="p-4 md:p-5 rounded-card bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-control bg-raised border border-border flex items-center justify-center text-ink shrink-0 font-mono text-xs font-semibold">
            01
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Targeted Weak-Spot Drills
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Practice questions with frequent errors, or review your {bookmarkedCount} saved bookmarks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/practice?mode=mistakes">
            <Button variant="secondary" size="sm" className="text-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>Mistakes Drill</span>
            </Button>
          </Link>
          <Link href="/bookmarks">
            <Button variant="outline" size="sm" className="text-xs">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarkedCount})</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* 12-Week Curriculum Matrix */}
      <section aria-labelledby="curriculum-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <div>
            <h2 id="curriculum-heading" className="text-lg font-bold tracking-tight text-ink">
              Weekly Course Curriculum
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Work through all 12 modules systematically with learn and mock quiz modes.
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center p-1 rounded-control bg-raised border border-border self-start sm:self-auto text-xs font-medium">
            <button
              onClick={() => setFilterMode("all")}
              className={`btn-press px-2.5 py-1 rounded text-xs transition-colors ${
                filterMode === "all"
                  ? "bg-surface text-ink font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              All (12)
            </button>
            <button
              onClick={() => setFilterMode("unattempted")}
              className={`btn-press px-2.5 py-1 rounded text-xs transition-colors ${
                filterMode === "unattempted"
                  ? "bg-surface text-ink font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Unattempted
            </button>
            <button
              onClick={() => setFilterMode("review")}
              className={`btn-press px-2.5 py-1 rounded text-xs transition-colors ${
                filterMode === "review"
                  ? "bg-surface text-ink font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Needs Review
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWeeks.map((week) => {
            const bestScore = weekBestScores[week.week];
            const isMastered = bestScore !== undefined && bestScore >= 80;
            const isPassing = bestScore !== undefined && bestScore >= 50 && bestScore < 80;

            return (
              <div
                key={week.week}
                className="card-hover group p-5 rounded-card bg-surface border border-border hover:border-ink-muted/50 transition-colors flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-badge bg-raised border border-border text-ink-muted">
                      WEEK {week.week.toString().padStart(2, "0")}
                    </span>

                    {bestScore !== undefined ? (
                      <Badge
                        variant={isMastered ? "correct" : isPassing ? "flag" : "neutral"}
                        size="sm"
                      >
                        {isMastered ? "Mastered" : "Passing"} · {bestScore}%
                      </Badge>
                    ) : (
                      <span className="text-[11px] font-mono text-ink-muted">
                        Unattempted
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-ink leading-snug line-clamp-1 group-hover:text-data transition-colors">
                    {week.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-ink-muted mt-2 font-mono text-[11px]">
                    <span>10 Questions</span>
                    <span>·</span>
                    <span>15 Mins</span>
                  </div>
                </div>

                {/* Card Action Rail */}
                <div className="pt-4 mt-4 border-t border-rule flex items-center justify-between gap-2">
                  <Link href={`/learn?week=${week.week}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs text-ink-muted hover:text-ink hover:bg-raised"
                    >
                      <span>Learn</span>
                    </Button>
                  </Link>

                  <Link href={`/quiz/weekly/${week.week}`} className="flex-1">
                    <Button
                      variant="data"
                      size="sm"
                      className="w-full text-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Quiz</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
