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
  clearAll: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  attempts: [],
  questionStats: {},
  isLoading: true,

  loadProgress: async () => {
    set({ isLoading: true });
    const [attempts, questionStats] = await Promise.all([
      defaultRepository.getAttempts(),
      defaultRepository.getQuestionStats(),
    ]);
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
    const currentStats = get().questionStats;
    const existing = currentStats[qid] || {
      qid,
      seen: 0,
      correct: 0,
      lastSeen: Date.now(),
      box: 1,
      bookmarked: false,
    };

    // Leitner box adjustment
    let newBox = existing.box;
    if (isCorrect) {
      newBox = Math.min(5, existing.box + 1) as 1 | 2 | 3 | 4 | 5;
    } else {
      newBox = 1; // Drop back to Box 1 on mistake
    }

    const updated: QuestionStatRecord = {
      ...existing,
      seen: existing.seen + 1,
      correct: existing.correct + (isCorrect ? 1 : 0),
      lastSeen: Date.now(),
      box: newBox,
    };

    await defaultRepository.saveQuestionStat(updated);
    set({
      questionStats: {
        ...currentStats,
        [qid]: updated,
      },
    });
  },

  clearAll: async () => {
    await defaultRepository.clearAll();
    set({ attempts: [], questionStats: {} });
  },
}));
