import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";

const features = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z" fill="currentColor" />
      </svg>
    ),
    title: "Nested collections",
    body: "Build deep hierarchies — collections inside collections. Move entire branches whenever your system evolves.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Every major platform",
    body: "Save from Instagram, YouTube, TikTok, Facebook, and anywhere else. One unified library.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Bulk operations",
    body: "Select dozens of posts or collections at once. Move, delete, and reorganize with a single action.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Private by default",
    body: "Google sign-in with Firebase keeps every workspace isolated. Only you see your saved content.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1l1.5 4h4l-3.3 2.4 1.3 4L7 9 3.5 11.4l1.3-4L1.5 5h4z" fill="currentColor" opacity="0.8" />
      </svg>
    ),
    title: "Light & dark mode",
    body: "Switch between a crisp light workspace and a deep dark canvas. Your preference is remembered.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8h4v4H8z" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
    title: "Instant search",
    body: "Find any saved post or collection across your entire library in milliseconds.",
  },
];

const steps = [
  {
    num: "01",
    title: "Sign in with Google",
    body: "One click. Firebase Authentication creates your private workspace instantly.",
  },
  {
    num: "02",
    title: "Create collections",
    body: "Build a structure that matches how you think — nest collections as deep as you need.",
  },
  {
    num: "03",
    title: "Save posts",
    body: "Paste any link from Instagram, YouTube, TikTok, or Facebook. Add a title and description.",
  },
];

const testimonials = [
  {
    quote: "Finally a place to put all the references I save and actually find them again. The nested collections are exactly what I needed.",
    name: "A.R.",
    role: "Designer",
    initial: "A",
  },
  {
    quote: "I was using browser bookmarks and spreadsheets. Social Save replaced both. The bulk move feature alone saved me hours.",
    name: "M.K.",
    role: "Content creator",
    initial: "M",
  },
  {
    quote: "Clean, fast, and private. I keep research for different clients in separate collections and it never gets messy.",
    name: "S.L.",
    role: "Freelance strategist",
    initial: "S",
  },
];

const platforms = ["Instagram", "YouTube", "TikTok", "Facebook", "Twitter / X", "LinkedIn", "Pinterest", "Reddit"];

export default function HomePage() {
  return (
    <div className="landing">
      <SiteHeader />

      <main>
        {/* ── Hero ── */}
        <section className="l-hero">
          <div className="l-hero__inner container">
            <p className="l-eyebrow l-hero__eyebrow">Your personal content library</p>
            <h1>
              Save every post.<br />
              Find it instantly.
            </h1>
            <p className="l-hero__sub">
              Turn scattered bookmarks into a structured library with nested
              collections, bulk actions, and a workspace built for focus.
            </p>
            <div className="l-hero__actions">
              <Link href="/dashboard" className="l-btn l-btn--primary">
                Start for free
              </Link>
              <a href="#features" className="l-btn l-btn--secondary">
                See features
              </a>
            </div>

            {/* Product screenshot */}
            <div className="l-screenshot">
              <div className="l-screenshot__bar">
                <div className="l-screenshot__dots">
                  <div className="l-screenshot__dot" />
                  <div className="l-screenshot__dot" />
                  <div className="l-screenshot__dot" />
                </div>
                <div className="l-screenshot__url" />
              </div>
              <div className="l-screenshot__body">
                {/* Sidebar */}
                <div className="l-screenshot__sidebar">
                  <div className="l-ss-section" />
                  <div className="l-ss-nav l-ss-nav--active" />
                  <div className="l-ss-nav" />
                  <div className="l-ss-nav" />
                  <div className="l-ss-nav" />
                  <div className="l-ss-section" style={{ marginTop: "20px" }} />
                  <div className="l-ss-nav" />
                  <div className="l-ss-nav" />
                  <div className="l-ss-nav" />
                </div>
                {/* Content */}
                <div className="l-screenshot__content">
                  <div className="l-ss-topbar">
                    <div className="l-ss-topbar__title" />
                    <div className="l-ss-topbar__spacer" />
                    <div className="l-ss-topbar__btn" />
                  </div>
                  {/* Card grid */}
                  <div className="l-ss-grid">
                    {[
                      { tag: "l-ss-card__tag--purple" },
                      { tag: "l-ss-card__tag--green" },
                      { tag: "l-ss-card__tag--gray" },
                      { tag: "l-ss-card__tag--purple" },
                      { tag: "l-ss-card__tag--gray" },
                      { tag: "l-ss-card__tag--green" },
                    ].map((c, i) => (
                      <div key={i} className="l-ss-card">
                        <div className={`l-ss-card__tag ${c.tag}`} />
                        <div className="l-ss-card__line" />
                        <div className="l-ss-card__line l-ss-card__line--short" />
                        <div className="l-ss-card__line l-ss-card__line--xshort" />
                      </div>
                    ))}
                  </div>
                  {/* Row list */}
                  {[
                    { dot: "l-ss-row__dot--purple" },
                    { dot: "l-ss-row__dot--green" },
                    { dot: "l-ss-row__dot--gray" },
                  ].map((r, i) => (
                    <div key={i} className="l-ss-row">
                      <div className={`l-ss-row__dot ${r.dot}`} />
                      <div className="l-ss-row__text" />
                      <div className="l-ss-row__text l-ss-row__text--short" />
                      <div className="l-ss-row__badge" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Platform logos ── */}
        <div className="l-logos">
          <div className="container">
            <p className="l-eyebrow l-logos__label">Works with every platform you use</p>
            <div className="l-logos__row">
              {platforms.map((p) => (
                <span key={p} className="l-logo-tile">{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Features ── */}
        <section id="features" className="l-features container">
          <div className="l-features__header">
            <p className="l-eyebrow">Features</p>
            <h2>Everything you need to stay organized</h2>
          </div>
          <div className="l-features__grid">
            {features.map((f) => (
              <div key={f.title} className="l-feature-card">
                <div className="l-feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Workflow ── */}
        <section id="workflow" className="l-workflow container">
          <div className="l-workflow__panel">
            <div className="l-workflow__header">
              <div>
                <p className="l-eyebrow">How it works</p>
                <h2>Up and running in under a minute</h2>
              </div>
              <p>No setup, no configuration. Sign in and start saving. Your library grows with you.</p>
            </div>
            <div className="l-workflow__steps">
              {steps.map((s) => (
                <div key={s.num} className="l-step">
                  <span className="l-step__num">{s.num}</span>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="l-testimonials container">
          <div className="l-testimonials__header">
            <p className="l-eyebrow">What people say</p>
            <h2>Built for people who save a lot</h2>
          </div>
          <div className="l-testimonials__grid">
            {testimonials.map((t) => (
              <div key={t.name} className="l-testimonial">
                <p className="l-testimonial__quote">"{t.quote}"</p>
                <div className="l-testimonial__author">
                  <div className="l-testimonial__avatar">{t.initial}</div>
                  <div>
                    <div className="l-testimonial__name">{t.name}</div>
                    <div className="l-testimonial__role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="l-cta container">
          <div className="l-cta__inner">
            <div className="l-cta__copy">
              <h2>Your saved internet, finally organized.</h2>
              <p>Sign in with Google and start building your library in seconds.</p>
            </div>
            <div className="l-cta__actions">
              <Link href="/dashboard" className="l-btn l-btn--primary">
                Open your workspace
              </Link>
              <a href="#features" className="l-btn l-btn--secondary">
                Learn more
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="l-footer">
        <div className="container l-footer__inner">
          <div>
            <div className="l-footer__brand">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#5e6ad2" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#5e6ad2" opacity="0.6" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#5e6ad2" opacity="0.6" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#5e6ad2" opacity="0.35" />
              </svg>
              Social Save
            </div>
            <p className="l-footer__tagline">© {new Date().getFullYear()} Social Save. Built with Next.js &amp; Firebase.</p>
          </div>
          <div className="l-footer__links">
            <a href="#features" className="l-footer__link">Features</a>
            <a href="#workflow" className="l-footer__link">How it works</a>
            <Link href="/dashboard" className="l-footer__link">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
