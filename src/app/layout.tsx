import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";
import "./site.css";
import "./dashboard/dashboard.css";

export const metadata: Metadata = {
  title: "Social Save",
  description: "Organize your saved social posts with nested collections.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
