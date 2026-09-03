import { describe, it, expect } from "vitest";
import { safeCallbackUrl } from "../safe-callback-url";

describe("safeCallbackUrl", () => {
  it("keeps a site-relative path (normal)", () => {
    expect(safeCallbackUrl("/admin/skills")).toBe("/admin/skills");
  });

  it("falls back for an absolute external URL (error)", () => {
    expect(safeCallbackUrl("https://evil.com")).toBe("/admin");
  });

  it("falls back for a protocol-relative URL (error)", () => {
    expect(safeCallbackUrl("//evil.com")).toBe("/admin");
  });

  it("falls back when undefined (boundary)", () => {
    expect(safeCallbackUrl(undefined)).toBe("/admin");
  });

  it("falls back for an empty string (boundary)", () => {
    expect(safeCallbackUrl("")).toBe("/admin");
  });

  it("takes the first element when given a string array (normal)", () => {
    expect(safeCallbackUrl(["/admin/skills", "/admin/other"])).toBe("/admin/skills");
  });
});
