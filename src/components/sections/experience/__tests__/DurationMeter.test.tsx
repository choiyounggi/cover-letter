import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const { timelineSpy, setSpy } = vi.hoisted(() => ({ timelineSpy: vi.fn(), setSpy: vi.fn() }));

vi.mock("@/lib/gsap", () => {
  const context = vi.fn((cb: (self: unknown) => void) => {
    cb({});
    return { revert: vi.fn() };
  });
  return { gsap: { context, timeline: timelineSpy, set: setSpy }, ScrollTrigger: {} };
});

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DurationMeter", () => {
  it("creates one gsap.timeline with a scrub ScrollTrigger targeting its own wrapper, and renders the initial 0개월 counter (normal)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(false);
    const { DurationMeter } = await import("@/components/sections/experience/DurationMeter");
    const timelineReturn = { fromTo: vi.fn().mockReturnThis() };
    timelineSpy.mockReturnValue(timelineReturn);

    const { container } = render(<DurationMeter months={6} maxMonths={12} />);

    expect(timelineSpy).toHaveBeenCalledTimes(1);
    const timelineVars = timelineSpy.mock.calls[0][0];
    expect(timelineVars.scrollTrigger).toMatchObject({ scrub: true });
    expect(timelineVars.scrollTrigger.trigger).toBe(container.querySelector('[data-testid="duration-meter"]'));
    expect(screen.getByText("0개월")).toBeInTheDocument();
    expect(timelineReturn.fromTo.mock.calls[0][1]).toEqual({ scaleX: 0 });
    expect(timelineReturn.fromTo.mock.calls[0][2]).toMatchObject({ scaleX: 0.5, ease: "none" });
  });

  it("guards the bar fraction to 0 when maxMonths is 0 (boundary/error-guard: divide-by-zero would otherwise produce NaN)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(false);
    const { DurationMeter } = await import("@/components/sections/experience/DurationMeter");
    const timelineReturn = { fromTo: vi.fn().mockReturnThis() };
    timelineSpy.mockReturnValue(timelineReturn);

    render(<DurationMeter months={0} maxMonths={0} />);

    expect(timelineReturn.fromTo.mock.calls[0][2]).toMatchObject({ scaleX: 0 });
  });

  it("creates one timeline per rendered instance — two DurationMeters yield two calls (boundary: trigger count matches instance count)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(false);
    const { DurationMeter } = await import("@/components/sections/experience/DurationMeter");
    timelineSpy.mockReturnValue({ fromTo: vi.fn().mockReturnThis() });

    render(
      <>
        <DurationMeter months={3} maxMonths={6} />
        <DurationMeter months={6} maxMonths={6} />
      </>,
    );

    expect(timelineSpy).toHaveBeenCalledTimes(2);
  });

  it("renders the final scaleX and N개월 immediately via gsap.set, without creating a scrub ScrollTrigger, when reduced motion is preferred (error path: a11y override — F1)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const { DurationMeter } = await import("@/components/sections/experience/DurationMeter");

    render(<DurationMeter months={6} maxMonths={12} />);

    expect(timelineSpy).not.toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy.mock.calls[0][1]).toMatchObject({ scaleX: 0.5 });
    expect(screen.getByText("6개월")).toBeInTheDocument();
  });

  it("guards the reduced-motion final scaleX to 0 when maxMonths is 0 (boundary: divide-by-zero guard also applies under reduced motion)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const { DurationMeter } = await import("@/components/sections/experience/DurationMeter");

    render(<DurationMeter months={0} maxMonths={0} />);

    expect(timelineSpy).not.toHaveBeenCalled();
    expect(setSpy.mock.calls[0][1]).toMatchObject({ scaleX: 0 });
    expect(screen.getByText("0개월")).toBeInTheDocument();
  });
});
