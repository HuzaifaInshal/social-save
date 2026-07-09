"use client";

import { CollectionItem } from "@/types";
import { cn } from "@/lib/utils";

type CollectionCardProps = {
  collection: CollectionItem;
  checked: boolean;
  onOpen: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onEdit: (collection: CollectionItem) => void;
  onDelete: (collection: CollectionItem) => void;
};

export function CollectionCard({ collection, checked, onOpen, onToggleSelect, onEdit, onDelete }: CollectionCardProps) {
  return (
    <article className={cn("collection-card", checked && "collection-card--selected")}>
      <div className="collection-card__top">
        <div className="collection-card__icon">📁</div>
        <label className="selector" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggleSelect(collection.id)}
            aria-label={`Select ${collection.title}`}
          />
          <span className="selector__box" />
        </label>
      </div>

      <button className="collection-card__title" onClick={() => onOpen(collection.id)}>
        {collection.title}
      </button>

      <p className="collection-card__desc">
        {collection.description || "No description yet."}
      </p>

      <div className="collection-card__footer">
        <span className="collection-card__meta">Collection</span>
        <div className="collection-card__actions">
          <button className="card-action-btn" onClick={() => onOpen(collection.id)} aria-label={`Open ${collection.title}`} title="Open">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>
          </button>
          <button className="card-action-btn" onClick={() => onEdit(collection)} aria-label={`Edit ${collection.title}`} title="Edit">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
          </button>
          <button className="card-action-btn card-action-btn--danger" onClick={() => onDelete(collection)} aria-label={`Delete ${collection.title}`} title="Delete">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></svg>
          </button>
        </div>
      </div>
    </article>
  );
}
