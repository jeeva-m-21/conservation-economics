"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllQuestions } from "@/lib/questions";
import { Question } from "@/lib/schema/question";
import { useProgressStore } from "@/store/useProgressStore";
import { useQuizStore } from "@/store/useQuizStore";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizNavigator } from "@/components/quiz/QuizNavigator";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import manifestData from "@/data/manifest.json";
import {
  Compass,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode"); // "mistakes" | "bookmarks"

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPracticing, setIsPracticing] = useState(false);

  // Filters
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [selectedTopic, setSelectedTopic] = useState<string | "all">("all");

  const { questionStats, loadProgress, recordAnswerStat, toggleBookmark } = useProgressStore();
  const { session, startSession, selectOption, toggleFlag, nextQuestion, prevQuestion, jumpToQuestion, resetSession } =
    useQuizStore();

  useEffect(() => {
    loadProgress();
    getAllQuestions().then((qs) => {
      setAllQuestions(qs);
      setLoading(false);
    });
  }, [loadProgress]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  // Filter questions bank based on mode or selections
  let eligibleQuestions = [...allQuestions];
  if (modeParam === "mistakes") {
    eligibleQuestions = eligibleQuestions.filter((q) => {
      const stat = questionStats[q.id];
      return stat && stat.seen > 0 && stat.correct / stat.seen < 0.6;
    });
  } else if (modeParam === "bookmarks") {
    eligibleQuestions = eligibleQuestions.filter((q) => questionStats[q.id]?.bookmarked);
  } else {
    if (selectedWeek !== "all") {
      const prefix = `w${selectedWeek.toString().padStart(2, "0")}-`;
      eligibleQuestions = eligibleQuestions.filter((q) => q.id.startsWith(prefix));
    }
  }

  const handleStartPractice = () => {
    if (eligibleQuestions.length === 0) return;

    startSession(
      {
        type: "practice",
        questionCount: eligibleQuestions.length,
        shuffleQuestions: true,
        shuffleOptions: true,
        seed: Date.now(),
        negativeMarking: false,
      },
      eligibleQuestions
    );
    setIsPracticing(true);
  };

  // Active Practice Screen
  if (isPracticing && session) {
    const currentQ = session.questions[session.currentIndex];
    const isFirst = session.currentIndex === 0;
    const isLast = session.currentIndex === session.questions.length - 1;

    return (
      <div className="flex-1 flex flex-col bg-ground">
        <QuizHeader
          title={modeParam === "mistakes" ? "Mistakes Practice Drill" : "Custom Practice Session"}
          currentIndex={session.currentIndex}
          totalQuestions={session.questions.length}
          onToggleNavigator={() => {}}
        />

        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col justify-between">
          <QuestionCard
            question={currentQ}
            currentIndex={session.currentIndex}
            totalQuestions={session.questions.length}
            onSelectOption={(idx) => {
              selectOption(currentQ.id, idx);
              const isCorrect = currentQ.answer.includes(idx);
              recordAnswerStat(currentQ.id, isCorrect);
            }}
            onToggleFlag={() => toggleFlag(currentQ.id)}
            showFeedback={true}
            isBookmarked={questionStats[currentQ.id]?.bookmarked}
            onToggleBookmark={() => toggleBookmark(currentQ.id)}
          />

          <div className="mt-6 flex items-center justify-between gap-3 bg-surface p-3.5 rounded-card border border-border">
            <Button
              variant="outline"
              size="md"
              onClick={prevQuestion}
              disabled={isFirst}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center gap-2">
              {isLast ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setIsPracticing(false);
                    resetSession();
                  }}
                  className="bg-data text-data-contrast font-semibold hover:bg-data/90"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Done Practicing</span>
                </Button>
              ) : (
                <Button variant="primary" size="md" onClick={nextQuestion}>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-Practice Filters Screen
  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-8">
      <div className="border-b border-border pb-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="data" size="sm">
            {modeParam === "mistakes" ? "Mistakes Drill" : "Custom Filters"}
          </Badge>
          <span className="text-xs text-ink-muted">Untimed Practice with Explanations</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {modeParam === "mistakes" ? "Review Previous Mistakes" : "Practice Mode"}
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          {modeParam === "mistakes"
            ? "Questions you previously got wrong, ordered to help reinforce correct understanding."
            : "Filter questions by week or topic to target specific areas of the syllabus."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">Practice Configuration</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          {modeParam !== "mistakes" && (
            <div>
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block mb-2">
                Select Course Week
              </label>
              <select
                value={selectedWeek}
                onChange={(e) =>
                  setSelectedWeek(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))
                }
                className="w-full h-10 px-3 text-xs font-mono rounded-control bg-surface border border-border text-ink"
              >
                <option value="all">All Weeks (Complete {manifestData.totalQuestions} Questions Pool)</option>
                {manifestData.weeks.map((w) => (
                  <option key={w.week} value={w.week}>
                    Week {w.week.toString().padStart(2, "0")}: {w.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {eligibleQuestions.length === 0 ? (
            <div className="p-6 rounded-card bg-raised/30 border border-border text-center space-y-2">
              <span className="text-xs font-semibold text-ink block">
                {modeParam === "mistakes"
                  ? "Zero Mistakes Recorded"
                  : "No Questions Match Selected Filter"}
              </span>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                {modeParam === "mistakes"
                  ? "You have answered every attempted question correctly so far! Complete more quizzes or review all weeks."
                  : "Try clearing your filters or selecting a different week."}
              </p>
              {modeParam === "mistakes" && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/practice")}
                    className="text-xs"
                  >
                    View All Questions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-card bg-raised/50 border border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-ink block">Available Questions</span>
                <span className="text-xs text-ink-muted">Matching your current filter criteria</span>
              </div>
              <span className="text-lg font-mono font-bold text-data tabular">
                {eligibleQuestions.length} Questions
              </span>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full bg-data text-data-contrast font-semibold hover:bg-data/90"
            onClick={handleStartPractice}
            disabled={eligibleQuestions.length === 0}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Practice Session</span>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
