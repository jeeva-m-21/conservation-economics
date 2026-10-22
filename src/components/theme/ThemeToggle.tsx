"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-control bg-surface border border-border" />;
  }

  const cycleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  return (
    <button
      onClick={cycleTheme}
      className="btn-press flex items-center justify-center w-8 h-8 rounded-control bg-surface border border-border hover:border-ink-muted text-ink transition-colors"
      title={`Current theme: ${theme}. Click to switch.`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="w-4 h-4 text-data" />
      ) : theme === "light" ? (
        <Sun className="w-4 h-4 text-status-flag" />
      ) : (
        <Monitor className="w-4 h-4 text-ink-muted" />
      )}
    </button>
  );
}
