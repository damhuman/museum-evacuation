import { sources } from "@/lib/sources-data";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  npa: "НПА",
  instruction: "ІНСТРУКЦІЯ",
  international: "МІЖНАРОДНИЙ",
};

export default function KnowledgePage() {
  const npa = sources.filter((s) => s.type === "npa");
  const instructions = sources.filter((s) => s.type === "instruction");
  const international = sources.filter((s) => s.type === "international");

  const groups = [
    { title: "НОРМАТИВНО-ПРАВОВІ АКТИ УКРАЇНИ", items: npa },
    { title: "ІНСТРУКЦІЇ ТА МЕТОДИЧНІ РЕКОМЕНДАЦІЇ", items: instructions },
    { title: "МІЖНАРОДНІ СТАНДАРТИ", items: international },
  ];

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-xs text-text-muted">
            <li>
              <Link href="/" className="hover:text-text transition-colors">
                Головна
              </Link>
            </li>
            <li aria-hidden="true">&gt;</li>
            <li className="text-text">База знань</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-2xl font-bold tracking-widest uppercase text-text mb-3">
            БАЗА ЗНАНЬ
          </h1>
          <div className="w-12 h-1 bg-accent mb-6" />
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            Нормативна база та міжнародні стандарти, на які спирається MuseumAID.
            Кожна рекомендація системи містить посилання на конкретний пункт документа.
          </p>
          <p className="text-xs text-text-muted mt-2">
            {sources.length} документів у базі
          </p>
        </header>

        {/* Groups */}
        {groups.map((group) => (
          <section key={group.title} className="mb-12">
            <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted mb-6">
              {group.title}
            </h2>

            <div className="space-y-4">
              {group.items.map((source) => {
                const badge = typeLabels[source.type];

                return (
                  <div
                    key={source.id}
                    className="bg-bg border border-border p-6"
                  >
                    {/* Badge + Title */}
                    <div className="mb-3">
                      <span className="inline-block bg-accent text-accent-text text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mb-2">
                        {badge}
                      </span>
                      <h3 className="text-base font-bold text-text">
                        {source.shortName}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-secondary mb-1">
                      {source.fullName}
                    </p>
                    <p className="text-xs text-text-muted mb-4">
                      {source.description}
                    </p>

                    {/* Key points */}
                    {source.keyPoints && source.keyPoints.length > 0 && (
                      <div className="border-t border-border pt-4 mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                          Ключові положення
                        </p>
                        <ul className="space-y-1">
                          {source.keyPoints.map((point, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-xs text-text-secondary"
                            >
                              <span className="text-text-muted mt-0.5 flex-shrink-0">
                                &mdash;
                              </span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sections quick access */}
                    {source.sections &&
                      Object.keys(source.sections).length > 0 &&
                      source.url && (
                        <div className="border-t border-border pt-4 mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                            Розділи
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(source.sections).map(
                              ([section, anchor]) => (
                                <a
                                  key={section}
                                  href={`${source.url}${anchor}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block border border-border px-2 py-0.5 text-xs font-mono text-text-secondary hover:bg-bg-alt"
                                >
                                  {section}
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Open link */}
                    {source.url && (
                      <div className="pt-2">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-text hover:text-text-secondary uppercase tracking-wider"
                        >
                          Відкрити
                          <span aria-hidden="true">&rarr;</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Bottom info box */}
        <div className="border border-border p-6 mt-4 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-text mb-2">
            Як MuseumAID використовує ці документи
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            Кожен агент системи (Тріаж, Пакування, Логістика) має вшиту нормативну базу
            у своєму системному промпті. Рекомендації генеруються з обов&apos;язковим цитуванням
            конкретного пункту документа. Промпти агентів доступні для перегляду та
            редагування у директорії{" "}
            <code className="font-mono bg-bg-alt px-1 py-0.5 text-text-secondary">
              prompts/
            </code>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
