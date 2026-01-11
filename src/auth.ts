import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: true,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      logger.info("SignIn Callback", { user, account, profile });
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        logger.info("JWT Callback Initial", { user, account });
      }
      return token;
    },
    async session({ session, token, user }) {
      logger.info("Session Callback", { session, token });
      return session;
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
    signIn: async ({ user, account }) => {
      logger.info("User signed in successfully", {
        email: user.email,
        provider: account?.provider,
      });
    },
    createUser: async ({ user }) => {
      logger.info("User created", { user });
    },
    linkAccount: async ({ user, account }) => {
      logger.info("Account linked", { user, account });
    },
  },

});
