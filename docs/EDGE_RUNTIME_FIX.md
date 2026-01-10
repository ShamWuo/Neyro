# Edge Runtime Fix for Prisma Client

## Issue
The application was attempting to use Prisma Client in middleware, which runs on Edge runtime. Prisma Client cannot run on Edge runtime without Prisma Accelerate or Driver Adapters.

## Error
```
Error [PrismaClientValidationError]: In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
```

## Solution

### 1. Removed Prisma from Middleware
The middleware was using `getUserSubscription` and `canAccessFeature`, which use Prisma Client. These checks have been moved to route level (API routes and pages) instead of middleware.

**Before:**
```typescript
// middleware.ts
const subscription = await getUserSubscription(session.user.id);
const hasAccess = await canAccessFeature(session.user.id, "templates");
```

**After:**
```typescript
// middleware.ts - Only authentication check
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.redirect(new URL("/auth/login", request.url));
}
```

### 2. Edge Runtime Detection in Prisma Connection
Added Edge runtime detection to prevent Prisma Client connection attempts in Edge runtime:

```typescript
// src/lib/prisma.ts
// Test database connection on startup (only in Node.js runtime, not Edge)
if (typeof window === "undefined" && !globalThis.EdgeRuntime) {
  prisma.$connect().catch((error) => {
    logger.error("Failed to connect to database", error);
  });
}
```

### 3. Subscription Checks Moved to Route Level
All subscription and feature access checks are now handled at the route level:

- **API Routes**: Check access in the route handler
- **Page Components**: Check access in server components
- **Examples**:
  - `/api/export` - Checks subscription in route handler
  - `/templates` - Checks access in page component

## Benefits

1. **No Prisma in Edge Runtime**: Middleware runs efficiently on Edge runtime
2. **Better Performance**: Middleware only does lightweight authentication checks
3. **Maintained Security**: All subscription checks still happen, just at route level
4. **Scalability**: Edge runtime middleware scales better globally

## Files Modified

- `src/middleware.ts` - Removed Prisma-dependent calls
- `src/lib/prisma.ts` - Added Edge runtime detection
- Route-level checks already in place (no changes needed)

## Testing

After this fix:
- Middleware works on Edge runtime
- Authentication redirects work correctly
- Subscription checks still enforce feature access
- All API routes and pages maintain security
