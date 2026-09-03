import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

const { requireAdminMock } = vi.hoisted(() => ({ requireAdminMock: vi.fn() }));
const { revalidatePathMock } = vi.hoisted(() => ({ revalidatePathMock: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdmin: requireAdminMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

import {
  formToObject,
  toActionError,
  adminAction,
  revalidateAdmin,
  isRedirectError,
  GENERIC_ERROR,
} from "../../_helpers";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("formToObject", () => {
  it("parses arrays/booleans/numbers per options (normal)", () => {
    const fd = new FormData();
    fd.set("name", "a");
    fd.set("tags", "x, y");
    fd.set("featured", "on");
    fd.set("level", "4");
    const result = formToObject(fd, { arrays: ["tags"], booleans: ["featured"], numbers: ["level"] });
    expect(result).toEqual({ name: "a", tags: ["x", "y"], featured: true, level: 4 });
  });

  it("defaults a missing checkbox to false and an empty tags string to [] (boundary)", () => {
    const fd = new FormData();
    fd.set("name", "a");
    fd.set("tags", "");
    const result = formToObject(fd, { arrays: ["tags"], booleans: ["featured"], numbers: ["level"] });
    expect(result.featured).toBe(false);
    expect(result.tags).toEqual([]);
  });
});

describe("adminAction", () => {
  it("calls requireAdmin then fn (normal)", async () => {
    requireAdminMock.mockResolvedValue({ user: { login: "choiyounggi" } });
    const fn = vi.fn().mockResolvedValue({ status: "ok" });
    const wrapped = adminAction(fn);
    const result = await wrapped({ status: "idle" }, new FormData());
    expect(requireAdminMock).toHaveBeenCalled();
    expect(fn).toHaveBeenCalled();
    expect(result).toEqual({ status: "ok" });
  });

  it("propagates a requireAdmin rejection without calling fn (error)", async () => {
    const redirectError = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;/login" });
    requireAdminMock.mockRejectedValue(redirectError);
    const fn = vi.fn();
    const wrapped = adminAction(fn);
    await expect(wrapped({ status: "idle" }, new FormData())).rejects.toBe(redirectError);
    expect(fn).not.toHaveBeenCalled();
  });

  it("maps a thrown error from fn to a generic error state (error)", async () => {
    requireAdminMock.mockResolvedValue({ user: { login: "choiyounggi" } });
    const fn = vi.fn().mockRejectedValue(new Error("db down"));
    const wrapped = adminAction(fn);
    const result = await wrapped({ status: "idle" }, new FormData());
    expect(result).toEqual({ status: "error", message: GENERIC_ERROR });
  });

  it("re-throws a redirect error thrown by fn instead of swallowing it (boundary)", async () => {
    requireAdminMock.mockResolvedValue({ user: { login: "choiyounggi" } });
    const redirectError = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;/somewhere" });
    const fn = vi.fn().mockRejectedValue(redirectError);
    const wrapped = adminAction(fn);
    await expect(wrapped({ status: "idle" }, new FormData())).rejects.toBe(redirectError);
  });
});

describe("isRedirectError", () => {
  it("detects a NEXT_REDIRECT digest (normal)", () => {
    expect(isRedirectError(Object.assign(new Error(), { digest: "NEXT_REDIRECT;/x" }))).toBe(true);
  });
  it("returns false for a plain error (boundary)", () => {
    expect(isRedirectError(new Error("plain"))).toBe(false);
    expect(isRedirectError(null)).toBe(false);
  });
});

describe("toActionError", () => {
  it("maps a ZodError to fieldErrors (normal)", () => {
    const schema = z.object({ name: z.string().min(1) });
    const parsed = schema.safeParse({ name: "" });
    if (parsed.success) throw new Error("expected failure");
    const result = toActionError(parsed.error);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.name?.length).toBeGreaterThan(0);
  });
});

describe("revalidateAdmin", () => {
  it("revalidates '/' and the given admin path (normal)", () => {
    revalidateAdmin("/admin/links");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/links");
  });
});
