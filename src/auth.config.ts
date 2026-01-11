import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    callbacks: {
        authorized: ({ auth, request }) => {
            const isAuthed = Boolean(auth?.user);
            const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
            if (isAuthRoute) return true;
            return isAuthed;
        },
        // Note: The session callback with user.id mapping is kept here but might not fully populate 
        // in middleware if using database strategy without the adapter. 
        // However, for middleware 'authorized' check, we mostly care about auth existence.
        session: ({ session, user, token }) => {
            if (session.user) {
                // If using database strategy, 'user' is populated. If JWT, 'token' is populated.
                // We handle both safely.
                if (user && user.id) {
                    session.user.id = user.id;
                } else if (token && token.sub) {
                    session.user.id = token.sub;
                }
            }
            return session;
        },
    },
    session: { strategy: "jwt" },
    providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;
