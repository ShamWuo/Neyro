import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers helper
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

// Lightweight session check - checks for NextAuth session cookie without importing Prisma
function hasSession(request: NextRequest): boolean {
  // Check for NextAuth session cookie (authjs.session-token or next-auth.session-token)
  const sessionToken = 
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;
  
  return !!sessionToken;
}

export async function middleware(request: NextRequest) {
  // Allow public routes
  const publicRoutes = ["/", "/auth", "/pricing", "/api/auth", "/share", "/blog"];
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Lightweight authentication check - just verify session cookie exists
  // Full auth validation happens at route level where we can use Prisma
  if (!hasSession(request)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Subscription checks are handled at the route level (API routes and pages)
  // This prevents Prisma Client usage in Edge runtime
  
  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
