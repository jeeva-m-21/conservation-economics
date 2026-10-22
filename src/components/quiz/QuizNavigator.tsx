"use client";

import React from "react";
import { QuizQuestion } from "@/lib/engine/quiz";
import { Flag, Check, HelpCircle } from "lucide-react";

export interface QuizNavigatorProps {
  questions: QuizQuestion[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
  className?: string;
}

export function QuizNavigator({
  questions,
  currentIndex,
  onSelectQuestion,
  className = "",
}: QuizNavigatorProps) {
  const answeredCount = questions.filter((q) => q.userSelected.length > 0).length;
  const flaggedCount = questions.filter((q) => q.flagged).length;

  return (
    <div className={`bg-surface rounded-card border border-border p-4 ${className}`}>
      {/* Header with summary stats */}
      <div className="border-b border-rule pb-3 mb-3">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
          Navigator
        </h3>
        <div className="flex items-center gap-3 text-xs text-ink-muted mt-1 font-mono tabular">
          <span>
            {answeredCount} / {questions.length} answered
          </span>
          {flaggedCount > 0 && (
            <span className="text-status-flag flex items-center gap-1">
              <Flag className="w-3 h-3 fill-current" />
              {flaggedCount} flagged
            </span>
          )}
        </div>
      </div>

      {/* Grid of number chips */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = q.userSelected.length > 0;
          const isFlagged = q.flagged;

          let chipStyle =
            "border-border bg-ground text-ink-muted hover:border-ink-muted hover:text-ink";

          if (isCurrent) {
            chipStyle = "border-data bg-data-subtle text-data font-bold ring-2 ring-data/30";
          } else if (isAnswered) {
            chipStyle = "border-ink-muted/40 bg-raised text-ink font-medium";
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`btn-press relative flex items-center justify-center h-9 rounded-control border text-xs font-mono transition-colors tabular ${chipStyle}`}
              aria-label={`Jump to question ${idx + 1}`}
              aria-current={isCurrent ? "true" : undefined}
            >
              <span>{(idx + 1).toString().padStart(2, "0")}</span>

              {/* Status indicators */}
              {isFlagged && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-status-flag" />
              )}
              {isAnswered && !isCurrent && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-data" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-rule pt-3 mt-4 flex items-center justify-between text-[11px] text-ink-muted font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-data" /> Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-flag" /> Flagged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-control border border-border" /> Unanswered
        </span>
      </div>
    </div>
  );
}
