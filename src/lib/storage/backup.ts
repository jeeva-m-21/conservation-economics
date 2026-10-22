import { ProgressRepository } from "./repository";
import { ProgressBackup, ProgressBackupSchema } from "../schema/progress";

/**
 * Exports all user progress, attempts, stats, and settings to a JSON payload.
 */
export async function exportProgress(
  repo: ProgressRepository
): Promise<ProgressBackup> {
  const attempts = await repo.getAttempts();
  const questionStats = await repo.getQuestionStats();
  const settings = await repo.getSettings();

  const backup: ProgressBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    attempts,
    questionStats,
    settings,
  };

  return ProgressBackupSchema.parse(backup);
}

/**
 * Validates and imports a JSON backup string into the repository.
 * Throws a Zod error if the schema does not match, preserving existing state.
 */
export async function importProgress(
  jsonString: string,
  repo: ProgressRepository
): Promise<{ success: boolean; importedAttempts: number }> {
  if (!jsonString || typeof jsonString !== "string") {
    throw new Error("Invalid input: Backup file content must be a non-empty string.");
  }

  // Defense-in-depth: Reject payloads larger than 5MB to prevent memory exhaustion
  if (jsonString.length > 5 * 1024 * 1024) {
    throw new Error("Backup file exceeds maximum allowed size (5MB).");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (e) {
    throw new Error("Invalid JSON file. Please provide a valid nptel-progress.json export.");
  }

  // Validate with Zod schema
  const validated = ProgressBackupSchema.parse(parsedJson);

  // Restore attempts
  for (const attempt of validated.attempts) {
    await repo.saveAttempt(attempt);
  }

  // Restore question stats
  for (const stat of Object.values(validated.questionStats)) {
    await repo.saveQuestionStat(stat);
  }

  // Restore settings if present
  if (validated.settings) {
    await repo.saveSettings(validated.settings);
  }

  return {
    success: true,
    importedAttempts: validated.attempts.length,
  };
}
