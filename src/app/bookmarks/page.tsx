"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllQuestions } from "@/lib/questions";
import { Question } from "@/lib/schema/question";
import { useProgressStore } from "@/store/useProgressStore";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bookmark, Compass, Trash2, CheckCircle2 } from "lucide-react";

export default function BookmarksPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | "all">("all");

  const { questionStats, toggleBookmark, loadProgress } = useProgressStore();

  useEffect(() => {
    loadProgress();
    getAllQuestions().then((qs) => {
      setAllQuestions(qs);
      setLoading(false);
    });
  }, [loadProgress]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-data border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Loading saved bookmarks...</p>
        </div>
      </div>
    );
  }

  // Filter bookmarked questions
  const bookmarkedQuestions = allQuestions.filter(
    (q) => questionStats[q.id]?.bookmarked
  );

  const filtered = bookmarkedQuestions.filter((q) => {
    if (selectedWeekFilter === "all") return true;
    const match = q.id.match(/^w(\d{2})-/);
    return match ? parseInt(match[1], 10) === selectedWeekFilter : true;
  });

  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="data" size="sm">Saved Questions</Badge>
            <span className="text-xs font-mono text-ink-muted">
              {bookmarkedQuestions.length} Questions Saved
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Bookmarks</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Review questions you flagged for extra study and practice.
          </p>
        </div>

        {bookmarkedQuestions.length > 0 && (
          <Link href="/practice?mode=bookmarks">
            <Button variant="primary" size="md">
              <Compass className="w-3.5 h-3.5" />
              <span>Practice Bookmarks</span>
            </Button>
          </Link>
        )}
      </div>

      {bookmarkedQuestions.length === 0 ? (
        <Card className="text-center py-16 px-4">
          <div className="w-12 h-12 rounded-full bg-raised text-ink-muted flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-ink">No bookmarks yet</h2>
          <p className="text-xs text-ink-muted max-w-sm mx-auto mt-1 mb-6">
            While taking quizzes or studying in Learn mode, click the bookmark icon on any question to save it here for targeted revision.
          </p>
          <Link href="/learn">
            <Button variant="outline" size="sm">Explore Learn Mode</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((q, idx) => (
            <Card key={q.id} className="p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-rule">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-data">{q.id}</span>
                  {q.topic && <Badge variant="neutral" size="sm">{q.topic}</Badge>}
                </div>
                <button
                  onClick={() => toggleBookmark(q.id)}
                  className="btn-press p-1 text-xs text-ink-muted hover:text-status-wrong transition-colors"
                  title="Remove bookmark"
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-sm font-medium text-ink mb-3">{q.question}</h3>

              <div className="space-y-1.5">
                {q.options.map((opt, optIdx) => {
                  const isAnswer = q.answer.includes(optIdx);
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center justify-between p-2.5 rounded-control text-xs ${
                        isAnswer
                          ? "bg-status-correct-bg border border-status-correct/30 text-ink font-medium"
                          : "bg-surface border border-border text-ink-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] w-4">{optIdx + 1}.</span>
                        <span>{opt}</span>
                      </div>
                      {isAnswer && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-correct shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
