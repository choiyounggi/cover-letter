import { describe, expect, it, vi } from "vitest";
import { applyReducedMotion, gsap, ScrollTrigger } from "@/lib/gsap";

function makeFakeGsap() {
  return {
    globalTimeline: { timeScale: vi.fn() },
    defaults: vi.fn(),
  };
}

describe("applyReducedMotion", () => {
  it("sets globalTimeline.timeScale(1000) and returns true when the user prefers reduced motion (normal)", () => {
    const g = makeFakeGsap();
    const result = applyReducedMotion(g, true);
    expect(g.globalTimeline.timeScale).toHaveBeenCalledWith(1000);
    expect(result).toBe(true);
  });

  it("does nothing and returns false when matches is false (negative)", () => {
    const g = makeFakeGsap();
    const result = applyReducedMotion(g, false);
    expect(g.globalTimeline.timeScale).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("calls defaults({ overwrite: 'auto' }) exactly once as the second side-effect (boundary)", () => {
    const g = makeFakeGsap();
    applyReducedMotion(g, true);
    expect(g.defaults).toHaveBeenCalledTimes(1);
    expect(g.defaults).toHaveBeenCalledWith({ overwrite: "auto" });
  });
});

describe("src/lib/gsap.ts module side effects", () => {
  it("registers ScrollTrigger on the real gsap instance on import (client)", () => {
    const g = gsap as unknown as { core: { globals: () => Record<string, unknown> } };
    expect(g.core.globals().ScrollTrigger).toBe(ScrollTrigger);
  });
});
