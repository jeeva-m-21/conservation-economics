import { describe, it, expect, beforeEach } from "vitest";
import { useQuizStore } from "@/store/useQuizStore";
import { Question } from "@/lib/schema/question";

describe("Quiz Store", () => {
  const mockQuestions: Question[] = [
    {
      id: "w01-q001",
      question: "Question 1?",
      options: ["A", "B", "C", "D"],
      answer: [1],
    },
    {
      id: "w01-q002",
      question: "Question 2?",
      options: ["True", "False"],
      answer: [0],
    },
  ];

  beforeEach(() => {
    useQuizStore.getState().resetSession();
  });

  it("starts session and allows navigating questions", () => {
    const store = useQuizStore.getState();
    store.startSession(
      {
        type: "weekly",
        week: 1,
        questionCount: 2,
        shuffleQuestions: false,
        shuffleOptions: false,
        seed: 123,
        negativeMarking: false,
      },
      mockQuestions
    );

    expect(useQuizStore.getState().session).not.toBeNull();
    expect(useQuizStore.getState().session?.currentIndex).toBe(0);

    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().session?.currentIndex).toBe(1);

    useQuizStore.getState().prevQuestion();
    expect(useQuizStore.getState().session?.currentIndex).toBe(0);
  });

  it("selects options and records answers", () => {
    const store = useQuizStore.getState();
    store.startSession(
      {
        type: "weekly",
        week: 1,
        questionCount: 2,
        shuffleQuestions: false,
        shuffleOptions: false,
        seed: 123,
        negativeMarking: false,
      },
      mockQuestions
    );

    useQuizStore.getState().selectOption("w01-q001", 1);
    const q1 = useQuizStore.getState().session?.questions[0];
    expect(q1?.userSelected).toEqual([1]);

    const result = useQuizStore.getState().finishSession();
    expect(result?.correctCount).toBe(1);
    expect(result?.skippedCount).toBe(1);
  });
});
