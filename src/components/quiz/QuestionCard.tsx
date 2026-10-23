"use client";

import React, { useEffect } from "react";
import { QuizQuestion } from "@/lib/engine/quiz";
import { Badge } from "@/components/ui/Badge";
import { Flag, CheckCircle2, XCircle, Lightbulb, Bookmark } from "lucide-react";

export interface QuestionCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  onSelectOption: (originalIndex: number) => void;
  onToggleFlag: () => void;
  showFeedback?: boolean; // If true, reveals correct vs wrong (Learn & Review modes)
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onSelectOption,
  onToggleFlag,
  showFeedback = false,
  isBookmarked = false,
  onToggleBookmark,
}: QuestionCardProps) {
  // Keyboard listener for 1-4 and F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        onToggleFlag();
      } else if (e.key === "b" || e.key === "B") {
        if (onToggleBookmark) {
          e.preventDefault();
          onToggleBookmark();
        }
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const visualIdx = parseInt(e.key, 10) - 1;
        if (visualIdx < question.options.length) {
          e.preventDefault();
          const originalIdx = question.originalOptionIndices[visualIdx];
          onSelectOption(originalIdx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question, onSelectOption, onToggleFlag, onToggleBookmark]);

  const hasAnswered = question.userSelected.length > 0;
  const isCorrect =
    showFeedback &&
    hasAnswered &&
    question.userSelected.length === question.answer.length &&
    question.userSelected.every((idx) => question.answer.includes(idx));

  return (
    <div className="w-full bg-surface rounded-card border border-border p-5 md:p-7 shadow-sm">
      {/* Screen Reader Live Status */}
      <span className="sr-only" role="status" aria-live="polite">
        Question {currentIndex + 1} of {totalQuestions}: {question.question}.
        {hasAnswered
          ? ` Selected option: ${question.options[question.originalOptionIndices.indexOf(question.userSelected[0])]}.`
          : " No option selected."}
        {question.flagged ? " Question is flagged for review." : ""}
      </span>
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-rule pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-ink-muted">
            QUESTION {(currentIndex + 1).toString().padStart(2, "0")} OF{" "}
            {totalQuestions.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-ink-muted font-mono">· 1 Point</span>
          {question.topic && (
            <Badge variant="neutral" size="sm">
              {question.topic}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`btn-press p-1.5 rounded-control text-xs flex items-center gap-1 border transition-colors ${
                isBookmarked
                  ? "bg-data-subtle text-data border-data/30"
                  : "bg-surface text-ink-muted border-border hover:text-ink"
              }`}
              title="Bookmark question"
              aria-label="Bookmark question"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          )}

          <button
            onClick={onToggleFlag}
            className={`btn-press px-2.5 py-1 rounded-control text-xs flex items-center gap-1.5 border transition-colors ${
              question.flagged
                ? "bg-status-flag-bg text-status-flag border-status-flag/40 font-medium"
                : "bg-surface text-ink-muted border-border hover:text-ink"
            }`}
            title="Flag question for review (Key: F)"
            aria-label="Flag question for review"
          >
            <Flag className={`w-3.5 h-3.5 ${question.flagged ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">Flag</span>
            <kbd className="hidden sm:inline font-mono text-[10px] opacity-60">F</kbd>
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mb-6">
        <h2 className="text-base md:text-lg font-medium text-ink leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Options List */}
      <div className="space-y-2.5" role="radiogroup" aria-label="Question options">
        {question.options.map((optionText, visualIdx) => {
          const originalIdx = question.originalOptionIndices[visualIdx];
          const isSelected = question.userSelected.includes(originalIdx);
          const isAcceptedCorrect = question.answer.includes(originalIdx);

          let optionStyle =
            "border-border bg-surface hover:border-ink-muted/60 text-ink";
          let keyBadgeStyle = "bg-raised text-ink-muted border-border";

          if (showFeedback && hasAnswered) {
            if (isAcceptedCorrect) {
              optionStyle =
                "border-status-correct bg-status-correct-bg text-ink ring-1 ring-status-correct/30 shadow-xs";
              keyBadgeStyle =
                "bg-status-correct text-status-correct-contrast font-semibold border-transparent";
            } else if (isSelected && !isAcceptedCorrect) {
              optionStyle =
                "border-status-wrong bg-status-wrong-bg text-ink ring-1 ring-status-wrong/30 shadow-xs";
              keyBadgeStyle =
                "bg-status-wrong text-status-wrong-contrast font-semibold border-transparent";
            } else {
              optionStyle = "border-border/60 bg-surface/50 text-ink-muted opacity-60";
              keyBadgeStyle = "bg-raised/60 text-ink-muted/60 border-border/40";
            }
          } else if (isSelected) {
            optionStyle = "border-data bg-data-subtle text-ink shadow-sm";
            keyBadgeStyle = "bg-data text-data-contrast font-semibold border-transparent";
          }

          return (
            <div
              key={visualIdx}
              onClick={() => onSelectOption(originalIdx)}
              className={`btn-press group w-full flex items-center justify-between p-3.5 md:p-4 rounded-card border cursor-pointer select-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-data ${optionStyle}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectOption(originalIdx);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-badge border text-[11px] font-mono font-semibold flex items-center justify-center shrink-0 transition-colors ${keyBadgeStyle}`}
                >
                  {visualIdx + 1}
                </span>
                <span className="text-sm md:text-base leading-normal">
                  {optionText}
                </span>
              </div>

              {/* Status Indicator Icon */}
              {showFeedback && hasAnswered ? (
                isAcceptedCorrect ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-status-correct shrink-0">
                    <span className="hidden sm:inline text-[11px] font-mono tracking-wide uppercase">Correct</span>
                    <CheckCircle2 className="w-4 h-4 text-status-correct shrink-0" />
                  </div>
                ) : isSelected ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-status-wrong shrink-0">
                    <span className="hidden sm:inline text-[11px] font-mono tracking-wide uppercase">Your Choice</span>
                    <XCircle className="w-4 h-4 text-status-wrong shrink-0" />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border/40 opacity-40 shrink-0" />
                )
              ) : (
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all shrink-0 ${
                    isSelected
                      ? "border-data bg-data ring-2 ring-data/20"
                      : "border-border group-hover:border-ink-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Immediate Learn & Practice Mode Feedback Accordion */}
      {showFeedback && hasAnswered && (
        <div
          className={`mt-6 p-4 md:p-5 rounded-card border text-sm animate-in fade-in slide-in-from-top-1 duration-150 ${
            isCorrect
              ? "bg-status-correct-bg/60 border-status-correct/30 text-ink"
              : "bg-status-wrong-bg/60 border-status-wrong/30 text-ink"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-xs tracking-tight mb-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCorrect ? "bg-status-correct" : "bg-status-wrong"
              }`}
            />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {isCorrect ? "Correct Solution" : "Incorrect Selection"}
            </span>
          </div>
          <p className="text-xs md:text-sm text-ink-secondary leading-relaxed mt-1 font-sans">
            {question.explanation ||
              `Accepted answer: ${question.options[question.originalOptionIndices.indexOf(question.answer[0])] || "Option " + (question.answer[0] + 1)}`}
          </p>
        </div>
      )}
    </div>
  );
}
