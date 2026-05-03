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
  onClose: () => void;
  onSubmit: (values: PostFormValues) => Promise<void> | void;
};

export function PostFormModal({
  title,
  collections,
  initialValues,
  onClose,
  onSubmit,
}: PostFormModalProps) {
  const [values, setValues] = useState(initialValues);

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit(values)}>Save post</Button>
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
            onChange={(event) =>
              setValues((current) => ({ ...current, collectionId: event.target.value || null }))
            }
          >
            <option value="">Root level</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.title}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>
      </div>
    </Modal>
  );
}
