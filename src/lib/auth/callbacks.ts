import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export function isAllowedLogin(
  login: string | null | undefined,
  allowed: string | undefined = process.env.ADMIN_GITHUB_LOGIN,
): boolean {
  return !!allowed && !!login && login === allowed;
}
export function jwtCallback({ token, profile }: { token: JWT; profile?: { login?: string } | null }): JWT {
  if (profile?.login) token.login = profile.login;
  return token;
}
export function sessionCallback({ session, token }: { session: Session; token: JWT }): Session {
  session.user.login = token.login;
  return session;
}
export function signInCallback({ profile }: { profile?: { login?: string } | null }): boolean {
  return isAllowedLogin(profile?.login);
}
