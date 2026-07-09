"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; message: string };
type ToastContextValue = { showError: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showError = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showError }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast toast--error">
            <span className="toast__icon">✕</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
