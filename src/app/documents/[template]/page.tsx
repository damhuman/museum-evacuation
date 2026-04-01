"use client";

import { useParams } from "next/navigation";
import { documentTemplates } from "@/lib/documents-data";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DocumentDetailPage() {
  const params = useParams();
  const templateId = params.template as string;
  const template = documentTemplates.find((d) => d.id === templateId);
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-text-muted">Шаблон не знайдено</p>
        <Link href="/documents" className="text-accent hover:underline text-sm">← Всі документи</Link>
      </div>
    );
  }

  const updateField = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const renderPreview = () => {
    let text = template.template;
    for (const field of template.fields) {
      text = text.replace(
        new RegExp(`\\{${field.id}\\}`, "g"),
        values[field.id] || `[${field.label}]`
      );
    }
    return text;
  };

  const exportDoc = () => {
    const text = renderPreview();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>${template.title}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body {
      font-family: "Times New Roman", "DejaVu Serif", serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      white-space: pre-wrap;
      max-width: 170mm;
    }
    .header {
      text-align: center;
      font-size: 10px;
      color: #888;
      margin-bottom: 24px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="header">
    MuseumAID · ${template.title} · Джерело: ${template.source}
  </div>
  ${text}
  <div class="footer">
    Згенеровано MuseumAID · ${new Date().toLocaleDateString("uk-UA")} · Довідковий характер
  </div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const filledFields = template.fields.filter((f) => values[f.id]?.trim()).length;
  const totalFields = template.fields.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      <Link href="/documents" className="text-xs text-accent hover:underline mb-6 inline-flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Всі документи
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl" aria-hidden="true">{template.icon}</span>
          <h1 className="font-display text-2xl font-bold">{template.title}</h1>
        </div>
        <p className="text-text-secondary text-sm mb-1 ml-12">{template.description}</p>
        <p className="text-[11px] text-accent/80 font-mono mb-6 ml-12">Джерело: {template.source}</p>
      </motion.div>

      {/* Tabs (mobile) */}
      <div className="flex gap-1 mb-6 lg:hidden">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "form"
              ? "bg-accent-soft text-accent"
              : "text-text-muted hover:bg-surface-hover"
          }`}
        >
          Заповнити ({filledFields}/{totalFields})
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "preview"
              ? "bg-accent-soft text-accent"
              : "text-text-muted hover:bg-surface-hover"
          }`}
        >
          Перегляд
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className={`${activeTab === "preview" ? "hidden lg:block" : ""}`}>
          <h2 className="font-medium text-sm text-text-secondary mb-4">Заповніть поля</h2>
          <div className="space-y-4" data-testid="document-fields">
            {template.fields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-xs font-medium text-text-secondary mb-1.5">
                  {field.label}
                  {field.required && <span className="text-danger ml-0.5">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.id}
                    value={values[field.id] || ""}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    data-testid={`field-${field.id}`}
                    className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-shadow"
                  />
                ) : (
                  <input
                    id={field.id}
                    type={field.type}
                    value={values[field.id] || ""}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    data-testid={`field-${field.id}`}
                    className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-shadow"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={exportDoc}
            aria-label="Завантажити документ"
            data-testid="export-pdf-button"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-text font-medium text-sm hover:bg-accent-hover transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Зберегти як PDF
          </button>
        </div>

        {/* Preview */}
        <div className={`${activeTab === "form" ? "hidden lg:block" : ""}`}>
          <h2 className="font-medium text-sm text-text-secondary mb-4">Попередній перегляд</h2>
          <div
            className="p-6 rounded-xl border border-border bg-bg-elevated font-mono text-xs whitespace-pre-wrap leading-relaxed text-text-secondary"
            data-testid="document-preview"
          >
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
