import {
  AttemptRecord,
  QuestionStatRecord,
  Settings,
  SettingsSchema,
} from "../schema/progress";
import { get, set, del, createStore } from "idb-keyval";

export type { AttemptRecord, QuestionStatRecord, Settings };

export interface ProgressRepository {
  saveAttempt(attempt: AttemptRecord): Promise<void>;
  getAttempts(): Promise<AttemptRecord[]>;
  getAttemptById(id: string): Promise<AttemptRecord | null>;
  saveQuestionStat(stat: QuestionStatRecord): Promise<void>;
  saveQuestionStatsBatch(stats: QuestionStatRecord[]): Promise<void>;
  getQuestionStats(): Promise<Record<string, QuestionStatRecord>>;
  saveSettings(settings: Settings): Promise<void>;
  getSettings(): Promise<Settings>;
  clearAll(): Promise<void>;
}

/**
 * In-memory repository (ideal for tests and fallback mode).
 */
export function createMemoryRepository(): ProgressRepository {
  const attempts: AttemptRecord[] = [];
  const questionStats: Record<string, QuestionStatRecord> = {};
  let settings: Settings = SettingsSchema.parse({});

  return {
    async saveAttempt(attempt: AttemptRecord) {
      const idx = attempts.findIndex((a) => a.id === attempt.id);
      if (idx >= 0) {
        attempts[idx] = attempt;
      } else {
        attempts.unshift(attempt);
      }
    },
    async getAttempts() {
      return [...attempts];
    },
    async getAttemptById(id: string) {
      return attempts.find((a) => a.id === id) || null;
    },
    async saveQuestionStat(stat: QuestionStatRecord) {
      questionStats[stat.qid] = stat;
    },
    async saveQuestionStatsBatch(stats: QuestionStatRecord[]) {
      for (const stat of stats) {
        questionStats[stat.qid] = stat;
      }
    },
    async getQuestionStats() {
      return { ...questionStats };
    },
    async saveSettings(newSettings: Settings) {
      settings = { ...newSettings };
    },
    async getSettings() {
      return { ...settings };
    },
    async clearAll() {
      attempts.length = 0;
      for (const k of Object.keys(questionStats)) {
        delete questionStats[k];
      }
      settings = SettingsSchema.parse({});
    },
  };
}

/**
 * Production IndexedDB repository with memory fallback.
 */
export function createIndexedDBRepository(): ProgressRepository {
  // If not in browser environment or IndexedDB is unavailable, fall back to memory
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return createMemoryRepository();
  }

  const customStore = createStore("nptel-quiz-db", "user-progress");
  const ATTEMPTS_KEY = "attempts";
  const STATS_KEY = "question_stats";
  const SETTINGS_KEY = "nptel_settings";

  return {
    async saveAttempt(attempt: AttemptRecord) {
      try {
        const attempts: AttemptRecord[] = (await get(ATTEMPTS_KEY, customStore)) || [];
        const idx = attempts.findIndex((a) => a.id === attempt.id);
        if (idx >= 0) {
          attempts[idx] = attempt;
        } else {
          attempts.unshift(attempt);
        }
        await set(ATTEMPTS_KEY, attempts, customStore);
      } catch (e) {
        console.warn("IndexedDB saveAttempt failed:", e);
      }
    },

    async getAttempts() {
      try {
        const attempts: AttemptRecord[] = (await get(ATTEMPTS_KEY, customStore)) || [];
        return attempts;
      } catch (e) {
        console.warn("IndexedDB getAttempts failed:", e);
        return [];
      }
    },

    async getAttemptById(id: string) {
      try {
        const attempts: AttemptRecord[] = (await get(ATTEMPTS_KEY, customStore)) || [];
        return attempts.find((a) => a.id === id) || null;
      } catch (e) {
        console.warn("IndexedDB getAttemptById failed:", e);
        return null;
      }
    },

    async saveQuestionStat(stat: QuestionStatRecord) {
      try {
        const stats: Record<string, QuestionStatRecord> = (await get(STATS_KEY, customStore)) || {};
        stats[stat.qid] = stat;
        await set(STATS_KEY, stats, customStore);
      } catch (e) {
        console.warn("IndexedDB saveQuestionStat failed:", e);
      }
    },

    async saveQuestionStatsBatch(newStats: QuestionStatRecord[]) {
      try {
        const stats: Record<string, QuestionStatRecord> = (await get(STATS_KEY, customStore)) || {};
        for (const stat of newStats) {
          stats[stat.qid] = stat;
        }
        await set(STATS_KEY, stats, customStore);
      } catch (e) {
        console.warn("IndexedDB saveQuestionStatsBatch failed:", e);
      }
    },

    async getQuestionStats() {
      try {
        const stats: Record<string, QuestionStatRecord> = (await get(STATS_KEY, customStore)) || {};
        return stats;
      } catch (e) {
        console.warn("IndexedDB getQuestionStats failed:", e);
        return {};
      }
    },

    async saveSettings(settings: Settings) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
      } catch (e) {
        console.warn("LocalStorage saveSettings failed:", e);
      }
    },

    async getSettings() {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const raw = localStorage.getItem(SETTINGS_KEY);
          if (raw) {
            return SettingsSchema.parse(JSON.parse(raw));
          }
        }
      } catch (e) {
        console.warn("LocalStorage getSettings failed:", e);
      }
      return SettingsSchema.parse({});
    },

    async clearAll() {
      try {
        await del(ATTEMPTS_KEY, customStore);
        await del(STATS_KEY, customStore);
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.removeItem(SETTINGS_KEY);
        }
      } catch (e) {
        console.warn("IndexedDB clearAll failed:", e);
      }
    },
  };
}

// Global default repository instance
export const defaultRepository = createIndexedDBRepository();
