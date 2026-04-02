import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { OrchestratorResult } from "./orchestrator";

const client = new Anthropic();

function loadPrompt(name: string): string {
  return readFileSync(join(process.cwd(), "prompts", `${name}.md`), "utf-8");
}

const AGENT_HEADERS: Record<string, string> = {
  triage: "## 🔴 ТРІАЖ — пріоритезація евакуації\n\n",
  packing: "## 📦 ПАКУВАННЯ — інструкції\n\n",
  logistics: "## 🚛 ЛОГІСТИКА — маршрути та документи\n\n",
};

function buildAgentContext(orchestratorResult: OrchestratorResult): string {
  const parts: string[] = [];
  const p = orchestratorResult.params;

  if (p.collection_types?.length) {
    parts.push(`Типи колекцій: ${p.collection_types.join(", ")}`);
  }
  if (p.item_count) {
    const items = Object.entries(p.item_count)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    parts.push(`Кількість: ${items}`);
  }
  if (p.time_available) parts.push(`Час: ${p.time_available}`);
  if (p.resources?.length) parts.push(`Ресурси: ${p.resources.join(", ")}`);
  if (p.location) parts.push(`Локація: ${p.location}`);
  if (p.threat_level) parts.push(`Рівень загрози: ${p.threat_level}`);
  if (p.specific_question) parts.push(`Питання: ${p.specific_question}`);

  if (parts.length === 0) return "";
  return `\n\n[ПАРАМЕТРИ ВІД ОРКЕСТРАТОРА]\n${parts.join("\n")}`;
}

export async function* runAgents(
  messages: { role: string; content: string }[],
  orchestratorResult: OrchestratorResult
): AsyncGenerator<string> {
  const agents = orchestratorResult.agents;
  const context = buildAgentContext(orchestratorResult);
  const showHeaders = agents.length > 1;
  const previousOutputs: string[] = [];

  for (let i = 0; i < agents.length; i++) {
    const agentName = agents[i];
    let systemPrompt = loadPrompt(agentName) + context;

    // Pass previous agents' output as context
    if (previousOutputs.length > 0) {
      systemPrompt +=
        "\n\n[ВІДПОВІДІ ПОПЕРЕДНІХ АГЕНТІВ — враховуй їх, не дублюй]\n" +
        previousOutputs.join("\n---\n");
    }

    if (showHeaders) {
      if (i > 0) yield "\n\n---\n\n";
      yield AGENT_HEADERS[agentName];
    }

    let agentOutput = "";

    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        agentOutput += event.delta.text;
        yield event.delta.text;
      }
    }

    previousOutputs.push(`[${agentName}]: ${agentOutput}`);
  }

  yield "\n\n---\n\n> ⚠️ Інформація має довідковий характер і не замінює нормативно-правові акти.";
}
