"use client";

import Link from "next/link";
import { checklistTypes } from "@/lib/checklists-data";

export default function ChecklistsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">
          ICCROM / MKIP №424
        </p>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-text mb-1">
          ЧЕКЛІСТИ ПАКУВАННЯ
        </h1>
        <div className="w-12 h-1 bg-accent mb-4" />
        <p className="text-text-secondary text-sm mb-8">
          Покрокові інструкції для безпечного пакування музейних предметів.
          Базовий принцип: м&#39;який шар &rarr; захисний шар &rarr; жорсткий контейнер.
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        data-testid="checklist-types"
      >
        {checklistTypes.map((cl) => (
          <Link
            key={cl.id}
            href={`/checklists/${cl.id}`}
            data-testid={`checklist-${cl.id}`}
            className="block p-5 border border-border bg-bg"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {cl.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-base text-text">
                  {cl.title}
                </h2>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {cl.description}
                </p>
                <span className="inline-block mt-3 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-accent text-accent-text">
                  {cl.items.length} кроків
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
