"use client";

import { useState, KeyboardEvent } from "react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { StarRating } from "@/components/ui/star-rating";
import { getInheritedTags } from "@/lib/utils";
import { CollectionItem, PostFormValues } from "@/types";

type PostFormModalProps = {
  title: string;
  collections: CollectionItem[];
  initialValues: PostFormValues;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: PostFormValues) => Promise<void> | void;
};

export function PostFormModal({
  title,
  collections,
  initialValues,
  loading,
  onClose,
  onSubmit,
}: PostFormModalProps) {
  const [values, setValues] = useState<PostFormValues>({
    ...initialValues,
    tags: initialValues.tags ?? [],
  });
  const [customTagInput, setCustomTagInput] = useState("");

  const availableCollectionTags = getInheritedTags(values.collectionId, collections);

  const toggleTag = (tag: string) => {
    setValues((prev) => {
      const currentTags = prev.tags ?? [];
      const hasTag = currentTags.includes(tag);
      return {
        ...prev,
        tags: hasTag ? currentTags.filter((t) => t !== tag) : [...currentTags, tag],
      };
    });
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().toLowerCase().replace(/^#/, "");
    if (!trimmed) return;
    if (!values.tags?.includes(trimmed)) {
      setValues((prev) => ({
        ...prev,
        tags: [...(prev.tags ?? []), trimmed],
      }));
    }
    setCustomTagInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      loading={loading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit(values)} disabled={loading}>
            {loading ? "Saving…" : "Save post"}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <FieldWrapper label="Title">
          <TextInput
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          />
        </FieldWrapper>

        <FieldWrapper label="Collection">
          <SelectInput
            value={values.collectionId ?? ""}
            onValueChange={(v) => setValues((current) => ({ ...current, collectionId: v || null }))}
            options={[
              { value: "", label: "Root level" },
              ...collections.map((c) => ({ value: c.id, label: c.title })),
            ]}
          />
        </FieldWrapper>

        <FieldWrapper label="Rating">
          <div style={{ paddingTop: "0.25rem", paddingBottom: "0.25rem" }}>
            <StarRating
              value={values.rating ?? 0}
              onChange={(rating) => setValues((current) => ({ ...current, rating }))}
              size="lg"
            />
          </div>
        </FieldWrapper>

        <FieldWrapper label="Select Collection Tags">
          {availableCollectionTags.length > 0 ? (
            <div className="tag-chips-selectable">
              {availableCollectionTags.map((tag) => {
                const isSelected = (values.tags ?? []).includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip tag-chip--selectable ${isSelected ? "tag-chip--selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {isSelected ? "✓ #" : "+ #"}
                    {tag}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="tag-hint-text">
              No tags defined on this collection or its parent collections yet. You can add tags in collection settings or add a custom tag below.
            </p>
          )}
        </FieldWrapper>

        <FieldWrapper label="Custom / Selected Tags">
          <div className="tag-manager">
            <div className="tag-input-row">
              <TextInput
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add custom tag..."
              />
              <Button type="button" variant="secondary" onClick={handleAddCustomTag} disabled={!customTagInput.trim()}>
                Add Tag
              </Button>
            </div>
            {(values.tags ?? []).length > 0 && (
              <div className="tag-chips-list" style={{ marginTop: "0.5rem" }}>
                {(values.tags ?? []).map((tag) => (
                  <span key={tag} className="tag-chip tag-chip--editable">
                    #{tag}
                    <button
                      type="button"
                      className="tag-chip__remove"
                      onClick={() => toggleTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </FieldWrapper>

        <FieldWrapper label="Description">
          <TextArea
            rows={3}
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          />
        </FieldWrapper>
        <FieldWrapper label="Post link">
          <TextInput
            type="url"
            value={values.link}
            onChange={(event) => setValues((current) => ({ ...current, link: event.target.value }))}
            placeholder="https://..."
          />
        </FieldWrapper>
      </div>
    </Modal>
  );
}


