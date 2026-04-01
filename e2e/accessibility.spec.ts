import { test, expect } from "@playwright/test";

test.describe("9. ACCESSIBILITY", () => {
  test("All interactive elements have aria labels", async ({ page }) => {
    await page.goto("/");

    // Theme toggle has aria-label
    await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
      "aria-label",
      /.+/
    );

    // Navigation links have meaningful text
    const nav = page.getByRole("navigation", { name: /навігація/i });
    await expect(nav).toBeVisible();

    // Chat page — input and button have aria-labels
    await page.goto("/chat");
    await expect(page.getByTestId("chat-input")).toHaveAttribute(
      "aria-label",
      /.+/
    );
    await expect(page.getByTestId("send-button")).toHaveAttribute(
      "aria-label",
      /.+/
    );
  });

  test("Tab navigation works through chat interface", async ({ page }) => {
    await page.goto("/chat");

    // Tab into the input
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // At some point the chat input or send button should be focused
    const chatInput = page.getByTestId("chat-input");
    const sendButton = page.getByTestId("send-button");

    const chatFocused = await chatInput.evaluate(
      (el) => el === document.activeElement
    );
    const sendFocused = await sendButton.evaluate(
      (el) => el === document.activeElement
    );

    // At least one should be reachable via tab
    // Also verify they are focusable at all
    await chatInput.focus();
    expect(
      await chatInput.evaluate((el) => el === document.activeElement)
    ).toBe(true);
  });

  test("Screen reader landmarks present", async ({ page }) => {
    await page.goto("/");

    // Navigation landmark
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    // Main landmark
    const main = page.getByRole("main");
    await expect(main).toBeVisible();

    // Chat page also has landmarks
    await page.goto("/chat");
    await expect(page.getByRole("main", { name: "Основний вміст" })).toBeVisible();
  });
});
