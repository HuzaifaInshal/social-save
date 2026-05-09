"use client";

import { platformLabels } from "@/lib/constants";
import { PostItem } from "@/types";
import { cn } from "@/lib/utils";
import { getEmbedUrl } from "@/lib/utils";

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
  view: "grid" | "feed";
  onToggleSelect: (id: string) => void;
  onEdit: (post: PostItem) => void;
  onDelete: (post: PostItem) => void;
  onPreview: (post: PostItem) => void;
};

export function PostCard({ post, checked, view, onToggleSelect, onEdit, onDelete, onPreview }: PostCardProps) {
  const host = safeHost(post.link);
  const embedUrl = getEmbedUrl(post.link, post.platform);

  if (view === "feed") {
    return (
      <article className={cn("post-feed-item", checked && "post-feed-item--selected")}>
        <div className="post-feed-item__header">
          <label className="selector" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggleSelect(post.id)}
              aria-label={`Select ${post.title}`}
            />
            <span className="selector__box" />
          </label>
          <span className="post-card__platform-badge">{platformLabels[post.platform]}</span>
          <span className="post-feed-item__title">{post.title}</span>
          <div className="post-card__actions" style={{ marginLeft: "auto" }}>
            <a href={post.link} target="_blank" rel="noreferrer" className="card-action-btn">Open</a>
            <button className="card-action-btn" onClick={() => onEdit(post)}>Edit</button>
            <button className="card-action-btn card-action-btn--danger" onClick={() => onDelete(post)}>Delete</button>
          </div>
        </div>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="post-feed-item__iframe"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy"
            title={post.title}
          />
        ) : (
          <div className="post-feed-item__no-embed">
            No embed available — <a href={post.link} target="_blank" rel="noreferrer">open link ↗</a>
          </div>
        )}
      </article>
    );
  }

  return (
    <article className={cn("post-card", checked && "post-card--selected")}>
      <div
        className="post-card__banner"
        data-platform={post.platform}
        onClick={() => onPreview(post)}
        title="Click to preview"
      >
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
        {embedUrl && <div className="post-card__play-hint">▶ Preview</div>}
      </div>

      <div className="post-card__body">
        <span className="post-card__platform-badge">{platformLabels[post.platform]}</span>
        <p className="post-card__title">{post.title}</p>
        {post.description && <p className="post-card__desc">{post.description}</p>}
      </div>

      <div className="post-card__footer">
        <span className="post-card__host">{host}</span>
        <div className="post-card__actions">
          <a href={post.link} target="_blank" rel="noreferrer" className="card-action-btn">Open</a>
          <button className="card-action-btn" onClick={() => onEdit(post)}>Edit</button>
          <button className="card-action-btn card-action-btn--danger" onClick={() => onDelete(post)}>Delete</button>
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
