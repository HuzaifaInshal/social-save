"use client";

import { useState, useCallback } from "react";
import { platformLabels } from "@/lib/constants";
import { PostItem } from "@/types";

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  youtube: "▶",
  tiktok: "♪",
  facebook: "f",
  other: "🔗",
};

type PostReaderProps = {
  posts: PostItem[];
};

export function PostReader({ posts }: PostReaderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goUp = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goDown = useCallback(() => {
    setActiveIndex((i) => Math.min(posts.length - 1, i + 1));
  }, [posts.length]);

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon">🔗</span>
        <p>No posts saved here yet.</p>
      </div>
    );
  }

  const current = posts[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === posts.length - 1;

  return (
    <div className="post-reader">
      {/* Navigation rail on the right */}
      <div className="post-reader__nav">
        <button
          className="post-reader__nav-btn"
          onClick={goUp}
          disabled={isFirst}
          aria-label="Previous post"
          title="Previous post"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 12.5L10 7.5L15 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="post-reader__nav-indicator">
          <span className="post-reader__nav-current">{activeIndex + 1}</span>
          <span className="post-reader__nav-sep">/</span>
          <span className="post-reader__nav-total">{posts.length}</span>
        </div>

        <button
          className="post-reader__nav-btn"
          onClick={goDown}
          disabled={isLast}
          aria-label="Next post"
          title="Next post"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Main content area */}
      <div className="post-reader__content">
        {/* Post info bar */}
        <div className="post-reader__info-bar">
          <div className="post-reader__info-left">
            <span className="post-reader__platform-icon" data-platform={current.platform}>
              {platformEmoji[current.platform] ?? "🔗"}
            </span>
            <div className="post-reader__meta">
              <span className="post-reader__title">{current.title}</span>
              <span className="post-reader__badge">{platformLabels[current.platform]}</span>
            </div>
          </div>
          <div className="post-reader__info-right">
            <span className="post-reader__host">{safeHost(current.link)}</span>
            <a
              href={current.link}
              target="_blank"
              rel="noreferrer"
              className="post-reader__open-btn"
            >
              Open in new tab ↗
            </a>
          </div>
        </div>

        {/* Sandboxed iframe */}
        <div className="post-reader__iframe-wrap">
          <div className="post-reader__iframe-shield">
            <span className="post-reader__shield-icon">🔒</span>
            <span>Sandboxed Preview</span>
          </div>
          <iframe
            key={current.id}
            src={current.link}
            className="post-reader__iframe"
            sandbox="allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer"
            loading="lazy"
            title={`Preview: ${current.title}`}
          />
        </div>
      </div>
    </div>
  );
}

function safeHost(link: string) {
  try {
    return new URL(link).hostname.replace("www.", "");
  } catch {
    return link;
  }
}
