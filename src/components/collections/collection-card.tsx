"use client";

import { CollectionItem } from "@/types";

type CollectionCardProps = {
  collection: CollectionItem;
  checked: boolean;
  onOpen: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onEdit: (collection: CollectionItem) => void;
  onDelete: (collection: CollectionItem) => void;
};

export function CollectionCard({
  collection,
  checked,
  onOpen,
  onToggleSelect,
  onEdit,
  onDelete,
}: CollectionCardProps) {
  return (
    <article className="collection-card card">
      <div className="collection-card__top">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggleSelect(collection.id)}
          aria-label={`Select ${collection.title}`}
        />
        <button onClick={() => onOpen(collection.id)} className="collection-card__title">
          {collection.title}
        </button>
      </div>
      <p>{collection.description || "No description added yet."}</p>
      <div className="collection-card__actions">
        <button onClick={() => onOpen(collection.id)}>Open</button>
        <button onClick={() => onEdit(collection)}>Edit</button>
        <button onClick={() => onDelete(collection)}>Delete</button>
      </div>
    </article>
  );
}
