"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  loading?: boolean;
};

export function Modal({ title, children, onClose, footer, loading }: ModalProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, loading]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="modal">
        <div className="modal__header">
          <h3>{title}</h3>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            style={{ padding: "0.25rem 0.4rem", fontSize: "1rem", lineHeight: 1 }}
          >
            ✕
          </Button>
        </div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
