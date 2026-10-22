import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const heightClass = size === "sm" ? "h-1" : "h-2";

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full bg-raised rounded-full overflow-hidden ${heightClass} ${className}`}
    >
      <div
        className="h-full bg-data transition-all duration-300 ease-emil rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
