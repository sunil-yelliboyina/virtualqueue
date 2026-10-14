import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role: Role;
      isGuest: boolean;
    };
  }

  interface User {
    role: Role;
    isGuest: boolean;
  }
}

declare module "next-auth" {
  interface JWT {
    id: string;
    role: Role;
    isGuest: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isGuest: false,
        };
      },
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const guestName =
          (credentials?.name as string) || `Guest-${Date.now().toString(36)}`;

        // Create a guest user record in the database
        const user = await prisma.user.create({
          data: {
            name: guestName,
            role: "CUSTOMER",
            isGuest: true,
          },
        });

        return {
          id: user.id,
          email: null,
          name: user.name,
          role: user.role,
          isGuest: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.isGuest = user.isGuest;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.isGuest = token.isGuest as boolean;
      }
      return session;
    },
  },
});
