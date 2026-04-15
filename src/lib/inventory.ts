import * as XLSX from "xlsx";

export interface InventoryItem {
  id?: string;
  name: string;
  material?: string;
  technique?: string;
  condition?: string;
  count?: number;
  location?: string;
  value?: string;
  dimensions?: string;
  notes?: string;
  priority: "red" | "yellow" | "green";
  priorityScore: number;
}

export interface ParsedInventory {
  items: InventoryItem[];
  materialsSummary: Record<string, number>;
  totalItems: number;
  totalUnits: number;
  prioritized: { red: number; yellow: number; green: number };
  sourceFileName: string;
  unmappedColumns: string[];
}

type Field = keyof Omit<InventoryItem, "priority" | "priorityScore">;

const HEADER_PATTERNS: Array<{ field: Field; patterns: RegExp[] }> = [
  {
    field: "id",
    patterns: [/^інвентар/i, /^ід$/i, /^id$/i, /^номер$/i, /^№/],
  },
  {
    field: "name",
    patterns: [/назв/i, /предмет/i, /найменуван/i, /^name$/i, /^item/i],
  },
  {
    field: "material",
    patterns: [/матеріал/i, /^material/i],
  },
  {
    field: "technique",
    patterns: [/техн/i, /^technique/i],
  },
  {
    field: "condition",
    patterns: [/стан/i, /збереж/i, /^condition/i],
  },
  {
    field: "count",
    patterns: [/к[іи]льк/i, /^к-?с?т?ь?$/i, /^count$/i, /^qty$/i, /^quantity$/i],
  },
  {
    field: "location",
    patterns: [/м[іи]сц/i, /локац/i, /розташув/i, /сховищ/i, /зберіган/i, /^location$/i],
  },
  {
    field: "value",
    patterns: [/ц[іи]нн/i, /катег/i, /^value$/i, /^category$/i],
  },
  {
    field: "dimensions",
    patterns: [/розм[іи]р/i, /габарит/i, /^size$/i, /^dimension/i],
  },
  {
    field: "notes",
    patterns: [/прим[іи]т/i, /коментар/i, /^notes?$/i, /^comment/i],
  },
];

function detectField(header: string): Field | null {
  const h = header.trim();
  if (!h) return null;
  for (const { field, patterns } of HEADER_PATTERNS) {
    if (patterns.some((p) => p.test(h))) return field;
  }
  return null;
}

function detectDelimiter(sample: string): string {
  const firstLine = sample.split(/\r?\n/).find((l) => l.trim().length > 0) || "";
  const counts = {
    "\t": (firstLine.match(/\t/g) || []).length,
    ";": (firstLine.match(/;/g) || []).length,
    ",": (firstLine.match(/,/g) || []).length,
  };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : ",";
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

function parseCSV(text: string): string[][] {
  const delim = detectDelimiter(text);
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    rows.push(parseCSVLine(line, delim));
  }
  return rows;
}

async function readFileAsRows(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
    const text = await file.text();
    return parseCSV(text);
  }
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  return rows.map((r) => (r as unknown[]).map((c) => String(c ?? "").trim()));
}

const FRAGILE_MATERIALS = [
  "пап",
  "керам",
  "тканин",
  "текстил",
  "полотн",
  "скл",
  "левкас",
  "гуаш",
  "тушь",
  "туш",
  "пергамент",
  "емал",
];

const HIGH_VALUE_KEYWORDS = [
  "особлив",
  "унікал",
  "національ",
  "держав",
  "надзвичай",
];

const MEDIUM_VALUE_KEYWORDS = ["висок"];

const FRAGILE_CONDITION_KEYWORDS = [
  "крихк",
  "чутлив",
  "вразлив",
  "аварійн",
  "поган",
  "критич",
];

function scoreItem(item: InventoryItem): { score: number; priority: "red" | "yellow" | "green" } {
  let score = 0;
  const value = (item.value || "").toLowerCase();
  const condition = (item.condition || "").toLowerCase();
  const material = (item.material || "").toLowerCase();
  const notes = (item.notes || "").toLowerCase();

  if (HIGH_VALUE_KEYWORDS.some((k) => value.includes(k) || notes.includes(k))) {
    score += 3;
  } else if (MEDIUM_VALUE_KEYWORDS.some((k) => value.includes(k))) {
    score += 2;
  } else if (value) {
    score += 1;
  }

  if (FRAGILE_CONDITION_KEYWORDS.some((k) => condition.includes(k))) {
    score += 2;
  }

  if (FRAGILE_MATERIALS.some((k) => material.includes(k))) {
    score += 1;
  }

  let priority: "red" | "yellow" | "green";
  if (score >= 4) priority = "red";
  else if (score >= 2) priority = "yellow";
  else priority = "green";

  return { score, priority };
}

function normalizeMaterial(raw: string): string {
  if (!raw) return "не вказано";
  // Take first token before comma — "полотно, олія" → "полотно"
  const primary = raw.split(/[,;]/)[0].trim().toLowerCase();
  return primary || "не вказано";
}

function parseCount(raw: string): number {
  if (!raw) return 1;
  const n = parseInt(raw.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function parseInventoryFile(file: File): Promise<ParsedInventory> {
  const rows = await readFileAsRows(file);
  if (rows.length < 2) {
    throw new Error("Файл порожній або не містить даних (потрібен рядок заголовка та хоча б один рядок).");
  }

  const headers = rows[0];
  const mapping: Partial<Record<Field, number>> = {};
  const unmapped: string[] = [];

  headers.forEach((h, idx) => {
    const field = detectField(h);
    if (field && mapping[field] === undefined) {
      mapping[field] = idx;
    } else if (h.trim()) {
      unmapped.push(h.trim());
    }
  });

  if (mapping.name === undefined) {
    throw new Error(
      "Не знайдено колонку з назвою предмета. Очікується заголовок на кшталт «Назва», «Предмет», «Найменування» або «Name»."
    );
  }

  const items: InventoryItem[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.some((c) => c && c.trim())) continue;

    const get = (f: Field): string | undefined => {
      const idx = mapping[f];
      return idx !== undefined ? row[idx]?.trim() || undefined : undefined;
    };

    const name = get("name");
    if (!name) continue;

    const base = {
      id: get("id"),
      name,
      material: get("material"),
      technique: get("technique"),
      condition: get("condition"),
      count: parseCount(get("count") || ""),
      location: get("location"),
      value: get("value"),
      dimensions: get("dimensions"),
      notes: get("notes"),
    };

    const { score, priority } = scoreItem({ ...base, priority: "green", priorityScore: 0 });
    items.push({ ...base, priority, priorityScore: score });
  }

  items.sort((a, b) => b.priorityScore - a.priorityScore);

  const materialsSummary: Record<string, number> = {};
  let totalUnits = 0;
  for (const item of items) {
    const mat = normalizeMaterial(item.material || "");
    materialsSummary[mat] = (materialsSummary[mat] || 0) + (item.count || 1);
    totalUnits += item.count || 1;
  }

  const prioritized = {
    red: items.filter((i) => i.priority === "red").length,
    yellow: items.filter((i) => i.priority === "yellow").length,
    green: items.filter((i) => i.priority === "green").length,
  };

  return {
    items,
    materialsSummary,
    totalItems: items.length,
    totalUnits,
    prioritized,
    sourceFileName: file.name,
    unmappedColumns: unmapped,
  };
}

export function inventoryToPromptContext(inv: ParsedInventory): string {
  const lines: string[] = [];
  lines.push(`[ІНВЕНТАР З ФАЙЛУ: ${inv.sourceFileName}]`);
  lines.push(`Всього позицій: ${inv.totalItems} (${inv.totalUnits} одиниць)`);
  lines.push(
    `Пріоритезація: 🔴 ${inv.prioritized.red} · 🟡 ${inv.prioritized.yellow} · 🟢 ${inv.prioritized.green}`
  );
  const mats = Object.entries(inv.materialsSummary)
    .sort((a, b) => b[1] - a[1])
    .map(([m, c]) => `${m}: ${c}`)
    .join(", ");
  lines.push(`Матеріали: ${mats}`);
  lines.push("");
  lines.push("Список предметів (відсортовано за пріоритетом):");
  inv.items.forEach((it, i) => {
    const parts = [
      `${i + 1}.`,
      it.id ? `[${it.id}]` : "",
      it.name,
      it.material ? `· ${it.material}` : "",
      it.condition ? `· стан: ${it.condition}` : "",
      it.value ? `· цінність: ${it.value}` : "",
      it.dimensions ? `· ${it.dimensions}` : "",
      it.count && it.count > 1 ? `· к-сть: ${it.count}` : "",
      it.location ? `· ${it.location}` : "",
      `· пріоритет: ${it.priority.toUpperCase()}`,
    ].filter(Boolean);
    lines.push(parts.join(" "));
  });
  return lines.join("\n");
}
