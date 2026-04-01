import { test, expect } from "@playwright/test";

test.describe("1. SMOKE TEST", () => {
  test("Landing page loads with all 3 scenario cards", async ({ page }) => {
    await page.goto("/");

    // Check hero content is visible
    await expect(page.getByText("Евакуація музейних")).toBeVisible();

    const cards = page.getByTestId("scenario-cards");
    await expect(cards).toBeVisible();

    await expect(page.getByTestId("scenario-emergency")).toBeVisible();
    await expect(page.getByTestId("scenario-planned")).toBeVisible();
    await expect(page.getByTestId("scenario-consultation")).toBeVisible();
  });

  test("Quick action buttons are clickable", async ({ page }) => {
    await page.goto("/");

    const quickActions = page.getByTestId("quick-actions");
    await expect(quickActions).toBeVisible();

    const links = quickActions.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(4);

    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toBeEnabled();
    }
  });

  test("Navigation works between all pages", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation");

    // Navigate to Chat
    await nav.getByRole("link", { name: "Чат" }).click();
    await expect(page).toHaveURL(/\/chat/);

    // Navigate to Checklists
    await nav.getByRole("link", { name: "Чеклісти" }).click();
    await expect(page).toHaveURL(/\/checklists/);

    // Navigate to Documents
    await nav.getByRole("link", { name: "Документи" }).click();
    await expect(page).toHaveURL(/\/documents/);

    // Navigate back to Home
    await nav.getByRole("link", { name: /MuseumAID/ }).click();
    await expect(page).toHaveURL("/");
  });
});
