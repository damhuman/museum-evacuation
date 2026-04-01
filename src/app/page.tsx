"use client";

import Link from "next/link";
import { sources } from "@/lib/sources-data";

const typeLabels: Record<string, string> = {
  npa: "НПА",
  instruction: "Методичка",
  international: "Міжнародний",
};

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* ── Hero ── */}
      <section className="bg-accent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-text/60">
            Система підтримки рішень
          </p>
        </div>
      </section>

      <section className="bg-bg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
            MuseumAID — система підтримки
            <br className="hidden sm:block" />
            евакуації музейних предметів
          </h1>
          <p className="text-text-secondary max-w-2xl leading-relaxed mb-8">
            Конкретні, нормативно обґрунтовані інструкції на основі КМУ&nbsp;№229,
            МКІП&nbsp;№424 та стандартів ICCROM. Тріаж, пакування, логістика,
            документи — в реальному часі.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-text font-bold text-sm uppercase tracking-wider hover:bg-accent-hover transition-colors"
          >
            Розпочати консультацію
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Scenarios ── */}
      <section className="bg-bg-alt">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-8">
            Сценарії евакуації
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                emoji: "🔴",
                title: "Екстрена евакуація",
                time: "Години",
                desc: "Загроза наближається. Тріаж, швидке пакування, найближчий безпечний пункт.",
                href: "/chat?scenario=emergency",
              },
              {
                emoji: "🟡",
                title: "Планова евакуація",
                time: "Дні — тижні",
                desc: "Рішення ОВА або превентивне переміщення. Повний план із документами.",
                href: "/chat?scenario=planned",
              },
              {
                emoji: "💬",
                title: "Консультація",
                time: "Питання",
                desc: "Як запакувати конкретний предмет? Які документи потрібні? Контакти?",
                href: "/chat?scenario=consultation",
              },
            ].map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="block p-6 bg-bg border border-border hover:border-text/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {s.time}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {s.desc}
                </p>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text transition-colors">
                  Розпочати &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-bg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
            Функціонал системи
          </h2>
          <div className="w-12 h-1 bg-accent mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "AI Чат з RAG",
                desc: "Три спеціалізовані агенти: тріаж, пакування, логістика. Нормативно обґрунтовані відповіді.",
                href: "/chat",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                ),
              },
              {
                title: "Чеклісти пакування",
                desc: "8 типів предметів. Покрокові інструкції за МКІП №424 та ICCROM.",
                href: "/checklists",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                ),
              },
              {
                title: "Шаблони документів",
                desc: "Наказ, перелік, акт передачі, лист до Мінкульту. Заповніть — отримайте PDF.",
                href: "/documents",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                ),
              },
              {
                title: "База знань",
                desc: "8 нормативних документів з ключовими положеннями та швидким доступом.",
                href: "/knowledge",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                  </svg>
                ),
              },
            ].map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group block p-5 border border-border bg-bg hover:border-text/20 transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-accent/20 text-text mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-sm mb-2 group-hover:underline">
                  {f.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Normative base ── */}
      <section className="bg-bg-alt">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
            Нормативна база
          </h2>
          <div className="w-12 h-1 bg-accent mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="p-5 bg-bg border border-border"
              >
                <span className="inline-block px-2 py-0.5 bg-accent text-accent-text text-[10px] font-bold uppercase tracking-wider mb-3">
                  {typeLabels[s.type] || s.type}
                </span>
                <h3 className="font-bold text-sm mb-2">{s.shortName}</h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                  {s.description}
                </p>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text transition-colors"
                  >
                    Відкрити &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text transition-colors"
            >
              Переглянути всі документи &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer bar ── */}
      <section className="border-t border-border bg-accent-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-text-secondary">
          Інформація має довідковий характер та не замінює чинні
          нормативно-правові акти
        </div>
      </section>
    </div>
  );
}
