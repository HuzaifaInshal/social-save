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
  loading?: boolean;
  onClose: () => void;
  onSubmit: (targetId: string | null) => Promise<void> | void;
};

export function MoveModal({
  title,
  label,
  collections,
  excludedIds = [],
  includeRoot = true,
  loading,
  onClose,
  onSubmit,
}: MoveModalProps) {
  const [targetId, setTargetId] = useState<string>("");

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
          <Button onClick={() => void onSubmit(targetId || null)} disabled={loading}>
            {loading ? "Moving…" : "Move"}
          </Button>
        </>
      }
    >
      <FieldWrapper label={label}>
        <SelectInput
          value={targetId}
          onValueChange={setTargetId}
          options={[
            ...(includeRoot ? [{ value: "", label: "Root level" }] : []),
            ...collections
              .filter((c) => !excludedIds.includes(c.id))
              .map((c) => ({ value: c.id, label: c.title })),
          ]}
        />
      </FieldWrapper>
    </Modal>
  );
}
