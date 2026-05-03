"use client";

import { User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signInWithGoogle, signOutUser, subscribeToAuth } from "@/lib/firebase/auth";
import { hasFirebaseEnv } from "@/lib/firebase/config";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasFirebaseEnv()) {
      setLoading(false);
      return;
    }

    return subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: hasFirebaseEnv(),
      signIn: async () => {
        await signInWithGoogle();
      },
      signOut: async () => {
        await signOutUser();
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
