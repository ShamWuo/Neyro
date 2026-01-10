"use client";

import { useState } from "react";
import { useToast } from "./ui/toast";

type ReviewShareButtonProps = {
  reviewId: string;
};

export function ReviewShareButton({ reviewId }: ReviewShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/share`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to generate share link");

      const data = await res.json();
      setShareUrl(data.url);

      // Copy to clipboard
      await navigator.clipboard.writeText(data.url);
      toast({
        title: "Share link copied!",
        description: "Your review summary is ready to share.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to create share link",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleShare}
        disabled={loading}
        className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] disabled:opacity-50"
      >
        {loading ? "Generating..." : "Share Review Summary"}
      </button>
      {shareUrl && (
        <div className="text-xs text-[var(--text-secondary)]">
          <p>Share URL: <a href={shareUrl} className="underline" target="_blank" rel="noreferrer">{shareUrl}</a></p>
        </div>
      )}
    </div>
  );
}

