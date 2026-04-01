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

  // Group consecutive table lines
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let lineIndex = 0;

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const rows = parseTableRows(tableBuffer);
    if (rows.length > 0) {
      const header = rows[0];
      const body = rows.slice(1);
      elements.push(
        <div key={`table-${lineIndex}`} className="my-3 overflow-x-auto rounded-lg border border-border">
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

    // Detect table lines (start with |)
    if (line.trimStart().startsWith("|") && line.trimEnd().endsWith("|")) {
      tableBuffer.push(line);
      continue;
    }

    // Flush any buffered table
    flushTable();

    // Non-table line rendering
    const checkMatch = line.match(/^- \[ \] (.+)$/);
    if (checkMatch) {
      const idx = checkboxIndex++;
      elements.push(
        <label key={i} className="flex items-start gap-2.5 py-1 cursor-pointer group" role="listitem">
          <input type="checkbox" checked={!!checked[idx]} onChange={() => toggleCheck(idx)} className="mt-0.5 h-4 w-4 rounded border-border-strong accent-accent flex-shrink-0" aria-label={checkMatch[1]} />
          <span className={`${checked[idx] ? "line-through text-text-muted" : ""} transition-colors`}><SmartText text={checkMatch[1]} /></span>
        </label>
      ); continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="font-display text-base font-bold mt-5 mb-1.5 text-text">{line.replace("## ", "")}</h2>); continue;
    }
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="font-medium text-sm mt-4 mb-1 text-text-secondary">{line.replace("### ", "")}</h3>); continue;
    }
    if (line.startsWith("> ⚠️")) {
      elements.push(<div key={i} className="mt-4 px-3 py-2 rounded-lg bg-warning-soft text-warning-text text-xs border border-warning/20">{line.replace("> ", "")}</div>); continue;
    }
    if (line.startsWith("> ")) {
      elements.push(<blockquote key={i} className="border-l-2 border-accent pl-3 my-2 text-text-secondary italic text-sm">{line.replace("> ", "")}</blockquote>); continue;
    }
    if (line.startsWith("**Джерело") || line.match(/^Джерело:/) || line.match(/^\*Джерело/)) {
      const clean = line.replace(/\*\*/g, "").replace(/^\*|\*$/g, "");
      elements.push(<p key={i} className="text-xs mt-2 font-mono" data-testid="citation"><SmartText text={clean} /></p>); continue;
    }
    if (line.startsWith("---")) {
      elements.push(<hr key={i} className="my-4 border-border" />); continue;
    }
    if (line.startsWith("- ❌") || line.startsWith("- ✗")) {
      elements.push(<p key={i} className="text-danger-text py-0.5 text-sm"><SmartText text={line.replace("- ", "")} /></p>); continue;
    }
    if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.+?)\*\*\s*—?\s*(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-1.5 py-0.5 text-sm">
            <span className="font-semibold flex-shrink-0"><SmartText text={match[1]} /></span>
            {match[2] && <span className="text-text-secondary">— <SmartText text={match[2]} /></span>}
          </div>
        ); continue;
      }
    }
    if (line.startsWith("- ")) {
      elements.push(<p key={i} className="text-sm py-0.5 pl-3 text-text-secondary"><SmartText text={line} /></p>); continue;
    }
    if (line.match(/^\d+\.\s/)) {
      elements.push(<p key={i} className="text-sm py-0.5 pl-3"><SmartText text={line} /></p>); continue;
    }
    if (line.trim() === "") { elements.push(<div key={i} className="h-1.5" />); continue; }
    elements.push(<p key={i} className="py-0.5 text-sm"><SmartText text={line} /></p>);
  }

  // Flush remaining table
  flushTable();

  return (
    <div className="space-y-0.5 text-sm leading-relaxed">
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
            <div className="py-10">
              <div className="text-center mb-8">
                <p className="font-display text-2xl font-semibold mb-2">Museum<span className="text-accent">AID</span></p>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  {scenario === "emergency"
                    ? "Опишіть ситуацію: тип колекції, кількість предметів, час, доступний транспорт"
                    : scenario === "planned"
                    ? "Опишіть план: колекція, терміни, ресурси, пункт призначення"
                    : "Задайте питання про евакуацію, пакування або документи"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {(scenario === "emergency" ? [
                  { text: "200 картин олією, 300 кераміки, 12 годин, 1 мікроавтобус", icon: "🚨" },
                  { text: "Що вивозити першим?", icon: "🔴" },
                  { text: "Як швидко запакувати ікони?", icon: "📦" },
                  { text: "Які документи оформити терміново?", icon: "📋" },
                ] : scenario === "planned" ? [
                  { text: "Плануємо евакуацію 5000 предметів за 2 тижні", icon: "📅" },
                  { text: "Які документи потрібні для міжобласної евакуації?", icon: "📄" },
                  { text: "Як організувати пакування текстилю?", icon: "🧵" },
                  { text: "Хто фінансує евакуацію?", icon: "💰" },
                ] : [
                  { text: "Як запакувати ікону XVIII століття?", icon: "⛪" },
                  { text: "Хто приймає рішення про евакуацію?", icon: "⚖️" },
                  { text: "Які документи потрібні?", icon: "📋" },
                  { text: "Музей у 30 км від фронту — евакуація обов'язкова?", icon: "🗺️" },
                  { text: "Як пакувати кераміку?", icon: "🏺" },
                  { text: "Що вивозити першим?", icon: "🔴" },
                ]).map((q) => (
                  <button
                    key={q.text}
                    onClick={() => sendMessage(q.text)}
                    className="flex items-start gap-2.5 text-left p-3 rounded-xl border border-border bg-bg-elevated hover:border-accent/30 hover:bg-surface-hover transition-all text-sm group"
                  >
                    <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">{q.icon}</span>
                    <span className="text-text-secondary group-hover:text-text transition-colors">{q.text}</span>
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
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse-dot 1.2s infinite 0s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse-dot 1.2s infinite 0.2s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse-dot 1.2s infinite 0.4s" }} />
                  </span>
                  <span>Оркестратор аналізує запит...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-bg/80 backdrop-blur-md p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Опишіть ситуацію або задайте питання..."
            aria-label="Повідомлення"
            data-testid="chat-input"
            className="flex-1 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            aria-label="Надіслати повідомлення"
            data-testid="send-button"
            className="px-4 py-2.5 rounded-xl bg-accent text-accent-text font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
