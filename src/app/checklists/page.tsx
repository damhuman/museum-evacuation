"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { checklistTypes } from "@/lib/checklists-data";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function ChecklistsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs font-medium tracking-widest uppercase text-accent mb-2">
          ICCROM · МКІП №424
        </p>
        <h1 className="font-display text-3xl font-bold mb-2">Чеклісти пакування</h1>
        <p className="text-text-secondary mb-8">
          Покрокові інструкції для безпечного пакування музейних предметів.
          Базовий принцип: м'який шар → захисний шар → жорсткий контейнер.
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        data-testid="checklist-types"
      >
        {checklistTypes.map((cl) => (
          <motion.div key={cl.id} variants={fadeUp}>
            <Link
              href={`/checklists/${cl.id}`}
              data-testid={`checklist-${cl.id}`}
              className="group block p-5 rounded-xl border border-border bg-bg-elevated hover:border-accent/30 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{cl.icon}</span>
                <div className="min-w-0">
                  <h2 className="font-display font-semibold text-base group-hover:text-accent transition-colors">
                    {cl.title}
                  </h2>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{cl.description}</p>
                  <p className="text-[11px] text-text-muted mt-2 font-mono">{cl.items.length} кроків</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
