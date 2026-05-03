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
  onClose: () => void;
  onSubmit: (values: CollectionFormValues) => Promise<void> | void;
};

export function CollectionFormModal({
  title,
  collections,
  initialValues,
  excludedIds = [],
  onClose,
  onSubmit,
}: CollectionFormModalProps) {
  const [values, setValues] = useState(initialValues);

  const options = collections.filter((collection) => !excludedIds.includes(collection.id));

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit(values)}>Save collection</Button>
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
            onChange={(event) =>
              setValues((current) => ({ ...current, parentId: event.target.value || null }))
            }
          >
            <option value="">Root level</option>
            {options.map((collection) => (
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
