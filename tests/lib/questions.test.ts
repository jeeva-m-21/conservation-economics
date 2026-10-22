import { describe, it, expect } from "vitest";
import { getWeekQuiz, getAllQuestions } from "@/lib/questions";

describe("Question Loader Utility", () => {
  it("loads Week 0 prerequisite quiz cleanly", async () => {
    const quiz = await getWeekQuiz(0);
    expect(quiz).not.toBeNull();
    expect(quiz?.week).toBe(0);
    expect(quiz?.questions.length).toBe(10);
    expect(quiz?.questions[0].id).toBe("w00-q001");
  });

  it("loads Week 1 quiz cleanly", async () => {
    const quiz = await getWeekQuiz(1);
    expect(quiz).not.toBeNull();
    expect(quiz?.week).toBe(1);
    expect(quiz?.questions.length).toBe(10);
  });

  it("loads all 130 questions across course (Weeks 0 to 12)", async () => {
    const all = await getAllQuestions();
    expect(all.length).toBe(130);
  });
});
