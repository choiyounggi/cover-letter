import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("REDIRECT");
  }),
}));

import { redirect } from "next/navigation";
import { isAdminSession, requireAdmin } from "../require-admin";

describe("isAdminSession", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_GITHUB_LOGIN", "choiyounggi");
  });

  it("returns true for a session with the allowed login (normal)", () => {
    const session = { user: { login: "choiyounggi" } } as Session;
    expect(isAdminSession(session)).toBe(true);
  });

  it("returns false for a null session (boundary)", () => {
    expect(isAdminSession(null)).toBe(false);
  });

  it("returns false for a session with no login on the user (boundary)", () => {
    const session = { user: {} } as Session;
    expect(isAdminSession(session)).toBe(false);
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_GITHUB_LOGIN", "choiyounggi");
    authMock.mockReset();
    vi.mocked(redirect).mockClear();
  });

  it("resolves with the session for the allowed login (normal)", async () => {
    const session = { user: { login: "choiyounggi" } } as Session;
    authMock.mockResolvedValue(session);
    await expect(requireAdmin()).resolves.toEqual(session);
  });

  it("redirects to /login for a disallowed login (error)", async () => {
    authMock.mockResolvedValue({ user: { login: "other" } } as Session);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login for a null session (boundary)", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
