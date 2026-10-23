import { describe, it, expect } from "vitest";
import { QuestionSchema, WeekQuizSchema } from "@/lib/schema/question";
import { SettingsSchema } from "@/lib/schema/progress";

describe("Question and Week Quiz Schema Validation", () => {
  it("validates a valid question object", () => {
    const validQuestion = {
      id: "w01-q001",
      question: "What is an example of migration?",
      options: ["A", "B", "C", "D"],
      answer: [1],
    };
    const parsed = QuestionSchema.safeParse(validQuestion);
    expect(parsed.success).toBe(true);
  });

  it("fails when id does not follow wXX-qYYY format", () => {
    const invalidIdQuestion = {
      id: "question-1",
      question: "Sample text",
      options: ["A", "B"],
      answer: [0],
    };
    const parsed = QuestionSchema.safeParse(invalidIdQuestion);
    expect(parsed.success).toBe(false);
  });

  it("fails when options has fewer than 2 items", () => {
    const fewOptions = {
      id: "w01-q001",
      question: "Sample text",
      options: ["Only one option"],
      answer: [0],
    };
    const parsed = QuestionSchema.safeParse(fewOptions);
    expect(parsed.success).toBe(false);
  });

  it("fails when answer index is out of bounds", () => {
    const outOfBoundsAnswer = {
      id: "w01-q001",
      question: "Sample text",
      options: ["A", "B"],
      answer: [5], // index 5 does not exist in 2 options
    };
    const parsed = QuestionSchema.safeParse(outOfBoundsAnswer);
    expect(parsed.success).toBe(false);
  });

  it("validates a full week quiz object", () => {
    const validQuiz = {
      week: 1,
      title: "Week 1 : Assignment 1",
      due_date: "2026-08-05, 23:59 IST",
      questions: [
        {
          id: "w01-q001",
          question: "Sample question?",
          options: ["Option 1", "Option 2"],
          answer: [0],
        },
      ],
    };
    const parsed = WeekQuizSchema.safeParse(validQuiz);
    expect(parsed.success).toBe(true);
  });

  it("fails when week quiz has duplicate question IDs", () => {
    const duplicateIdQuiz = {
      week: 1,
      title: "Week 1 : Assignment 1",
      questions: [
        {
          id: "w01-q001",
          question: "Q1",
          options: ["A", "B"],
          answer: [0],
        },
        {
          id: "w01-q001",
          question: "Q2 with same ID",
          options: ["A", "B"],
          answer: [1],
        },
      ],
    };
    const parsed = WeekQuizSchema.safeParse(duplicateIdQuiz);
    expect(parsed.success).toBe(false);
  });

  it("validates a Week 0 prerequisite quiz object", () => {
    const week0Quiz = {
      week: 0,
      title: "Week 0 : Assignment 0",
      due_date: "Prerequisite Assessment",
      questions: [
        {
          id: "w00-q001",
          question: "Prerequisite question?",
          options: ["Option 1", "Option 2"],
          answer: [0],
        },
      ],
    };
    const parsed = WeekQuizSchema.safeParse(week0Quiz);
    expect(parsed.success).toBe(true);
  });

  it("validates SettingsSchema defaults with shuffleQuestions set to true", () => {
    const settings = SettingsSchema.parse({});
    expect(settings.shuffleQuestions).toBe(true);
    expect(settings.shuffleOptions).toBe(true);
  });
});
