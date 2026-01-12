import { logger } from "./lib/logger";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { isAllowed } from "./lib/rate-limiter";

const SECURITY_HEADERS: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Basic CSP: conservative defaults, allow reporting when configured.
const DEFAULT_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.googleapis.com https://*.gstatic.com;";


export async function middleware(req: NextRequest) {
  // Rate limit certain write endpoints to reduce accidental abuse
  // Rate limiting disabled in middleware due to Edge Runtime incompatibility with ioredis
  // TODO: Implement Edge-compatible rate limiting (e.g. Upstash Redis)
  /*
  try {
    const pathname = req.nextUrl.pathname;
    const method = req.method?.toUpperCase() || "GET";
    if (method === "POST" && pathname.startsWith("/api/projects")) {
      const xf = req.headers.get("x-forwarded-for");
      const ip = xf ? xf.split(",")[0].trim() : (req as any).ip || "unknown";
      const allowed = await isAllowed(ip, 6, 60_000); // 6 requests per minute
      if (!allowed) {
        return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  } catch (e: any) {
    // if rate limiter fails, allow through (fail-open) but log in development
    logger.warn("Rate limiter error:", e?.message || String(e));
  }
  */

  const res = NextResponse.next();
  // Apply security headers on every response (idempotent)
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  // Content-Security-Policy: support report-only via env var `CSP_REPORT_ONLY` (set to 'true')
  try {
    const reportOnly = process.env.CSP_REPORT_ONLY === "true";
    const reportUri = process.env.CSP_REPORT_URI;
    const csp = reportUri ? `${DEFAULT_CSP} report-uri ${reportUri};` : DEFAULT_CSP;
    if (reportOnly) {
      res.headers.set("Content-Security-Policy-Report-Only", csp);
    } else {
      res.headers.set("Content-Security-Policy", csp);
    }
  } catch {
    // ignore CSP header failures
  }

  if (process.env.NODE_ENV === "development") {
    // Log missing or unexpected headers for developer awareness
    logger.log("Security headers applied on:", req.nextUrl.pathname);
  }

  return res;
}

export const config = {
  matcher: "/:path*",
};
// Note: earlier file content accidentally duplicated an auth wrapper and a second
// `config` export. That content has been removed to keep a single middleware
// implementation. The `config` above is the intended export for the middleware.
