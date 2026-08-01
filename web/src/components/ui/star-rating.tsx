"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  allowClear?: boolean;
};

export function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  className,
  allowClear = true,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = (star: number) => {
    if (readOnly || !onChange) return;
    // If clicking same rating, clear to 0 if allowClear is true
    if (allowClear && star === value) {
      onChange(0);
    } else {
      onChange(star);
    }
  };

  const sizeClass = {
    sm: "star-rating--sm",
    md: "star-rating--md",
    lg: "star-rating--lg",
  }[size];

  return (
    <div
      className={cn("star-rating", sizeClass, readOnly && "star-rating--readonly", className)}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`Rating: ${value} out of 5 stars`}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        if (readOnly) {
          return (
            <span
              key={star}
              className={cn("star-icon", isFilled ? "star-icon--filled" : "star-icon--empty")}
              aria-hidden="true"
            >
              <StarSVG filled={isFilled} />
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            className={cn("star-button", isFilled ? "star-button--filled" : "star-button--empty")}
            onMouseEnter={() => setHoverValue(star)}
            onClick={(e) => {
              e.stopPropagation();
              handleClick(star);
            }}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            aria-checked={star === value}
            role="radio"
          >
            <StarSVG filled={isFilled} />
          </button>
        );
      })}
    </div>
  );
}

function StarSVG({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="star-svg">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
