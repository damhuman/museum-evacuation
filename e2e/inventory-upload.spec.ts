import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Inventory upload in chat", () => {
  test("demo button parses CSV and shows preview chip with priority counts", async ({ page }) => {
    await page.goto("/chat");

    await page.getByRole("button", { name: "Спробувати на демо" }).click();

    // Attached chip visible in input area
    const chip = page.locator("text=mfu-inventory.csv").first();
    await expect(chip).toBeVisible();

    // Priority counts visible (at least red and yellow groups)
    await expect(page.locator("text=/🔴 \\d+/").first()).toBeVisible();
    await expect(page.locator("text=/🟡 \\d+/").first()).toBeVisible();

    // Send button enabled even with empty text since inventory attached
    const sendBtn = page.getByTestId("send-button");
    await expect(sendBtn).toBeEnabled();
  });

  test("file input accepts CSV upload and shows correct totals", async ({ page }) => {
    await page.goto("/chat");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.join(__dirname, "..", "public", "demo", "mfu-inventory.csv")
    );

    await expect(page.locator("text=mfu-inventory.csv").first()).toBeVisible();
    // 8 items in demo file
    await expect(page.locator("text=/8 поз/")).toBeVisible();
  });

  test("XLSX upload works the same as CSV", async ({ page }) => {
    await page.goto("/chat");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.join(__dirname, "..", "public", "demo", "mfu-inventory.xlsx")
    );

    await expect(page.locator("text=mfu-inventory.xlsx").first()).toBeVisible();
    await expect(page.locator("text=/8 поз/")).toBeVisible();
  });
});
