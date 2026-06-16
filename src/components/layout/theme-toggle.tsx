"use client";

import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="topbar-icon-btn"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M14 9.34A6.5 6.5 0 016.66 2 6.5 6.5 0 108 14.5a6.47 6.47 0 006-5.16z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
