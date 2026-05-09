"use client";

import { PostItem } from "@/types";
import { getEmbedUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = { post: PostItem; onClose: () => void };

export function PostEmbedModal({ post, onClose }: Props) {
  const embedUrl = getEmbedUrl(post.link, post.platform);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="embed-modal">
        <div className="embed-modal__header">
          <span className="embed-modal__title">{post.title}</span>
          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: "0.25rem 0.4rem", fontSize: "1rem", lineHeight: 1 }}
          >
            ✕
          </Button>
        </div>
        <div className="embed-modal__body">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="embed-modal__iframe"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              title={post.title}
            />
          ) : (
            <div className="embed-modal__fallback">
              <p>No embed available.</p>
              <a href={post.link} target="_blank" rel="noreferrer">Open original link ↗</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
