"use client";

import { useState } from "react";

type ResourceRatingProps = {
  rating: number | null;
  onRatingChange: (rating: number) => void;
  readOnly?: boolean;
  maxRating?: number;
};

export function ResourceRating({
  rating,
  onRatingChange,
  readOnly = false,
  maxRating = 5,
}: ResourceRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleClick = (value: number) => {
    if (!readOnly) {
      onRatingChange(value);
    }
  };

  const displayRating = hoveredRating || rating || 0;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readOnly && setHoveredRating(value)}
          onMouseLeave={() => setHoveredRating(null)}
          disabled={readOnly}
          className={`transition ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
          aria-label={`Rate ${value} out of ${maxRating}`}
          aria-pressed={value === rating}
        >
          <svg
            className={`h-5 w-5 ${
              value <= displayRating
                ? "fill-[var(--warning)] text-[var(--warning)]"
                : "fill-[var(--surface-muted)] text-[var(--border-subtle)]"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        </button>
      ))}
      {rating !== null && (
        <span className="ml-2 text-sm text-[var(--text-secondary)]">{rating}/{maxRating}</span>
      )}
    </div>
  );
}
