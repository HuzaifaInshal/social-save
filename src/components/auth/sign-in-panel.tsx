"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function SignInPanel() {
  const { signIn, loading, isConfigured } = useAuth();

  return (
    <section className="auth-panel card">
      <span className="hero__eyebrow">Secure workspace</span>
      <h2>Sign in with Google to save posts into your own library.</h2>
      <p>
        Each user sees only their own collections and posts through Firebase Authentication and
        Firestore.
      </p>
      <Button onClick={() => void signIn()} disabled={!isConfigured || loading}>
        Continue with Google
      </Button>
      {!isConfigured ? (
        <p className="auth-panel__warning">
          Firebase environment variables are missing. Add them to `.env.local` first.
        </p>
      ) : null}
    </section>
  );
}
