import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// Fail fast in production when auth env is misconfigured to avoid silent OAuth callback failures.
function assertAuthEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const missing: string[] = [];

  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    missing.push("AUTH_SECRET or NEXTAUTH_SECRET");
  }
  if (!process.env.NEXTAUTH_URL) {
    missing.push("NEXTAUTH_URL (set to your deployed domain, e.g. https://neyro.vercel.app)");
  }
  if (!process.env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");

  if (missing.length) {
    throw new Error(`Auth configuration missing required env vars: ${missing.join(", ")}`);
  }

  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith("https://")) {
    logger.warn("NEXTAUTH_URL should be HTTPS and match your deployed domain", {
      nextauthUrl: process.env.NEXTAUTH_URL,
    });
  }
}

assertAuthEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        logger.info("SignIn Callback", { 
          userId: user?.id, 
          email: user?.email,
          provider: account?.provider,
          accountId: account?.providerAccountId 
        });
        return true;
      } catch (error) {
        logger.error("SignIn Callback Error", { error, user, account });
        return false;
      }
    },
    async jwt({ token, user, account, profile, trigger }) {
      try {
        if (user) {
          logger.info("JWT Callback Initial", { 
            userId: user.id, 
            email: user.email,
            provider: account?.provider 
          });
          token.id = user.id;
        }
        return token;
      } catch (error) {
        logger.error("JWT Callback Error", { error, token, user });
        return token;
      }
    },
    async session({ session, token, user }) {
      try {
        logger.info("Session Callback", { 
          userId: session.user?.id || token.id,
          email: session.user?.email 
        });
        if (token.id) {
          session.user.id = token.id as string;
        }
        return session;
      } catch (error) {
        logger.error("Session Callback Error", { error, session, token });
        return session;
      }
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      checks: ["pkce", "state"],
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn("Login attempt with missing credentials");
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          logger.warn(`Invalid email format attempted: ${email}`);
          return null;
        }

        if (password.length < 8 || password.length > 128) {
          logger.warn(`Invalid password length for email: ${email}`);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          logger.warn(`Failed login attempt for email: ${email}`);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          logger.warn(`Invalid password for email: ${email}`);
          return null;
        }

        logger.info(`Successful login for user: ${user.id}`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    signIn: async ({ user, account, isNewUser }) => {
      try {
        logger.info("User signed in successfully", {
          userId: user.id,
          email: user.email,
          provider: account?.provider,
          isNewUser,
        });
      } catch (error) {
        logger.error("SignIn Event Error", { error, user, account });
      }
    },
    createUser: async ({ user }) => {
      try {
        logger.info("User created", { 
          userId: user.id,
          email: user.email 
        });
      } catch (error) {
        logger.error("CreateUser Event Error", { error, user });
      }
    },
    linkAccount: async ({ user, account }) => {
      try {
        logger.info("Account linked", { 
          userId: user.id,
          provider: account?.provider 
        });
      } catch (error) {
        logger.error("LinkAccount Event Error", { error, user, account });
      }
    },
  },

});
