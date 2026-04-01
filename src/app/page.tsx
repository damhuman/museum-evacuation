"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const rotatingWords = ["Тріаж", "Пакування", "Логістика", "Документи"];

function AnimatedWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block text-accent">
      {/* Invisible word to reserve width/height */}
      <span className="invisible">Логістика</span>
      {rotatingWords.map((word, i) => (
        <span
          key={word}
          className={`absolute inset-0 transition-all duration-500 ${
            i === index
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

const scenarios = [
  {
    id: "emergency",
    title: "Екстрена евакуація",
    time: "Години",
    description: "Загроза наближається. Тріаж, швидке пакування, найближчий безпечний пункт.",
    href: "/chat?scenario=emergency",
    accent: "danger",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: "planned",
    title: "Планова евакуація",
    time: "Дні — тижні",
    description: "Рішення ОВА або превентивне переміщення. Повний план із документами.",
    href: "/chat?scenario=planned",
    accent: "warning",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    span: "",
  },
  {
    id: "consultation",
    title: "Консультація",
    time: "Питання",
    description: "Як запакувати конкретний предмет? Які документи? Контакти?",
    href: "/chat?scenario=consultation",
    accent: "info",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    span: "",
  },
];

const quickActions = [
  { icon: "📋", title: "Згенерувати перелік", description: "Перелік предметів за п.11 КМУ №229", href: "/documents/perelik-predmetiv" },
  { icon: "📦", title: "Чекліст пакування", description: "Покрокові інструкції для 8 типів предметів", href: "/checklists" },
  { icon: "📄", title: "Наказ про евакуацію", description: "Шаблон за п.9(3) КМУ №229", href: "/documents/nakaz-evakuatsiia" },
  { icon: "🗺️", title: "Пункти зберігання", description: "Найближчі безпечні пункти", href: "/chat?scenario=consultation" },
];

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient opacity-30 dark:opacity-20" style={{
          background: "linear-gradient(135deg, #B45309 0%, #92400E 20%, #1E3A5F 40%, #166534 60%, #991B1B 80%, #B45309 100%)",
          backgroundSize: "300% 300%",
        }} />
        <div className="absolute inset-0 bg-bg/70 dark:bg-bg/80" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-accent mb-4">
              Система підтримки рішень
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Евакуація музейних
              <br />
              предметів: <AnimatedWord />
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed">
              Конкретні, нормативно обґрунтовані інструкції від КМУ&nbsp;№229,
              МКІП&nbsp;№424 та ICCROM. В реальному часі.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/chat?scenario=emergency"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-danger text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Екстрена евакуація
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-border-strong bg-bg-elevated text-text font-medium text-sm hover:bg-surface-hover transition-colors"
            >
              Відкрити чат
            </Link>
          </motion.div>
        </div>
      </section>

      {/* BENTO GRID — Scenarios */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 variants={fadeUp} className="font-display text-2xl font-semibold mb-2">
            Оберіть сценарій
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-muted mb-8">
            Система адаптує рекомендації до вашої ситуації
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-3" data-testid="scenario-cards">
            {scenarios.map((s) => (
              <motion.div key={s.id} variants={fadeUp} className={s.span}>
                <Link
                  href={s.href}
                  data-testid={`scenario-${s.id}`}
                  className={`group block h-full p-6 rounded-xl border border-border bg-bg-elevated hover:border-${s.accent} transition-all duration-200 hover:shadow-lg hover:shadow-${s.accent}/5`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-${s.accent}-soft text-${s.accent} mb-4`}>
                    {s.icon}
                  </div>
                  <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 bg-${s.accent}-soft text-${s.accent}-text`}>
                    {s.time}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {s.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2 variants={fadeUp} className="font-display text-2xl font-semibold mb-2">
            Швидкі дії
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-muted mb-8">
            Шаблони документів та чеклісти пакування
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="quick-actions">
            {quickActions.map((a) => (
              <motion.div key={a.title} variants={fadeUp}>
                <Link
                  href={a.href}
                  className="group block p-5 rounded-xl border border-border bg-bg-elevated hover:border-border-strong hover:bg-surface-hover transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">{a.icon}</span>
                    <div>
                      <p className="font-medium text-sm group-hover:text-accent transition-colors">{a.title}</p>
                      <p className="text-xs text-text-muted mt-1">{a.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SOURCES FOOTER */}
      <footer className="border-t border-border bg-surface/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-text-muted leading-relaxed">
            <p className="font-medium text-text-secondary mb-1">Нормативна база</p>
            <p>КМУ №229 · ЗУ №249/95-ВР · МКІП №424 · КМУ №841 · ICCROM First Aid</p>
          </div>
          <p className="text-xs text-text-muted">
            ⚠️ Довідковий характер — не замінює НПА
          </p>
        </div>
      </footer>
    </div>
  );
}
