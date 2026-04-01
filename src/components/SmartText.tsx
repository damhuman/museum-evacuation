"use client";

import Link from "next/link";
import { sources } from "@/lib/sources-data";
import { checklistTypes } from "@/lib/checklists-data";

// Build citation patterns
const citationPatterns: {
  regex: RegExp;
  sourceId: string;
  sectionGroup?: number;
}[] = [
  { regex: /КМУ\s*№\s*229(?:\s*від[^,]*)?(,?\s*(п\.\s*\d+(?:\(\d+\))?))?/g, sourceId: "kmu-229", sectionGroup: 2 },
  { regex: /КМУ\s*№\s*841(?:\s*від[^,]*)?(,?\s*(п\.\s*\d+))?/g, sourceId: "kmu-841", sectionGroup: 2 },
  { regex: /КМУ\s*№\s*1147/g, sourceId: "kmu-1147" },
  { regex: /МКІП\s*№\s*424(?:\s*від[^,]*)?(,?\s*((?:р|п)\.\s*\d+(?:\.\d+)?))?/g, sourceId: "mkip-424", sectionGroup: 2 },
  { regex: /ЗУ\s*(?:«[^»]*»\s*)?(?:№\s*)?249\/95(?:-ВР)?/g, sourceId: "zu-249" },
  { regex: /Інструкці[яї]\s*№?\s*580/g, sourceId: "instruction-580" },
  { regex: /ICCROM\s*First\s*Aid[^,]*(,?\s*(?:p|стор)\.?\s*(\d+))?/gi, sourceId: "iccrom-first-aid", sectionGroup: 2 },
  { regex: /ICCROM\s*Endangered[^,]*/gi, sourceId: "iccrom-endangered" },
];

// Build checklist patterns — match Ukrainian item type names
const checklistPatterns: { regex: RegExp; checklistId: string; label: string }[] = [
  { regex: /живопис(?:у|ом|ні|них|ні)?/gi, checklistId: "zhyvopys", label: "Живопис" },
  { regex: /керамік(?:а|и|у|ою)?/gi, checklistId: "keramika", label: "Кераміка" },
  { regex: /текстил(?:ь|ю|ем)?/gi, checklistId: "tekstyl", label: "Текстиль" },
  { regex: /нумізматик(?:а|и|у)?/gi, checklistId: "numizmatyka", label: "Нумізматика" },
  { regex: /скульптур(?:а|и|у|ою|ні)?/gi, checklistId: "skulptura", label: "Скульптура" },
  { regex: /(?:документ|книг|рукопис|стародрук)(?:ів|и|ів|ами|ам)?/gi, checklistId: "dokumenty", label: "Документи" },
  { regex: /ікон(?:а|и|у|ою|ам|ах|опис)?/gi, checklistId: "ikony", label: "Іконопис" },
  { regex: /метал(?:у|ом|ів|еві)?(?:\s|$|,|\.)/gi, checklistId: "metal", label: "Метал" },
];

interface TextSegment {
  type: "text" | "citation" | "checklist";
  content: string;
  url?: string;
  tooltip?: string;
}

function resolveSourceUrl(sourceId: string, section?: string): string | null {
  const source = sources.find((s) => s.id === sourceId);
  if (!source?.url) return null;

  let url = source.url;
  if (section && source.sections) {
    const cleanSection = section.replace(/\s/g, "");
    const anchor = source.sections[cleanSection];
    if (anchor) url += anchor;
  }
  return url;
}

function resolveSourceTooltip(sourceId: string): string {
  const source = sources.find((s) => s.id === sourceId);
  return source?.fullName || "";
}

export function SmartText({ text }: { text: string }) {
  // Find all matches and their positions
  const matches: { start: number; end: number; segment: TextSegment }[] = [];

  // Citations
  for (const pattern of citationPatterns) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const section = pattern.sectionGroup ? match[pattern.sectionGroup] : undefined;
      const cleanSection = section?.replace(/,?\s*/, "");
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        segment: {
          type: "citation",
          content: match[0],
          url: resolveSourceUrl(pattern.sourceId, cleanSection) || undefined,
          tooltip: resolveSourceTooltip(pattern.sourceId),
        },
      });
    }
  }

  // Checklists
  for (const pattern of checklistPatterns) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      // Don't overlap with citation matches
      const overlaps = matches.some(
        (m) => match!.index < m.end && match!.index + match![0].length > m.start
      );
      if (!overlaps) {
        // Verify this checklist exists
        const exists = checklistTypes.find((c) => c.id === pattern.checklistId);
        if (exists) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            segment: {
              type: "checklist",
              content: match[0],
              url: `/checklists/${pattern.checklistId}`,
              tooltip: `Чекліст: ${pattern.label}`,
            },
          });
        }
      }
    }
  }

  // Sort by position, remove overlaps (keep earlier/longer)
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const filtered: typeof matches = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  // Build segments
  const segments: TextSegment[] = [];
  let pos = 0;
  for (const m of filtered) {
    if (m.start > pos) {
      segments.push({ type: "text", content: text.slice(pos, m.start) });
    }
    segments.push(m.segment);
    pos = m.end;
  }
  if (pos < text.length) {
    segments.push({ type: "text", content: text.slice(pos) });
  }

  if (segments.length === 0) {
    return <>{text}</>;
  }

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "citation" && seg.url) {
          return (
            <a
              key={i}
              href={seg.url}
              target="_blank"
              rel="noopener noreferrer"
              title={seg.tooltip}
              className="inline-flex items-center gap-0.5 text-accent hover:text-accent-hover underline decoration-accent/30 hover:decoration-accent underline-offset-2 transition-colors cursor-pointer"
            >
              {seg.content}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 opacity-60">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          );
        }
        if (seg.type === "citation" && !seg.url) {
          return (
            <span key={i} className="text-accent font-medium" title={seg.tooltip}>
              {seg.content}
            </span>
          );
        }
        if (seg.type === "checklist" && seg.url) {
          return (
            <Link
              key={i}
              href={seg.url}
              title={seg.tooltip}
              className="inline-flex items-center gap-0.5 text-accent hover:text-accent-hover underline decoration-accent/30 hover:decoration-accent underline-offset-2 transition-colors"
            >
              {seg.content}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 opacity-60">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </Link>
          );
        }
        return <InlineMarkdown key={i} text={seg.content} />;
      })}
    </>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  // Process **bold** and *italic* patterns
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // **bold**
      parts.push(<strong key={match.index} className="font-semibold text-text">{match[1]}</strong>);
    } else if (match[2]) {
      // *italic*
      parts.push(<em key={match.index}>{match[2]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) return <>{text}</>;
  return <>{parts}</>;
}
