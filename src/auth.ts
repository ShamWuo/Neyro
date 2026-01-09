import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  secret,
  trustHost: true,
  basePath: "/api/auth",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    session: ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    authorized: ({ auth, request }) => {
      const isAuthed = Boolean(auth?.user);
      const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
      if (isAuthRoute) return true;
      return isAuthed;
    },
  },
  events: {
    signIn: async ({ user, account }) => {
      // Log successful sign-in
      logger.info("User signed in", { email: user.email, provider: account?.provider });
    },
    signInError: async ({ error }) => {
      // Log sign-in errors
      logger.error("Sign-in error", error);
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
