import { test, expect } from "@playwright/test";

test.describe("2. SCENARIO FLOW: EMERGENCY", () => {
  test("Emergency scenario flow with streaming response", async ({ page }) => {
    await page.goto("/");

    // Click emergency card
    await page.getByTestId("scenario-emergency").click();
    await expect(page).toHaveURL(/\/chat\?scenario=emergency/);

    // Verify chat input is visible
    const input = page.getByTestId("chat-input");
    await expect(input).toBeVisible();

    // Send emergency message
    await input.fill(
      "Маємо 200 картин олією та 300 кераміки, є 12 годин і 1 мікроавтобус"
    );
    await page.getByTestId("send-button").click();

    // Wait for streaming response to complete (disclaimer at end)
    const assistantMessage = page.getByTestId("assistant-message").first();
    await expect(assistantMessage).toContainText("довідковий характер", { timeout: 60000 });

    const text = await assistantMessage.textContent();

    // Verify response contains priority indication (LLM may use different words)
    expect(text).toMatch(/пріоритет|першочерг|негайно|червоний|🔴/i);

    // Verify source citations
    expect(text).toMatch(/КМУ|МКІП|ICCROM/);

    // Verify checklist items render with checkboxes (if LLM generated "- [ ]" items)
    const checkboxes = assistantMessage.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      // Click a checkbox and verify it toggles
      const firstCheckbox = checkboxes.first();
      await expect(firstCheckbox).not.toBeChecked();
      await firstCheckbox.check();
      await expect(firstCheckbox).toBeChecked();
    }

    // Verify response has actionable structure (numbered/bulleted items)
    expect(text).toMatch(/\d\.|•|✅|☐|пріоритет/i);
  });
});
