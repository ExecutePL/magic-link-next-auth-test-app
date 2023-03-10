/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { Magic } from "@magic-sdk/admin";

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      // user && (token.user = user);
      return token;
    },
    session({ session, user }) {
      try {
        session.user.email = user.email;
      } catch (error) {
        console.log(error);
      }
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
        const didToken = credentials?.didToken || "";
        magic.token.validate(didToken);
        const metadata = await magic.users.getMetadataByToken(didToken);
        return { ...metadata, id: "kjhgfghjk" };
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
  },
};

export default NextAuth(authOptions);
