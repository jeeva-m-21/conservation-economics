"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getAllQuestions } from "@/lib/questions";
import { Question } from "@/lib/schema/question";
import { useProgressStore } from "@/store/useProgressStore";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Repeat,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function RevisionPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedBoxFilter, setSelectedBoxFilter] = useState<number | "all">("all");

  const { questionStats, recordAnswerStat, loadProgress } = useProgressStore();

  useEffect(() => {
    loadProgress();
    getAllQuestions().then((qs) => {
      setAllQuestions(qs);
      setLoading(false);
    });
  }, [loadProgress]);

  // Compute count of questions in each Leitner box (1 to 5)
  const boxCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let unclassifiedCount = 0;

  for (const q of allQuestions) {
    const stat = questionStats[q.id];
    if (stat && stat.seen > 0) {
      boxCounts[stat.box] = (boxCounts[stat.box] || 0) + 1;
    } else {
      unclassifiedCount++;
    }
  }

  // Build revision queue based on box filter
  useEffect(() => {
    if (allQuestions.length === 0) return;

    let queue: Question[] = [];
    if (selectedBoxFilter === "all") {
      // Prioritize Box 1, then Box 2, then unseen
      queue = [...allQuestions].sort((a, b) => {
        const boxA = questionStats[a.id]?.box || 0;
        const boxB = questionStats[b.id]?.box || 0;
        return boxA - boxB;
      });
    } else {
      queue = allQuestions.filter((q) => {
        const stat = questionStats[q.id];
        return stat && stat.box === selectedBoxFilter;
      });
    }

    setActiveDeck(queue);
    setCurrentIndex(0);
    setIsRevealed(false);
  }, [allQuestions, questionStats, selectedBoxFilter]);

  const currentQ = activeDeck[currentIndex];
  const currentStat = currentQ ? questionStats[currentQ.id] : null;
  const currentBox = currentStat ? currentStat.box : 1;

  const handleAdvance = useCallback(
    (mastered: boolean) => {
      if (!currentQ) return;
      recordAnswerStat(currentQ.id, mastered);
      setIsRevealed(false);
      if (currentIndex < activeDeck.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Completed current deck session
        setCurrentIndex(0);
      }
    },
    [currentQ, currentIndex, activeDeck.length, recordAnswerStat]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!isRevealed) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setIsRevealed(true);
        }
      } else {
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleAdvance(false);
        } else if (e.key === "2" || e.key === "ArrowRight") {
          e.preventDefault();
          handleAdvance(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRevealed, handleAdvance]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Building Leitner revision deck...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="data" size="sm">Leitner System</Badge>
          <span className="text-xs text-ink-muted">5-Box Spaced Repetition</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Spaced Revision</h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Reinforce course questions before they slip from memory. Questions you miss return to Box 1.
        </p>
      </div>

      {/* 5-Box Leitner Dashboard Visualizer */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8">
        {[
          { box: 1, label: "Box 1", interval: "Daily Review", count: boxCounts[1] },
          { box: 2, label: "Box 2", interval: "Every 3 Days", count: boxCounts[2] },
          { box: 3, label: "Box 3", interval: "Weekly", count: boxCounts[3] },
          { box: 4, label: "Box 4", interval: "Bi-Weekly", count: boxCounts[4] },
          { box: 5, label: "Box 5", interval: "Mastered", count: boxCounts[5] },
        ].map((item) => (
          <button
            key={item.box}
            onClick={() => setSelectedBoxFilter(item.box)}
            className={`btn-press p-3 rounded-card border text-left transition-colors ${
              selectedBoxFilter === item.box
                ? "bg-data-subtle text-data border-data/30 font-semibold"
                : "bg-surface border-border text-ink hover:bg-raised"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase">{item.label}</span>
              <span className="text-sm font-mono font-bold tabular">{item.count}</span>
            </div>
            <div className="text-[10px] text-ink-muted mt-1">{item.interval}</div>
          </button>
        ))}
      </div>

      {activeDeck.length === 0 ? (
        <Card className="text-center py-12 px-4">
          <p className="text-xs text-ink-muted mb-4">No cards in this box category yet.</p>
          <Button variant="outline" size="sm" onClick={() => setSelectedBoxFilter("all")}>
            View Full Deck (All Cards)
          </Button>
        </Card>
      ) : (
        currentQ && (
          <div className="space-y-6">
            {/* Active Card Progress */}
            <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
              <span>Card {(currentIndex + 1).toString().padStart(2, "0")} of {activeDeck.length.toString().padStart(2, "0")}</span>
              <div className="flex items-center gap-2">
                <Badge variant="data" size="sm">Current: Box {currentBox}</Badge>
                {currentQ.topic && <Badge variant="neutral" size="sm">{currentQ.topic}</Badge>}
              </div>
            </div>

            {/* Flashcard Frame */}
            <Card className="p-6 md:p-8 min-h-[280px] flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-mono font-semibold text-data block mb-2">{currentQ.id}</span>
                <h2 className="text-base md:text-lg font-medium text-ink leading-relaxed mb-6">
                  {currentQ.question}
                </h2>

                {/* Answer Reveal Area */}
                {isRevealed ? (
                  <div className="p-4 rounded-card bg-status-correct-bg border border-status-correct/30 space-y-3 animate-in fade-in duration-200">
                    <div className="text-xs font-semibold text-status-correct flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct Accepted Answer</span>
                    </div>
                    <div className="text-sm md:text-base font-semibold text-ink">
                      {currentQ.options[currentQ.answer[0]]}
                    </div>
                    {currentQ.explanation && (
                      <p className="text-xs text-ink-secondary border-t border-status-correct/20 pt-2">
                        {currentQ.explanation}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs opacity-75">
                    {currentQ.options.map((opt, i) => (
                      <div key={i} className="p-2.5 rounded-control bg-raised border border-border text-ink-muted font-mono">
                        {i + 1}. {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Action Controls */}
              <div className="pt-6 border-t border-rule mt-6 flex items-center justify-between gap-3">
                {!isRevealed ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full bg-data text-white hover:bg-data/90"
                    onClick={() => setIsRevealed(true)}
                  >
                    <span>Reveal Answer</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="w-full grid grid-cols-2 gap-3">
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => handleAdvance(false)}
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Need Practice (Box 1)</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleAdvance(true)}
                      className="w-full bg-status-correct text-white hover:bg-status-correct/90"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mastered (Box +1)</span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )
      )}
    </main>
  );
}
