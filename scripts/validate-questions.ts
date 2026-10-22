import fs from "fs";
import path from "path";
import { WeekQuizSchema } from "../src/lib/schema/question";

const QUESTIONS_DIR = path.resolve(__dirname, "../questions");

function validateQuestions() {
  console.log("🔍 Validating question files in", QUESTIONS_DIR);

  if (!fs.existsSync(QUESTIONS_DIR)) {
    console.error("❌ Questions directory does not exist:", QUESTIONS_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(QUESTIONS_DIR)
    .filter((f) => f.startsWith("week-") && f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.error("❌ No question files found in", QUESTIONS_DIR);
    process.exit(1);
  }

  let totalQuestions = 0;
  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(QUESTIONS_DIR, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(raw);

      // Verify filename matches week number
      const match = file.match(/^week-(\d{2})\.json$/);
      if (!match) {
        console.error(`❌ File ${file} does not match week-XX.json naming convention`);
        hasErrors = true;
        continue;
      }

      const expectedWeek = parseInt(match[1], 10);
      if (json.week !== expectedWeek) {
        console.error(`❌ File ${file} has week number ${json.week}, expected ${expectedWeek}`);
        hasErrors = true;
      }

      const parsed = WeekQuizSchema.safeParse(json);
      if (!parsed.success) {
        console.error(`❌ Validation failed for ${file}:`);
        console.error(parsed.error.format());
        hasErrors = true;
      } else {
        totalQuestions += parsed.data.questions.length;
        console.log(`  ✓ ${file}: Week ${parsed.data.week} valid (${parsed.data.questions.length} questions)`);
      }
    } catch (err) {
      console.error(`❌ Error reading/parsing ${file}:`, err);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error("\n❌ Question validation failed with errors.");
    process.exit(1);
  }

  console.log(`\n✅ All ${files.length} files valid! Total questions: ${totalQuestions}\n`);
}

validateQuestions();
