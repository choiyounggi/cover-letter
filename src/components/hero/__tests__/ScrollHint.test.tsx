import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ScrollHint } from "@/components/hero/ScrollHint";
import * as gsapLib from "@/lib/gsap";

const { fromToSpy } = vi.hoisted(() => ({ fromToSpy: vi.fn() }));

vi.mock("@/lib/gsap", () => {
  const reverts: ReturnType<typeof vi.fn>[] = [];
  const context = vi.fn((cb: (self: unknown) => void) => {
    cb({});
    const revert = vi.fn();
    reverts.push(revert);
    return { revert };
  });
  return { gsap: { context, fromTo: fromToSpy }, ScrollTrigger: {}, __reverts: reverts };
});

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn(),
}));

const context = gsapLib.gsap.context as unknown as ReturnType<typeof vi.fn>;
const reverts = (gsapLib as unknown as { __reverts: ReturnType<typeof vi.fn>[] }).__reverts;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  reverts.length = 0;
});

describe("ScrollHint", () => {
  it("starts the gsap scaleY loop with the D16 params when reduced motion is not preferred (normal)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(false);

    const { container } = render(<ScrollHint />);

    expect(fromToSpy).toHaveBeenCalledTimes(1);
    const [target, from, to] = fromToSpy.mock.calls[0];
    expect(target).toBe(container.querySelector("span"));
    expect(from).toEqual({ scaleY: 0 });
    expect(to).toMatchObject({ scaleY: 1, repeat: -1, yoyo: true, duration: 1.4, ease: "power2.inOut" });
    // No static inline scaleY override — the loop itself drives the value.
    expect(container.querySelector("span")).not.toHaveStyle({ transform: "scaleY(1)" });
  });

  it("never starts the loop and renders a static scaleY(1) line when reduced motion is preferred (error path: a11y override)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);

    const { container } = render(<ScrollHint />);

    expect(fromToSpy).not.toHaveBeenCalled();
    expect(container.querySelector("span")).toHaveStyle({ transform: "scaleY(1)" });
  });

  it("reverts the running-loop gsap context and starts a fresh (no-op) one when reduced motion turns on after mount (boundary: the [reduced] dep actually re-runs the effect)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(false);

    const { container, rerender } = render(<ScrollHint />);
    expect(context).toHaveBeenCalledTimes(1);
    expect(reverts).toHaveLength(1);
    expect(reverts[0]).not.toHaveBeenCalled();
    expect(fromToSpy).toHaveBeenCalledTimes(1);

    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    rerender(<ScrollHint />);

    // With useGsap's effect keyed on [reduced], a rerender that changes
    // `reduced` must revert the first (looping) context and create a new
    // one — that new context's callback still runs, but bails out on the
    // reduced-motion gate before calling fromTo again. If the effect were
    // NOT actually re-keyed on `reduced` (e.g. deps=[]), gsap.context would
    // stay called exactly once and the first revert would never fire —
    // exactly what this asserts.
    expect(reverts[0]).toHaveBeenCalledTimes(1);
    expect(context).toHaveBeenCalledTimes(2);
    expect(fromToSpy).toHaveBeenCalledTimes(1);
    expect(container.querySelector("span")).toHaveStyle({ transform: "scaleY(1)" });
  });
});
