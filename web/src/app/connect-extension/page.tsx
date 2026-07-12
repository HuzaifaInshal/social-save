"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { getFirebaseConfig } from "@/lib/firebase/config";
import { SignInPanel } from "@/components/auth/sign-in-panel";

export default function ConnectExtensionPage() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<"connecting" | "success">("connecting");

  useEffect(() => {
    if (loading || !user) return;

    const firebaseConfig = getFirebaseConfig();
    const payload = {
      firebaseConfig: {
        apiKey: firebaseConfig.apiKey,
        projectId: firebaseConfig.projectId,
      },
      refreshToken: (user as any).refreshToken,
      uid: user.uid,
    };

    const requestEvent = new CustomEvent("SOCIAL_SAVE_CONNECT_APP", {
      detail: payload,
    });

    let successTimeout: any;

    const handleSuccess = () => {
      setStatus("success");
      successTimeout = setTimeout(() => {
        window.close();
      }, 1500);
    };

    window.addEventListener("SOCIAL_SAVE_CONNECT_SUCCESS", handleSuccess);
    
    // Dispatch connection request to content script
    window.dispatchEvent(requestEvent);

    return () => {
      window.removeEventListener("SOCIAL_SAVE_CONNECT_SUCCESS", handleSuccess);
      if (successTimeout) clearTimeout(successTimeout);
    };
  }, [user, loading]);

  if (loading) {
    return (
      <div className="auth-page" style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div className="spinner" style={{ width: 30, height: 30, marginBottom: "1rem" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Checking connection status...</p>
      </div>
    );
  }

  if (!user) {
    return <SignInPanel />;
  }

  return (
    <div className="auth-page" style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="auth-form" style={{ maxWidth: "420px", textAlign: "center", padding: "3rem", borderRadius: "16px", background: "var(--surface)", border: "1px solid var(--border)" }}>
        {status === "connecting" && (
          <>
            <div className="spinner" style={{ width: 32, height: 32, margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Linking Extension...</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Passing authentication credentials to your browser extension.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ width: "48px", height: "48px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "50%", display: "grid", placeItems: "center", margin: "0 auto 1.5rem", color: "var(--success)", fontSize: "1.5rem" }}>✓</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--success)" }}>Connected Successfully!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>This tab will close automatically in a moment.</p>
          </>
        )}
      </div>
    </div>
  );
}
