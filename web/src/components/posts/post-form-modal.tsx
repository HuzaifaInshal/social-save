"use client";

import { useState } from "react";
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

  // Calculate available tags from collection & parent collections hierarchy
  const availableCollectionTags = getInheritedTags(values.collectionId, collections);

  // Combine available collection tags with any tags already assigned to this post
  const allSelectableTags = Array.from(
    new Set([...availableCollectionTags, ...(values.tags ?? [])])
  );

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

        <FieldWrapper label="Select Tags">
          {allSelectableTags.length > 0 ? (
            <div className="tag-chips-selectable">
              {allSelectableTags.map((tag) => {
                const isSelected = (values.tags ?? []).includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip tag-chip--selectable ${isSelected ? "tag-chip--selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {tag}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="tag-hint-text">
              No tags created for this collection yet. Tags can be created when creating or editing a collection.
            </p>
          )}
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


