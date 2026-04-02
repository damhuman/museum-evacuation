"use client";

import { createContext, useContext, useState } from "react";

const AccessibilityContext = createContext<{
  fontSize: number;
  setFontSize: (s: number) => void;
  highContrast: boolean;
  toggleContrast: () => void;
}>({
  fontSize: 16,
  setFontSize: () => {},
  highContrast: false,
  toggleContrast: () => {},
});

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  const toggleContrast = () => setHighContrast((v) => !v);

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, toggleContrast }}>
      <div
        style={{ fontSize: `${fontSize}px` }}
        className={`min-h-full flex flex-col flex-1${highContrast ? " high-contrast" : ""}`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}
