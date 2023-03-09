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
        magic.token.validate(credentials?.didToken || "");
        const metadata = await magic.users.getMetadataByToken(
          credentials?.didToken || ""
        );
        const user = { id: "1", name: "J Smith", email: metadata.email };

        if (user) {
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
