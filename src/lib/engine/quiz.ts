import { Question } from "../schema/question";

export type QuizMode = "weekly" | "overall" | "practice" | "learn" | "revision";
export type SamplingStrategy = "even" | "proportional" | "weak-weighted";

export interface QuizConfig {
  type: QuizMode;
  week?: number;
  questionCount: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  seed: number;
  negativeMarking: boolean;
  negativeMarkValue?: number; // default -0.25
  samplingStrategy?: SamplingStrategy;
  filterTopic?: string;
  filterDifficulty?: "easy" | "medium" | "hard";
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // Options as shown to the user in this session
  answer: number[]; // Correct original indices
  originalOptionIndices: number[]; // Maps visual option index -> original index in Question
  explanation?: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  userSelected: number[]; // Original indices the user selected
  flagged: boolean;
  timeSpentMs: number;
}

export interface QuizSession {
  id: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  currentIndex: number;
  startedAt: number;
  finishedAt?: number;
}

export interface SessionResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  score: number;
  maxScore: number;
  percentage: number;
  totalTimeMs: number;
  averageTimeMs: number;
}

/**
 * 32-bit Mulberry PRNG for deterministic shuffling.
 */
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pure Fisher-Yates shuffle using provided PRNG.
 */
export function shuffleArray<T>(array: T[], randomFn: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Builds a deterministic QuizSession from raw question bank.
 */
export function buildQuiz(
  config: QuizConfig,
  questionBank: Question[]
): QuizSession {
  const randomFn = mulberry32(config.seed);

  let selectedRaw: Question[] = [];

  if (config.type === "weekly" && config.week !== undefined) {
    const weekPrefix = `w${config.week.toString().padStart(2, "0")}-`;
    selectedRaw = questionBank.filter((q) => q.id.startsWith(weekPrefix));
  } else if (config.type === "overall") {
    // Group by week
    const byWeek: Record<number, Question[]> = {};
    for (const q of questionBank) {
      const match = q.id.match(/^w(\d{2})-/);
      if (match) {
        const w = parseInt(match[1], 10);
        if (!byWeek[w]) byWeek[w] = [];
        byWeek[w].push(q);
      }
    }

    const availableWeeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);
    if (availableWeeks.length > 0) {
      // Even sampling across weeks
      const perWeek = Math.max(1, Math.floor(config.questionCount / availableWeeks.length));
      for (const w of availableWeeks) {
        const weekQs = config.shuffleQuestions
          ? shuffleArray(byWeek[w], randomFn)
          : [...byWeek[w]];
        selectedRaw.push(...weekQs.slice(0, perWeek));
      }
      // If we need more to reach questionCount, pick remaining
      if (selectedRaw.length < config.questionCount) {
        const remaining = questionBank.filter((q) => !selectedRaw.some((sq) => sq.id === q.id));
        const extra = config.shuffleQuestions
          ? shuffleArray(remaining, randomFn)
          : remaining;
        selectedRaw.push(...extra.slice(0, config.questionCount - selectedRaw.length));
      }
    }
  } else {
    selectedRaw = [...questionBank];
    if (config.filterTopic) {
      selectedRaw = selectedRaw.filter((q) => q.topic === config.filterTopic);
    }
    if (config.filterDifficulty) {
      selectedRaw = selectedRaw.filter((q) => q.difficulty === config.filterDifficulty);
    }
  }

  // Shuffle question order if requested
  if (config.shuffleQuestions) {
    selectedRaw = shuffleArray(selectedRaw, randomFn);
  }

  // Slice to desired questionCount
  selectedRaw = selectedRaw.slice(0, config.questionCount);

  // Transform to QuizQuestion with option shuffle and index mapping
  const questions: QuizQuestion[] = selectedRaw.map((q) => {
    let visualOptions = [...q.options];
    let originalIndices = q.options.map((_, idx) => idx);

    if (config.shuffleOptions) {
      // Create indexed array to keep track of original positions
      const indexed = q.options.map((opt, idx) => ({ opt, idx }));
      const shuffled = shuffleArray(indexed, randomFn);
      visualOptions = shuffled.map((item) => item.opt);
      originalIndices = shuffled.map((item) => item.idx);
    }

    return {
      id: q.id,
      question: q.question,
      options: visualOptions,
      answer: q.answer,
      originalOptionIndices: originalIndices,
      explanation: q.explanation,
      topic: q.topic,
      difficulty: q.difficulty,
      userSelected: [],
      flagged: false,
      timeSpentMs: 0,
    };
  });

  return {
    id: `quiz-${config.type}-${config.seed}-${Date.now()}`,
    config,
    questions,
    currentIndex: 0,
    startedAt: Date.now(),
  };
}

/**
 * Pure function: records selected original indices for a question.
 */
export function answerQuestion(
  session: QuizSession,
  qid: string,
  selectedOriginalIndices: number[],
  timeSpentMs = 0
): QuizSession {
  const updatedQuestions = session.questions.map((q) => {
    if (q.id === qid) {
      return {
        ...q,
        userSelected: selectedOriginalIndices,
        timeSpentMs: q.timeSpentMs + timeSpentMs,
      };
    }
    return q;
  });

  return {
    ...session,
    questions: updatedQuestions,
  };
}

/**
 * Pure function: toggles flagged status for a question.
 */
export function toggleFlag(session: QuizSession, qid: string): QuizSession {
  const updatedQuestions = session.questions.map((q) => {
    if (q.id === qid) {
      return {
        ...q,
        flagged: !q.flagged,
      };
    }
    return q;
  });

  return {
    ...session,
    questions: updatedQuestions,
  };
}

/**
 * Pure function: scores a completed or submitted session.
 */
export function scoreSession(session: QuizSession): SessionResult {
  const negPenalty = session.config.negativeMarking
    ? session.config.negativeMarkValue ?? 0.25
    : 0;

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let totalScore = 0;
  let totalTimeMs = 0;

  for (const q of session.questions) {
    totalTimeMs += q.timeSpentMs;

    if (q.userSelected.length === 0) {
      skippedCount++;
      continue;
    }

    // Check if userSelected matches q.answer exactly (both sorted)
    const sortedSelected = [...q.userSelected].sort((a, b) => a - b);
    const sortedAnswer = [...q.answer].sort((a, b) => a - b);

    const isMatch =
      sortedSelected.length === sortedAnswer.length &&
      sortedSelected.every((val, idx) => val === sortedAnswer[idx]);

    if (isMatch) {
      correctCount++;
      totalScore += 1;
    } else {
      incorrectCount++;
      totalScore -= negPenalty;
    }
  }

  const maxScore = session.questions.length;
  // Score cannot fall below 0 in overall display
  const finalScore = Math.max(0, totalScore);
  const percentage = maxScore > 0 ? Math.round((finalScore / maxScore) * 1000) / 10 : 0;
  const averageTimeMs =
    session.questions.length > 0
      ? Math.round(totalTimeMs / session.questions.length)
      : 0;

  return {
    totalQuestions: session.questions.length,
    correctCount,
    incorrectCount,
    skippedCount,
    score: totalScore,
    maxScore,
    percentage,
    totalTimeMs,
    averageTimeMs,
  };
}
