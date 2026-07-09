"use client";

import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";

type ConfirmationModalProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  extra?: React.ReactNode;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  extra,
  loading,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      loading={loading}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? "Working…" : confirmLabel}
          </Button>
        </>
      }
    >
      <p>{description}</p>
      {extra}
    </Modal>
  );
}
