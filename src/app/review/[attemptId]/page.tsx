"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { defaultRepository } from "@/lib/storage/repository";
import { AttemptRecord } from "@/lib/schema/progress";
import { getAllQuestions } from "@/lib/questions";
import { Question } from "@/lib/schema/question";
import { useProgressStore } from "@/store/useProgressStore";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Bookmark,
  Lightbulb,
  Flag,
  Award,
} from "lucide-react";

export default function ReviewPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const attemptId = params.attemptId;

  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "incorrect" | "flagged">("all");

  const { questionStats, toggleBookmark } = useProgressStore();

  useEffect(() => {
    async function load() {
      const [record, allQs] = await Promise.all([
        defaultRepository.getAttemptById(attemptId),
        getAllQuestions(),
      ]);

      const map: Record<string, Question> = {};
      for (const q of allQs) {
        map[q.id] = q;
      }

      setAttempt(record);
      setQuestionsMap(map);
      setLoading(false);

      // Trigger celebration if scored 80% or higher
      if (record && record.percentage >= 80) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#0f766e", "#34d399", "#f59e0b"],
        });
      }
    }

    load();
  }, [attemptId]);

  if (loading || !attempt) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Loading results...</p>
        </div>
      </div>
    );
  }

  const correctCount = attempt.answers.filter((a) => a.correct).length;
  const incorrectCount = attempt.answers.filter((a) => !a.correct && a.selected.length > 0).length;
  const skippedCount = attempt.answers.filter((a) => a.selected.length === 0).length;

  const totalMinutes = Math.floor(attempt.totalTimeMs / 60000);
  const totalSeconds = Math.floor((attempt.totalTimeMs % 60000) / 1000);
  const formattedTime = `${totalMinutes}m ${totalSeconds}s`;

  const avgSecondsPerQ =
    attempt.answers.length > 0
      ? Math.round(attempt.totalTimeMs / 1000 / attempt.answers.length)
      : 0;

  // Filter questions
  const filteredAnswers = attempt.answers.filter((ans) => {
    if (filter === "incorrect") return !ans.correct;
    if (filter === "flagged") return ans.flagged;
    return true;
  });

  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8">
      {/* Result Hero Header */}
      <div className="bg-surface rounded-card border border-border p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-rule">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="data" size="sm">
                {attempt.type === "weekly" ? `Week ${attempt.week} Quiz` : "Final Exam Simulation"}
              </Badge>
              <span className="text-xs text-ink-muted">Attempt Completed</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Score Summary</h1>
          </div>

          <div className="flex items-center gap-2.5">
            {attempt.week !== undefined && (
              <Link href={`/quiz/weekly/${attempt.week}`}>
                <Button variant="outline" size="md">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="primary" size="md">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Score & Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div>
            <div className="text-[11px] font-mono uppercase text-ink-muted">Final Score</div>
            <div className="text-3xl font-mono font-bold text-ink mt-1 tabular">
              {attempt.score.toFixed(1)} <span className="text-base text-ink-muted font-normal">/ {attempt.maxScore}</span>
            </div>
            <div className="mt-1">
              <Badge
                variant={attempt.percentage >= 80 ? "correct" : attempt.percentage >= 50 ? "flag" : "wrong"}
                size="sm"
              >
                {attempt.percentage}% Accuracy
              </Badge>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase text-ink-muted">Breakdown</div>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono">
              <span className="text-status-correct font-semibold">{correctCount} Correct</span>
              <span className="text-ink-muted">·</span>
              <span className="text-status-wrong font-semibold">{incorrectCount} Wrong</span>
              {skippedCount > 0 && (
                <>
                  <span className="text-ink-muted">·</span>
                  <span className="text-ink-muted">{skippedCount} Skipped</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-ink-muted mt-1">Total {attempt.answers.length} Questions</div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase text-ink-muted">Time Taken</div>
            <div className="text-xl font-mono font-semibold text-ink mt-2 tabular">{formattedTime}</div>
            <div className="text-[11px] text-ink-muted mt-1">{avgSecondsPerQ}s avg / question</div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase text-ink-muted">Outcome</div>
            <div className="text-sm font-semibold text-ink mt-2">
              {attempt.percentage >= 80
                ? "🌟 Outstanding Mastery"
                : attempt.percentage >= 50
                ? "👍 Passed Standard"
                : "⚠️ Review Recommended"}
            </div>
            <div className="text-[11px] text-ink-muted mt-1">Target is 70%+</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Detailed Review Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-ink">Detailed Question Review</h2>
          <p className="text-xs text-ink-muted">Analyze your answers and master the correct principles.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-control border border-border">
          <button
            onClick={() => setFilter("all")}
            className={`btn-press px-2.5 py-1 text-xs rounded-control font-medium transition-colors ${
              filter === "all" ? "bg-raised text-ink border border-border font-semibold" : "text-ink-muted hover:text-ink"
            }`}
          >
            All ({attempt.answers.length})
          </button>
          <button
            onClick={() => setFilter("incorrect")}
            className={`btn-press px-2.5 py-1 text-xs rounded-control font-medium transition-colors ${
              filter === "incorrect" ? "bg-raised text-ink border border-border font-semibold" : "text-ink-muted hover:text-ink"
            }`}
          >
            Wrong ({incorrectCount})
          </button>
          <button
            onClick={() => setFilter("flagged")}
            className={`btn-press px-2.5 py-1 text-xs rounded-control font-medium transition-colors ${
              filter === "flagged" ? "bg-raised text-ink border border-border font-semibold" : "text-ink-muted hover:text-ink"
            }`}
          >
            Flagged
          </button>
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-4">
        {filteredAnswers.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-card border border-border">
            <p className="text-xs text-ink-muted">No questions match this filter.</p>
          </div>
        ) : (
          filteredAnswers.map((ans, idx) => {
            const questionData = questionsMap[ans.qid];
            if (!questionData) return null;

            const isCorrect = ans.correct;
            const isSkipped = ans.selected.length === 0;

            return (
              <Card key={ans.qid} className="p-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-rule">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-ink">
                      Q{(idx + 1).toString().padStart(2, "0")} · {ans.qid}
                    </span>
                    {isCorrect ? (
                      <Badge variant="correct" size="sm">Correct</Badge>
                    ) : isSkipped ? (
                      <Badge variant="neutral" size="sm">Skipped</Badge>
                    ) : (
                      <Badge variant="wrong" size="sm">Incorrect</Badge>
                    )}
                    {ans.flagged && (
                      <span className="text-status-flag flex items-center gap-1 text-[11px]">
                        <Flag className="w-3 h-3 fill-current" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-ink-muted">
                      {Math.round(ans.timeMs / 1000)}s spent
                    </span>
                    <button
                      onClick={() => toggleBookmark(ans.qid)}
                      className={`btn-press p-1 rounded-control text-xs border transition-colors ${
                        questionStats[ans.qid]?.bookmarked
                          ? "bg-data-subtle text-data border-data/30"
                          : "bg-surface text-ink-muted border-border hover:text-ink"
                      }`}
                      title="Bookmark question"
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          questionStats[ans.qid]?.bookmarked ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <h3 className="text-sm md:text-base font-medium text-ink mb-4">
                  {questionData.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2">
                  {questionData.options.map((opt, optIdx) => {
                    const isAcceptedAnswer = questionData.answer.includes(optIdx);
                    const wasSelectedByUser = ans.selected.includes(optIdx);

                    let optStyle = "border-border bg-surface text-ink";
                    let badgeStyle = "bg-raised text-ink-muted border-border";

                    if (isAcceptedAnswer) {
                      optStyle = "border-status-correct/60 bg-status-correct-bg/70 text-ink";
                      badgeStyle = "bg-status-correct text-status-correct-contrast font-semibold border-transparent";
                    } else if (wasSelectedByUser && !isAcceptedAnswer) {
                      optStyle = "border-status-wrong/60 bg-status-wrong-bg/70 text-ink";
                      badgeStyle = "bg-status-wrong text-status-wrong-contrast font-semibold border-transparent";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center justify-between p-3 rounded-control border text-xs md:text-sm ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-badge border text-[10px] font-mono font-semibold flex items-center justify-center shrink-0 ${badgeStyle}`}
                          >
                            {optIdx + 1}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isAcceptedAnswer && (
                            <span className="text-[11px] font-semibold text-status-correct flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Correct Answer</span>
                            </span>
                          )}
                          {wasSelectedByUser && !isAcceptedAnswer && (
                            <span className="text-[11px] font-semibold text-status-wrong flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Your Choice</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="mt-3.5 p-3 rounded-control bg-raised/50 border border-rule text-xs flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-data shrink-0 mt-0.5" />
                  <div className="text-ink-secondary">
                    <strong className="text-ink">Explanation: </strong>
                    {questionData.explanation ||
                      `Accepted correct answer is Option ${questionData.answer.map((i) => i + 1).join(", ")} (${questionData.options[questionData.answer[0]]}).`}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
