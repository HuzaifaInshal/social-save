"use client";

import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";

type ConfirmationModalProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  extra?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  extra,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{description}</p>
      {extra}
    </Modal>
  );
}
