import { test, expect } from "@playwright/test";

test.describe("3. SCENARIO FLOW: CONSULTATION", () => {
  test("Consultation about packing an icon", async ({ page }) => {
    await page.goto("/chat?scenario=consultation");

    const input = page.getByTestId("chat-input");
    await expect(input).toBeVisible();

    // Ask about packing an icon
    await input.fill("Як запакувати ікону XVIII століття?");
    await page.getByTestId("send-button").click();

    // Wait for full response (disclaimer at end)
    const assistantMessage = page.getByTestId("assistant-message").first();
    await expect(assistantMessage).toContainText("довідковий характер", { timeout: 60000 });

    const text = await assistantMessage.textContent();

    // Verify packing instructions are present (LLM may vary wording)
    expect(text).toMatch(/ікон|дерев|фарб|пакуван|обгорн|захист|лицьов/i);

    // Verify response has actionable structure (checkboxes or numbered steps)
    expect(text).toMatch(/\d\.|✅|☐|крок|етап|- \[/i);

    // Verify source citation is present
    expect(text).toMatch(/Джерело|МКІП|ICCROM/);
  });
});
