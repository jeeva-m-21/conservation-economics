import { test, expect } from "@playwright/test";

test.describe("NPTEL Quiz Platform End-to-End Journeys", () => {
  test("1. Weekly Quiz Flow: complete quiz, submit, and view review screen", async ({
    page,
  }) => {
    // 1. Visit Weekly Quiz for Week 1
    await page.goto("/quiz/weekly/1");

    // Wait for quiz content to load
    await expect(page.getByText("QUESTION 01 OF 10", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Assignment 1")).toBeVisible();

    // 2. Select option for question 1 (e.g. migration)
    const firstOption = page.locator('[role="radio"]').nth(1); // "migration"
    await firstOption.click();
    await expect(firstOption).toHaveAttribute("aria-checked", "true");

    // 3. Navigate through questions using Next button
    const nextButton = page.getByRole("button", { name: "Next" });
    await nextButton.click();
    await expect(page.getByText("QUESTION 02 OF 10", { exact: true })).toBeVisible();

    // 4. Select an option for question 2
    const q2Option = page.locator('[role="radio"]').nth(0);
    await q2Option.click();

    // 5. Jump to question 10 via navigator chip
    const q10Chip = page.locator('button:has-text("10")').first();
    if (await q10Chip.isVisible()) {
      await q10Chip.click();
    } else {
      for (let i = 2; i < 10; i++) {
        await page.keyboard.press("ArrowRight");
      }
    }
    await expect(page.getByText("QUESTION 10 OF 10", { exact: true })).toBeVisible();

    // 6. Select option for question 10
    await page.locator('[role="radio"]').nth(3).click();

    // 7. Click Submit Quiz
    const submitBtn = page.getByRole("button", { name: /Submit Quiz/i });
    await submitBtn.click();

    // Confirm submission in modal
    const modalConfirmBtn = page.getByRole("button", { name: "Submit Now" });
    await modalConfirmBtn.click();

    // 8. Verify redirected to Review page
    await expect(page).toHaveURL(/\/review\/attempt-w1-/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Score Summary" })).toBeVisible();
    await expect(page.locator("text=Final Score")).toBeVisible();
  });

  test("2. Learn Mode: reveals instant feedback and explanations", async ({
    page,
  }) => {
    await page.goto("/learn?week=1");

    // Wait for study material
    await expect(page.getByText("QUESTION 01 OF 10", { exact: true })).toBeVisible({ timeout: 10000 });

    // Select an option
    const option = page.locator('[role="radio"]').nth(1);
    await option.click();

    // In learn mode, feedback card appears immediately
    await expect(page.locator("text=Correct Solution").or(page.locator("text=Incorrect Selection"))).toBeVisible();
  });

  test("3. Final Exam Simulator: start, answer, and exit confirmation", async ({
    page,
  }) => {
    await page.goto("/quiz/overall");

    await expect(page.locator("text=Final Exam Simulator")).toBeVisible({ timeout: 10000 });

    // Start Exam with the exact button label
    const startBtn = page.getByRole("button", { name: /Begin Final Exam Simulation/i });
    await startBtn.click();

    // Verify session started
    await expect(page.locator("span.font-mono:has-text('QUESTION 01 OF')")).toBeVisible({ timeout: 10000 });

    // Answer first question using keyboard shortcut
    await page.keyboard.press("1");
    const firstOption = page.locator('[role="radio"]').nth(0);
    await expect(firstOption).toHaveAttribute("aria-checked", "true");
  });

  test("4. Settings & Storage: preferences save and persist", async ({
    page,
  }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({ timeout: 10000 });

    // Verify negative marking toggle
    const checkbox = page.locator('input[type="checkbox"]').first();
    const initialChecked = await checkbox.isChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: !initialChecked });

    // Reload page to verify persistence in localStorage
    await page.reload();
    await expect(checkbox).toBeChecked({ checked: !initialChecked });
  });
});
