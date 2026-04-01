import { test, expect } from "@playwright/test";

test.describe("5. DOCUMENTS PAGE", () => {
  test("Documents page shows all templates", async ({ page }) => {
    await page.goto("/documents");

    const templates = page.getByTestId("document-templates");
    await expect(templates).toBeVisible();

    const links = templates.locator("a");
    expect(await links.count()).toBeGreaterThanOrEqual(3);
  });

  test("Open Наказ про евакуацію, fill fields, verify preview and export", async ({
    page,
  }) => {
    await page.goto("/documents");

    // Click on Наказ
    await page.getByTestId("document-nakaz-evakuatsiia").click();
    await expect(page).toHaveURL(/\/documents\/nakaz-evakuatsiia/);

    // Fill in fields
    await page.getByTestId("field-museum_name").fill("Національний музей мистецтв");
    await page.getByTestId("field-director_name").fill("Петренко Олена Василівна");
    await page.getByTestId("field-date").fill("2026-04-01");
    await page
      .getByTestId("field-reason")
      .fill("У зв'язку із загрозою ракетних обстрілів");
    await page.getByTestId("field-destination").fill("Львів, Національний музей");
    await page.getByTestId("field-items_count").fill("350");

    // Verify preview updates with entered values
    const preview = page.getByTestId("document-preview");
    await expect(preview).toContainText("Національний музей мистецтв");
    await expect(preview).toContainText("Петренко Олена Василівна");
    await expect(preview).toContainText("350");

    // Verify export button exists and is clickable
    const exportBtn = page.getByTestId("export-pdf-button");
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toBeEnabled();

    // Click export — opens print dialog in new window
    const popupPromise = page.waitForEvent("popup");
    await exportBtn.click();
    const popup = await popupPromise;
    // Verify the popup contains the document content
    await expect(popup.locator("body")).toContainText("Національний музей мистецтв");
  });
});
