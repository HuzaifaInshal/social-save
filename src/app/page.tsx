import Link from "next/link";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { SiteHeader } from "@/components/layout/site-header";

const features = [
  "Save Facebook, Instagram, YouTube, and TikTok posts in one workspace.",
  "Create nested collections at any depth and move collections anytime.",
  "Manage bulk post and collection actions with confirmation modals.",
  "Use Google sign-in with Firebase Auth and Firestore for multi-user data.",
];

export default function HomePage() {
  return (
    <div className="shell">
      <SiteHeader />
      <main>
        <section className="hero container">
          <div className="hero__content">
            <span className="hero__eyebrow">One place for every saved post</span>
            <h1>Bring your scattered social posts into a library you can actually navigate.</h1>
            <p>
              Social Save gives you nested collections, bulk actions, quick previews, and a calmer
              way to organize links from every major social platform.
            </p>
            <div className="hero__actions">
              <Link href="/dashboard" className="hero__cta">
                Open dashboard
              </Link>
              <a href="#features" className="hero__secondary">
                Explore features
              </a>
            </div>
          </div>
          <div className="hero__panel card">
            <SignInPanel />
          </div>
        </section>

        <section id="features" className="container feature-section">
          {features.map((feature) => (
            <article key={feature} className="feature-card card">
              <h3>{feature.split(".")[0]}</h3>
              <p>{feature}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
