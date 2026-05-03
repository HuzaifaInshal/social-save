"use client";

import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, TextArea } from "@/components/ui/field";

type BulkUploadModalProps = {
  loading?: boolean;
  onClose: () => void;
  onSubmitLinks: (rawText: string) => Promise<void> | void;
  onSubmitPosts: (rawText: string) => Promise<void> | void;
};

type Tab = "links" | "posts";

export function BulkUploadModal({ loading, onClose, onSubmitLinks, onSubmitPosts }: BulkUploadModalProps) {
  const [tab, setTab] = useState<Tab>("links");
  const [links, setLinks] = useState("");
  const [posts, setPosts] = useState("");

  const linkCount = links.split("\n").map((l) => l.trim()).filter(Boolean).length;
  const postCount = posts.split("\n").map((l) => l.trim()).filter(Boolean).length;

  const count = tab === "links" ? linkCount : postCount;
  const value = tab === "links" ? links : posts;

  return (
    <Modal
      title="Bulk add posts"
      onClose={onClose}
      loading={loading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => void (tab === "links" ? onSubmitLinks(links) : onSubmitPosts(posts))}
            disabled={loading || count === 0}
          >
            {loading ? "Importing…" : `Import ${count > 0 ? count : ""} ${count === 1 ? "post" : "posts"}`}
          </Button>
        </>
      }
    >
      <div className="bulk-tabs">
        <button className={`bulk-tab${tab === "links" ? " bulk-tab--active" : ""}`} onClick={() => setTab("links")}>
          Links only
        </button>
        <button className={`bulk-tab${tab === "posts" ? " bulk-tab--active" : ""}`} onClick={() => setTab("posts")}>
          Full format
        </button>
      </div>

      {tab === "links" ? (
        <div className="field">
          <div className="field__label-row">
            <span className="field__label">One link per line</span>
            {linkCount > 0 && <span className="bulk-counter">{linkCount} {linkCount === 1 ? "link" : "links"}</span>}
          </div>
          <TextArea
            rows={10}
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder={"https://instagram.com/p/...\nhttps://youtube.com/watch?v=...\nhttps://tiktok.com/@user/video/..."}
          />
        </div>
      ) : (
        <FieldWrapper label="One post per line" hint="Format: title | description | link">
          <TextArea
            rows={10}
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
            placeholder={"Summer reel | Outfit notes | https://instagram.com/..."}
          />
        </FieldWrapper>
      )}
    </Modal>
  );
}
