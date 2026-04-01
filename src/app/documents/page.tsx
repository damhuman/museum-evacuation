"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { documentTemplates } from "@/lib/documents-data";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function DocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs font-medium tracking-widest uppercase text-accent mb-2">
          КМУ №229
        </p>
        <h1 className="font-display text-3xl font-bold mb-2">Шаблони документів</h1>
        <p className="text-text-secondary mb-8">
          Нормативно обґрунтовані шаблони для оформлення евакуації. Заповніть поля — отримайте готовий документ.
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        data-testid="document-templates"
      >
        {documentTemplates.map((doc) => (
          <motion.div key={doc.id} variants={fadeUp}>
            <Link
              href={`/documents/${doc.id}`}
              data-testid={`document-${doc.id}`}
              className="group block p-5 rounded-xl border border-border bg-bg-elevated hover:border-accent/30 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{doc.icon}</span>
                <div className="min-w-0">
                  <h2 className="font-display font-semibold text-base group-hover:text-accent transition-colors">
                    {doc.title}
                  </h2>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{doc.description}</p>
                  <p className="text-[11px] text-accent/80 font-mono mt-2">{doc.source}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
