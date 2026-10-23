import { create } from "zustand";
import { AttemptRecord, QuestionStatRecord } from "../lib/schema/progress";
import { defaultRepository } from "../lib/storage/repository";

interface ProgressState {
  attempts: AttemptRecord[];
  questionStats: Record<string, QuestionStatRecord>;
  isLoading: boolean;
  loadProgress: () => Promise<void>;
  saveAttempt: (attempt: AttemptRecord) => Promise<void>;
  toggleBookmark: (qid: string) => Promise<void>;
  recordAnswerStat: (qid: string, isCorrect: boolean) => Promise<void>;
  recordAnswerStatsBatch: (results: Array<{ qid: string; isCorrect: boolean }>) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  attempts: [],
  questionStats: {},
  isLoading: true,

  loadProgress: async () => {
    set({ isLoading: true });
    const [attempts, rawStats] = await Promise.all([
      defaultRepository.getAttempts(),
      defaultRepository.getQuestionStats(),
    ]);

    const questionStats = { ...rawStats };
    const missingToBackfill: QuestionStatRecord[] = [];

    // Backfill any question records present in attempts but missing from stats
    for (const attempt of attempts) {
      if (attempt.answers) {
        for (const ans of attempt.answers) {
          if (ans.qid && (!questionStats[ans.qid] || questionStats[ans.qid].seen === 0)) {
            const backfilled: QuestionStatRecord = {
              qid: ans.qid,
              seen: 1,
              correct: ans.correct ? 1 : 0,
              lastSeen: attempt.finishedAt || Date.now(),
              box: ans.correct ? 2 : 1,
              bookmarked: questionStats[ans.qid]?.bookmarked || false,
            };
            questionStats[ans.qid] = backfilled;
            missingToBackfill.push(backfilled);
          }
        }
      }
    }

    if (missingToBackfill.length > 0) {
      defaultRepository.saveQuestionStatsBatch(missingToBackfill).catch((e) => {
        console.warn("Backfill stats failed:", e);
      });
    }

    set({ attempts, questionStats, isLoading: false });
  },

  saveAttempt: async (attempt) => {
    await defaultRepository.saveAttempt(attempt);
    const attempts = await defaultRepository.getAttempts();
    set({ attempts });
  },

  toggleBookmark: async (qid) => {
    const currentStats = get().questionStats;
    const existing = currentStats[qid] || {
      qid,
      seen: 0,
      correct: 0,
      lastSeen: Date.now(),
      box: 1,
      bookmarked: false,
    };

    const updated: QuestionStatRecord = {
      ...existing,
      bookmarked: !existing.bookmarked,
    };

    await defaultRepository.saveQuestionStat(updated);
    set({
      questionStats: {
        ...currentStats,
        [qid]: updated,
      },
    });
  },

  recordAnswerStat: async (qid, isCorrect) => {
    await get().recordAnswerStatsBatch([{ qid, isCorrect }]);
  },

  recordAnswerStatsBatch: async (results) => {
    if (results.length === 0) return;
    const currentStats = { ...get().questionStats };
    const updatedBatch: QuestionStatRecord[] = [];

    for (const { qid, isCorrect } of results) {
      const existing = currentStats[qid] || {
        qid,
        seen: 0,
        correct: 0,
        lastSeen: Date.now(),
        box: 1,
        bookmarked: false,
      };

      let newBox = existing.box;
      if (isCorrect) {
        newBox = Math.min(5, existing.box + 1) as 1 | 2 | 3 | 4 | 5;
      } else {
        newBox = 1;
      }

      const updated: QuestionStatRecord = {
        ...existing,
        seen: existing.seen + 1,
        correct: existing.correct + (isCorrect ? 1 : 0),
        lastSeen: Date.now(),
        box: newBox,
      };

      currentStats[qid] = updated;
      updatedBatch.push(updated);
    }

    await defaultRepository.saveQuestionStatsBatch(updatedBatch);
    set({ questionStats: currentStats });
  },

  clearAll: async () => {
    await defaultRepository.clearAll();
    set({ attempts: [], questionStats: {} });
  },
}));
