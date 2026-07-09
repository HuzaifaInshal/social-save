import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";
import "./site.css";
import "./landing.css";
import "./auth.css";
import "./ui.css";
import "./dashboard/dashboard.css";
import "./dashboard/cards.css";

export const metadata: Metadata = {
  title: "Social Save",
  description: "Organize your saved social posts with nested collections.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
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
