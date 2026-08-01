"use client";

import { useState, KeyboardEvent } from "react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { getInheritedTags } from "@/lib/utils";
import { CollectionFormValues, CollectionItem } from "@/types";

type CollectionFormModalProps = {
  title: string;
  collections: CollectionItem[];
  initialValues: CollectionFormValues;
  excludedIds?: string[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: CollectionFormValues) => Promise<void> | void;
};

export function CollectionFormModal({
  title,
  collections,
  initialValues,
  excludedIds = [],
  loading,
  onClose,
  onSubmit,
}: CollectionFormModalProps) {
  const [values, setValues] = useState<CollectionFormValues>({
    ...initialValues,
    tags: initialValues.tags ?? [],
  });
  const [tagInput, setTagInput] = useState("");

  const options = collections.filter((collection) => !excludedIds.includes(collection.id));
  const inheritedParentTags = getInheritedTags(values.parentId, collections);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (!trimmed) return;
    if (!values.tags?.includes(trimmed)) {
      setValues((prev) => ({
        ...prev,
        tags: [...(prev.tags ?? []), trimmed],
      }));
    }
    setTagInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValues((prev) => ({
      ...prev,
      tags: (prev.tags ?? []).filter((t) => t !== tagToRemove),
    }));
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
            {loading ? "Saving…" : "Save collection"}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <FieldWrapper label="Title">
          <TextInput
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Recipes, tutorials, client work..."
          />
        </FieldWrapper>
        <FieldWrapper label="Description">
          <TextArea
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            rows={3}
            placeholder="What belongs in this collection?"
          />
        </FieldWrapper>
        <FieldWrapper label="Parent collection">
          <SelectInput
            value={values.parentId ?? ""}
            onValueChange={(v) => setValues((current) => ({ ...current, parentId: v || null }))}
            options={[
              { value: "", label: "Root level" },
              ...options.map((c) => ({ value: c.id, label: c.title })),
            ]}
          />
        </FieldWrapper>
        <FieldWrapper label="Collection Tags">
          <div className="tag-manager">
            <div className="tag-input-row">
              <TextInput
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type tag and press Enter (e.g. food, tutorial)..."
              />
              <Button type="button" variant="secondary" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Add Tag
              </Button>
            </div>
            {(values.tags ?? []).length > 0 && (
              <div className="tag-chips-list">
                {(values.tags ?? []).map((tag) => (
                  <span key={tag} className="tag-chip tag-chip--editable">
                    #{tag}
                    <button
                      type="button"
                      className="tag-chip__remove"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {inheritedParentTags.length > 0 && (
              <div className="tag-inherited-box">
                <span className="tag-inherited-label">Inherited from parent collection(s):</span>
                <div className="tag-chips-list">
                  {inheritedParentTags.map((tag) => (
                    <span key={tag} className="tag-chip tag-chip--inherited" title="Inherited from parent collection">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FieldWrapper>
      </div>
    </Modal>
  );
}

