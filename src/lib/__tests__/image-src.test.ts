import { describe, it, expect } from "vitest";
import { isRemoteSrc } from "@/lib/image-src";

describe("isRemoteSrc", () => {
  it("is true for an absolute https URL (normal case)", () => {
    expect(isRemoteSrc("https://x.com/a.png")).toBe(true);
  });
  it("is false for a local /images path (normal case)", () => {
    expect(isRemoteSrc("/images/a.png")).toBe(false);
  });
  it("is false for an empty string (boundary: nothing to match)", () => {
    expect(isRemoteSrc("")).toBe(false);
  });
  it("is true for a bare 'http://' scheme (boundary: matches the prefix even with no host)", () => {
    expect(isRemoteSrc("http://")).toBe(true);
  });
  it("is false for a protocol-relative URL (boundary: no explicit http(s) scheme, so treated as non-remote)", () => {
    expect(isRemoteSrc("//x.com/a.png")).toBe(false);
  });
  it("throws for a non-string value at runtime (error case: a Symbol can't be coerced to a string)", () => {
    expect(() => isRemoteSrc(Symbol("x") as unknown as string)).toThrow();
  });
});
