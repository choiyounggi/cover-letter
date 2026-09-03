import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { jwtCallback, sessionCallback, signInCallback } from "@/lib/auth/callbacks";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    signIn: ({ profile }) => signInCallback({ profile: profile as { login?: string } | null }),
    jwt: ({ token, profile }) => jwtCallback({ token, profile: profile as { login?: string } | null }),
    session: ({ session, token }) => sessionCallback({ session, token }),
  },
});
