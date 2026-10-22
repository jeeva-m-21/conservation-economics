import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-[transform,background-color,border-color] duration-100 ease-emil active:scale-[0.97] touch-manipulation select-none disabled:opacity-50 disabled:pointer-events-none rounded-control";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
    };

    const variantStyles = {
      // Primary: near-black ink in light mode / white ink in dark mode (Achromatic Ledger rule)
      primary:
        "bg-ink text-surface hover:opacity-90 border border-transparent shadow-sm",
      secondary:
        "bg-raised text-ink hover:bg-border/60 border border-border",
      outline:
        "bg-surface text-ink hover:bg-raised border border-border",
      ghost:
        "bg-transparent text-ink-muted hover:text-ink hover:bg-raised",
      danger:
        "bg-status-wrong-bg text-status-wrong border border-status-wrong/30 hover:bg-status-wrong hover:text-white",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
