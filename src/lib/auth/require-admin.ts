import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isAllowedLogin } from "./callbacks";

export function isAdminSession(session: Session | null | undefined): session is Session {
  return !!session?.user?.login && isAllowedLogin(session.user.login);
}
export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  if (!isAdminSession(session)) redirect("/login");
  return session;
}
