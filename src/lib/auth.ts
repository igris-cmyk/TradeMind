import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import type { NextAuthConfig } from "next-auth";

const providers: NextAuthConfig["providers"] = [
  ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? [
        Google({
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : []),
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const normalizedEmail = String(credentials.email).trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user || !user.hashedPassword) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.hashedPassword
      );

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }

      // Authoritative session fields must always come from the database.
      if ((trigger === "signIn" || trigger === "update" || !token.plan) && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            plan: true,
            role: true,
            image: true,
            name: true,
            onboardingProfile: { select: { id: true } },
            subscription: { select: { status: true } },
          },
        });
        if (dbUser) {
          token.plan = dbUser.plan;
          token.role = dbUser.role;
          token.image = dbUser.image;
          token.name = dbUser.name;
          token.onboardingComplete = !!dbUser.onboardingProfile;
          token.subscriptionStatus = dbUser.subscription?.status ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.plan = (token.plan as string) ?? "FREE";
        session.user.role = (token.role as string) ?? "USER";
        session.user.onboardingComplete = (token.onboardingComplete as boolean) ?? false;
        session.user.subscriptionStatus = (token.subscriptionStatus as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
