"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getWeekQuiz } from "@/lib/questions";
import { WeekQuiz } from "@/lib/schema/question";
import { useProgressStore } from "@/store/useProgressStore";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import manifestData from "@/data/manifest.json";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

function LearnContent() {
  const searchParams = useSearchParams();
  const initialWeek = parseInt(searchParams.get("week") || "1", 10);

  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [quizData, setQuizData] = useState<WeekQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number[]>>({});

  const { questionStats, recordAnswerStat, toggleBookmark } = useProgressStore();

  useEffect(() => {
    setLoading(true);
    getWeekQuiz(selectedWeek).then((data) => {
      setQuizData(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setLoading(false);
    });
  }, [selectedWeek]);

  if (loading || !quizData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Loading study material...</p>
        </div>
      </div>
    );
  }

  const currentRawQ = quizData.questions[currentIndex];
  const userSelected = selectedAnswers[currentRawQ.id] || [];

  // Adapt raw question to QuizQuestion structure for QuestionCard
  const adaptedQuestion = {
    ...currentRawQ,
    originalOptionIndices: currentRawQ.options.map((_, i) => i),
    userSelected,
    flagged: false,
    timeSpentMs: 0,
  };

  const handleSelect = (originalIndex: number) => {
    if (userSelected.length > 0) return; // already revealed in learn mode
    const newAnswers = { ...selectedAnswers, [currentRawQ.id]: [originalIndex] };
    setSelectedAnswers(newAnswers);

    const isCorrect = currentRawQ.answer.includes(originalIndex);
    recordAnswerStat(currentRawQ.id, isCorrect);
  };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === quizData.questions.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / quizData.questions.length) * 100);

  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8">
      {/* Header with week picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="data" size="sm">Learn Mode</Badge>
            <span className="text-xs text-ink-muted">Instant Feedback & Explanations</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-ink">
            {quizData.title}
          </h1>
        </div>

        {/* Week Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="week-select" className="text-xs font-mono text-ink-muted">Week:</label>
          <select
            id="week-select"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
            className="h-9 px-3 text-xs font-mono rounded-control bg-surface border border-border text-ink focus:ring-1 focus:ring-data"
          >
            {manifestData.weeks.map((w) => (
              <option key={w.week} value={w.week}>
                Week {w.week.toString().padStart(2, "0")} ({w.questionCount} Qs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
          <span>
            Question {(currentIndex + 1).toString().padStart(2, "0")} / {quizData.questions.length.toString().padStart(2, "0")}
          </span>
          <span>{progressPercent}% Complete</span>
        </div>
        <ProgressBar value={progressPercent} size="sm" />
      </div>

      {/* Question Card in Learn Mode (showFeedback = true) */}
      <div className="mb-6">
        <QuestionCard
          question={adaptedQuestion}
          currentIndex={currentIndex}
          totalQuestions={quizData.questions.length}
          onSelectOption={handleSelect}
          onToggleFlag={() => {}}
          showFeedback={true}
          isBookmarked={questionStats[currentRawQ.id]?.bookmarked}
          onToggleBookmark={() => toggleBookmark(currentRawQ.id)}
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-surface p-3.5 rounded-card border border-border">
        <Button
          variant="outline"
          size="md"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={isFirst}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-2">
          {isLast ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswers({});
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Week</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentIndex((prev) => Math.min(quizData.questions.length - 1, prev + 1))}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LearnContent />
    </Suspense>
  );
}
