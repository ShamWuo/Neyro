import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Security headers helper
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export async function middleware(request: NextRequest) {
  // Only check subscription for dashboard routes
  if (!request.nextUrl.pathname.startsWith("/")) {
    return NextResponse.next();
  }

  // Allow public routes
  const publicRoutes = ["/", "/auth", "/pricing", "/api/auth", "/share", "/blog"];
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Check authentication only (subscription checks moved to route level)
  // Note: auth() works in middleware but doesn't use Prisma Client directly
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Subscription checks are now handled at the route level (API routes and pages)
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
