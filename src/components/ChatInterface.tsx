"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AgentPipeline } from "./AgentPipeline";
import { SmartText } from "./SmartText";
import {
  parseInventoryFile,
  inventoryToPromptContext,
  type ParsedInventory,
} from "@/lib/inventory";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  displayText?: string;
  inventory?: ParsedInventory;
}

const PRIORITY_STYLES: Record<"red" | "yellow" | "green", string> = {
  red: "bg-red-100 text-red-900 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700",
  yellow:
    "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700",
  green:
    "bg-green-100 text-green-900 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700",
};

function InventoryPreview({ inv }: { inv: ParsedInventory }) {
  const topMaterials = Object.entries(inv.materialsSummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="mb-2 border border-accent/40 bg-bg/60 rounded-sm">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
          </svg>
          <span className="text-xs font-semibold truncate">{inv.sourceFileName}</span>
        </div>
        <span className="text-[10px] font-mono text-text-muted whitespace-nowrap">
          {inv.totalItems} позицій · {inv.totalUnits} од.
        </span>
      </div>
      <div className="px-3 py-2 flex flex-wrap gap-1.5 border-b border-border">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_STYLES.red}`}>
          🔴 {inv.prioritized.red}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_STYLES.yellow}`}>
          🟡 {inv.prioritized.yellow}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_STYLES.green}`}>
          🟢 {inv.prioritized.green}
        </span>
      </div>
      {topMaterials.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
            Матеріали
          </div>
          <div className="flex flex-wrap gap-1">
            {topMaterials.map(([mat, count]) => (
              <span
                key={mat}
                className="text-[10px] px-1.5 py-0.5 bg-surface border border-border rounded text-text-secondary"
              >
                {mat} · {count}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="max-h-48 overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-surface/60 sticky top-0">
            <tr className="text-text-muted">
              <th className="px-2 py-1 text-left font-semibold">#</th>
              <th className="px-2 py-1 text-left font-semibold">Назва</th>
              <th className="px-2 py-1 text-left font-semibold">Матеріал</th>
              <th className="px-2 py-1 text-center font-semibold">Пріор.</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.slice(0, 20).map((it, i) => (
              <tr key={i} className={i % 2 === 1 ? "bg-surface/30" : ""}>
                <td className="px-2 py-1 font-mono text-text-muted">
                  {it.id || i + 1}
                </td>
                <td className="px-2 py-1 text-text truncate max-w-[180px]" title={it.name}>
                  {it.name}
                </td>
                <td className="px-2 py-1 text-text-secondary truncate max-w-[140px]">
                  {it.material || "—"}
                </td>
                <td className="px-2 py-1 text-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      it.priority === "red"
                        ? "bg-red-500"
                        : it.priority === "yellow"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    aria-label={it.priority}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inv.items.length > 20 && (
          <div className="px-2 py-1 text-[10px] text-text-muted text-center">
            +{inv.items.length - 20} ще…
          </div>
        )}
      </div>
    </div>
  );
}

function parseActiveAgent(content: string): { active: string | null; completed: string[] } {
  const completed: string[] = [];
  let active: string | null = null;

  if (content.length > 0) {
    completed.push("orchestrator");
  }
  if (content.includes("ТРІАЖ")) {
    active = "triage";
    completed.push("orchestrator");
  }
  if (content.includes("ПАКУВАННЯ")) {
    if (active === "triage") completed.push("triage");
    active = "packing";
  }
  if (content.includes("ЛОГІСТИКА")) {
    if (active === "packing") completed.push("packing");
    if (!completed.includes("triage")) completed.push("triage");
    active = "logistics";
  }
  if (content.includes("довідковий характер")) {
    if (active) completed.push(active);
    active = null;
  }

  return { active, completed: [...new Set(completed)] };
}

function parseTableRows(lines: string[]): string[][] {
  return lines
    .filter((l) => !l.match(/^\|[\s-:|]+\|$/)) // skip separator rows
    .map((l) =>
      l.split("|").slice(1, -1).map((cell) => cell.trim())
    );
}

function RenderedMarkdown({ content }: { content: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const toggleCheck = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const lines = content.split("\n");
  let checkboxIndex = 0;
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let codeBuffer: string[] | null = null;
  let lineIndex = 0;

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const rows = parseTableRows(tableBuffer);
    if (rows.length > 0) {
      const header = rows[0];
      const body = rows.slice(1);
      elements.push(
        <div key={`table-${lineIndex}`} className="my-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface">
                {header.map((cell, ci) => (
                  <th key={ci} className="px-3 py-2 text-left font-semibold text-text-secondary border-b border-border whitespace-nowrap">
                    <SmartText text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? "bg-surface/50" : ""}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 border-b border-border text-text-secondary">
                      <SmartText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    lineIndex = i;

    // ── Code block toggle ──
    if (line.trimStart().startsWith("```")) {
      if (codeBuffer === null) {
        codeBuffer = [];
      } else {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-3 px-4 py-3 rounded-lg bg-surface border border-border text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed"
          >
            {codeBuffer.join("\n")}
          </pre>
        );
        codeBuffer = null;
      }
      continue;
    }
    if (codeBuffer !== null) {
      codeBuffer.push(line);
      continue;
    }

    // ── Table lines ──
    if (line.trimStart().startsWith("|") && line.trimEnd().endsWith("|")) {
      tableBuffer.push(line);
      continue;
    }
    flushTable();

    // ── H1 ──
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="font-display text-lg font-bold mt-1 mb-3 pb-2 border-b border-border text-text">
          <SmartText text={line.slice(2)} />
        </h1>
      );
      continue;
    }

    // ── H2 — section header ──
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-[13px] font-bold tracking-wide uppercase mt-6 mb-2 pt-4 border-t border-border text-text">
          <SmartText text={line.slice(3)} />
        </h2>
      );
      continue;
    }

    // ── H3 ──
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-semibold text-sm mt-4 mb-1 text-text-secondary">
          <SmartText text={line.slice(4)} />
        </h3>
      );
      continue;
    }

    // ── Standalone bold line → sub-header (e.g. **Етап 1: …**) ──
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      const inner = line.trim().slice(2, -2);
      elements.push(
        <p key={i} className="font-semibold text-sm mt-4 mb-1 text-text">
          <SmartText text={inner} />
        </p>
      );
      continue;
    }

    // ── Checkbox ──
    const checkMatch = line.match(/^- \[ \] (.+)$/);
    if (checkMatch) {
      const idx = checkboxIndex++;
      elements.push(
        <label key={i} className="flex items-start gap-2.5 py-1.5 cursor-pointer group" role="listitem">
          <input
            type="checkbox"
            checked={!!checked[idx]}
            onChange={() => toggleCheck(idx)}
            className="mt-0.5 h-4 w-4 rounded border-border-strong accent-accent flex-shrink-0"
            aria-label={checkMatch[1]}
          />
          <span className={`text-sm ${checked[idx] ? "line-through text-text-muted" : ""} transition-colors`}>
            <SmartText text={checkMatch[1]} />
          </span>
        </label>
      );
      continue;
    }

    // ── Warning blockquote ──
    if (line.startsWith("> ⚠️")) {
      elements.push(
        <div key={i} className="mt-4 mb-2 px-3 py-2.5 rounded-lg bg-warning-soft text-warning-text text-xs border border-warning/20 leading-relaxed">
          <SmartText text={line.slice(2)} />
        </div>
      );
      continue;
    }

    // ── Blockquote ──
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-accent pl-3 my-2 text-text-secondary italic text-sm">
          <SmartText text={line.slice(2)} />
        </blockquote>
      );
      continue;
    }

    // ── Citation / source line ──
    if (/^(\*{0,2})Джерело/.test(line)) {
      const clean = line.replace(/\*\*/g, "").replace(/^\*|\*$/g, "");
      elements.push(
        <div
          key={i}
          className="mt-2 mb-1 px-3 py-2 rounded-md bg-surface/60 text-[11px] font-mono text-text-muted border-l-2 border-accent/30"
          data-testid="citation"
        >
          <SmartText text={clean} />
        </div>
      );
      continue;
    }

    // ── Horizontal rule — section divider ──
    if (line.startsWith("---")) {
      elements.push(<hr key={i} className="my-5 border-border" />);
      continue;
    }

    // ── Danger list items ──
    if (line.startsWith("- ❌") || line.startsWith("- ✗")) {
      elements.push(
        <p key={i} className="text-danger-text py-0.5 pl-1 text-sm">
          <SmartText text={line.replace(/^- /, "")} />
        </p>
      );
      continue;
    }

    // ── Emoji-prefixed lines (✅, ❌, ✗, 🔴, etc.) ──
    if (/^[✅❌✗🔴🟡🟢⚠️]/.test(line.trim())) {
      elements.push(
        <p key={i} className="font-medium text-sm mt-2 mb-1 text-text">
          <SmartText text={line} />
        </p>
      );
      continue;
    }

    // ── Bold definition list: - **Term** — desc ──
    if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.+?)\*\*\s*—?\s*(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-1.5 py-1 pl-1 text-sm">
            <span className="font-semibold text-text flex-shrink-0">
              <SmartText text={match[1]} />
            </span>
            {match[2] && (
              <span className="text-text-secondary">
                — <SmartText text={match[2]} />
              </span>
            )}
          </div>
        );
        continue;
      }
    }

    // ── Dash/en-dash list items (- or –) ──
    if (/^[-–]\s/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2 py-0.5 pl-2 text-sm text-text-secondary">
          <span className="text-text-muted/60 flex-shrink-0 select-none">–</span>
          <span>
            <SmartText text={line.replace(/^[-–]\s+/, "")} />
          </span>
        </div>
      );
      continue;
    }

    // ── Numbered list ──
    const numMatch = line.match(/^(\d+)\.\s(.+)$/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-2.5 py-0.5 pl-1 text-sm">
          <span className="text-accent font-mono text-xs mt-[3px] flex-shrink-0 w-5 text-right select-none">
            {numMatch[1]}.
          </span>
          <span>
            <SmartText text={numMatch[2]} />
          </span>
        </div>
      );
      continue;
    }

    // ── Empty line ──
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // ── Default paragraph ──
    elements.push(
      <p key={i} className="py-0.5 text-sm">
        <SmartText text={line} />
      </p>
    );
  }

  flushTable();

  return (
    <div className="text-sm leading-relaxed">
      {elements}
    </div>
  );
}

export function ChatInterface({ scenario }: { scenario?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [attachedInventory, setAttachedInventory] =
    useState<ParsedInventory | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);
    setIsParsing(true);
    try {
      const parsed = await parseInventoryFile(file);
      setAttachedInventory(parsed);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Не вдалося прочитати файл.");
      setAttachedInventory(null);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const loadDemoFile = useCallback(async () => {
    setUploadError(null);
    setIsParsing(true);
    try {
      const res = await fetch("/demo/mfu-inventory.csv");
      if (!res.ok) throw new Error("Демо-файл недоступний.");
      const blob = await res.blob();
      const file = new File([blob], "mfu-inventory.csv", { type: "text/csv" });
      const parsed = await parseInventoryFile(file);
      setAttachedInventory(parsed);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Не вдалося завантажити демо.");
    } finally {
      setIsParsing(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { active: activeAgent, completed: completedAgents } = isStreaming
    ? parseActiveAgent(streamingContent)
    : { active: null, completed: [] };

  const sendMessage = useCallback(async (overrideText?: string) => {
    const messageText = (overrideText || input).trim();
    const inv = attachedInventory;
    if ((!messageText && !inv) || isStreaming) return;

    const textForUser = messageText || (inv
      ? "Проаналізуй інвентар: склади план евакуації — що вивозити першим, як пакувати, які документи потрібні."
      : "");

    const apiContent = inv
      ? `${inventoryToPromptContext(inv)}\n\n---\n\n${textForUser}`
      : textForUser;

    setInput("");
    setAttachedInventory(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: apiContent,
      displayText: textForUser,
      inventory: inv || undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent("");

    const assistantId = (Date.now() + 1).toString();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          scenario,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setStreamingContent(accumulated);
        }
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: accumulated },
        ]);
      }
    } catch {
      // Handle navigation-away gracefully
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [input, isStreaming, messages, scenario, attachedInventory]);

  const suggestions = scenario === "emergency" ? [
    "200 картин, 300 кераміки, 12 годин, 1 авто",
    "Що вивозити першим?",
    "Як швидко запакувати ікони?",
    "Які документи оформити терміново?",
  ] : scenario === "planned" ? [
    "Евакуація 5000 предметів за 2 тижні",
    "Документи для міжобласної евакуації",
    "Як організувати пакування текстилю?",
    "Хто фінансує евакуацію?",
  ] : [
    "Як запакувати ікону XVIII століття?",
    "Хто приймає рішення про евакуацію?",
    "Які документи потрібні?",
    "Музей у 30 км від фронту — евакуація обов'язкова?",
    "Як пакувати кераміку?",
    "Що вивозити першим?",
  ];

  return (
    <div className="flex flex-col h-full bg-bg-alt">
      {/* Agent Pipeline */}
      <AgentPipeline activeAgent={activeAgent} completedAgents={completedAgents} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" role="log" aria-live="polite">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-10">
              <div className="w-12 h-12 bg-accent flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
                </svg>
              </div>
              <p className="text-lg font-bold mb-1">
                {scenario === "emergency" ? "Екстрена евакуація" : scenario === "planned" ? "Планова евакуація" : "Чим допомогти?"}
              </p>
              <p className="text-xs text-text-muted max-w-sm text-center mb-10">
                {scenario === "emergency"
                  ? "Опишіть: тип колекції, кількість, час, транспорт"
                  : scenario === "planned"
                  ? "Опишіть: колекція, терміни, ресурси, пункт призначення"
                  : "Оберіть питання або напишіть своє"}
              </p>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="flex items-center gap-3 text-left px-4 py-3 border border-border bg-bg hover:border-text/30 transition-colors border-l-4 border-l-accent"
                  >
                    <span className="text-sm text-text-secondary leading-snug">{q}</span>
                  </button>
                ))}
              </div>

              {/* Inventory upload hint */}
              <div className="mt-8 w-full max-w-lg border border-dashed border-border px-4 py-3 text-center">
                <p className="text-xs text-text-muted mb-2">
                  Або завантажте інвентар (CSV / XLSX) — система розпізнає колонки,
                  пріоритезує предмети та підготує план.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-medium border border-border hover:bg-surface-hover"
                  >
                    Обрати файл
                  </button>
                  <button
                    onClick={loadDemoFile}
                    className="px-3 py-1.5 text-xs font-medium border border-border hover:bg-surface-hover text-text-secondary"
                  >
                    Спробувати на демо
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] ${
                  msg.role === "user"
                    ? "bg-accent-soft border border-accent/30 px-4 py-2.5"
                    : "bg-bg border border-border px-5 py-4"
                }`}
                data-testid={msg.role === "assistant" ? "assistant-message" : "user-message"}
              >
                {msg.role === "assistant" ? (
                  <RenderedMarkdown content={msg.content} />
                ) : (
                  <>
                    {msg.inventory && <InventoryPreview inv={msg.inventory} />}
                    {(msg.displayText || msg.content) && (
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.displayText ?? msg.content}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[88%] bg-bg border border-border px-5 py-4" data-testid="assistant-message">
                <RenderedMarkdown content={streamingContent} />
              </div>
            </div>
          )}

          {isStreaming && !streamingContent && (
            <div className="flex justify-start">
              <div className="bg-bg border border-border px-5 py-4" aria-label="Завантаження відповіді">
                <div className="flex items-center gap-3 text-text-muted text-sm">
                  <div className="w-5 h-5 rounded-full border-2 border-border border-t-text animate-spin" />
                  <span>Оркестратор аналізує запит...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input + Export */}
      <div className="border-t border-border bg-bg p-3 sm:p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="max-w-3xl mx-auto"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            aria-label="Завантажити файл інвентаря"
          />

          {attachedInventory && (
            <div className="mb-2 flex items-center justify-between gap-2 px-3 py-2 border border-accent/40 bg-accent-soft/30">
              <div className="flex items-center gap-2 min-w-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-xs font-medium truncate">
                  {attachedInventory.sourceFileName}
                </span>
                <span className="text-[10px] font-mono text-text-muted whitespace-nowrap">
                  · {attachedInventory.totalItems} поз. · 🔴 {attachedInventory.prioritized.red} · 🟡 {attachedInventory.prioritized.yellow} · 🟢 {attachedInventory.prioritized.green}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachedInventory(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                aria-label="Прибрати файл"
                className="flex-shrink-0 text-text-muted hover:text-text text-sm leading-none"
              >
                ✕
              </button>
            </div>
          )}

          {uploadError && (
            <div className="mb-2 px-3 py-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              {uploadError}
            </div>
          )}

          <div className="flex items-end gap-2 border border-border bg-bg p-1.5 focus-within:border-text/40">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming || isParsing}
              aria-label="Прикріпити інвентар (CSV/XLSX)"
              title="Прикріпити інвентар (CSV/XLSX)"
              className="flex-shrink-0 p-2 text-text-muted hover:text-text disabled:opacity-30"
            >
              {isParsing ? (
                <div className="w-4 h-4 rounded-full border-2 border-text/30 border-t-text animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              )}
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={attachedInventory ? "Уточніть запит або надішліть як є..." : "Опишіть ситуацію або задайте питання..."}
              aria-label="Повідомлення"
              data-testid="chat-input"
              className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !attachedInventory) || isStreaming}
              aria-label="Надіслати повідомлення"
              data-testid="send-button"
              className="flex-shrink-0 px-4 py-2 bg-accent text-accent-text font-bold text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
            >
              {isStreaming ? (
                <div className="w-4 h-4 rounded-full border-2 border-text/30 border-t-text animate-spin" />
              ) : (
                "Надіслати"
              )}
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <p className="text-[10px] text-text-muted">
              MuseumAID може помилятись. Перевіряйте за першоджерелами.
            </p>
            {messages.length > 0 && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const text = messages.map((m) =>
                      `${m.role === "user" ? "ЗАПИТ" : "MUSEUMAID"}:\n${m.content}`
                    ).join("\n\n---\n\n");
                    const blob = new Blob([`MuseumAID — Діалог\n${new Date().toLocaleString("uk-UA")}\n\n${"=".repeat(50)}\n\n${text}\n`], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `museumaid-chat-${new Date().toISOString().slice(0, 10)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2.5 py-1 border border-border text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors flex items-center gap-1.5"
                  title="Завантажити як текст"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  .txt
                </button>
                <button
                  onClick={() => {
                    const blocks = messages.map((m) => {
                      if (m.role === "user") {
                        return "<div class='q'><span class='ql'>ЗАПИТ</span>" + m.content.replace(/</g, "&lt;") + "</div>";
                      }
                      const html = m.content
                        .replace(/</g, "&lt;")
                        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
                        .replace(/^- \[ \] (.+)$/gm, "<div class='ch'>☐ $1</div>")
                        .replace(/^---$/gm, "<hr/>")
                        .replace(/\n/g, "<br/>");
                      return "<div class='a'>" + html + "</div>";
                    }).join("");
                    const date = new Date().toLocaleString("uk-UA");
                    const doc = "<!DOCTYPE html><html lang='uk'><head><meta charset='UTF-8'><title>MuseumAID Діалог</title><style>@page{margin:18mm;size:A4}body{font-family:'e-Ukraine',system-ui,sans-serif;font-size:12px;line-height:1.7;color:#1a1a1a;max-width:170mm}h1{font-size:16px;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:4px}h2{font-size:14px;margin:18px 0 6px;border-bottom:1px solid #e0e0e0;padding-bottom:4px}h3{font-size:12px;color:#4a4a4a;margin:12px 0 4px}.q{background:#FFF9CC;border-left:4px solid #FFE600;padding:10px 14px;margin:16px 0}.ql{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;color:#1a1a1a;margin-bottom:4px;text-transform:uppercase}.a{margin:12px 0}hr{border:none;border-top:1px solid #e0e0e0;margin:14px 0}.ch{padding:2px 0 2px 16px}.f{margin-top:28px;font-size:9px;color:#8a8a8a;border-top:1px solid #e0e0e0;padding-top:8px;text-align:center}</style></head><body><h1>MuseumAID — Діалог</h1><p style='font-size:10px;color:#8a8a8a'>" + date + "</p>" + blocks + "<div class='f'>Згенеровано MuseumAID · Довідковий характер — не замінює НПА</div></body></html>";
                    const w = window.open("", "_blank");
                    if (!w) return;
                    w.document.write(doc);
                    w.document.close();
                    setTimeout(() => w.print(), 300);
                  }}
                  className="px-2.5 py-1 border border-border text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors flex items-center gap-1.5"
                  title="Зберегти як PDF"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  PDF
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
