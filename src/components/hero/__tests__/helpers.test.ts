import { describe, expect, it } from "vitest";
import { readThemeColors } from "@/hooks/useThemeColors";

describe("readThemeColors", () => {
  const vars: Record<string, string> = {
    "--bg": " #0a0a0c ",
    "--fg": "#f5f5f7",
    "--accent": "#7c9cff",
  };
  const get = (n: string) => vars[n] ?? "";

  it("returns trimmed hex strings for present vars (normal)", () => {
    expect(readThemeColors(get)).toEqual({ bg: "#0a0a0c", fg: "#f5f5f7", accent: "#7c9cff" });
  });

  it("falls back to the default palette per key when a var is missing (boundary)", () => {
    const partial = (n: string) => (n === "--accent" ? "" : (vars[n] ?? ""));
    expect(readThemeColors(partial)).toEqual({ bg: "#0a0a0c", fg: "#f5f5f7", accent: "#7c9cff" });
  });

  it("passes a non-hex CSS value straight through unmodified (error-ish passthrough)", () => {
    const rgba = (n: string) => (n === "--bg" ? "rgba(0,0,0,.1)" : (vars[n] ?? ""));
    expect(readThemeColors(rgba).bg).toBe("rgba(0,0,0,.1)");
  });
});
