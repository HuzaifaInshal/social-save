"use client";

import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, SelectInput, TextArea, TextInput } from "@/components/ui/field";
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
  const [values, setValues] = useState(initialValues);

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
        <FieldWrapper label="Description">
          <TextArea
            rows={4}
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
      </div>
    </Modal>
  );
}
