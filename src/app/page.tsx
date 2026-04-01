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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* HERO — dark, atmospheric, urgent */}
      <section className="relative overflow-hidden bg-[#1a1410] text-[#f5f0eb]">
        {/* Layered gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d1810]/80 via-[#1a1410] to-[#0f1419]/90" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #f5f0eb 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        {/* Amber glow top-left */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#B45309]/20 rounded-full blur-[120px]" />
        {/* Red glow bottom-right (urgency) */}
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#991B1B]/15 rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B45309]/30 bg-[#B45309]/10 text-[#D97706] text-xs font-medium tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
              СИСТЕМА ПІДТРИМКИ РІШЕНЬ
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight mb-6">
              Евакуація музейних
              <br />
              предметів: <AnimatedWord />
            </h1>
            <p className="text-base sm:text-lg text-[#b8b0a6] max-w-xl leading-relaxed">
              Конкретні, нормативно обґрунтовані інструкції від КМУ&nbsp;№229,
              МКІП&nbsp;№424 та ICCROM. В реальному часі.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link
              href="/chat?scenario=emergency"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#991B1B] text-white font-semibold text-sm hover:bg-[#7f1d1d] transition-colors shadow-lg shadow-[#991B1B]/25"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Екстрена евакуація
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-[#4a4039] text-[#f5f0eb] font-medium text-sm hover:bg-[#2a2420] transition-colors"
            >
              Відкрити чат
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-14 pt-6 border-t border-[#2a2520] flex flex-wrap gap-8 sm:gap-12 text-xs"
          >
            <div>
              <span className="block text-[#7c756d] mb-1">Нормативна база</span>
              <span className="text-[#b8b0a6] font-mono">8 документів</span>
            </div>
            <div>
              <span className="block text-[#7c756d] mb-1">Чеклісти</span>
              <span className="text-[#b8b0a6] font-mono">8 типів · 56 кроків</span>
            </div>
            <div>
              <span className="block text-[#7c756d] mb-1">Шаблони</span>
              <span className="text-[#b8b0a6] font-mono">5 документів</span>
            </div>
            <div>
              <span className="block text-[#7c756d] mb-1">Агенти</span>
              <span className="text-[#b8b0a6] font-mono">Тріаж · Пакування · Логістика</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCENARIOS — bold color-coded cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.p variants={fadeUp} className="text-xs font-medium tracking-widest uppercase text-text-muted mb-2">
            Оберіть ваш сценарій
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-3xl font-bold mb-10">
            Система адаптується до ситуації
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="scenario-cards">
            {/* EMERGENCY — dominant red */}
            <motion.div variants={fadeUp}>
              <Link
                href="/chat?scenario=emergency"
                data-testid="scenario-emergency"
                className="group relative block h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#991B1B] to-[#7f1d1d] text-white p-7 hover:shadow-2xl hover:shadow-[#991B1B]/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span className="text-xs font-bold tracking-wider uppercase opacity-80">Години</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">
                    Екстрена евакуація
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed mb-6">
                    Загроза наближається. Тріаж, швидке пакування, найближчий безпечний пункт.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors">
                    Розпочати
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* PLANNED — warm amber */}
            <motion.div variants={fadeUp}>
              <Link
                href="/chat?scenario=planned"
                data-testid="scenario-planned"
                className="group relative block h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#92400E] to-[#78350F] text-white p-7 hover:shadow-2xl hover:shadow-[#92400E]/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="text-xs font-bold tracking-wider uppercase opacity-80">Дні — тижні</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">
                    Планова евакуація
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed mb-6">
                    Рішення ОВА або превентивне переміщення. Повний план із документами.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors">
                    Планувати
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* CONSULTATION — deep teal/slate */}
            <motion.div variants={fadeUp}>
              <Link
                href="/chat?scenario=consultation"
                data-testid="scenario-consultation"
                className="group relative block h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#172554] text-white p-7 hover:shadow-2xl hover:shadow-[#1E3A5F]/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    <span className="text-xs font-bold tracking-wider uppercase opacity-80">Питання</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">
                    Консультація
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed mb-6">
                    Як запакувати конкретний предмет? Які документи потрібні? Контакти?
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors">
                    Запитати
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* QUICK ACTIONS — compact, icon-driven */}
      <section className="border-t border-border bg-surface/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.p variants={fadeUp} className="text-xs font-medium tracking-widest uppercase text-text-muted mb-2">
              Інструменти
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-3xl font-bold mb-10">
              Швидкі дії
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" data-testid="quick-actions">
              {[
                {
                  title: "Перелік предметів",
                  desc: "п.11 КМУ №229",
                  href: "/documents/perelik-predmetiv",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
                },
                {
                  title: "Чеклісти пакування",
                  desc: "8 типів предметів",
                  href: "/checklists",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
                },
                {
                  title: "Наказ про евакуацію",
                  desc: "п.9(3) КМУ №229",
                  href: "/documents/nakaz-evakuatsiia",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                },
                {
                  title: "База знань",
                  desc: "8 нормативних документів",
                  href: "/knowledge",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
                },
              ].map((a) => (
                <motion.div key={a.title} variants={fadeUp}>
                  <Link
                    href={a.href}
                    className="group flex items-start gap-3.5 p-4 rounded-xl border border-border bg-bg-elevated hover:border-accent/40 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text-muted group-hover:text-accent group-hover:bg-accent-soft transition-colors">
                      {a.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm group-hover:text-accent transition-colors">{a.title}</p>
                      <p className="text-[11px] text-text-muted mt-0.5 font-mono">{a.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-text-muted leading-relaxed">
            <p className="font-medium text-text-secondary mb-1">Нормативна база</p>
            <p>КМУ №229 · ЗУ №249/95-ВР · МКІП №424 · КМУ №841 · ICCROM First Aid</p>
          </div>
          <p className="text-xs text-text-muted">
            Довідковий характер — не замінює НПА
          </p>
        </div>
      </footer>
    </div>
  );
}
