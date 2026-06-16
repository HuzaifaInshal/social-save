"use client";

import { platformLabels } from "@/lib/constants";
import { PostItem } from "@/types";
import { cn } from "@/lib/utils";

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  youtube: "▶",
  tiktok: "♪",
  facebook: "f",
  other: "🔗",
};

type PostCardProps = {
  post: PostItem;
  checked: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (post: PostItem) => void;
  onDelete: (post: PostItem) => void;
};

export function PostCard({ post, checked, onToggleSelect, onEdit, onDelete }: PostCardProps) {
  const host = safeHost(post.link);

  return (
    <article className={cn("post-card", checked && "post-card--selected")}>
      {/* Image / Banner area */}
      <div className="post-card__banner" data-platform={post.platform}>
        <label className="selector post-card__select" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggleSelect(post.id)}
            aria-label={`Select ${post.title}`}
          />
          <span className="selector__box" />
        </label>
        <div className="post-card__banner-icon">
          {platformEmoji[post.platform] ?? "🔗"}
        </div>
      </div>

      {/* Body */}
      <div className="post-card__body">
        <div className="post-card__platform-row">
          <span className="post-card__platform-dot" data-platform={post.platform}>
            {platformEmoji[post.platform] ?? "🔗"}
          </span>
          <span className="post-card__platform-name">{platformLabels[post.platform]}</span>
        </div>
        <span className="post-card__host">{host}</span>
      </div>

      {/* Action icons footer */}
      <div className="post-card__footer">
        <a
          href={post.link}
          target="_blank"
          rel="noreferrer"
          className="card-action-btn"
          title="Open link"
        >
          {/* External link icon */}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M6 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V10M10 2h4v4M7 9l7-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <button className="card-action-btn" onClick={() => onEdit(post)} title="Edit post">
          {/* Pencil icon */}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="card-action-btn card-action-btn--danger" onClick={() => onDelete(post)} title="Delete post">
          {/* Trash icon */}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 4h11M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M12 4v8.5a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 014 12.5V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </article>
  );
}

function safeHost(link: string) {
  try {
    return new URL(link).hostname.replace("www.", "");
  } catch {
    return link;
  }
}
