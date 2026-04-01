"use client";

import { motion } from "framer-motion";
import { sources } from "@/lib/sources-data";

const typeLabels: Record<string, { label: string; color: string }> = {
  npa: { label: "НПА України", color: "bg-accent-soft text-accent" },
  instruction: { label: "Інструкція", color: "bg-warning-soft text-warning-text" },
  international: { label: "Міжнародний стандарт", color: "bg-info-soft text-info" },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function KnowledgePage() {
  const npa = sources.filter((s) => s.type === "npa");
  const instructions = sources.filter((s) => s.type === "instruction");
  const international = sources.filter((s) => s.type === "international");

  const groups = [
    { title: "Нормативно-правові акти України", items: npa },
    { title: "Інструкції та методичні рекомендації", items: instructions },
    { title: "Міжнародні стандарти", items: international },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs font-medium tracking-widest uppercase text-accent mb-2">
          {sources.length} документів
        </p>
        <h1 className="font-display text-3xl font-bold mb-2">База знань</h1>
        <p className="text-text-secondary mb-10">
          Нормативна база та міжнародні стандарти, на які спирається MuseumAID.
          Кожна рекомендація системи містить посилання на конкретний пункт документа.
        </p>
      </motion.div>

      {groups.map((group) => (
        <motion.section
          key={group.title}
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-30px" }}
          className="mb-10"
        >
          <motion.h2 variants={fadeUp} className="font-display text-lg font-semibold mb-4">
            {group.title}
          </motion.h2>

          <div className="space-y-3">
            {group.items.map((source) => {
              const typeInfo = typeLabels[source.type];

              return (
                <motion.div
                  key={source.id}
                  variants={fadeUp}
                  className="p-5 rounded-xl border border-border bg-bg-elevated hover:border-accent/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-base">
                          {source.shortName}
                        </h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{source.fullName}</p>
                    </div>

                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-accent hover:bg-accent-soft transition-colors"
                      >
                        Відкрити
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-text-muted mb-3">{source.description}</p>

                  {source.keyPoints && source.keyPoints.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-medium">
                        Ключові положення
                      </p>
                      <ul className="space-y-1">
                        {source.keyPoints.map((point, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-text-secondary">
                            <span className="text-accent mt-0.5 flex-shrink-0">›</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {source.sections && Object.keys(source.sections).length > 0 && source.url && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-medium">
                        Швидкий доступ до розділів
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(source.sections).map(([section, anchor]) => (
                          <a
                            key={section}
                            href={`${source.url}${anchor}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-2 py-0.5 rounded-md bg-surface hover:bg-accent-soft text-xs font-mono text-text-secondary hover:text-accent transition-colors"
                          >
                            {section}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      ))}

      <div className="mt-8 p-5 rounded-xl border border-border bg-surface/50 text-xs text-text-muted">
        <p className="font-medium text-text-secondary mb-1">Як MuseumAID використовує ці документи</p>
        <p>
          Кожен агент системи (Тріаж, Пакування, Логістика) має вшиту нормативну базу у своєму системному промпті.
          Рекомендації генеруються з обов'язковим цитуванням конкретного пункту документа.
          Промпти агентів доступні для перегляду та редагування у директорії <code className="font-mono bg-bg-elevated px-1 rounded">prompts/</code>.
        </p>
      </div>
    </div>
  );
}
