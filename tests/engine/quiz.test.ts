import { describe, it, expect } from "vitest";
import {
  mulberry32,
  shuffleArray,
  buildQuiz,
  answerQuestion,
  scoreSession,
  QuizConfig,
  QuizSession,
} from "@/lib/engine/quiz";
import { Question } from "@/lib/schema/question";

describe("Pure Quiz Engine", () => {
  const mockQuestions: Question[] = [
    {
      id: "w01-q001",
      question: "Question 1?",
      options: ["A", "B", "C", "D"],
      answer: [0],
    },
    {
      id: "w01-q002",
      question: "Question 2?",
      options: ["True", "False"],
      answer: [1],
    },
    {
      id: "w02-q001",
      question: "Question 3?",
      options: ["Red", "Green", "Blue", "Yellow"],
      answer: [2],
    },
  ];

  describe("Deterministic Seeded PRNG (mulberry32)", () => {
    it("produces identical sequences for the same seed", () => {
      const prng1 = mulberry32(12345);
      const prng2 = mulberry32(12345);

      const seq1 = [prng1(), prng1(), prng1(), prng1()];
      const seq2 = [prng2(), prng2(), prng2(), prng2()];

      expect(seq1).toEqual(seq2);
    });

    it("shuffles array deterministically given a seed", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8];
      const shuffled1 = shuffleArray([...arr], mulberry32(999));
      const shuffled2 = shuffleArray([...arr], mulberry32(999));

      expect(shuffled1).toEqual(shuffled2);
      expect(shuffled1).not.toEqual(arr);
    });
  });

  describe("buildQuiz", () => {
    it("builds a weekly quiz with option mapping preserved", () => {
      const config: QuizConfig = {
        type: "weekly",
        week: 1,
        questionCount: 2,
        shuffleQuestions: false,
        shuffleOptions: true,
        seed: 42,
        negativeMarking: false,
      };

      const session = buildQuiz(config, mockQuestions);

      expect(session.questions.length).toBe(2);
      expect(session.questions[0].id).toBe("w01-q001");
      // Verify option remapping exists
      expect(session.questions[0].originalOptionIndices.length).toBe(4);
      // All 0,1,2,3 must be present in the remapped array
      expect(new Set(session.questions[0].originalOptionIndices)).toEqual(new Set([0, 1, 2, 3]));
    });

    it("samples questions from multiple weeks for overall quiz", () => {
      const config: QuizConfig = {
        type: "overall",
        questionCount: 3,
        shuffleQuestions: true,
        shuffleOptions: false,
        seed: 777,
        samplingStrategy: "even",
        negativeMarking: true,
      };

      const session = buildQuiz(config, mockQuestions);
      expect(session.questions.length).toBe(3);
    });
  });

  describe("answerQuestion and scoreSession", () => {
    it("records answers with original option indices and computes score without negative marking", () => {
      const config: QuizConfig = {
        type: "weekly",
        week: 1,
        questionCount: 2,
        shuffleQuestions: false,
        shuffleOptions: false,
        seed: 1,
        negativeMarking: false,
      };

      let session = buildQuiz(config, mockQuestions);

      // Answer Q1 correctly (index 0)
      session = answerQuestion(session, "w01-q001", [0], 5000);
      // Answer Q2 incorrectly (selected 0 instead of 1)
      session = answerQuestion(session, "w01-q002", [0], 4000);

      const result = scoreSession(session);

      expect(result.totalQuestions).toBe(2);
      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(1);
      expect(result.skippedCount).toBe(0);
      expect(result.score).toBe(1); // 1 correct, 0 penalty
      expect(result.percentage).toBe(50);
      expect(result.totalTimeMs).toBe(9000);
    });

    it("applies negative marking penalty (-0.25) when enabled", () => {
      const config: QuizConfig = {
        type: "weekly",
        week: 1,
        questionCount: 2,
        shuffleQuestions: false,
        shuffleOptions: false,
        seed: 1,
        negativeMarking: true,
      };

      let session = buildQuiz(config, mockQuestions);

      // Q1 correct (+1)
      session = answerQuestion(session, "w01-q001", [0], 2000);
      // Q2 wrong (-0.25)
      session = answerQuestion(session, "w01-q002", [0], 3000);

      const result = scoreSession(session);
      expect(result.score).toBe(0.75); // 1 - 0.25
      expect(result.percentage).toBe(37.5);
    });

    it("does not penalize skipped questions under negative marking", () => {
      const config: QuizConfig = {
        type: "weekly",
        week: 1,
        questionCount: 2,
        shuffleQuestions: false,
        shuffleOptions: false,
        seed: 1,
        negativeMarking: true,
      };

      let session = buildQuiz(config, mockQuestions);
      // Q1 answered correctly
      session = answerQuestion(session, "w01-q001", [0], 2000);
      // Q2 left unselected / skipped

      const result = scoreSession(session);
      expect(result.score).toBe(1); // 1 point, no penalty for skipped
      expect(result.skippedCount).toBe(1);
    });
  });
});
