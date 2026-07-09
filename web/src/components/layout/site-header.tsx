"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        {/* Wordmark */}
        <Link href="/" className="brand">
          <svg className="brand__mark" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#5e6ad2" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#5e6ad2" opacity="0.6" />
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#5e6ad2" opacity="0.6" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#5e6ad2" opacity="0.35" />
          </svg>
          Social Save
        </Link>

        {/* Center nav */}
        <nav className="site-header__nav">
          <a href="#features" className="site-header__link">Features</a>
          <a href="#workflow" className="site-header__link">How it works</a>
        </nav>

        {/* Right actions */}
        <div className="site-header__actions">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/dashboard" className="l-btn l-btn--secondary" style={{ fontSize: "13px", padding: "6px 12px" }}>
                Dashboard
              </Link>
              <button
                className="l-btn l-btn--secondary"
                style={{ fontSize: "13px", padding: "6px 12px" }}
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="l-btn l-btn--secondary" style={{ fontSize: "13px", padding: "6px 12px" }}>
                Sign in
              </Link>
              <Link href="/dashboard" className="l-btn l-btn--primary" style={{ fontSize: "13px", padding: "6px 12px" }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
