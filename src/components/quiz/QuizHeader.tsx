"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QuizTimer } from "./QuizTimer";
import { ChevronLeft, Grid, AlertCircle } from "lucide-react";

export interface QuizHeaderProps {
  title: string;
  currentIndex: number;
  totalQuestions: number;
  targetEndAt?: number;
  onExpire?: () => void;
  onToggleNavigator?: () => void;
}

export function QuizHeader({
  title,
  currentIndex,
  totalQuestions,
  targetEndAt,
  onExpire,
  onToggleNavigator,
}: QuizHeaderProps) {
  const router = useRouter();
  const [exitModalOpen, setExitModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border bg-ground/90 backdrop-blur-md px-4 h-14 flex items-center justify-between gap-3">
        {/* Left: Exit button & Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExitModalOpen(true)}
            className="text-ink-muted hover:text-ink -ml-2"
            aria-label="Exit quiz"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </Button>

          <div className="flex flex-col">
            <h1 className="text-xs sm:text-sm font-semibold text-ink line-clamp-1">{title}</h1>
            <span className="text-[10px] font-mono text-ink-muted">
              Q {(currentIndex + 1).toString().padStart(2, "0")} / {totalQuestions.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Right: Timer and Navigator Toggle */}
        <div className="flex items-center gap-2">
          {targetEndAt && <QuizTimer targetEndAt={targetEndAt} onExpire={onExpire} />}

          {onToggleNavigator && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleNavigator}
              className="md:hidden"
              aria-label="Toggle Navigator"
            >
              <Grid className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        title="Leave Quiz Session?"
        description="Your answers up to this point will be discarded if you leave without submitting."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-control bg-raised text-xs text-ink-muted border border-border">
            <AlertCircle className="w-4 h-4 text-data shrink-0 mt-0.5" />
            <span>
              You can return to the dashboard and restart or continue practicing anytime.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setExitModalOpen(false)}>
              Resume Quiz
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setExitModalOpen(false);
                router.push("/");
              }}
            >
              Exit to Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
