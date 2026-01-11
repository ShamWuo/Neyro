"use client";

import { useState, useEffect } from "react";
import { LazyImage } from "./lazy-image";

type ResourcePreviewProps = {
  url: string;
  title?: string;
  onClose?: () => void;
};

type PreviewData = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

export function ResourcePreview({ url, title }: ResourcePreviewProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchPreview = async () => {
      if (!url?.trim()) {
        setLoading(false);
        setError(true);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        // Validate URL format
        try {
          new URL(url);
        } catch {
          throw new Error("Invalid URL format");
        }

        const res = await fetch(`/api/resource-preview?url=${encodeURIComponent(url)}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (cancelled) return;

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Failed to fetch preview" }));
          throw new Error(errorData.error || "Failed to fetch preview");
        }

        const data = await res.json();
        if (!cancelled) {
          setPreview(data);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching resource preview:", error);
        setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (url) {
      fetchPreview();
    }

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--surface-muted)] rounded w-3/4" />
          <div className="h-3 bg-[var(--surface-muted)] rounded w-full" />
          <div className="h-3 bg-[var(--surface-muted)] rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || (!loading && !preview)) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4" role="alert">
        <p className="text-sm text-[var(--text-secondary)] mb-2">Unable to load preview</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[var(--primary-strong)] hover:underline inline-flex items-center gap-1 transition"
          aria-label={`Open ${url} in new tab`}
        >
          Open link →
        </a>
      </div>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] overflow-hidden shadow-[var(--elev-1)]">
      {preview.image && (
        <LazyImage
          src={preview.image}
          alt={preview.title || title || "Preview"}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 space-y-2">
        {preview.siteName && (
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            {preview.siteName}
          </p>
        )}
        <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">
          {preview.title || title}
        </h4>
        {preview.description && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-3">
            {preview.description}
          </p>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[var(--primary-strong)] hover:underline inline-flex items-center gap-1"
        >
          Visit site →
        </a>
      </div>
    </div>
  );
}
