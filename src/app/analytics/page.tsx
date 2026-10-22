"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useProgressStore } from "@/store/useProgressStore";
import {
  computeReadinessScore,
  computeWeekAccuracies,
  identifyWeakSpots,
  computeStudyStreak,
} from "@/lib/analytics/stats";
import manifestData from "@/data/manifest.json";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Play,
  Calendar,
  Layers,
  Award,
} from "lucide-react";

export default function AnalyticsPage() {
  const { attempts, questionStats, isLoading, loadProgress } = useProgressStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadProgress();
  }, [loadProgress]);

  if (!mounted || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Computing score analytics...</p>
        </div>
      </div>
    );
  }

  const readinessScore = computeReadinessScore(
    attempts,
    manifestData.totalQuestions,
    questionStats
  );
  const weekAccuracies = computeWeekAccuracies(attempts, 12);
  const weakQuestionIds = identifyWeakSpots(questionStats);
  const streak = computeStudyStreak(attempts);

  // Chart data format
  const barChartData = weekAccuracies.map((w) => ({
    name: `W${w.week.toString().padStart(2, "0")}`,
    accuracy: w.accuracy,
    attempts: w.attemptsCount,
  }));

  // Trendline data from historical attempts
  const trendData = attempts
    .slice()
    .reverse()
    .map((a, i) => ({
      attempt: `#${i + 1}`,
      percentage: a.percentage,
      type: a.type,
    }));

  // Lowest accuracy attempted week
  const attemptedWeeks = weekAccuracies.filter((w) => w.attemptsCount > 0);
  const weakestWeek =
    attemptedWeeks.length > 0
      ? [...attemptedWeeks].sort((a, b) => a.accuracy - b.accuracy)[0]
      : null;

  return (
    <main className="max-w-6xl mx-auto w-full px-4 py-8 page-enter">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="data" size="sm">Course Intelligence</Badge>
            <span className="text-xs text-ink-muted">Client-Side Analytics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Score Analytics & Insights</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Diagnostic performance breakdown across all 12 weeks of NPTEL Conservation Economics.
          </p>
        </div>

        {weakQuestionIds.length > 0 && (
          <Link href="/practice?mode=mistakes">
            <Button variant="primary" size="md">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice Weak Spots ({weakQuestionIds.length})</span>
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Row (Achromatic Ledger) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Card className="p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Readiness Score</div>
          <div className="text-3xl font-mono font-bold text-ink mt-1 tabular">{readinessScore}%</div>
          <div className="text-[11px] text-ink-muted mt-0.5">Weighted composite metric</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Active Study Streak</div>
          <div className="text-3xl font-mono font-bold text-ink mt-1 tabular">
            {streak} <span className="text-sm font-normal text-ink-muted">Days</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Consecutive daily sessions</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Weak Spots Found</div>
          <div className="text-3xl font-mono font-bold text-ink mt-1 tabular">{weakQuestionIds.length}</div>
          <div className="text-[11px] text-ink-muted mt-0.5">Questions needing review</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Priority Focus</div>
          <div className="text-xl font-mono font-semibold text-ink mt-2">
            {weakestWeek ? `Week ${weakestWeek.week}` : "None"}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            {weakestWeek ? `${weakestWeek.accuracy}% accuracy` : "Take a quiz to discover"}
          </div>
        </Card>
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Week Accuracy Bar Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Week-by-Week Accuracy</h2>
              <p className="text-xs text-ink-muted">Average score percentage across each week's attempts.</p>
            </div>
            <BarChart3 className="w-4 h-4 text-ink-muted" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, "Accuracy"]}
                  itemStyle={{ color: "var(--text-ink)" }}
                  labelStyle={{ color: "var(--text-muted)", fontWeight: 600 }}
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--text-ink)",
                  }}
                />
                <Bar dataKey="accuracy" fill="var(--data-hue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Score Trendline Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Score Trendline</h2>
              <p className="text-xs text-ink-muted">Historical scores over your last attempts.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-ink-muted" />
          </div>

          {trendData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-ink-muted">
              Complete at least one quiz to view your score trendline.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="attempt" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, "Score"]}
                    itemStyle={{ color: "var(--text-ink)" }}
                    labelStyle={{ color: "var(--text-muted)", fontWeight: 600 }}
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "var(--text-ink)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="var(--data-hue)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--data-hue)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Weak Areas Drill-Down */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink">Weak Areas Diagnostic</h2>
              <p className="text-xs text-ink-muted">
                Questions where multiple errors occurred or that sit in Leitner Box 1.
              </p>
            </div>
            {weakQuestionIds.length > 0 && (
              <Badge variant="flag" size="sm">{weakQuestionIds.length} flagged</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {weakQuestionIds.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-muted">
              No weak areas detected! Take a few practice quizzes to build diagnostic data.
            </div>
          ) : (
            <div className="divide-y divide-rule">
              {weakQuestionIds.slice(0, 10).map((qid) => {
                const stat = questionStats[qid];
                const accuracy = stat ? Math.round((stat.correct / stat.seen) * 100) : 0;
                return (
                  <div key={qid} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-data">{qid}</span>
                      <span className="text-xs text-ink-muted">
                        Answered {stat.correct} / {stat.seen} times correctly
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="wrong" size="sm">{accuracy}% accuracy</Badge>
                      <Badge variant="neutral" size="sm">Box {stat.box}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
