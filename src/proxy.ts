import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAllowedLogin } from "@/lib/auth/callbacks";

export const proxy = auth((req) => {
  const login = req.auth?.user?.login;
  if (!isAllowedLogin(login)) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
});

export const config = { matcher: ["/admin/:path*"] };
