"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllQuestions } from "@/lib/questions";
import { Question } from "@/lib/schema/question";
import { useQuizStore } from "@/store/useQuizStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizNavigator } from "@/components/quiz/QuizNavigator";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { AttemptRecord } from "@/lib/schema/progress";
import {
  Play,
  Clock,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  AlertTriangle,
  Award,
} from "lucide-react";

export default function OverallExamPage() {
  const router = useRouter();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  // Exam configuration options
  const [questionCount, setQuestionCount] = useState(50);
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [samplingStrategy, setSamplingStrategy] = useState<"even" | "proportional" | "weak-weighted">("even");
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);

  const [targetEndAt, setTargetEndAt] = useState<number | undefined>(undefined);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const { session, startSession, selectOption, toggleFlag, nextQuestion, prevQuestion, jumpToQuestion, finishSession } =
    useQuizStore();
  const { settings, loadSettings } = useSettingsStore();
  const { saveAttempt, recordAnswerStat, questionStats, toggleBookmark } = useProgressStore();

  useEffect(() => {
    loadSettings();
    getAllQuestions().then((qs) => {
      setAllQuestions(qs);
      setLoading(false);
    });
  }, [loadSettings]);

  useEffect(() => {
    if (!session || !isStarted) return;
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
  }, [session, isStarted, showSubmitModal, nextQuestion, prevQuestion]);

  const handleStartExam = () => {
    const endAt = timerMinutes > 0 ? Date.now() + timerMinutes * 60 * 1000 : undefined;
    setTargetEndAt(endAt);

    startSession(
      {
        type: "overall",
        questionCount: Math.min(questionCount, allQuestions.length),
        shuffleQuestions: true,
        shuffleOptions,
        seed: Date.now(),
        negativeMarking,
        samplingStrategy,
      },
      allQuestions
    );
    setIsStarted(true);
  };

  const handleSubmitExam = async () => {
    const result = finishSession();
    if (!result || !session) return;

    const attemptId = `attempt-overall-${Date.now()}`;
    const attemptRecord: AttemptRecord = {
      id: attemptId,
      type: "overall",
      startedAt: session.startedAt,
      finishedAt: Date.now(),
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      totalTimeMs: result.totalTimeMs,
      answers: session.questions.map((q) => {
        const isCorrect =
          q.userSelected.length === q.answer.length &&
          q.userSelected.every((idx) => q.answer.includes(idx));

        recordAnswerStat(q.id, isCorrect);

        return {
          qid: q.id,
          selected: q.userSelected,
          correct: isCorrect,
          timeMs: q.timeSpentMs,
          flagged: q.flagged,
        };
      }),
    };

    await saveAttempt(attemptRecord);
    setShowSubmitModal(false);
    router.push(`/review/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Loading question bank...</p>
        </div>
      </div>
    );
  }

  // Pre-Exam Setup Screen
  if (!isStarted || !session) {
    return (
      <main className="max-w-2xl mx-auto w-full px-4 py-10 page-enter">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control bg-raised border border-border text-[11px] font-mono text-ink-muted mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-data animate-pulse" />
            <span>NPTEL Certification Mock</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink font-sans">
            Final Exam Simulator
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1 max-w-md mx-auto">
            Simulate the complete NPTEL certification exam conditions with questions drawn from across all 12 course weeks.
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-ink">Exam Parameters</h2>
            <p className="text-xs text-ink-muted">Configure your mock exam format.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Question Count */}
            <div>
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block mb-2">
                Question Count
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 50, 100].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`btn-press py-2 rounded-control border text-xs font-mono tabular font-semibold transition-colors ${
                      questionCount === count
                        ? "bg-data text-data-contrast font-semibold border-transparent"
                        : "bg-surface border-border text-ink hover:bg-raised"
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Time Duration */}
            <div>
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block mb-2">
                Time Limit
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "30 Mins", val: 30 },
                  { label: "60 Mins", val: 60 },
                  { label: "Untimed", val: 0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setTimerMinutes(item.val)}
                    className={`btn-press py-2 rounded-control border text-xs font-mono tabular font-semibold transition-colors ${
                      timerMinutes === item.val
                        ? "bg-data text-data-contrast font-semibold border-transparent"
                        : "bg-surface border-border text-ink hover:bg-raised"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sampling Strategy */}
            <div>
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block mb-2">
                Sampling Strategy
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSamplingStrategy("even")}
                  className={`btn-press p-2.5 rounded-control border text-left text-xs transition-colors ${
                    samplingStrategy === "even"
                      ? "bg-data-subtle text-data border-data/30 font-medium"
                      : "bg-surface border-border text-ink-muted hover:bg-raised"
                  }`}
                >
                  <div className="font-semibold text-ink">Even Balance</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">Equal representation from all 12 weeks</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSamplingStrategy("weak-weighted")}
                  className={`btn-press p-2.5 rounded-control border text-left text-xs transition-colors ${
                    samplingStrategy === "weak-weighted"
                      ? "bg-data-subtle text-data border-data/30 font-medium"
                      : "bg-surface border-border text-ink-muted hover:bg-raised"
                  }`}
                >
                  <div className="font-semibold text-ink">Focus Weak Areas</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">Weighted toward your lower scoring weeks</div>
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-rule space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-ink block">Negative Marking (-0.25)</span>
                  <span className="text-[11px] text-ink-muted block">Real exam penalty for incorrect guesses</span>
                </div>
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="w-4 h-4 rounded text-data"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-ink block">Shuffle Options</span>
                  <span className="text-[11px] text-ink-muted block">Randomize option order A, B, C, D</span>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 rounded text-data"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4 bg-data text-data-contrast font-semibold hover:bg-data/90"
              onClick={handleStartExam}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Final Exam Simulation</span>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Active Exam Runner
  const currentQ = session.questions[session.currentIndex];
  const isFirst = session.currentIndex === 0;
  const isLast = session.currentIndex === session.questions.length - 1;
  const answeredCount = session.questions.filter((q) => q.userSelected.length > 0).length;
  const unansweredCount = session.questions.length - answeredCount;

  return (
    <div className="flex-1 flex flex-col bg-ground">
      <QuizHeader
        title="Final Exam Simulation"
        currentIndex={session.currentIndex}
        totalQuestions={session.questions.length}
        targetEndAt={targetEndAt}
        onExpire={handleSubmitExam}
        onToggleNavigator={() => setShowMobileNav(!showMobileNav)}
      />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col md:flex-row gap-6 page-enter">
        <div className="flex-1 flex flex-col justify-between">
          <QuestionCard
            question={currentQ}
            currentIndex={session.currentIndex}
            totalQuestions={session.questions.length}
            onSelectOption={(idx) => selectOption(currentQ.id, idx)}
            onToggleFlag={() => toggleFlag(currentQ.id)}
            isBookmarked={questionStats[currentQ.id]?.bookmarked}
            onToggleBookmark={() => toggleBookmark(currentQ.id)}
          />

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
                  <span>Submit Exam</span>
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
                <span>Submit Exam</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showMobileNav}
        onClose={() => setShowMobileNav(false)}
        title="Exam Navigator"
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

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Final Exam?"
        description="Are you sure you want to finish and generate your score report?"
      >
        <div className="space-y-4">
          {unansweredCount > 0 && (
            <div className="p-3 rounded-control bg-status-flag-bg text-status-flag text-xs border border-status-flag/30 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                You have <strong>{unansweredCount} unanswered questions</strong>.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowSubmitModal(false)}>
              Keep Reviewing
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitExam}
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
