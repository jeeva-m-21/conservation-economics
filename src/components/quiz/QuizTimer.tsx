"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export interface QuizTimerProps {
  targetEndAt: number; // timestamp in ms
  onExpire?: () => void;
  className?: string;
}

export function QuizTimer({ targetEndAt, onExpire, className = "" }: QuizTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.floor((targetEndAt - Date.now()) / 1000));
  });

  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, Math.floor((targetEndAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        if (onExpire) onExpire();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetEndAt, onExpire]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // Urgency states: under 2 minutes is urgent (amber/red)
  const isUrgent = secondsRemaining > 0 && secondsRemaining <= 120;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control font-mono text-xs font-semibold select-none border transition-colors tabular ${
        isUrgent
          ? "bg-status-flag-bg text-status-flag border-status-flag/40 animate-pulse"
          : "bg-surface text-ink border-border"
      } ${className}`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{formatted}</span>
    </div>
  );
}
