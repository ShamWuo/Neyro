import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { takeToken } from "@/lib/rateLimiter";
import { validateUrl } from "@/lib/validation";
import { logger } from "@/lib/logger";

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
      takeToken(`user:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

    // Fetch the page HTML with security limits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    let response: Response;
    try {
      response = await fetch(targetUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NeyroBot/1.0)",
        },
        signal: controller.signal,
        redirect: "follow",
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
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
