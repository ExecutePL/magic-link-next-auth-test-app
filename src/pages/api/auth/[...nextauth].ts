/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db";
import CredentialsProvider from "next-auth/providers/credentials";
// import { Magic } from "@magic-sdk/admin";
import { Magic } from "magic-sdk";

const magic =
  typeof window !== "undefined" &&
  new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "a");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  callbacks: {
    jwt({ token, user }) {
      user && (token.user = user);
      return token;
    },
    session({ session, user }) {
      session = {
        ...session,
        user: {
          // id: user.id,
          ...session.user,
        },
      };
      return session;
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        didToken: { label: "DID Token", type: "text" },
      },
      async authorize(credentials, req) {
        const didToken = credentials?.didToken;

        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${didToken || ""}`,
          },
        });

        if (res.status === 200) {
          if (!magic) return null;
          const userMetadata = await magic?.user?.getMetadata();
          const user = {
            id: "jfshgad",
            userName: "TestUser",
            email: userMetadata.email,
          };
          return user;
        } else {
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
  },
};

export default NextAuth(authOptions);
