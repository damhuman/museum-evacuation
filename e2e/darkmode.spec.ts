import { test, expect } from "@playwright/test";

test.describe("7. DARK MODE", () => {
  test("Toggle dark mode and verify all pages render correctly", async ({
    page,
  }) => {
    await page.goto("/");

    // Toggle dark mode
    await page.getByTestId("theme-toggle").click();

    // Verify dark class is on html element
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Verify text is visible (hero content)
    await expect(page.getByText("Евакуація музейних")).toBeVisible();

    // Navigate to chat and verify
    await page.goto("/chat");
    await expect(page.getByTestId("chat-input")).toBeVisible();

    // Navigate to checklists and verify
    await page.goto("/checklists");
    await expect(page.getByTestId("checklist-types")).toBeVisible();
    const checklistLinks = page.getByTestId("checklist-types").locator("a");
    await expect(checklistLinks.first()).toBeVisible();

    // Navigate to documents and verify
    await page.goto("/documents");
    await expect(page.getByTestId("document-templates")).toBeVisible();

    // Toggle back to light mode
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
