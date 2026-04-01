import { classify } from "@/lib/orchestrator";
import { runAgents } from "@/lib/agents";

function buildQuestionnaireResponse(
  questions: string[],
  scenario: string
): string {
  const header = scenario === "emergency"
    ? "## ⚡ Потрібна додаткова інформація\n\nЩоб сформувати точний план евакуації, мені потрібно знати:\n\n"
    : "## 📋 Уточнення перед формуванням плану\n\nЩоб дати максимально корисні рекомендації, відповідте на кілька питань:\n\n";

  const numbered = questions.map((q, i) => `**${i + 1}.** ${q}`).join("\n\n");

  const footer = "\n\n---\n\n> 💡 Напишіть відповіді в одному повідомленні — система проаналізує і сформує персоналізований план.";

  return header + numbered + footer;
}

export async function POST(request: Request) {
  const { messages, scenario } = await request.json();

  // Step 1: Orchestrator classifies the query
  const classification = await classify(messages, scenario);

  const encoder = new TextEncoder();

  // Step 2: If orchestrator decides to ask questions — stream questionnaire
  if (classification.action === "ask_questions" && classification.questions?.length) {
    const questionnaire = buildQuestionnaireResponse(
      classification.questions,
      classification.scenario
    );

    const stream = new ReadableStream({
      start(controller) {
        // Stream word by word for natural feel
        const words = questionnaire.split(/(\s+)/);
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(words[i]));
            i++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 5);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  }

  // Step 3: Route to agents, streaming each one's output
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of runAgents(messages, classification)) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
