"use client";

import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="btn btn--ghost"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{ padding: "0.45rem 0.6rem", fontSize: "1rem" }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
