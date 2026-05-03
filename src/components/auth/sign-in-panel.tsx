"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/components/ui/toast";

export function SignInPanel() {
  const { signIn, loading, isConfigured } = useAuth();
  const { showError } = useToast();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      {/* Visual side */}
      <div className="auth-visual">
        <div className="auth-visual__bg" />
        <div className="auth-visual__content">
          <div className="auth-visual__logo">
            <span className="auth-visual__logo-icon">
              <svg viewBox="0 0 16 16"><path d="M2 3h5v5H2zM9 3h5v5H9zM2 10h5v3H2zM9 10h5v3H9z" /></svg>
            </span>
            Social Save
          </div>

          {/* SVG Illustration */}
          <svg
            className="auth-visual__illustration"
            viewBox="0 0 400 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background cards */}
            <rect x="20" y="40" width="160" height="100" rx="16" fill="rgba(124,106,247,0.08)" stroke="rgba(124,106,247,0.2)" strokeWidth="1" />
            <rect x="220" y="20" width="160" height="80" rx="16" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
            <rect x="220" y="120" width="160" height="80" rx="16" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.2)" strokeWidth="1" />
            <rect x="20" y="160" width="160" height="80" rx="16" fill="rgba(244,114,182,0.08)" stroke="rgba(244,114,182,0.2)" strokeWidth="1" />

            {/* Card content lines */}
            <rect x="36" y="60" width="80" height="8" rx="4" fill="rgba(124,106,247,0.4)" />
            <rect x="36" y="76" width="120" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="36" y="90" width="100" height="6" rx="3" fill="rgba(255,255,255,0.07)" />
            <rect x="36" y="116" width="60" height="6" rx="3" fill="rgba(255,255,255,0.07)" />

            <rect x="236" y="38" width="70" height="8" rx="4" fill="rgba(52,211,153,0.5)" />
            <rect x="236" y="54" width="110" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="236" y="68" width="90" height="6" rx="3" fill="rgba(255,255,255,0.07)" />

            <rect x="236" y="138" width="70" height="8" rx="4" fill="rgba(251,191,36,0.5)" />
            <rect x="236" y="154" width="110" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="236" y="168" width="80" height="6" rx="3" fill="rgba(255,255,255,0.07)" />

            <rect x="36" y="178" width="70" height="8" rx="4" fill="rgba(244,114,182,0.5)" />
            <rect x="36" y="194" width="110" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="36" y="208" width="90" height="6" rx="3" fill="rgba(255,255,255,0.07)" />

            {/* Connection dots */}
            <circle cx="200" cy="90" r="5" fill="rgba(124,106,247,0.6)" />
            <circle cx="200" cy="160" r="5" fill="rgba(52,211,153,0.6)" />
            <line x1="200" y1="90" x2="200" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Floating accent */}
            <circle cx="340" cy="240" r="30" fill="rgba(124,106,247,0.06)" stroke="rgba(124,106,247,0.15)" strokeWidth="1" />
            <circle cx="60" cy="260" r="20" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.15)" strokeWidth="1" />
          </svg>

          <h2>Your private content library</h2>
          <p>
            Save posts from any platform, organize them into nested collections,
            and find anything instantly.
          </p>

          <div className="auth-visual__features">
            {["Nested collections", "Bulk actions", "Dark & light mode", "Private workspace"].map((f) => (
              <div key={f} className="auth-visual__feature">
                <span className="auth-visual__feature-check">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-form">
          <div className="auth-form__header">
            <h1>Welcome back</h1>
            <p>Sign in to access your saved content library.</p>
          </div>

          <div className="auth-form__body">
            <button
              className="btn btn--google"
              onClick={() => void handleSignIn()}
              disabled={!isConfigured || loading}
            >
              {loading ? (
                <span className="spinner" style={{ borderColor: "var(--text-2)", borderTopColor: "transparent" }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: "0.5rem" }}>
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
              )}
              {loading ? "Signing in…" : "Continue with Google"}
            </button>

            {!isConfigured && (
              <div className="auth-form__warning">
                Firebase environment variables are missing. Add them to <code>.env.local</code> to continue.
              </div>
            )}
          </div>

          <p className="auth-form__footer">
            By signing in you agree to keep your workspace private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
