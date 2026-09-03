import { describe, expect, it } from "vitest";
import { readThemeColors } from "@/hooks/useThemeColors";
import {
  motionPreferences,
  frameloopFor,
  nextMorphTarget,
  nextMorphDelayMs,
  easeTowards,
} from "@/components/hero/motion-prefs";

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

describe("motionPreferences", () => {
  it("everything on when not reduced and in view (normal)", () => {
    expect(motionPreferences({ reduced: false, inView: true })).toEqual({
      frameloop: "always",
      particles: true,
      smoothScroll: true,
      morph: true,
    });
  });

  it("everything off + demand frameloop when reduced (error/negative)", () => {
    expect(motionPreferences({ reduced: true, inView: true })).toEqual({
      frameloop: "demand",
      particles: false,
      smoothScroll: false,
      morph: false,
    });
  });

  it("demand frameloop but particles still true when out of view and not reduced (boundary)", () => {
    expect(motionPreferences({ reduced: false, inView: false })).toEqual({
      frameloop: "demand",
      particles: true,
      smoothScroll: true,
      morph: true,
    });
  });
});

describe("frameloopFor", () => {
  it("returns the same frameloop value motionPreferences would derive (normal)", () => {
    expect(frameloopFor({ reduced: false, inView: true })).toBe("always");
  });

  it("returns 'demand' once reduced is true regardless of inView (error/negative)", () => {
    expect(frameloopFor({ reduced: true, inView: true })).toBe("demand");
  });

  it("returns 'demand' when out of view even though not reduced (boundary)", () => {
    expect(frameloopFor({ reduced: false, inView: false })).toBe("demand");
  });
});

describe("nextMorphTarget", () => {
  it("maps rand()=0 to the low end 0.4 (normal)", () => {
    expect(nextMorphTarget(() => 0)).toBe(0.4);
  });

  it("maps rand()=0.999 to just under 1.0 (boundary)", () => {
    expect(nextMorphTarget(() => 0.999)).toBeLessThan(1.0);
    expect(nextMorphTarget(() => 0.999)).toBeGreaterThan(0.9);
  });
});

describe("nextMorphDelayMs", () => {
  it("maps rand()=0 to the low end 6000ms (normal)", () => {
    expect(nextMorphDelayMs(() => 0)).toBe(6000);
  });

  it("maps rand()=1 to the high end 10000ms (boundary)", () => {
    expect(nextMorphDelayMs(() => 1)).toBe(10000);
  });

  it("uses Math.random by default when no rand fn is supplied (error-ish: no crash on missing arg)", () => {
    const delay = nextMorphDelayMs();
    expect(delay).toBeGreaterThanOrEqual(6000);
    expect(delay).toBeLessThanOrEqual(10000);
  });
});

describe("easeTowards", () => {
  it("steps a fraction k of the way toward target (normal)", () => {
    expect(easeTowards(0, 1, 0.1)).toBeCloseTo(0.1);
  });

  it("stays at target once current already equals target (boundary)", () => {
    expect(easeTowards(1, 1, 0.1)).toBe(1);
  });
});
