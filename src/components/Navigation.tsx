"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccessibility } from "./ThemeProvider";

const navItems = [
  { href: "/", label: "Головна" },
  { href: "/chat", label: "AI Чат" },
  { href: "/checklists", label: "Чеклісти" },
  { href: "/documents", label: "Документи" },
  { href: "/knowledge", label: "База знань" },
];

const mobileIcons: Record<string, React.ReactNode> = {
  "/": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  "/chat": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  "/checklists": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  "/documents": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  "/knowledge": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  ),
};

function isActive(href: string, pathname: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(href + "/");
}

export function Navigation() {
  const pathname = usePathname();
  const { fontSize, setFontSize, highContrast, toggleContrast } =
    useAccessibility();

  return (
    <>
      {/* ── Accessibility bar ── */}
      <div className="hidden lg:block border-b border-border bg-surface text-xs no-print">
        <div className="max-w-6xl mx-auto px-6 h-8 flex items-center justify-end gap-3 text-text-muted">
          <span className="mr-1">Розмір шрифту:</span>
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-hover"
            aria-label="Зменшити шрифт"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize(16)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-hover"
            aria-label="Стандартний шрифт"
          >
            A
          </button>
          <button
            onClick={() => setFontSize(Math.min(22, fontSize + 2))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-hover"
            aria-label="Збільшити шрифт"
          >
            A+
          </button>
          <span className="w-px h-4 bg-border mx-1" />
          <button
            onClick={toggleContrast}
            className={`px-2 py-0.5 rounded text-xs ${highContrast ? "bg-text text-bg" : "hover:bg-surface-hover"}`}
            aria-label="Висококонтрастний режим"
          >
            Контраст
          </button>
        </div>
      </div>

      {/* ── Main nav ── */}
      <nav
        aria-label="Головна навігація"
        className="border-b border-border bg-bg sticky top-0 z-50 no-print"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-text hover:opacity-80 transition-opacity"
            aria-label="MuseumAID — головна"
          >
            Museum<span className="bg-accent px-1">AID</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-xs font-medium uppercase tracking-widest transition-colors ${
                  isActive(item.href, pathname)
                    ? "text-text border-b-2 border-text"
                    : "text-text-muted hover:text-text"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        aria-label="Мобільна навігація"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] no-print"
      >
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  active ? "text-text" : "text-text-muted"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {mobileIcons[item.href]}
                <span className="text-[10px] font-medium leading-none">
                  {item.label === "База знань" ? "Знання" : item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
