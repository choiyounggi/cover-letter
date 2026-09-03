import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting tailwind classes keeping the last", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("ignores falsy inputs (error-ish input)", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
  it("returns an empty string for no inputs (boundary)", () => {
    expect(cn()).toBe("");
  });
});
