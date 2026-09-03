import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

const { reactLenisSpy, fakeLenis, tickerAdd, tickerRemove, scrollTriggerUpdate } = vi.hoisted(() => ({
  reactLenisSpy: vi.fn(),
  fakeLenis: { on: vi.fn(), off: vi.fn() },
  tickerAdd: vi.fn(),
  tickerRemove: vi.fn(),
  scrollTriggerUpdate: vi.fn(),
}));

vi.mock("lenis/react", async () => {
  const React = await import("react");
  const ReactLenis = React.forwardRef<{ lenis: typeof fakeLenis }, { children?: React.ReactNode; root?: boolean; options?: unknown }>(
    (props, ref) => {
      reactLenisSpy(props);
      React.useEffect(() => {
        if (ref && typeof ref === "object") {
          ref.current = { lenis: fakeLenis };
        }
      }, [ref]);
      return React.createElement("div", { "data-testid": "react-lenis" }, props.children);
    },
  );
  ReactLenis.displayName = "MockReactLenis";
  return { ReactLenis };
});

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/gsap", () => ({
  gsap: {
    ticker: {
      add: tickerAdd,
      remove: tickerRemove,
      lagSmoothing: vi.fn(),
    },
  },
  ScrollTrigger: { update: scrollTriggerUpdate },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.mocked(useReducedMotionPref).mockReturnValue(false);
});

describe("SmoothScroll", () => {
  it("renders children directly without mounting ReactLenis when reduced motion is preferred (error path: a11y override)", () => {
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const { getByText } = render(
      <SmoothScroll>
        <p>content</p>
      </SmoothScroll>,
    );
    expect(getByText("content")).toBeInTheDocument();
    expect(reactLenisSpy).not.toHaveBeenCalled();
  });

  it("mounts ReactLenis with root=true when reduced motion is not preferred (normal)", () => {
    const { getByText } = render(
      <SmoothScroll>
        <p>content</p>
      </SmoothScroll>,
    );
    expect(getByText("content")).toBeInTheDocument();
    expect(reactLenisSpy).toHaveBeenCalledTimes(1);
    expect(reactLenisSpy.mock.calls[0][0].root).toBe(true);
  });

  it("registers a gsap ticker callback synced to the lenis instance and removes the same one on unmount (boundary: cleanup symmetry)", () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <SmoothScroll>
        <p>content</p>
      </SmoothScroll>,
    );
    // The lenis instance is only exposed on the ref asynchronously (mirrors
    // the real lenis/react ReactLenis, which sets it via useImperativeHandle
    // in its own effect) — the bridge polls via requestAnimationFrame until
    // it appears, so a tick must run before the sync wiring exists.
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(tickerAdd).toHaveBeenCalledTimes(1);
    expect(fakeLenis.on).toHaveBeenCalledWith("scroll", expect.any(Function));
    const tickFn = tickerAdd.mock.calls[0][0];
    const scrollHandler = fakeLenis.on.mock.calls[0][1];

    unmount();

    expect(tickerRemove).toHaveBeenCalledWith(tickFn);
    expect(fakeLenis.off).toHaveBeenCalledWith("scroll", scrollHandler);
    vi.useRealTimers();
  });

  it("cancels the pending readiness poll if unmounted before the next tick, so the ticker is never wired up (boundary: early unmount)", () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <SmoothScroll>
        <p>content</p>
      </SmoothScroll>,
    );
    // On the very first effect flush the ref lookup misses (ReactLenis's own
    // ref-setting effect and the bridge's first poll attempt happen in the
    // same commit, ordered such that the bridge sees it too early) and a
    // retry is scheduled via requestAnimationFrame — unmount immediately,
    // before that scheduled tick ever runs.
    unmount();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(tickerAdd).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
