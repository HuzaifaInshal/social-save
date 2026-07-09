import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

export function Button({ className, variant = "primary", loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn("btn", `btn--${variant}`, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}
