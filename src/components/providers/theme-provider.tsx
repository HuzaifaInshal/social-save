"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeMode } from "@/types";

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "social-save-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme = stored ?? preferred;
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = nextTheme;
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        setTheme(nextTheme);
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
