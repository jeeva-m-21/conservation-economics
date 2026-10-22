"use client";

import { useEffect } from "react";
import Link from "next/link";
import manifestData from "@/data/manifest.json";
import { useProgressStore } from "@/store/useProgressStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Sparkles,
  Play,
  BookOpen,
  Repeat,
  Calendar,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const { attempts, questionStats, loadProgress } = useProgressStore();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Compute metrics from stored attempts
  const totalQuestions = manifestData.totalQuestions;
  const seenQuestionIds = new Set(
    Object.values(questionStats).filter((s) => s.seen > 0).map((s) => s.qid)
  );
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
  const weekBestScores: Record<number, number> = {};
  for (const a of attempts) {
    if (a.week !== undefined) {
      const prev = weekBestScores[a.week] || 0;
      if (a.percentage > prev) {
        weekBestScores[a.week] = a.percentage;
      }
    }
  }

  return (
    <main className="max-w-6xl mx-auto w-full px-4 py-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="data" size="sm">NPTEL 2026</Badge>
            <span className="text-xs text-ink-muted">12 Weeks · 120 Questions</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-ink">
            Conservation Economics
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1 max-w-xl">
            Static exam preparation platform. Practice weekly assignments, simulate final certification exams, and build long-term retention.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/quiz/overall">
            <Button variant="primary" size="md">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Exam Simulator</span>
            </Button>
          </Link>
          <Link href="/revision">
            <Button variant="outline" size="md">
              <Repeat className="w-3.5 h-3.5" />
              <span>Spaced Revision</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards (Achromatic Ledger Style - Typographic, no colored circle icons) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Card className="p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Readiness Score</div>
          <div className="text-2xl md:text-3xl font-mono font-semibold text-ink mt-1 tabular">
            {readinessScore}%
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            {readinessScore >= 80 ? "Exam Ready" : "Targeting 80%+"}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Course Coverage</div>
          <div className="text-2xl md:text-3xl font-mono font-semibold text-ink mt-1 tabular">
            {seenQuestionIds.size} <span className="text-sm text-ink-muted font-normal">/ {totalQuestions}</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">{coveragePercent}% questions seen</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Avg. Accuracy</div>
          <div className="text-2xl md:text-3xl font-mono font-semibold text-ink mt-1 tabular">
            {avgAccuracy}%
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Across {attempts.length} attempts</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Total Attempts</div>
          <div className="text-2xl md:text-3xl font-mono font-semibold text-ink mt-1 tabular">
            {attempts.length}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Stored on device</div>
        </Card>
      </section>

      {/* Quick Launchpad Strip */}
      <section className="mb-10 p-4 rounded-card bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-control bg-data-subtle text-data border border-data/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Target Your Weak Spots</h3>
            <p className="text-xs text-ink-muted">Drill into questions you previously missed or flagged for review.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/practice?mode=mistakes">
            <Button variant="secondary" size="sm">Review Mistakes</Button>
          </Link>
          <Link href="/bookmarks">
            <Button variant="outline" size="sm">View Bookmarks</Button>
          </Link>
        </div>
      </section>

      {/* 12 Weeks Assignment Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Course Assignments (Weeks 1 – 12)</h2>
            <p className="text-xs text-ink-muted">Master each weekly topic before taking the full mock exam.</p>
          </div>
          <span className="text-xs font-mono text-ink-muted">{manifestData.weeks.length} Weeks Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {manifestData.weeks.map((week) => {
            const bestScore = weekBestScores[week.week];

            return (
              <Card
                key={week.week}
                className="hover:border-ink-muted transition-colors flex flex-col justify-between"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-semibold text-data">
                      WEEK {week.week.toString().padStart(2, "0")}
                    </span>
                    {bestScore !== undefined ? (
                      <Badge
                        variant={bestScore >= 80 ? "correct" : bestScore >= 50 ? "flag" : "neutral"}
                        size="sm"
                      >
                        Best: {bestScore}%
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Unattempted</Badge>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-ink leading-snug line-clamp-1">
                    {week.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-xs text-ink-muted mt-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Layers className="w-3 h-3" />
                      {week.questionCount} Questions
                    </span>
                    {week.due_date && (
                      <span className="flex items-center gap-1 truncate font-mono text-[11px]">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {week.due_date.split(",")[0]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 bg-raised/40 border-t border-rule flex items-center justify-between gap-2">
                  <Link href={`/learn?week=${week.week}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      <BookOpen className="w-3 h-3" />
                      <span>Learn</span>
                    </Button>
                  </Link>

                  <Link href={`/quiz/weekly/${week.week}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Quiz</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
