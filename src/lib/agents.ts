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

  for (let i = 0; i < agents.length; i++) {
    const agentName = agents[i];
    const systemPrompt = loadPrompt(agentName) + context;

    if (showHeaders) {
      if (i > 0) yield "\n\n---\n\n";
      yield AGENT_HEADERS[agentName];
    }

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
        yield event.delta.text;
      }
    }
  }

  yield "\n\n---\n\n> ⚠️ Інформація має довідковий характер і не замінює нормативно-правові акти.";
}
