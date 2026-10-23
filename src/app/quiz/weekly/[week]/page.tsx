"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWeekQuiz } from "@/lib/questions";
import { WeekQuiz } from "@/lib/schema/question";
import { useQuizStore } from "@/store/useQuizStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizNavigator } from "@/components/quiz/QuizNavigator";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AttemptRecord } from "@/lib/schema/progress";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";

export default function WeeklyQuizPage({
  params,
}: {
  params: { week: string };
}) {
  const weekNum = parseInt(params.week, 10);
  const router = useRouter();

  const [quizData, setQuizData] = useState<WeekQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetEndAt, setTargetEndAt] = useState<number | undefined>(undefined);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const { session, startSession, selectOption, toggleFlag, nextQuestion, prevQuestion, jumpToQuestion, finishSession } =
    useQuizStore();
  const { settings, loadSettings } = useSettingsStore();
  const { saveAttempt, recordAnswerStatsBatch, questionStats, toggleBookmark } = useProgressStore();

  useEffect(() => {
    loadSettings();
    getWeekQuiz(weekNum).then((data) => {
      setQuizData(data);
      setLoading(false);
      if (data) {
        // Auto-start weekly session with default timer (15 minutes)
        const durationMin = settings.defaultTimerMin || 15;
        const endAt = Date.now() + durationMin * 60 * 1000;
        setTargetEndAt(endAt);

        startSession(
          {
            type: "weekly",
            week: weekNum,
            questionCount: data.questions.length,
            shuffleQuestions: false,
            shuffleOptions: settings.shuffleOptions,
            seed: Date.now(),
            negativeMarking: settings.negativeMarking,
          },
          data.questions
        );
      }
    });
  }, [weekNum, loadSettings, settings.defaultTimerMin, settings.negativeMarking, settings.shuffleOptions, startSession]);

  useEffect(() => {
    if (!session) return;
    const isFirst = session.currentIndex === 0;
    const isLast = session.currentIndex === session.questions.length - 1;

    const handleKeyNav = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        showSubmitModal
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        if (!isLast) {
          e.preventDefault();
          nextQuestion();
        }
      } else if (e.key === "ArrowLeft") {
        if (!isFirst) {
          e.preventDefault();
          prevQuestion();
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        if (isLast) {
          e.preventDefault();
          setShowSubmitModal(true);
        } else {
          e.preventDefault();
          nextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [session, showSubmitModal, nextQuestion, prevQuestion]);

  if (loading || !quizData || !session) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Loading Assignment {weekNum}...</p>
        </div>
      </div>
    );
  }

  const currentQ = session.questions[session.currentIndex];
  const isFirst = session.currentIndex === 0;
  const isLast = session.currentIndex === session.questions.length - 1;

  const answeredCount = session.questions.filter((q) => q.userSelected.length > 0).length;
  const unansweredCount = session.questions.length - answeredCount;

  const handleExpire = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    const result = finishSession();
    if (!result) return;

    const attemptId = `attempt-w${weekNum}-${Date.now()}`;
    const answers = session.questions.map((q) => {
      const isCorrect =
        q.userSelected.length === q.answer.length &&
        q.userSelected.every((idx) => q.answer.includes(idx));

      return {
        qid: q.id,
        selected: q.userSelected,
        correct: isCorrect,
        timeMs: q.timeSpentMs,
        flagged: q.flagged,
      };
    });

    const attemptRecord: AttemptRecord = {
      id: attemptId,
      type: "weekly",
      week: weekNum,
      startedAt: session.startedAt,
      finishedAt: Date.now(),
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      totalTimeMs: result.totalTimeMs,
      answers,
    };

    // Atomically persist question stats and attempt record
    await Promise.all([
      saveAttempt(attemptRecord),
      recordAnswerStatsBatch(
        answers.map((a) => ({ qid: a.qid, isCorrect: a.correct }))
      ),
    ]);
    setShowSubmitModal(false);
    router.push(`/review/${attemptId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-ground">
      <QuizHeader
        title={quizData.title}
        currentIndex={session.currentIndex}
        totalQuestions={session.questions.length}
        targetEndAt={targetEndAt}
        onExpire={handleExpire}
        onToggleNavigator={() => setShowMobileNav(!showMobileNav)}
      />

      {/* Main Workspace */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col md:flex-row gap-6 page-enter">
        {/* Left: Active Question Card & Controls */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <QuestionCard
              question={currentQ}
              currentIndex={session.currentIndex}
              totalQuestions={session.questions.length}
              onSelectOption={(idx) => selectOption(currentQ.id, idx)}
              onToggleFlag={() => toggleFlag(currentQ.id)}
              isBookmarked={questionStats[currentQ.id]?.bookmarked}
              onToggleBookmark={() => toggleBookmark(currentQ.id)}
            />
          </div>

          {/* Bottom Action Rail */}
          <div className="mt-6 flex items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border">
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
              <Button
                variant={currentQ.flagged ? "secondary" : "outline"}
                size="md"
                onClick={() => toggleFlag(currentQ.id)}
                className="hidden sm:inline-flex"
              >
                <Flag className={`w-3.5 h-3.5 ${currentQ.flagged ? "fill-current text-status-flag" : ""}`} />
                <span>{currentQ.flagged ? "Flagged" : "Flag"}</span>
              </Button>

              {isLast ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-data text-data-contrast font-semibold hover:bg-data/90"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Quiz</span>
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

        {/* Right: Desktop Navigator */}
        <div className="hidden md:block w-72 shrink-0">
          <div className="sticky top-20">
            <QuizNavigator
              questions={session.questions}
              currentIndex={session.currentIndex}
              onSelectQuestion={jumpToQuestion}
            />

            <div className="mt-4 p-3 rounded-card bg-surface border border-border">
              <Button
                variant="primary"
                size="md"
                className="w-full bg-data text-data-contrast font-semibold hover:bg-data/90"
                onClick={() => setShowSubmitModal(true)}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Assignment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigator Modal */}
      <Modal
        isOpen={showMobileNav}
        onClose={() => setShowMobileNav(false)}
        title="Question Navigator"
      >
        <QuizNavigator
          questions={session.questions}
          currentIndex={session.currentIndex}
          onSelectQuestion={(idx) => {
            jumpToQuestion(idx);
            setShowMobileNav(false);
          }}
        />
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Assignment?"
        description="Are you sure you want to finish and view your score breakdown?"
      >
        <div className="space-y-4">
          {unansweredCount > 0 ? (
            <div className="p-3 rounded-control bg-status-flag-bg text-status-flag text-xs border border-status-flag/30 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                You still have <strong>{unansweredCount} unanswered questions</strong>. Submitting now will mark them as skipped.
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-control bg-status-correct-bg text-status-correct text-xs border border-status-correct/30">
              All {session.questions.length} questions answered! You are ready to submit.
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowSubmitModal(false)}>
              Keep Reviewing
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitQuiz}
              className="bg-data text-data-contrast font-semibold hover:bg-data/90"
            >
              Submit Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
