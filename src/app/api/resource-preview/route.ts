import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAllowed } from "@/lib/rate-limiter";
import { validateUrl } from "@/lib/validation";
import { logger } from "@/lib/logger";

import safeFetchUrlChecked from "@/lib/safe-fetch-url";

/**
 * Resource preview API
 * Fetches Open Graph metadata from URLs for preview cards
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (prevent abuse of preview fetching)
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 8, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {

      console.warn("Rate limiter check failed, allowing resource-preview request:", (e as Error)?.message || String(e));
    }

    const { searchParams } = new URL(request.url);
    const urlRaw = searchParams.get("url");

    if (!urlRaw) {
      return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
    }

    // Validate URL (only http/https)
    const url = validateUrl(urlRaw);
    if (!url) {
      return NextResponse.json({ error: "Invalid URL. Only http and https URLs are allowed." }, { status: 400 });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Security: Only allow http and https protocols
    if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid protocol. Only http and https are allowed." }, { status: 400 });
    }

    // Additional safety: disallow IP-literal hostnames and private IP ranges
    const hostname = targetUrl.hostname;
    if (hostname === "localhost" || hostname === "::1") {
      return NextResponse.json({ error: "Hostname not allowed" }, { status: 400 });
    }

    const ipMatch = hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
    if (ipMatch) {
      // Basic IPv4 private range checks
      const parts = hostname.split('.').map((p) => parseInt(p, 10));
      if (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        parts[0] === 127
      ) {
        return NextResponse.json({ error: "IP range not allowed" }, { status: 400 });
      }
    } else {
      // If hostname is not an IP literal, avoid resolving to local addresses by refusing plain 'localhost' via DNS name above.
      // Optionally could perform DNS resolution and check addresses, but avoid DNS lookup to reduce latency.
    }

    // Fetch the page HTML with security limits using URL-checked safeFetch (centralized timeouts/retries)
    let response: Response;
    try {
      response = await safeFetchUrlChecked(targetUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NeyroBot/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        timeoutMs: 5000,
      } as RequestInit & { timeoutMs: number });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }
      logger.warn(`Resource preview fetch failed for ${targetUrl.toString()}: ${(error as Error).message}`);
      return NextResponse.json({ error: "Failed to fetch preview" }, { status: 502 });
    }

    if (!response.ok) {
      logger.warn(`Failed to fetch preview for ${targetUrl.toString()}: ${response.status}`);
      return NextResponse.json({ error: "Failed to fetch preview" }, { status: 502 });
    }

    // Limit HTML size to prevent DoS
    const html = await response.text().then((text) => text.slice(0, 1024 * 1024)); // Max 1MB

    // Extract Open Graph metadata
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1];
    const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1];
    const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1];
    const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i)?.[1];

    // Fallback to standard meta tags
    const title = ogTitle || html.match(/<title>([^<]+)<\/title>/i)?.[1] || null;
    const description =
      ogDescription || html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || null;

    return NextResponse.json({
      title: title?.trim() || undefined,
      description: description?.trim() || undefined,
      image: ogImage || undefined,
      siteName: ogSiteName || targetUrl.hostname,
    });
  } catch (error) {
    logger.error("Error fetching resource preview", error);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 408 });
    }
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}
