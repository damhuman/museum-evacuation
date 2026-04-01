"use client";

import Link from "next/link";
import { documentTemplates } from "@/lib/documents-data";

export default function DocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">
          КМУ №229
        </p>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-text mb-1">
          Шаблони документів
        </h1>
        <div className="w-12 h-1 bg-accent mb-4" />
        <p className="text-sm text-text-secondary mb-8">
          Нормативно обґрунтовані шаблони для оформлення евакуації. Заповніть
          поля — отримайте готовий документ.
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        data-testid="document-templates"
      >
        {documentTemplates.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            data-testid={`document-${doc.id}`}
            className="group block p-5 rounded border border-border bg-white hover:border-text-muted"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {doc.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-sm text-text group-hover:text-text">
                  {doc.title}
                </h2>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {doc.description}
                </p>
                <span className="inline-block mt-2 text-[11px] font-mono text-text-muted bg-bg-alt px-2 py-0.5 rounded-sm border border-border">
                  {doc.source}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
