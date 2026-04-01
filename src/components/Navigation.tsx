"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const navItems = [
  {
    href: "/",
    label: "Головна",
    mobileLabel: "Головна",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Чат",
    mobileLabel: "Чат",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    href: "/checklists",
    label: "Чеклісти",
    mobileLabel: "Чеклісти",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Документи",
    mobileLabel: "Документи",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/knowledge",
    label: "База знань",
    mobileLabel: "Знання",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
];

function isActive(href: string, pathname: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(href + "/");
}

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* ── Desktop top bar ── */}
      <nav
        aria-label="Головна навігація"
        className="border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-text hover:text-accent transition-colors"
            aria-label="MuseumAID — головна"
          >
            Museum<span className="text-accent">AID</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive(item.href, pathname)
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
              aria-label={
                theme === "light"
                  ? "Увімкнути темну тему"
                  : "Увімкнути світлу тему"
              }
              data-testid="theme-toggle"
              className="ml-3 w-8 h-8 flex items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              {theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 01-.32-10.99A6.5 6.5 0 0011.5 9a6.5 6.5 0 003.48-1A5.5 5.5 0 018 13.5z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 1v2m0 10v2m-7-7h2m10 0h2m-2.05-4.95L11.5 4.5m-7 7L3.05 12.95m0-9.9L4.5 4.5m7 7 1.45 1.45"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile: only theme toggle in top bar */}
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "light"
                ? "Увімкнути темну тему"
                : "Увімкнути світлу тему"
            }
            data-testid="theme-toggle-mobile"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            {theme === "light" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 01-.32-10.99A6.5 6.5 0 0011.5 9a6.5 6.5 0 003.48-1A5.5 5.5 0 018 13.5z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 1v2m0 10v2m-7-7h2m10 0h2m-2.05-4.95L11.5 4.5m-7 7L3.05 12.95m0-9.9L4.5 4.5m7 7 1.45 1.45"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        aria-label="Мобільна навігація"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  active
                    ? "text-accent"
                    : "text-text-muted active:text-text"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className={active ? "text-accent" : ""}>{item.icon}</span>
                <span className="text-[10px] font-medium leading-none">
                  {item.mobileLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
