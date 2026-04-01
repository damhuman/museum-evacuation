import { test, expect } from "@playwright/test";

test.describe("8. EDGE CASES", () => {
  test("Empty message — no crash, button disabled", async ({ page }) => {
    await page.goto("/chat");

    const sendBtn = page.getByTestId("send-button");
    const input = page.getByTestId("chat-input");

    // Button should be disabled when input is empty
    await expect(sendBtn).toBeDisabled();

    // Type spaces only
    await input.fill("   ");
    await expect(sendBtn).toBeDisabled();

    // No messages should appear
    const messages = page.getByTestId("assistant-message");
    expect(await messages.count()).toBe(0);
  });

  test("Very long message (1000+ chars) — handles gracefully", async ({
    page,
  }) => {
    await page.goto("/chat");

    const longMessage = "Потрібно евакуювати кераміку. ".repeat(50);
    await page.getByTestId("chat-input").fill(longMessage);
    await page.getByTestId("send-button").click();

    // Should get a response without errors (longer timeout for LLM)
    const assistantMessage = page.getByTestId("assistant-message").first();
    await expect(assistantMessage).toBeVisible({ timeout: 60000 });
    await expect(assistantMessage).not.toBeEmpty();

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test("Rapid-fire messages — no crash", async ({ page }) => {
    await page.goto("/chat");

    const input = page.getByTestId("chat-input");
    const sendBtn = page.getByTestId("send-button");

    // Send a message and wait for response
    await input.fill("Як пакувати кераміку?");
    await sendBtn.click();

    // Wait for response to fully stream
    const firstResponse = page.getByTestId("assistant-message").first();
    await expect(firstResponse).toContainText("довідковий", { timeout: 60000 });

    // Send another message
    await input.fill("А скульптуру?");
    await sendBtn.click();

    // Wait for second response
    await expect(page.getByTestId("assistant-message").nth(1)).toContainText("довідковий", { timeout: 60000 });

    // Page should still be functional
    await expect(page.getByTestId("chat-input")).toBeVisible();
    expect(await page.getByTestId("user-message").count()).toBeGreaterThanOrEqual(2);
  });

  test("Navigate away mid-stream — no errors in console", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/chat");

    await page.getByTestId("chat-input").fill("Як евакуювати картини?");
    await page.getByTestId("send-button").click();

    // Wait briefly for streaming to start
    await page.waitForTimeout(500);

    // Navigate away
    await page.goto("/checklists");
    await expect(page.getByTestId("checklist-types")).toBeVisible();

    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});
