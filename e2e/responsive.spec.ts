import { test, expect } from "@playwright/test";

test.describe("6. RESPONSIVE", () => {
  test("Mobile viewport (375px) — all pages usable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // Home page
    await page.goto("/");
    await expect(page.getByTestId("scenario-emergency")).toBeVisible();
    await expect(page.getByTestId("scenario-planned")).toBeVisible();
    await expect(page.getByTestId("scenario-consultation")).toBeVisible();

    // Chat page
    await page.goto("/chat");
    await expect(page.getByTestId("chat-input")).toBeVisible();
    await expect(page.getByTestId("send-button")).toBeVisible();

    // Checklists
    await page.goto("/checklists");
    await expect(page.getByTestId("checklist-types")).toBeVisible();

    // Documents
    await page.goto("/documents");
    await expect(page.getByTestId("document-templates")).toBeVisible();
  });

  test("Tablet viewport (768px) — all pages usable", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto("/");
    await expect(page.getByTestId("scenario-cards")).toBeVisible();

    await page.goto("/checklists");
    await expect(page.getByTestId("checklist-types")).toBeVisible();

    await page.goto("/documents");
    await expect(page.getByTestId("document-templates")).toBeVisible();
  });
});
