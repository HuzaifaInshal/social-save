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
          <button className="card-action-btn" onClick={() => onOpen(collection.id)}>Open</button>
          <button className="card-action-btn" onClick={() => onEdit(collection)}>Edit</button>
          <button className="card-action-btn card-action-btn--danger" onClick={() => onDelete(collection)}>Delete</button>
        </div>
      </div>
    </article>
  );
}
