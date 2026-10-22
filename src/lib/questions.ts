import { Question, WeekQuiz, WeekQuizSchema } from "./schema/question";

// Static imports or dynamic require mapping for 13 weeks (Week 0 to Week 12)
const weekLoaders: Record<number, () => Promise<{ default: WeekQuiz }>> = {
  0: () => import("@/data/questions/week-00.json"),
  1: () => import("@/data/questions/week-01.json"),
  2: () => import("@/data/questions/week-02.json"),
  3: () => import("@/data/questions/week-03.json"),
  4: () => import("@/data/questions/week-04.json"),
  5: () => import("@/data/questions/week-05.json"),
  6: () => import("@/data/questions/week-06.json"),
  7: () => import("@/data/questions/week-07.json"),
  8: () => import("@/data/questions/week-08.json"),
  9: () => import("@/data/questions/week-09.json"),
  10: () => import("@/data/questions/week-10.json"),
  11: () => import("@/data/questions/week-11.json"),
  12: () => import("@/data/questions/week-12.json"),
};

export async function getWeekQuiz(weekNumber: number): Promise<WeekQuiz | null> {
  const loader = weekLoaders[weekNumber];
  if (!loader) return null;
  try {
    const mod = await loader();
    return WeekQuizSchema.parse(mod.default || mod);
  } catch (err) {
    console.error(`Failed to load week ${weekNumber} questions:`, err);
    return null;
  }
}

export async function getAllQuestions(): Promise<Question[]> {
  const allQs: Question[] = [];
  for (let w = 0; w <= 12; w++) {
    const quiz = await getWeekQuiz(w);
    if (quiz) {
      allQs.push(...quiz.questions);
    }
  }
  return allQs;
}
