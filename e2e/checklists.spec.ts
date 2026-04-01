import { test, expect } from "@playwright/test";

test.describe("4. CHECKLISTS PAGE", () => {
  test("Checklists page shows at least 5 item types", async ({ page }) => {
    await page.goto("/checklists");

    const types = page.getByTestId("checklist-types");
    await expect(types).toBeVisible();

    const links = types.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("Open Живопис checklist, toggle checkboxes, verify progress", async ({
    page,
  }) => {
    await page.goto("/checklists");

    // Click on Живопис
    await page.getByTestId("checklist-zhyvopys").click();
    await expect(page).toHaveURL(/\/checklists\/zhyvopys/);

    // Verify checklist items
    const items = page.getByTestId("checklist-items");
    await expect(items).toBeVisible();

    // Verify progress starts at 0
    await expect(page.getByTestId("progress-text")).toContainText("0 /");

    // Toggle first checkbox
    const firstCheckbox = page.getByTestId("checkbox-z1");
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();

    // Verify progress bar updates
    await expect(page.getByTestId("progress-text")).toContainText("1 /");

    // Toggle second checkbox
    await page.getByTestId("checkbox-z2").check();
    await expect(page.getByTestId("progress-text")).toContainText("2 /");

    // Uncheck first
    await firstCheckbox.uncheck();
    await expect(page.getByTestId("progress-text")).toContainText("1 /");
  });

  test("Print and export buttons exist", async ({ page }) => {
    await page.goto("/checklists/zhyvopys");

    await expect(page.getByTestId("print-button")).toBeVisible();
    await expect(page.getByTestId("export-button")).toBeVisible();
  });
});
