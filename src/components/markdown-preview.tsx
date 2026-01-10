"use client";

import { useMemo } from "react";
import { sanitizeMarkdownHtml } from "@/lib/xss-sanitizer";

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  if (typeof window === "undefined") {
    // Server-side escape
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  const htmlContent = useMemo(() => {
    if (!content) return "";

    // Escape content first for security
    let html = escapeHtml(content);

    // Headers (escaped already)
    html = html.replace(/^### (.*)$/gim, "<h3 class='text-base font-semibold text-[var(--text-primary)] mt-4 mb-2'>$1</h3>");
    html = html.replace(/^## (.*)$/gim, "<h2 class='text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2'>$1</h2>");
    html = html.replace(/^# (.*)$/gim, "<h1 class='text-xl font-semibold text-[var(--text-primary)] mt-4 mb-2'>$1</h1>");

    // Bold (after escaping, need to handle **text**)
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong class='font-semibold text-[var(--text-primary)]'>$1</strong>");

    // Italic
    html = html.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/gim, "<em class='italic'>$1</em>");

    // Code blocks (handle before inline code)
    html = html.replace(/```([\s\S]*?)```/gim, (match, code) => {
      const escapedCode = escapeHtml(code.trim());
      return `<pre class='rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 overflow-x-auto text-xs font-mono text-[var(--text-primary)] my-3'><code>${escapedCode}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/gim, "<code class='rounded bg-[var(--surface-muted)] px-1 py-0.5 text-xs font-mono text-[var(--text-primary)]'>$1</code>");

    // Links (validate URLs)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, (match, text, url) => {
      const escapedText = escapeHtml(text);
      try {
        // Validate URL to prevent javascript: and other dangerous protocols
        const urlObj = new URL(url, window.location.origin);
        if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:" && urlObj.protocol !== "mailto:") {
          // Only allow relative URLs, http/https, and mailto
          if (!url.startsWith("/") && !url.startsWith("#")) {
            return escapedText; // Invalid URL, just show text
          }
        }
        const escapedUrl = escapeHtml(url);
        return `<a href='${escapedUrl}' target='_blank' rel='noopener noreferrer' class='text-[var(--primary-strong)] hover:underline'>${escapedText}</a>`;
      } catch {
        // If URL parsing fails, check if it's a safe relative URL
        if (url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:")) {
          const escapedUrl = escapeHtml(url);
          return `<a href='${escapedUrl}' target='_blank' rel='noopener noreferrer' class='text-[var(--primary-strong)] hover:underline'>${escapedText}</a>`;
        }
        return escapedText; // Invalid URL, just show text
      }
    });

    // Unordered lists
    html = html.replace(/^[\-\+]\s+(.*)$/gim, "<li class='ml-4 list-disc text-sm text-[var(--text-secondary)]'>$1</li>");

    // Ordered lists
    html = html.replace(/^\d+\.\s+(.*)$/gim, "<li class='ml-4 list-decimal text-sm text-[var(--text-secondary)]'>$1</li>");

    // Wrap consecutive list items
    html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gim, (match) => {
      return `<ul class='space-y-1 my-2 list-inside'>${match}</ul>`;
    });

    // Paragraphs (handle non-formatted text)
    const lines = html.split("\n");
    const formattedLines: string[] = [];
    let currentPara: string[] = [];

    for (const line of lines) {
      if (line.trim() === "") {
        if (currentPara.length > 0) {
          const paraText = currentPara.join(" ").trim();
          if (paraText && !paraText.startsWith("<")) {
            formattedLines.push(`<p class='text-sm text-[var(--text-secondary)] leading-relaxed my-2'>${paraText}</p>`);
          } else if (paraText) {
            formattedLines.push(paraText);
          }
          currentPara = [];
        }
      } else if (line.match(/^<[^>]+>/)) {
        // Already formatted HTML tag
        if (currentPara.length > 0) {
          const paraText = currentPara.join(" ").trim();
          if (paraText && !paraText.startsWith("<")) {
            formattedLines.push(`<p class='text-sm text-[var(--text-secondary)] leading-relaxed my-2'>${paraText}</p>`);
          }
          currentPara = [];
        }
        formattedLines.push(line);
      } else {
        currentPara.push(line);
      }
    }

    if (currentPara.length > 0) {
      const paraText = currentPara.join(" ").trim();
      if (paraText && !paraText.startsWith("<")) {
        formattedLines.push(`<p class='text-sm text-[var(--text-secondary)] leading-relaxed my-2'>${paraText}</p>`);
      } else if (paraText) {
        formattedLines.push(paraText);
      }
    }

    const result = formattedLines.join("\n");
    
    // Final sanitization pass to remove any remaining dangerous content
    return sanitizeMarkdownHtml(result);
  }, [content]);

  if (!content?.trim()) {
    return (
      <div className={`text-xs text-[var(--text-tertiary)] italic ${className}`} role="status" aria-live="polite">
        No content
      </div>
    );
  }

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      aria-label="Markdown preview"
    />
  );
}
