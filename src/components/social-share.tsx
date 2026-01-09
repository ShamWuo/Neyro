"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { logger } from "@/lib/logger";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
}

export const SocialShare = memo(function SocialShare({ url, title, description, className = "" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || "");
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const shareTitle = title || "Neyro – PARA Productivity App";
  const shareDescription = description || "One inbox. Seven projects max. Ship the weekly review.";

  const [mounted, setMounted] = useState(false);

  // Set shareUrl after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (!url && typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, [url]);

  // Check for native share after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function") {
      setHasNativeShare(true);
    }
  }, []);

  // Compute shareLinks with useMemo to avoid hydration mismatch
  // Use placeholder URLs during SSR, real URLs after mount
  const shareLinks = useMemo(() => {
    if (!mounted || !shareUrl) {
      return {
        twitter: "#",
        linkedin: "#",
        facebook: "#",
        reddit: "#",
        hackernews: "#",
      };
    }
    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      hackernews: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(shareTitle)}`,
    };
  }, [mounted, shareUrl, shareTitle]);

  const trackShare = useCallback((platform: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("share", { detail: { platform } }));
    }
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare("copy");
    } catch (err) {
      logger.error("Failed to copy to clipboard", err instanceof Error ? err : new Error(String(err)));
    }
  }, [shareUrl, trackShare]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        // Track share event
        trackShare("native");
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  }, [shareTitle, shareDescription, shareUrl, trackShare]);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {hasNativeShare && (
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:shadow-[var(--elev-1)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      )}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackShare("twitter")}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-twitter)] hover:bg-[var(--brand-twitter)] hover:text-[var(--text-inverse)]"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
        Twitter
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackShare("linkedin")}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-linkedin)] hover:bg-[var(--brand-linkedin)] hover:text-[var(--text-inverse)]"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        LinkedIn
      </a>
      <a
        href={shareLinks.reddit}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackShare("reddit")}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-reddit)] hover:bg-[var(--brand-reddit)] hover:text-[var(--text-inverse)]"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-2.597-.083-.03a.5.5 0 0 0-.412.057 1.25 1.25 0 0 1-1.249-1.25V1.25a1.25 1.25 0 0 1 2.498-.056l2.597 2.597.083.03a.5.5 0 0 0 .412-.057 1.25 1.25 0 0 1 1.249 1.25v1.494zm-4.476 3.415a1.25 1.25 0 1 1-2.498 0 1.25 1.25 0 0 1 2.498 0zm5.526 0a1.25 1.25 0 1 1-2.498 0 1.25 1.25 0 0 1 2.498 0zm-9.555 1.25a1.25 1.25 0 1 1 0 2.498 1.25 1.25 0 0 1 0-2.498zm10.61 0a1.25 1.25 0 1 1 0 2.498 1.25 1.25 0 0 1 0-2.498zM14.01 18.5a1.25 1.25 0 1 1 0-2.498 1.25 1.25 0 0 1 0 2.498zm-4.476-1.25a1.25 1.25 0 1 1-2.498 0 1.25 1.25 0 0 1 2.498 0zm7.85 0a1.25 1.25 0 1 1-2.498 0 1.25 1.25 0 0 1 2.498 0zm-6.875 0a1.25 1.25 0 1 1-2.498 0 1.25 1.25 0 0 1 2.498 0z" />
        </svg>
        Reddit
      </a>
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:shadow-[var(--elev-1)] ${
          copied ? "border-[var(--success)] bg-[var(--success)] text-[var(--text-inverse)]" : ""
        }`}
      >
        {copied ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy link
          </>
        )}
      </button>
    </div>
  );
});

