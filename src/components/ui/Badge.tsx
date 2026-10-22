import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "data" | "correct" | "wrong" | "flag";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({
  variant = "neutral",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center font-mono font-medium rounded-badge uppercase tracking-wider select-none tabular";

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-xs",
  };

  const variantStyles = {
    neutral: "bg-raised text-ink-muted border border-border",
    data: "bg-data-subtle text-data border border-data/25",
    correct: "bg-status-correct-bg text-status-correct border border-status-correct/30",
    wrong: "bg-status-wrong-bg text-status-wrong border border-status-wrong/30",
    flag: "bg-status-flag-bg text-status-flag border border-status-flag/30",
  };

  return (
    <span
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
