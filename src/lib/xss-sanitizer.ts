/**
 * XSS sanitization utilities for safe HTML rendering
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags but removes dangerous attributes and scripts
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  let sanitized = html;

  // Remove script tags completely
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: and data: URLs in attributes
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  // Remove iframe, object, embed tags (too dangerous)
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");

  // Remove style tags that could contain malicious CSS
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove dangerous attributes from remaining tags
  sanitized = sanitized.replace(/\s*(style|href|src|action|formaction)\s*=\s*["']?javascript:/gi, "");

  return sanitized;
}

/**
 * Escape HTML entities to render text safely
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (s) => map[s] ?? s);
}

/**
 * Sanitize markdown-rendered HTML (more permissive than general sanitizeHtml)
 */
export function sanitizeMarkdownHtml(html: string): string {
  if (!html) return "";

  let sanitized = html;

  // Remove script tags completely
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  // Remove dangerous tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");

  // Ensure links have safe attributes
  sanitized = sanitized.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    // Remove dangerous attributes
    attrs = attrs.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
    attrs = attrs.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
    
    // Ensure target and rel exist for external links
    if (attrs.includes('href=') && !attrs.includes('target=')) {
      attrs += ' target="_blank" rel="noopener noreferrer"';
    }
    
    return `<a${attrs}>`;
  });

  return sanitized;
}
