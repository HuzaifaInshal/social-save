"use client";

import { platformLabels } from "@/lib/constants";
import { PostItem } from "@/types";

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
    <article className="post-card card">
      <div className="post-card__top">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggleSelect(post.id)}
          aria-label={`Select ${post.title}`}
        />
        <span className="post-card__platform">{platformLabels[post.platform]}</span>
      </div>
      <div className="post-preview">
        <strong>{post.title}</strong>
        <p>{post.description || "No description added yet."}</p>
        <span>{host}</span>
      </div>
      <div className="post-card__actions">
        <a href={post.link} target="_blank" rel="noreferrer">
          Open post
        </a>
        <button onClick={() => onEdit(post)}>Edit</button>
        <button onClick={() => onDelete(post)}>Delete</button>
      </div>
    </article>
  );
}

function safeHost(link: string) {
  try {
    return new URL(link).hostname.replace("www.", "");
  } catch {
    return "Invalid URL";
  }
}
