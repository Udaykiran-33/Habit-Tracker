import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

const nextAuth = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[Auth] Missing credentials");
            return null;
          }

          await connectDB();

          const email = (credentials.email as string).toLowerCase().trim();
          const user = await User.findOne({ email });

          if (!user) {
            console.log("[Auth] No user found for:", email);
            return null;
          }

          if (!user.password) {
            console.log("[Auth] User has no password:", email);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            console.log("[Auth] Invalid password for:", email);
            return null;
          }

          console.log("[Auth] Login successful for:", email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image ?? null,
          };
        } catch (error) {
          console.error("[Auth] Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  logger: {
    error(error: any) {
      if (error?.name === "JWTSessionError" || error?.message?.includes("JWTSessionError")) {
        return;
      }
      console.error(error);
    },
  },
});

export const { handlers, signIn, signOut} = nextAuth;
export const auth = async (...args: any[]) => {
  try {
    // @ts-ignore
    return await nextAuth.auth(...args);
  } catch (error: any) {
    // Rethrow Next.js navigation errors (like redirects) so they work normally
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    // Return null for session parsing errors to maintain a smooth flow without crashing
    return null as any;
  }
};
