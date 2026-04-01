"use client";

import { useParams } from "next/navigation";
import { documentTemplates } from "@/lib/documents-data";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function parseItemsData(raw: string): string[][] {
  if (!raw?.trim()) return [];
  return raw
    .trim()
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()));
}

function templateToHTML(
  templateText: string,
  values: Record<string, string>,
  fields: { id: string; label: string }[],
): string {
  // Fill all fields except items_data
  let text = templateText;
  for (const field of fields) {
    if (field.id === "items_data") continue;
    text = text.replace(
      new RegExp(`\\{${field.id}\\}`, "g"),
      values[field.id] || `[${field.label}]`,
    );
  }

  const lines = text.split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── ASCII table start ──
    if (trimmed.startsWith("┌")) {
      i++;
      // Header row
      let headerCells: string[] = [];
      if (i < lines.length && lines[i].trim().startsWith("│")) {
        headerCells = lines[i]
          .split("│")
          .filter(Boolean)
          .map((c) => c.trim());
        i++;
      }
      // Skip ├ separator
      if (i < lines.length && lines[i].trim().startsWith("├")) i++;

      const hasItemsPlaceholder =
        i < lines.length && lines[i].includes("{items_data}");

      html +=
        '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;"><thead><tr>';
      for (const cell of headerCells) {
        html += `<th style="border:1px solid #555;padding:5px 8px;text-align:left;font-weight:600;background:#f0f0f0;">${esc(cell)}</th>`;
      }
      html += "</tr></thead><tbody>";

      if (hasItemsPlaceholder) {
        const rows = parseItemsData(values["items_data"] || "");
        if (rows.length > 0) {
          rows.forEach((parts, ri) => {
            const [
              inv = "",
              name = "",
              author = "",
              material = "",
              count = "",
              condition = "",
            ] = parts;
            html += `<tr${ri % 2 === 1 ? ' style="background:#fafafa;"' : ""}>
              <td style="border:1px solid #999;padding:4px 8px;text-align:center;">${ri + 1}</td>
              <td style="border:1px solid #999;padding:4px 8px;">${esc(inv)}</td>
              <td style="border:1px solid #999;padding:4px 8px;">${esc(name)}</td>
              <td style="border:1px solid #999;padding:4px 8px;">${esc(author)}</td>
              <td style="border:1px solid #999;padding:4px 8px;">${esc(material)}</td>
              <td style="border:1px solid #999;padding:4px 8px;text-align:center;">${esc(count)}</td>
              <td style="border:1px solid #999;padding:4px 8px;">${esc(condition)}</td>
              <td style="border:1px solid #999;padding:4px 8px;"></td>
            </tr>`;
          });
        } else {
          html += `<tr><td colspan="${headerCells.length}" style="border:1px solid #999;padding:12px 8px;text-align:center;color:#999;font-style:italic;">Введіть дані предметів у формі зліва</td></tr>`;
        }
        i++; // skip {items_data} line
      } else {
        // Regular table data rows
        while (i < lines.length && lines[i].trim().startsWith("│")) {
          const cells = lines[i]
            .split("│")
            .filter(Boolean)
            .map((c) => c.trim());
          html += "<tr>";
          for (const cell of cells) {
            html += `<td style="border:1px solid #999;padding:4px 8px;">${esc(cell)}</td>`;
          }
          html += "</tr>";
          i++;
        }
      }

      // Skip └ closing border
      if (i < lines.length && lines[i].trim().startsWith("└")) i++;
      html += "</tbody></table>";
      continue;
    }

    // Skip stray table borders
    if (
      trimmed.startsWith("├") ||
      trimmed.startsWith("└") ||
      trimmed.startsWith("│")
    ) {
      i++;
      continue;
    }

    // Empty line → spacing
    if (!trimmed) {
      html += '<div style="height:8px;"></div>';
      i++;
      continue;
    }

    // Title keywords — centered & bold
    const titlePatterns = [
      /^НАКАЗ$/,
      /^НАКАЗУЮ:$/,
      /^ЗАТВЕРДЖУЮ$/,
      /^ПЕРЕЛІК$/,
      /^ПОВІДОМЛЕННЯ$/,
    ];
    if (titlePatterns.some((p) => p.test(trimmed))) {
      html += `<p style="text-align:center;font-weight:bold;font-size:16px;margin:14px 0 6px;letter-spacing:2px;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // "АКТ № ..." header
    if (trimmed.startsWith("АКТ №") || trimmed.startsWith("ОПИС СТАНУ")) {
      html += `<p style="text-align:center;font-weight:bold;font-size:15px;margin:14px 0 4px;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // Subtitles (Про тимчасове…, приймання-передачі…, культурних цінностей…)
    if (
      /^(Про тимчасове|приймання-передачі|культурних цінностей)/.test(trimmed)
    ) {
      html += `<p style="text-align:center;margin:2px 0 12px;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // "№ XX від XX" line (order number) — centered
    if (/^№\s/.test(trimmed)) {
      html += `<p style="text-align:center;margin:4px 0 12px;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // Right-aligned block (Міністерство address, city+date)
    if (line.startsWith("                    ")) {
      html += `<p style="text-align:right;margin:1px 0;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // Signature lines (contain ____________)
    if (trimmed.includes("_____________")) {
      html += `<p style="margin:6px 0;white-space:pre-wrap;font-family:inherit;">${esc(line)}</p>`;
      i++;
      continue;
    }

    // Sub-points (3.1., 3.2., …)
    if (/^\s{2,}\d+\.\d+\./.test(line)) {
      html += `<p style="margin:3px 0;padding-left:30px;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // Dash-prefixed items (— забезпечити...)
    if (trimmed.startsWith("—") || trimmed.startsWith("- ")) {
      html += `<p style="margin:3px 0;padding-left:20px;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // Numbered items (1., 2., …)
    if (/^\d+\./.test(trimmed)) {
      html += `<p style="margin:6px 0 3px;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // Section labels (УМОВИ ТИМЧАСОВОГО…, СТАН ПРЕДМЕТІВ…, etc)
    if (
      trimmed === trimmed.toUpperCase() &&
      /^[А-ЯІЇЄҐ\s(),:—]+$/.test(trimmed) &&
      trimmed.length > 5
    ) {
      html += `<p style="font-weight:600;margin:14px 0 4px;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // Labels like "ПРЕДМЕТ:", "Назва:", "Дата:"
    if (/^[А-ЯІЇЄҐ][А-ЯІЇЄҐА-яіїєґa-zA-Z\s]*:/.test(trimmed)) {
      html += `<p style="margin:3px 0;">${esc(trimmed)}</p>`;
      i++;
      continue;
    }

    // Regular line
    html += `<p style="margin:3px 0;">${esc(line)}</p>`;
    i++;
  }

  return html;
}

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
        <Link href="/documents" className="text-accent hover:underline text-sm">
          ← Всі документи
        </Link>
      </div>
    );
  }

  const updateField = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const getDocumentHTML = () =>
    templateToHTML(template.template, values, template.fields);

  const exportDoc = () => {
    const bodyHTML = getDocumentHTML();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>${esc(template.title)}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body {
      font-family: "Times New Roman", "DejaVu Serif", serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 170mm;
      margin: 0 auto;
      padding: 0;
    }
    p { orphans: 3; widows: 3; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; }
    .doc-header {
      text-align: center;
      font-size: 10px;
      color: #888;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
    }
    .doc-footer {
      margin-top: 40px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="doc-header">
    MuseumAID &middot; ${esc(template.title)} &middot; Джерело: ${esc(template.source)}
  </div>
  ${bodyHTML}
  <div class="doc-footer">
    Згенеровано MuseumAID &middot; ${new Date().toLocaleDateString("uk-UA")} &middot; Довідковий характер
  </div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const filledFields = template.fields.filter(
    (f) => values[f.id]?.trim(),
  ).length;
  const totalFields = template.fields.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      <Link
        href="/documents"
        className="text-xs text-accent hover:underline mb-6 inline-flex items-center gap-1"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Всі документи
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl" aria-hidden="true">
            {template.icon}
          </span>
          <h1 className="font-display text-2xl font-bold">{template.title}</h1>
        </div>
        <p className="text-text-secondary text-sm mb-1 ml-12">
          {template.description}
        </p>
        <p className="text-[11px] text-accent/80 font-mono mb-6 ml-12">
          Джерело: {template.source}
        </p>
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
        <div
          className={`${activeTab === "preview" ? "hidden lg:block" : ""}`}
        >
          <h2 className="font-medium text-sm text-text-secondary mb-4">
            Заповніть поля
          </h2>
          <div className="space-y-4" data-testid="document-fields">
            {template.fields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-xs font-medium text-text-secondary mb-1.5"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-danger ml-0.5">*</span>
                  )}
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Зберегти як PDF
          </button>
        </div>

        {/* Preview */}
        <div
          className={`${activeTab === "form" ? "hidden lg:block" : ""}`}
        >
          <h2 className="font-medium text-sm text-text-secondary mb-4">
            Попередній перегляд
          </h2>
          <div
            className="rounded-xl border border-border bg-white shadow-sm overflow-auto"
            style={{ fontFamily: '"Times New Roman", "DejaVu Serif", serif' }}
            data-testid="document-preview"
          >
            <div
              className="px-4 py-5 sm:px-8 sm:py-6 text-[13px] leading-relaxed text-gray-900"
              dangerouslySetInnerHTML={{ __html: getDocumentHTML() }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
