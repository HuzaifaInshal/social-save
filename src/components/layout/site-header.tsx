"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand">
          Social Save
        </Link>
        <div className="site-header__actions">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/dashboard" className="site-header__link">
                Dashboard
              </Link>
              <Button variant="secondary" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/dashboard" className="site-header__link">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
