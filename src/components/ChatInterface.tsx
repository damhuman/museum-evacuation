"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AgentPipeline } from "./AgentPipeline";
import { SmartText } from "./SmartText";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (!messageText || isStreaming) return;

    setInput("");
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
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
  }, [input, isStreaming, messages, scenario]);

  return (
    <div className="flex flex-col h-full">
      {/* Agent Pipeline */}
      <AgentPipeline activeAgent={activeAgent} completedAgents={completedAgents} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" role="log" aria-live="polite">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-10">
              {/* Logo + context */}
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
                </svg>
              </div>
              <p className="font-display text-xl font-semibold mb-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {(scenario === "emergency" ? [
                  { text: "200 картин, 300 кераміки, 12 годин, 1 авто", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                  { text: "Що вивозити першим?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg> },
                  { text: "Як швидко запакувати ікони?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
                  { text: "Які документи оформити терміново?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                ] : scenario === "planned" ? [
                  { text: "Евакуація 5000 предметів за 2 тижні", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                  { text: "Документи для міжобласної евакуації", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                  { text: "Як організувати пакування текстилю?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
                  { text: "Хто фінансує евакуацію?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
                ] : [
                  { text: "Як запакувати ікону XVIII століття?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
                  { text: "Хто приймає рішення про евакуацію?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                  { text: "Які документи потрібні?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                  { text: "Музей у 30 км від фронту — евакуація обов'язкова?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                  { text: "Як пакувати кераміку?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
                  { text: "Що вивозити першим?", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg> },
                ]).map((q) => (
                  <button
                    key={q.text}
                    onClick={() => sendMessage(q.text)}
                    className="group flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border border-border bg-bg-elevated hover:border-accent/40 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-muted group-hover:text-accent group-hover:bg-accent-soft transition-colors">
                      {q.icon}
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-text transition-colors leading-snug">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] ${
                  msg.role === "user"
                    ? "bg-accent text-accent-text rounded-2xl rounded-br-md px-4 py-2.5"
                    : "bg-bg-elevated border border-border rounded-2xl rounded-bl-md px-5 py-4"
                }`}
                data-testid={msg.role === "assistant" ? "assistant-message" : "user-message"}
              >
                {msg.role === "assistant" ? (
                  <RenderedMarkdown content={msg.content} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingContent && (
            <div className="flex justify-start">
              <div
                className="max-w-[88%] bg-bg-elevated border border-border rounded-2xl rounded-bl-md px-5 py-4"
                data-testid="assistant-message"
              >
                <RenderedMarkdown content={streamingContent} />
              </div>
            </div>
          )}

          {isStreaming && !streamingContent && (
            <div className="flex justify-start">
              <div className="bg-bg-elevated border border-border rounded-2xl rounded-bl-md px-5 py-4" aria-label="Завантаження відповіді">
                <div className="flex items-center gap-3 text-text-muted text-sm">
                  <div className="w-5 h-5 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                  <span>Оркестратор аналізує запит...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input + Export */}
      <div className="border-t border-border bg-bg/80 backdrop-blur-md p-3 sm:p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="max-w-3xl mx-auto relative"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg-elevated p-1.5 focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent/50 transition-shadow">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Опишіть ситуацію або задайте питання..."
              aria-label="Повідомлення"
              data-testid="chat-input"
              className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label="Надіслати повідомлення"
              data-testid="send-button"
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent text-accent-text flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
            >
              {isStreaming ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
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
                  className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-text-secondary hover:text-accent hover:border-accent/40 hover:bg-accent-soft transition-all flex items-center gap-1.5"
                  title="Завантажити як текст"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Скачати .txt
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
                    const doc = "<!DOCTYPE html><html lang='uk'><head><meta charset='UTF-8'><title>MuseumAID Діалог</title><style>@page{margin:18mm;size:A4}body{font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.7;color:#1a1714;max-width:170mm}h1{font-size:16px;border-bottom:2px solid #B45309;padding-bottom:6px;margin-bottom:4px}h2{font-size:14px;color:#92400E;margin:18px 0 6px;border-bottom:1px solid #e8e2db;padding-bottom:4px}h3{font-size:12px;color:#5c554d;margin:12px 0 4px}.q{background:#f5f0eb;border-left:4px solid #B45309;padding:10px 14px;margin:16px 0;border-radius:0 8px 8px 0}.ql{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;color:#B45309;margin-bottom:4px;text-transform:uppercase}.a{margin:12px 0}hr{border:none;border-top:1px solid #e8e2db;margin:14px 0}.ch{padding:2px 0 2px 16px}.f{margin-top:28px;font-size:9px;color:#9c9488;border-top:1px solid #e8e2db;padding-top:8px;text-align:center}</style></head><body><h1>MuseumAID — Діалог</h1><p style='font-size:10px;color:#9c9488'>" + date + "</p>" + blocks + "<div class='f'>Згенеровано MuseumAID · Довідковий характер — не замінює НПА</div></body></html>";
                    const w = window.open("", "_blank");
                    if (!w) return;
                    w.document.write(doc);
                    w.document.close();
                    setTimeout(() => w.print(), 300);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-text-secondary hover:text-accent hover:border-accent/40 hover:bg-accent-soft transition-all flex items-center gap-1.5"
                  title="Зберегти як PDF"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Зберегти PDF
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
