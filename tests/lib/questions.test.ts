import { describe, it, expect } from "vitest";
import { getWeekQuiz, getAllQuestions } from "@/lib/questions";

describe("Question Loader Utility", () => {
  it("loads Week 1 quiz cleanly", async () => {
    const quiz = await getWeekQuiz(1);
    expect(quiz).not.toBeNull();
    expect(quiz?.week).toBe(1);
    expect(quiz?.questions.length).toBe(10);
  });

  it("loads all 120 questions across course", async () => {
    const all = await getAllQuestions();
    expect(all.length).toBe(120);
  });
});
