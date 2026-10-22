"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RotateCcw, LayoutDashboard, AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client exceptions for observability
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 page-enter">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-status-wrong-bg border border-status-wrong/30 text-status-wrong flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-ink">
          Something interrupted your session
        </h1>

        <p className="text-xs text-ink-muted leading-relaxed">
          An unexpected interface error occurred. Your quiz progress and local answers are safely preserved in IndexedDB.
        </p>

        <div className="pt-2 flex items-center justify-center gap-2.5">
          <Button variant="primary" size="md" onClick={() => reset()}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>

          <Link href="/">
            <Button variant="outline" size="md">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
