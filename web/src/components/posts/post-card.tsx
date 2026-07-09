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

      <div className="post-card__body">
        <span className="post-card__platform-badge">{platformLabels[post.platform]}</span>
        <p className="post-card__title">{post.title}</p>
        {post.description && (
          <p className="post-card__desc">{post.description}</p>
        )}
      </div>

      <div className="post-card__footer">
        <span className="post-card__host">{host}</span>
        <div className="post-card__actions">
          <a
            href={post.link}
            target="_blank"
            rel="noreferrer"
            className="card-action-btn"
            aria-label={`Open ${post.title}`}
            title="Open"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>
          </a>
          <button className="card-action-btn" onClick={() => onEdit(post)} aria-label={`Edit ${post.title}`} title="Edit">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
          </button>
          <button className="card-action-btn card-action-btn--danger" onClick={() => onDelete(post)} aria-label={`Delete ${post.title}`} title="Delete">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></svg>
          </button>
        </div>
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
