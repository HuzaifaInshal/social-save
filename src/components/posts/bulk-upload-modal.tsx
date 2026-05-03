"use client";

import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { FieldWrapper, TextArea } from "@/components/ui/field";

type BulkUploadModalProps = {
  onClose: () => void;
  onSubmit: (rawText: string) => Promise<void> | void;
};

export function BulkUploadModal({ onClose, onSubmit }: BulkUploadModalProps) {
  const [value, setValue] = useState("");

  return (
    <Modal
      title="Bulk add posts"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit(value)}>Import posts</Button>
        </>
      }
    >
      <FieldWrapper
        label="One post per line"
        hint="Format: title | description | link"
      >
        <TextArea
          rows={10}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={"Summer reel | Outfit notes | https://instagram.com/..."}
        />
      </FieldWrapper>
    </Modal>
  );
}
