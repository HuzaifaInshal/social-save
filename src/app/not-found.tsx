import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="auth-layout container">
      <section className="card" style={{ padding: "2rem", textAlign: "center" }}>
        <span className="hero__eyebrow">404</span>
        <h1 style={{ marginTop: 0 }}>This page drifted out of the collection.</h1>
        <p style={{ color: "var(--muted)" }}>
          The link you opened does not exist anymore, but your workspace is still right where you
          left it.
        </p>
        <Link href="/" className="hero__cta">
          Back to home
        </Link>
      </section>
    </main>
  );
}
