import { describe, it, expect } from "vitest";
import {
  computeReadinessScore,
  computeWeekAccuracies,
  identifyWeakSpots,
  computeStudyStreak,
} from "@/lib/analytics/stats";
import { AttemptRecord, QuestionStatRecord } from "@/lib/schema/progress";

describe("Analytics Calculation Engine", () => {
  const mockAttempts: AttemptRecord[] = [
    {
      id: "a1",
      type: "weekly",
      week: 1,
      startedAt: 1700000000000,
      finishedAt: 1700000060000,
      score: 8,
      maxScore: 10,
      percentage: 80,
      totalTimeMs: 60000,
      answers: [
        { qid: "w01-q001", selected: [0], correct: true, timeMs: 6000 },
        { qid: "w01-q002", selected: [1], correct: false, timeMs: 54000 },
      ],
    },
    {
      id: "a2",
      type: "weekly",
      week: 2,
      startedAt: 1700086400000,
      finishedAt: 1700086450000,
      score: 5,
      maxScore: 10,
      percentage: 50,
      totalTimeMs: 50000,
      answers: [
        { qid: "w02-q001", selected: [1], correct: false, timeMs: 50000 },
      ],
    },
  ];

  const mockStats: Record<string, QuestionStatRecord> = {
    "w01-q001": { qid: "w01-q001", seen: 1, correct: 1, lastSeen: 1700000000000, box: 2, bookmarked: false },
    "w01-q002": { qid: "w01-q002", seen: 1, correct: 0, lastSeen: 1700000000000, box: 1, bookmarked: false },
    "w02-q001": { qid: "w02-q001", seen: 1, correct: 0, lastSeen: 1700086400000, box: 1, bookmarked: true },
  };

  it("computes overall readiness score accurately", () => {
    const score = computeReadinessScore(mockAttempts, 120, mockStats);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("incorporates questions from attempts into readiness score coverage even if missing from stats", () => {
    // If stats only has 1 question saved (due to race condition), but attempts has 3 distinct questions
    const partialStats: Record<string, QuestionStatRecord> = {
      "w01-q001": { qid: "w01-q001", seen: 1, correct: 1, lastSeen: 1700000000000, box: 2, bookmarked: false },
    };
    const scoreWithCoverage = computeReadinessScore(mockAttempts, 10, partialStats);
    // 3 unique questions across mockAttempts (w01-q001, w01-q002, w02-q001) out of 10 = 30% coverage
    // Accuracy = (8+5)/(10+10) = 65%
    // Activity = 2 * 10 = 20
    // Weighted = 0.5 * 65 + 0.3 * 30 + 0.2 * 20 = 32.5 + 9 + 4 = 45.5 -> 46
    expect(scoreWithCoverage).toBe(46);
  });

  it("calculates accuracy per week and highlights weakest week", () => {
    const weekStats = computeWeekAccuracies(mockAttempts, 12);
    expect(weekStats.length).toBe(12);
    // Week 1 has 80% accuracy
    expect(weekStats[0].accuracy).toBe(80);
    // Week 2 has 50% accuracy
    expect(weekStats[1].accuracy).toBe(50);
    // Weakest week among attempted should be Week 2
    const attempted = weekStats.filter((w) => w.attemptsCount > 0);
    const weakest = [...attempted].sort((a, b) => a.accuracy - b.accuracy)[0];
    expect(weakest.week).toBe(2);
  });

  it("identifies weak questions based on low correctness ratio", () => {
    const weakSpots = identifyWeakSpots(mockStats);
    // w01-q002 and w02-q001 have 0% correct
    expect(weakSpots).toContain("w01-q002");
    expect(weakSpots).toContain("w02-q001");
  });

  it("computes study streak correctly", () => {
    const referenceDate = new Date(1700086400000);
    const streak = computeStudyStreak(mockAttempts, referenceDate);
    expect(streak).toBe(2);
  });
});
