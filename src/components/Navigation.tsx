"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/", label: "Головна" },
  { href: "/chat", label: "Чат" },
  { href: "/checklists", label: "Чеклісти" },
  { href: "/documents", label: "Документи" },
  { href: "/knowledge", label: "База знань" },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav aria-label="Головна навігація" className="border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-text hover:text-accent transition-colors"
          aria-label="MuseumAID — головна"
        >
          Museum<span className="text-accent">AID</span>
        </Link>

        <div className="flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "bg-accent-soft text-accent font-medium"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              }`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Увімкнути темну тему" : "Увімкнути світлу тему"}
            data-testid="theme-toggle"
            className="ml-3 w-8 h-8 flex items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            {theme === "light" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 01-.32-10.99A6.5 6.5 0 0011.5 9a6.5 6.5 0 003.48-1A5.5 5.5 0 018 13.5z" fill="currentColor"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2m0 10v2m-7-7h2m10 0h2m-2.05-4.95L11.5 4.5m-7 7L3.05 12.95m0-9.9L4.5 4.5m7 7 1.45 1.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
