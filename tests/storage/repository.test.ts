import { describe, it, expect, beforeEach } from "vitest";
import {
  createMemoryRepository,
  ProgressRepository,
  AttemptRecord,
  QuestionStatRecord,
} from "@/lib/storage/repository";
import { exportProgress, importProgress } from "@/lib/storage/backup";

describe("Storage Layer & Backup Engine", () => {
  let repo: ProgressRepository;

  beforeEach(() => {
    repo = createMemoryRepository();
  });

  it("stores and retrieves attempts", async () => {
    const attempt: AttemptRecord = {
      id: "attempt-1",
      type: "weekly",
      week: 1,
      startedAt: 1000,
      finishedAt: 2000,
      score: 9,
      maxScore: 10,
      percentage: 90,
      totalTimeMs: 60000,
      answers: [
        {
          qid: "w01-q001",
          selected: [1],
          correct: true,
          timeMs: 5000,
          flagged: false,
        },
      ],
    };

    await repo.saveAttempt(attempt);
    const attempts = await repo.getAttempts();
    expect(attempts.length).toBe(1);
    expect(attempts[0].id).toBe("attempt-1");

    const fetched = await repo.getAttemptById("attempt-1");
    expect(fetched?.score).toBe(9);
  });

  it("updates and retrieves Leitner question stats", async () => {
    const stat: QuestionStatRecord = {
      qid: "w01-q001",
      seen: 1,
      correct: 1,
      lastSeen: 1700000000,
      box: 2,
      bookmarked: true,
    };

    await repo.saveQuestionStat(stat);
    const stats = await repo.getQuestionStats();
    expect(stats["w01-q001"]).toBeDefined();
    expect(stats["w01-q001"].box).toBe(2);
    expect(stats["w01-q001"].bookmarked).toBe(true);
  });

  it("exports progress to valid JSON format", async () => {
    await repo.saveAttempt({
      id: "attempt-export",
      type: "weekly",
      week: 2,
      startedAt: 1000,
      finishedAt: 2000,
      score: 8,
      maxScore: 10,
      percentage: 80,
      totalTimeMs: 40000,
      answers: [],
    });

    await repo.saveQuestionStat({
      qid: "w02-q001",
      seen: 2,
      correct: 2,
      lastSeen: 2000,
      box: 3,
      bookmarked: false,
    });

    const exportData = await exportProgress(repo);
    expect(exportData.version).toBe(1);
    expect(exportData.attempts.length).toBe(1);
    expect(exportData.questionStats["w02-q001"].box).toBe(3);
  });

  it("imports progress safely and restores data", async () => {
    const validPayload = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      attempts: [
        {
          id: "imported-1",
          type: "overall",
          startedAt: 5000,
          finishedAt: 10000,
          score: 45,
          maxScore: 50,
          percentage: 90,
          totalTimeMs: 300000,
          answers: [],
        },
      ],
      questionStats: {
        "w01-q001": {
          qid: "w01-q001",
          seen: 3,
          correct: 3,
          lastSeen: 10000,
          box: 4,
          bookmarked: true,
        },
      },
    });

    const result = await importProgress(validPayload, repo);
    expect(result.success).toBe(true);

    const attempts = await repo.getAttempts();
    expect(attempts.length).toBe(1);
    expect(attempts[0].id).toBe("imported-1");

    const stats = await repo.getQuestionStats();
    expect(stats["w01-q001"].box).toBe(4);
  });

  it("rejects corrupted or invalid import payloads without corrupting repo", async () => {
    const corruptedPayload = JSON.stringify({
      version: 999, // unsupported future version
      invalidField: true,
    });

    await expect(importProgress(corruptedPayload, repo)).rejects.toThrow();
  });
});
