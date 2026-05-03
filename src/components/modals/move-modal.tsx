"use client";

import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, SelectInput } from "@/components/ui/field";
import { CollectionItem } from "@/types";

type MoveModalProps = {
  title: string;
  label: string;
  collections: CollectionItem[];
  excludedIds?: string[];
  includeRoot?: boolean;
  onClose: () => void;
  onSubmit: (targetId: string | null) => Promise<void> | void;
};

export function MoveModal({
  title,
  label,
  collections,
  excludedIds = [],
  includeRoot = true,
  onClose,
  onSubmit,
}: MoveModalProps) {
  const [targetId, setTargetId] = useState<string>("");

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit(targetId || null)}>Move</Button>
        </>
      }
    >
      <FieldWrapper label={label}>
        <SelectInput value={targetId} onChange={(event) => setTargetId(event.target.value)}>
          {includeRoot ? <option value="">Root level</option> : null}
          {collections
            .filter((collection) => !excludedIds.includes(collection.id))
            .map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.title}
              </option>
            ))}
        </SelectInput>
      </FieldWrapper>
    </Modal>
  );
}
