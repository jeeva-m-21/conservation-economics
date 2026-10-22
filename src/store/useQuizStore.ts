import { create } from "zustand";
import {
  QuizConfig,
  QuizSession,
  SessionResult,
  buildQuiz,
  answerQuestion,
  toggleFlag,
  scoreSession,
} from "../lib/engine/quiz";
import { Question } from "../lib/schema/question";

interface QuizState {
  session: QuizSession | null;
  lastQuestionTimestamp: number;
  startSession: (config: QuizConfig, questionBank: Question[]) => void;
  selectOption: (qid: string, originalIndex: number, isMultiSelect?: boolean) => void;
  toggleFlag: (qid: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  jumpToQuestion: (index: number) => void;
  finishSession: () => SessionResult | null;
  resetSession: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  session: null,
  lastQuestionTimestamp: Date.now(),

  startSession: (config, questionBank) => {
    const session = buildQuiz(config, questionBank);
    set({ session, lastQuestionTimestamp: Date.now() });
  },

  selectOption: (qid, originalIndex, isMultiSelect = false) => {
    const { session, lastQuestionTimestamp } = get();
    if (!session) return;

    const currentQ = session.questions.find((q) => q.id === qid);
    if (!currentQ) return;

    const timeSpent = Date.now() - lastQuestionTimestamp;

    let newSelected: number[];
    if (isMultiSelect) {
      if (currentQ.userSelected.includes(originalIndex)) {
        newSelected = currentQ.userSelected.filter((i) => i !== originalIndex);
      } else {
        newSelected = [...currentQ.userSelected, originalIndex];
      }
    } else {
      newSelected = [originalIndex];
    }

    const updatedSession = answerQuestion(session, qid, newSelected, timeSpent);
    set({
      session: updatedSession,
      lastQuestionTimestamp: Date.now(),
    });
  },

  toggleFlag: (qid) => {
    const { session } = get();
    if (!session) return;
    const updated = toggleFlag(session, qid);
    set({ session: updated });
  },

  nextQuestion: () => {
    const { session } = get();
    if (!session) return;
    if (session.currentIndex < session.questions.length - 1) {
      set({
        session: { ...session, currentIndex: session.currentIndex + 1 },
        lastQuestionTimestamp: Date.now(),
      });
    }
  },

  prevQuestion: () => {
    const { session } = get();
    if (!session) return;
    if (session.currentIndex > 0) {
      set({
        session: { ...session, currentIndex: session.currentIndex - 1 },
        lastQuestionTimestamp: Date.now(),
      });
    }
  },

  jumpToQuestion: (index) => {
    const { session } = get();
    if (!session) return;
    if (index >= 0 && index < session.questions.length) {
      set({
        session: { ...session, currentIndex: index },
        lastQuestionTimestamp: Date.now(),
      });
    }
  },

  finishSession: () => {
    const { session } = get();
    if (!session) return null;
    return scoreSession(session);
  },

  resetSession: () => {
    set({ session: null });
  },
}));
