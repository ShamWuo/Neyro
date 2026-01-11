"use client";
import React, { useState } from "react";
import { useProjectQuota } from "@/lib/useProjectQuota";

export default function ActiveProjectsBadge() {
  const { data, loading } = useProjectQuota(0);
  const [showToast, setShowToast] = useState(false);

  if (loading || !data) {
    return <div className="project-badge project-badge--loading" aria-hidden>…</div>;
  }

  const isFull = data.active >= data.limit;
  const isNearLimit = data.active >= data.limit - 1;
  const warningThreshold = 1;

  return (
    <>
      <div
        className={`project-badge ${isFull ? "project-badge--full" : isNearLimit ? "project-badge--warning" : ""}`}
        title={isFull ? "Project limit reached" : isNearLimit ? "Near project limit — consider archiving completed projects" : `${data.remaining} slots remaining`}
        aria-live="polite"
        onMouseEnter={() => {
          if (isNearLimit) setShowToast(true);
        }}
        onMouseLeave={() => setShowToast(false)}
      >
        <span className="project-badge__count">{data.active}/{data.limit}</span>
        <span className="project-badge__label">Projects</span>
        {isNearLimit && <span className="project-badge__warning-icon" aria-label="warning">⚠️</span>}
      </div>
      {showToast && isNearLimit && (
        <div className="project-badge-toast" role="status">
          <p className="project-badge-toast__text">
            You have <strong>{data.limit - data.active}</strong> project slot{data.limit - data.active !== 1 ? "s" : ""} remaining.
          </p>
          <p className="project-badge-toast__hint">Archive completed projects to free up space.</p>
        </div>
      )}
    </>
  );
}
