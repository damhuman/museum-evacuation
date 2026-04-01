export interface SourceDocument {
  id: string;
  shortName: string;
  fullName: string;
  description: string;
  url: string | null;
  type: "npa" | "international" | "instruction";
  keyPoints: string[];
  sections?: Record<string, string>;
}

export const sources: SourceDocument[] = [
  {
    id: "kmu-229",
    shortName: "КМУ №229",
    fullName: "Порядок тимчасового переміщення (евакуації) культурних цінностей (КМУ №229 від 18.02.2026)",
    description: "Основний нормативний документ, що регулює процедуру евакуації культурних цінностей під час воєнного стану.",
    url: "https://zakon.rada.gov.ua/laws/show/229-2026-п",
    type: "npa",
    keyPoints: [
      "п.4 — Зона <50 км від фронту: евакуація обов'язкова",
      "п.9(3) — Директор може прийняти рішення самостійно",
      "п.11 — Перелік: інв.номер, назва, автор, к-сть",
      "п.13 — Координація з ДСНС і Нацполіцією",
      "Лист до Мінкульту — 2 к.д. після прибуття",
    ],
    sections: {
      "п.3": "#n13",
      "п.4": "#n14",
      "п.9": "#n19",
      "п.9(3)": "#n19",
      "п.11": "#n21",
      "п.13": "#n23",
    },
  },
  {
    id: "zu-249",
    shortName: "ЗУ №249/95-ВР",
    fullName: "Закон України «Про музеї та музейну справу» від 29.06.1995 №249/95-ВР",
    description: "Базовий закон, що визначає правовий статус музеїв, Музейний фонд України та обов'язки зберігачів.",
    url: "https://zakon.rada.gov.ua/laws/show/249/95-вр",
    type: "npa",
    keyPoints: [
      "Визначення Музейного фонду України",
      "Відповідальність за збереження музейних предметів",
      "Державний реєстр національного культурного надбання",
    ],
  },
  {
    id: "kmu-841",
    shortName: "КМУ №841",
    fullName: "Порядок проведення евакуації у разі загрози виникнення НС (КМУ №841 від 30.10.2013)",
    description: "Загальний порядок евакуації, включаючи фінансування. КМУ №229 посилається на цей документ щодо фінансового забезпечення.",
    url: "https://zakon.rada.gov.ua/laws/show/841-2013-п",
    type: "npa",
    keyPoints: [
      "Фінансування евакуації з держбюджету/місцевих бюджетів",
      "Порядок координації з ОВА",
      "Поширюється на культурні цінності через КМУ №229",
    ],
    sections: {
      "п.3": "#n13",
    },
  },
  {
    id: "kmu-1147",
    shortName: "КМУ №1147",
    fullName: "Інструкція про порядок визначення категорій музеїв (КМУ №1147 від 2000)",
    description: "Визначає категорії музеїв та критерії їх класифікації. Важливо для пріоритезації евакуації.",
    url: "https://zakon.rada.gov.ua/laws/show/1147-2000-п",
    type: "npa",
    keyPoints: [
      "Категорії музеїв: національний, державний, комунальний",
      "Критерії визначення цінності колекцій",
    ],
  },
  {
    id: "mkip-424",
    shortName: "МКІП №424",
    fullName: "Методичні рекомендації щодо роботи закладів культури (МКІП №424 від 11.08.2023)",
    description: "Ключовий документ з практичними інструкціями пакування та евакуації по типах предметів. Містить класифікацію вразливості матеріалів.",
    url: "https://zakon.rada.gov.ua/rada/show/v0424921-23",
    type: "instruction",
    keyPoints: [
      "р.2 — Класифікація пріоритетів евакуації",
      "р.3.1 — Живопис: пакування, транспортування",
      "р.3.2 — Скульптура: фіксація, захист",
      "р.3.3 — Кераміка: індивідуальне пакування",
      "р.3.4 — Метал: сухе зберігання",
      "р.3.5 — Текстиль: валики, прокладки",
      "р.3.6 — Документи/книги: водозахист",
      "р.3.7 — Нумізматика: індивідуальні конверти",
    ],
    sections: {
      "р.2": "#n10",
      "р.2.1": "#n10",
      "р.3": "#n15",
      "р.3.1": "#n16",
      "р.3.2": "#n17",
      "р.3.3": "#n18",
      "р.3.4": "#n19",
      "р.3.5": "#n20",
      "р.3.6": "#n21",
      "р.3.7": "#n22",
      "п.2.1": "#n10",
      "п.3.1": "#n16",
      "п.3.2": "#n17",
      "п.3.3": "#n18",
      "п.4": "#n25",
    },
  },
  {
    id: "instruction-580",
    shortName: "Інструкція №580",
    fullName: "Інструкція з обліку музейних предметів (Мінкульт №580 від 2016)",
    description: "Визначає порядок обліку, інвентаризації та документування музейних предметів. Важливо для складання переліків при евакуації.",
    url: "https://zakon.rada.gov.ua/laws/show/z1129-16",
    type: "instruction",
    keyPoints: [
      "Порядок присвоєння інвентарних номерів",
      "Вимоги до переліків та актів",
      "Облік руху музейних предметів",
    ],
  },
  {
    id: "iccrom-first-aid",
    shortName: "ICCROM First Aid",
    fullName: "ICCROM — First Aid to Cultural Heritage in Times of Crisis",
    description: "Міжнародний стандарт першої допомоги культурній спадщині під час кризових ситуацій. Розроблений ICCROM спільно з UNESCO.",
    url: "/docs/iccrom_first_aid.pdf",
    type: "international",
    keyPoints: [
      "Система тріажу: червоний / жовтий / зелений",
      "Принцип пакування: м'який → захисний → жорсткий",
      "Покрокові інструкції для кожного типу матеріалу",
      "Побутові аналоги професійних матеріалів",
      "Документування стану перед переміщенням",
    ],
    sections: {
      "p.32": "",
      "p.47": "",
      "p.50": "",
      "p.52": "",
      "p.55": "",
      "p.58": "",
      "p.78": "",
    },
  },
  {
    id: "iccrom-endangered",
    shortName: "ICCROM Endangered Heritage",
    fullName: "ICCROM — Endangered Heritage: Emergency Evacuation of Heritage Collections",
    description: "Практичний посібник ICCROM з екстреної евакуації колекцій. Деталізує логістику, пріоритезацію та координацію.",
    url: "/docs/iccrom_endangered_heritage_ENG.pdf",
    type: "international",
    keyPoints: [
      "Workflow екстреної евакуації",
      "Ролі та відповідальності команди",
      "Логістика транспортування",
    ],
  },
];

export interface ParsedCitation {
  fullMatch: string;
  sourceId: string;
  source: SourceDocument;
  section?: string;
  url: string | null;
}

export function parseCitation(text: string): ParsedCitation | null {
  // Patterns to match citation references
  const patterns: { regex: RegExp; sourceId: string; sectionGroup?: number }[] = [
    { regex: /КМУ\s*№\s*229[^,]*(,\s*(п\.\d+(?:\(\d+\))?))?/i, sourceId: "kmu-229", sectionGroup: 2 },
    { regex: /КМУ\s*№\s*841[^,]*(,\s*(п\.\d+))?/i, sourceId: "kmu-841", sectionGroup: 2 },
    { regex: /КМУ\s*№\s*1147/i, sourceId: "kmu-1147" },
    { regex: /МКІП\s*№\s*424[^,]*(,\s*((?:р|п)\.\d+(?:\.\d+)?))?/i, sourceId: "mkip-424", sectionGroup: 2 },
    { regex: /ЗУ\s*(?:«[^»]+»\s*)?№?\s*249\/95/i, sourceId: "zu-249" },
    { regex: /Інструкція?\s*№?\s*580/i, sourceId: "instruction-580" },
    { regex: /ICCROM\s*First\s*Aid[^,]*(,\s*(?:p|стор)\.?\s*(\d+))?/i, sourceId: "iccrom-first-aid", sectionGroup: 2 },
    { regex: /ICCROM\s*Endangered/i, sourceId: "iccrom-endangered" },
    { regex: /ICCROM[^,]*(,\s*(?:p|стор)\.?\s*(\d+))?/i, sourceId: "iccrom-first-aid", sectionGroup: 2 },
  ];

  for (const { regex, sourceId, sectionGroup } of patterns) {
    const match = text.match(regex);
    if (match) {
      const source = sources.find((s) => s.id === sourceId);
      if (!source) continue;

      const section = sectionGroup ? match[sectionGroup] : undefined;
      let url = source.url;

      if (url && section && source.sections) {
        const anchor = source.sections[section];
        if (anchor) {
          url = url + anchor;
        }
      }

      return {
        fullMatch: match[0],
        sourceId,
        source,
        section,
        url,
      };
    }
  }

  return null;
}

export function findAllCitations(text: string): ParsedCitation[] {
  const results: ParsedCitation[] = [];
  const seen = new Set<string>();

  // Split by common delimiters and try to parse each segment
  const segments = text.split(/[;,]/);

  for (const segment of segments) {
    const citation = parseCitation(segment.trim());
    if (citation && !seen.has(citation.sourceId + (citation.section || ""))) {
      seen.add(citation.sourceId + (citation.section || ""));
      results.push(citation);
    }
  }

  return results;
}
