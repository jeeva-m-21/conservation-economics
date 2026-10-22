import { AttemptRecord, QuestionStatRecord } from "../schema/progress";

export interface WeekAccuracyStat {
  week: number;
  accuracy: number;
  attemptsCount: number;
  bestPercentage: number;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * Calculates overall exam readiness score (0 - 100)
 * Weighted: 50% Accuracy + 30% Coverage + 20% Activity factor
 */
export function computeReadinessScore(
  attempts: AttemptRecord[],
  totalCourseQuestions: number,
  stats: Record<string, QuestionStatRecord>
): number {
  if (attempts.length === 0) return 0;

  // 1. Accuracy
  let totalScore = 0;
  let totalMax = 0;
  for (const a of attempts) {
    totalScore += a.score;
    totalMax += a.maxScore;
  }
  const avgAccuracy = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

  // 2. Coverage
  const seenCount = Object.values(stats).filter((s) => s.seen > 0).length;
  const coveragePercent = totalCourseQuestions > 0 ? (seenCount / totalCourseQuestions) * 100 : 0;

  // 3. Activity volume
  const activityFactor = Math.min(100, attempts.length * 10);

  const weighted = 0.5 * avgAccuracy + 0.3 * coveragePercent + 0.2 * activityFactor;
  return Math.min(100, Math.max(0, Math.round(weighted)));
}

/**
 * Calculates accuracy and attempts count per week for bar chart
 */
export function computeWeekAccuracies(
  attempts: AttemptRecord[],
  totalWeeks = 12
): WeekAccuracyStat[] {
  const result: WeekAccuracyStat[] = [];

  for (let w = 1; w <= totalWeeks; w++) {
    const weekAttempts = attempts.filter((a) => a.week === w);

    let totalScore = 0;
    let totalMax = 0;
    let best = 0;

    for (const a of weekAttempts) {
      totalScore += a.score;
      totalMax += a.maxScore;
      if (a.percentage > best) best = a.percentage;
    }

    const accuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    result.push({
      week: w,
      accuracy,
      attemptsCount: weekAttempts.length,
      bestPercentage: best,
    });
  }

  return result;
}

/**
 * Identifies question IDs where accuracy is below 60% or in Box 1
 */
export function identifyWeakSpots(
  stats: Record<string, QuestionStatRecord>
): string[] {
  const weakIds: string[] = [];

  for (const stat of Object.values(stats)) {
    if (stat.seen > 0) {
      const acc = stat.correct / stat.seen;
      if (acc < 0.6 || stat.box === 1) {
        weakIds.push(stat.qid);
      }
    }
  }

  // Sort by lowest accuracy first
  return weakIds.sort((a, b) => {
    const accA = stats[a].correct / stats[a].seen;
    const accB = stats[b].correct / stats[b].seen;
    return accA - accB;
  });
}

/**
 * Computes consecutive study streak (in days)
 */
export function computeStudyStreak(
  attempts: AttemptRecord[],
  referenceDate = new Date()
): number {
  if (attempts.length === 0) return 0;

  // Extract unique sorted calendar days (YYYY-MM-DD)
  const daysSet = new Set<string>();
  for (const a of attempts) {
    const d = new Date(a.startedAt);
    const dayStr = d.toISOString().slice(0, 10);
    daysSet.add(dayStr);
  }

  const sortedDays = Array.from(daysSet).sort().reverse();
  if (sortedDays.length === 0) return 0;

  let streak = 0;
  const currentCheck = new Date(referenceDate);

  // Allow reference date or yesterday as the active anchor of the streak
  const todayStr = currentCheck.toISOString().slice(0, 10);
  currentCheck.setDate(currentCheck.getDate() - 1);
  const yesterdayStr = currentCheck.toISOString().slice(0, 10);

  if (sortedDays[0] !== todayStr && sortedDays[0] !== yesterdayStr) {
    return 0;
  }

  let expectedDate = new Date(sortedDays[0]);

  for (const day of sortedDays) {
    const expectedStr = expectedDate.toISOString().slice(0, 10);
    if (day === expectedStr) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return Math.max(1, streak);
}

/**
 * Computes daily attempt activity for contribution heatmap
 */
export function computeDailyActivity(attempts: AttemptRecord[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const a of attempts) {
    const dayStr = new Date(a.startedAt).toISOString().slice(0, 10);
    map[dayStr] = (map[dayStr] || 0) + 1;
  }
  return map;
}
