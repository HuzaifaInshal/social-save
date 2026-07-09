"use client";

import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, SelectInput, TextArea, TextInput } from "@/components/ui/field";
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
  const [values, setValues] = useState(initialValues);

  const options = collections.filter((collection) => !excludedIds.includes(collection.id));

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
            rows={4}
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
      </div>
    </Modal>
  );
}
