"use client";

import { useParams } from "next/navigation";
import { checklistTypes } from "@/lib/checklists-data";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ChecklistDetailPage() {
  const params = useParams();
  const typeId = params.type as string;
  const checklist = checklistTypes.find((c) => c.id === typeId);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!checklist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-text-muted">Чекліст не знайдено</p>
        <Link href="/checklists" className="text-accent hover:underline text-sm">
          ← Всі чеклісти
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
      <Link href="/checklists" className="text-xs text-accent hover:underline mb-6 inline-flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Всі чеклісти
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl" aria-hidden="true">{checklist.icon}</span>
          <h1 className="font-display text-2xl font-bold">{checklist.title}</h1>
        </div>
        <p className="text-text-secondary text-sm mb-1 ml-12">{checklist.description}</p>
        <p className="text-[11px] text-accent/80 font-mono mb-6 ml-12" data-testid="checklist-source">
          Джерело: {checklist.source}
        </p>
      </motion.div>

      {/* Progress */}
      <div className="mb-6 p-4 rounded-xl border border-border bg-bg-elevated">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary">Прогрес</span>
          <span className="font-mono text-sm font-medium" data-testid="progress-text">
            {completedCount} / {totalCount}
          </span>
        </div>
        <div
          className="w-full h-2 bg-surface rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Прогрес чеклісту"
          data-testid="progress-bar"
        >
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            data-testid="progress-fill"
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2" data-testid="checklist-items" role="list">
        {checklist.items.map((item, i) => (
          <motion.label
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
              checked[item.id]
                ? "bg-accent-soft border-accent/30"
                : "bg-bg-elevated border-border hover:border-border-strong"
            }`}
            role="listitem"
          >
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggleItem(item.id)}
              className="mt-0.5 h-[18px] w-[18px] rounded border-border-strong accent-accent flex-shrink-0"
              aria-label={item.text}
              data-testid={`checkbox-${item.id}`}
            />
            <div>
              <span className={`text-sm ${checked[item.id] ? "line-through text-text-muted" : ""} transition-colors`}>
                {item.text}
              </span>
              {item.warning && (
                <p className="text-xs text-danger-text mt-1.5 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {item.warning}
                </p>
              )}
            </div>
          </motion.label>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => window.print()}
          aria-label="Друкувати чекліст"
          data-testid="print-button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-bg-elevated hover:bg-surface-hover text-sm transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Друкувати
        </button>
        <button
          onClick={() => {
            const text = checklist.items
              .map((item, i) => `${checked[item.id] ? "✅" : "☐"} ${i + 1}. ${item.text}`)
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-bg-elevated hover:bg-surface-hover text-sm transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Експортувати
        </button>
      </div>
    </div>
  );
}
