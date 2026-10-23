import { z } from "zod";

export const AnswerRecordSchema = z.object({
  qid: z.string(),
  selected: z.array(z.number().int().nonnegative()),
  correct: z.boolean(),
  timeMs: z.number().nonnegative(),
  flagged: z.boolean().optional(),
});

export type AnswerRecord = z.infer<typeof AnswerRecordSchema>;

export const AttemptRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["weekly", "overall", "practice", "learn", "revision"]),
  week: z.number().int().optional(),
  startedAt: z.number().nonnegative(),
  finishedAt: z.number().nonnegative().optional(),
  score: z.number(),
  maxScore: z.number().nonnegative(),
  percentage: z.number().nonnegative(),
  totalTimeMs: z.number().nonnegative(),
  answers: z.array(AnswerRecordSchema),
});

export type AttemptRecord = z.infer<typeof AttemptRecordSchema>;

export const QuestionStatRecordSchema = z.object({
  qid: z.string(),
  seen: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  lastSeen: z.number().nonnegative(),
  box: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  bookmarked: z.boolean(),
});

export type QuestionStatRecord = z.infer<typeof QuestionStatRecordSchema>;

export const SettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("light"),
  defaultTimerMin: z.number().int().positive().optional(),
  negativeMarking: z.boolean().default(false),
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const ProgressBackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  attempts: z.array(AttemptRecordSchema),
  questionStats: z.record(z.string(), QuestionStatRecordSchema),
  settings: SettingsSchema.optional(),
});

export type ProgressBackup = z.infer<typeof ProgressBackupSchema>;
