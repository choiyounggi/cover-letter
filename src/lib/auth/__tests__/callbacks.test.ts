import { describe, it, expect, beforeEach, vi } from "vitest";
import { isAllowedLogin, jwtCallback, sessionCallback, signInCallback } from "../callbacks";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

describe("isAllowedLogin", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_GITHUB_LOGIN", "choiyounggi");
  });

  it("returns true for the allowed login (normal)", () => {
    expect(isAllowedLogin("choiyounggi")).toBe(true);
  });

  it("returns false for a different login (error)", () => {
    expect(isAllowedLogin("other")).toBe(false);
  });

  it("returns false for a null login (error)", () => {
    expect(isAllowedLogin(null)).toBe(false);
  });

  it("fails closed when ADMIN_GITHUB_LOGIN is truly unset, even for an undefined login (boundary)", () => {
    vi.stubEnv("ADMIN_GITHUB_LOGIN", undefined);
    expect(isAllowedLogin(undefined)).toBe(false);
    expect(isAllowedLogin(null)).toBe(false);
    expect(isAllowedLogin("")).toBe(false);
    expect(isAllowedLogin("choiyounggi")).toBe(false);
  });

  it("fails closed when ADMIN_GITHUB_LOGIN is an empty string, even for an empty login (boundary)", () => {
    vi.stubEnv("ADMIN_GITHUB_LOGIN", "");
    expect(isAllowedLogin("")).toBe(false);
    expect(isAllowedLogin("choiyounggi")).toBe(false);
  });
});

describe("signInCallback", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_GITHUB_LOGIN", "choiyounggi");
  });

  it("returns true when the profile login is allowed (normal)", () => {
    expect(signInCallback({ profile: { login: "choiyounggi" } })).toBe(true);
  });

  it("returns false when the profile login is not allowed (error)", () => {
    expect(signInCallback({ profile: { login: "other" } })).toBe(false);
  });

  it("returns false when profile is null (boundary)", () => {
    expect(signInCallback({ profile: null })).toBe(false);
  });
});

describe("jwtCallback", () => {
  it("sets token.login from profile.login when profile is present (normal)", () => {
    const token = {} as JWT;
    const result = jwtCallback({ token, profile: { login: "choiyounggi" } });
    expect(result.login).toBe("choiyounggi");
  });

  it("keeps existing token.login when profile is absent (boundary)", () => {
    const token = { login: "x" } as JWT;
    const result = jwtCallback({ token });
    expect(result.login).toBe("x");
  });
});

describe("sessionCallback", () => {
  it("sets session.user.login from token.login (normal)", () => {
    const session = { user: {} } as Session;
    const token = { login: "x" } as JWT;
    const result = sessionCallback({ session, token });
    expect(result.user.login).toBe("x");
  });
});
