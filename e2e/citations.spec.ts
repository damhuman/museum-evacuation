import { test, expect } from "@playwright/test";

const domainQuestions = [
  "Хто приймає рішення про евакуацію?",
  "Які документи потрібні для евакуації?",
  "Хто фінансує евакуацію?",
  "Музей у 30 км від фронту — евакуація обов'язкова?",
  "Як запакувати ікону XVIII століття?",
];

const validSources = [
  "КМУ",
  "МКІП",
  "ICCROM",
  "ЗУ",
  "Інструкція",
  "Мінкульт",
  "№229",
  "№424",
  "№249",
  "№580",
  "№841",
  "First Aid",
  "Джерело",
];

test.describe("10. CITATIONS INTEGRITY", () => {
  for (const question of domainQuestions) {
    test(`Response to "${question}" contains valid citations`, async ({
      page,
    }) => {
      await page.goto("/chat");

      // Send the question
      await page.getByTestId("chat-input").fill(question);
      await page.getByTestId("send-button").click();

      // Wait for full response (disclaimer at end = response complete)
      const assistantMessage = page.getByTestId("assistant-message").first();
      await expect(assistantMessage).toContainText("довідковий характер", {
        timeout: 60000,
      });

      const text = (await assistantMessage.textContent()) || "";

      // Every response must contain at least one citation source
      const hasCitation = validSources.some((source) =>
        text.includes(source)
      );
      expect(hasCitation).toBe(true);

      // Verify no hallucinated document numbers
      const docReferences = text.match(/№\d+/g) || [];
      const knownDocs = ["229", "424", "249", "580", "841", "1147", "376"];
      for (const ref of docReferences) {
        const num = ref.replace("№", "");
        expect(knownDocs).toContain(num);
      }
    });
  }
});
