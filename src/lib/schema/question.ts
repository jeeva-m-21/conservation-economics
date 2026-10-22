import { z } from "zod";

export const QuestionSchema = z
  .object({
    id: z
      .string()
      .regex(/^w\d{2}-q\d{3}$/, "Question ID must match wXX-qYYY format"),
    question: z.string().min(1, "Question text cannot be empty"),
    options: z.array(z.string().min(1)).min(2, "Must have at least 2 options"),
    answer: z
      .array(z.number().int().nonnegative())
      .min(1, "Must have at least one correct answer index"),
    explanation: z.string().optional(),
    topic: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  })
  .superRefine((val, ctx) => {
    for (const ansIdx of val.answer) {
      if (ansIdx >= val.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Answer index ${ansIdx} out of bounds for options length ${val.options.length}`,
          path: ["answer"],
        });
      }
    }
  });

export type Question = z.infer<typeof QuestionSchema>;

export const WeekQuizSchema = z
  .object({
    week: z.number().int().min(0).max(12),
    title: z.string().min(1),
    due_date: z.string().nullable().optional(),
    questions: z.array(QuestionSchema),
  })
  .superRefine((val, ctx) => {
    const seenIds = new Set<string>();
    for (let i = 0; i < val.questions.length; i++) {
      const q = val.questions[i];
      if (seenIds.has(q.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate question ID found: ${q.id}`,
          path: ["questions", i, "id"],
        });
      }
      seenIds.add(q.id);
    }
  });

export type WeekQuiz = z.infer<typeof WeekQuizSchema>;
