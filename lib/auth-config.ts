import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import { User } from "@/app/api/auth/[...nextauth]/models/User";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          if (!mongoose.connections[0].readyState) {
            await mongoose.connect(process.env.MONGODB_URI!);
          }

          const user = await User.findOne({ email: credentials.email });
          if (!user) return null;

          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) return null;

          if (!user.emailVerified) {
            throw new Error("Please verify your email first");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: AuthUser }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified || false;
      }
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
} as const; 