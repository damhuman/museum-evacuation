import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const client = new Anthropic();

function loadPrompt(name: string): string {
  return readFileSync(join(process.cwd(), "prompts", `${name}.md`), "utf-8");
}

export interface OrchestratorResult {
  scenario: "emergency" | "planned" | "consultation";
  intent: string;
  action: "ask_questions" | "route_agents";
  questions?: string[];
  agents: ("triage" | "packing" | "logistics")[];
  params: {
    collection_types?: string[];
    item_count?: Record<string, number>;
    time_available?: string;
    resources?: string[];
    location?: string;
    threat_level?: string;
    specific_question?: string;
  };
}

export async function classify(
  messages: { role: string; content: string }[],
  scenario?: string
): Promise<OrchestratorResult> {
  const prompt = loadPrompt("orchestrator");
  const scenarioHint = scenario
    ? `\n\n[Користувач обрав режим: ${scenario}. Враховуй це при класифікації.]`
    : "";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: prompt + scenarioHint,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text);
  } catch {
    return {
      scenario: (scenario as OrchestratorResult["scenario"]) || "consultation",
      intent: "загальна консультація",
      action: "route_agents",
      agents: ["triage"],
      params: {},
    };
  }
}
