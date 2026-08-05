"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ExtensionBridge } from "@/components/providers/extension-bridge";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ExtensionBridge />
            {children}
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
