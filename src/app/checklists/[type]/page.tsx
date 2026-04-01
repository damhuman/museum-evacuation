"use client";

import { useParams } from "next/navigation";
import { checklistTypes } from "@/lib/checklists-data";
import { useState } from "react";
import Link from "next/link";

export default function ChecklistDetailPage() {
  const params = useParams();
  const typeId = params.type as string;
  const checklist = checklistTypes.find((c) => c.id === typeId);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!checklist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-text-muted">Чекліст не знайдено</p>
        <Link href="/checklists" className="text-accent-text underline text-sm">
          &larr; Всі чеклісти
        </Link>
      </div>
    );
  }

  const toggleItem = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
      {/* Breadcrumbs */}
      <nav className="text-xs text-text-muted mb-6 flex items-center gap-1" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">
          Головна
        </Link>
        <span>&gt;</span>
        <Link href="/checklists" className="hover:underline">
          Чеклісти
        </Link>
        <span>&gt;</span>
        <span className="text-text font-bold">{checklist.title}</span>
      </nav>

      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl" aria-hidden="true">{checklist.icon}</span>
          <h1 className="text-xl font-bold uppercase tracking-widest text-text">
            {checklist.title}
          </h1>
        </div>
        <div className="w-12 h-1 bg-accent mb-3 ml-12" />
        <p className="text-text-secondary text-sm mb-1 ml-12">{checklist.description}</p>
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mb-6 ml-12" data-testid="checklist-source">
          Джерело: {checklist.source}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 p-4 border border-border bg-bg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Прогрес</span>
          <span className="text-sm font-bold text-text" data-testid="progress-text">
            {completedCount} / {totalCount}
          </span>
        </div>
        <div
          className="w-full h-2 bg-bg-alt overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Прогрес чеклісту"
          data-testid="progress-bar"
        >
          <div
            className="h-full bg-accent"
            style={{ width: `${progress}%` }}
            data-testid="progress-fill"
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2" data-testid="checklist-items" role="list">
        {checklist.items.map((item) => (
          <label
            key={item.id}
            className={`flex items-start gap-3 p-4 border cursor-pointer ${
              checked[item.id]
                ? "bg-accent-soft border-accent"
                : "bg-bg border-border"
            }`}
            role="listitem"
          >
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggleItem(item.id)}
              className="mt-0.5 h-[18px] w-[18px] border-border-strong accent-accent flex-shrink-0"
              aria-label={item.text}
              data-testid={`checkbox-${item.id}`}
            />
            <div>
              <span className={`text-sm ${checked[item.id] ? "line-through text-text-muted" : "text-text"}`}>
                {item.text}
              </span>
              {item.warning && (
                <p className="text-xs text-danger-text mt-1.5 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {item.warning}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => window.print()}
          aria-label="Друкувати чекліст"
          data-testid="print-button"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-bg text-sm font-bold uppercase tracking-wider text-text"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Друкувати
        </button>
        <button
          onClick={() => {
            const text = checklist.items
              .map((item, i) => `${checked[item.id] ? "\u2705" : "\u2610"} ${i + 1}. ${item.text}`)
              .join("\n");
            const blob = new Blob(
              [`${checklist.title}\n${checklist.source}\n\n${text}`],
              { type: "text/plain" }
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `checklist-${checklist.id}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          aria-label="Експортувати чекліст"
          data-testid="export-button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-text text-sm font-bold uppercase tracking-wider border border-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Експортувати
        </button>
      </div>
    </div>
  );
}
