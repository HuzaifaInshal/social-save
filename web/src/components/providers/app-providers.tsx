"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ExtensionBridge } from "@/components/providers/extension-bridge";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ExtensionBridge />
          {children}
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
