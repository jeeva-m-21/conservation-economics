import fs from "fs";
import path from "path";
import { WeekQuizSchema } from "../src/lib/schema/question";

const QUESTIONS_DIR = path.resolve(__dirname, "../questions");
const OUT_DIR = path.resolve(__dirname, "../src/data");
const OUT_FILE = path.join(OUT_DIR, "manifest.json");

interface WeekSummary {
  week: number;
  title: string;
  due_date: string | null;
  questionCount: number;
  questionIds: string[];
  topics: string[];
}

interface Manifest {
  generatedAt: string;
  totalWeeks: number;
  totalQuestions: number;
  weeks: WeekSummary[];
}

function buildIndex() {
  console.log("🔨 Generating manifest index...");

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(QUESTIONS_DIR)
    .filter((f) => f.startsWith("week-") && f.endsWith(".json"))
    .sort();

  const weekSummaries: WeekSummary[] = [];
  let totalQuestions = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(QUESTIONS_DIR, file), "utf-8");
    const json = JSON.parse(raw);
    const parsed = WeekQuizSchema.parse(json);

    const topicsSet = new Set<string>();
    const ids: string[] = [];

    for (const q of parsed.questions) {
      ids.push(q.id);
      if (q.topic) {
        topicsSet.add(q.topic);
      }
    }

    weekSummaries.push({
      week: parsed.week,
      title: parsed.title,
      due_date: parsed.due_date || null,
      questionCount: parsed.questions.length,
      questionIds: ids,
      topics: Array.from(topicsSet).sort(),
    });

    totalQuestions += parsed.questions.length;
  }

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    totalWeeks: weekSummaries.length,
    totalQuestions,
    weeks: weekSummaries,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`✅ Manifest generated at ${OUT_FILE} with ${weekSummaries.length} weeks and ${totalQuestions} questions.`);
}

buildIndex();
