"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="ghost" onClick={toggleTheme}>
      {theme === "light" ? "Dark mode" : "Light mode"}
    </Button>
  );
}
