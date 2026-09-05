import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { magneticOffset } from "@/components/motion/magnetic-offset";
import { Magnetic } from "@/components/motion/Magnetic";
import { Parallax } from "@/components/motion/Parallax";
import { Cursor, DOT_FACTOR, RING_FACTOR } from "@/components/motion/Cursor";

vi.mock("@/hooks/useIsTouch", () => ({
  useIsTouch: vi.fn().mockReturnValue(false),
}));
vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(false),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-custom-cursor");
});

describe("magneticOffset", () => {
  it("applies a linearly-falling-off pull toward the pointer within radius (normal)", () => {
    const { x, y } = magneticOffset(30, 0, 80, 0.35);
    expect(x).toBeCloseTo(30 * 0.35 * (1 - 30 / 80));
    expect(y).toBe(0);
  });

  it("returns zero offset once the pointer is outside the radius (error/negative)", () => {
    expect(magneticOffset(100, 0, 80, 0.35)).toEqual({ x: 0, y: 0 });
  });

  it("returns zero offset when radius is 0 and the pointer is outside it (boundary, task-spec case)", () => {
    expect(magneticOffset(10, 10, 0, 0.35)).toEqual({ x: 0, y: 0 });
  });

  it("does not divide by zero when both the offset and radius are 0 (boundary: genuine 0/0 case)", () => {
    expect(magneticOffset(0, 0, 0, 0.35)).toEqual({ x: 0, y: 0 });
  });
});

describe("Magnetic", () => {
  it("renders its child unchanged, preserving its role (normal)", () => {
    const { getByRole } = render(
      <Magnetic>
        <button>press</button>
      </Magnetic>,
    );
    expect(getByRole("button", { name: "press" })).toBeInTheDocument();
  });

  it("marks the wrapper with data-cursor=hover for the Cursor ring to react to (normal)", () => {
    const { container } = render(
      <Magnetic>
        <button>press</button>
      </Magnetic>,
    );
    expect(container.querySelector('[data-cursor="hover"]')).not.toBeNull();
  });

  it("pulls the wrapper toward the pointer on pointermove and springs back on pointerleave", async () => {
    // framer-motion's own spring ticker captures the native requestAnimationFrame
    // at import time (before any per-test vi.useFakeTimers() call), so it does
    // not advance under fake timers — this test uses real timers + waitFor to
    // let the real spring animation run, unlike Cursor's RAF loop below (which
    // calls the global requestAnimationFrame fresh each time and IS fake-timer
    // driven).
    const { container } = render(
      <Magnetic radius={80} strength={0.35}>
        <button>press</button>
      </Magnetic>,
    );
    const wrapper = container.querySelector('[data-cursor="hover"]') as HTMLElement;
    wrapper.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON() {},
      }) as DOMRect;

    // Wrapper center is (50, 50); pointer at (80, 50) => dx=30, dy=0, inside the 80px radius.
    wrapper.dispatchEvent(new PointerEvent("pointermove", { clientX: 80, clientY: 50, bubbles: true }));

    let movedX = 0;
    await waitFor(() => {
      const match = wrapper.style.transform.match(/translateX\((-?[\d.]+)px\)/);
      expect(match).not.toBeNull();
      movedX = Number(match![1]);
      expect(movedX).toBeGreaterThan(1);
    });

    // React synthesizes onPointerLeave from the bubbling "pointerout" event
    // plus relatedTarget ancestry — a native "pointerleave" (non-bubbling)
    // dispatched directly on the element is not what React's delegated
    // listener observes, so pointerout is what actually exercises the handler.
    wrapper.dispatchEvent(
      new PointerEvent("pointerout", { bubbles: true, relatedTarget: document.body } as PointerEventInit),
    );

    await waitFor(
      () => {
        const match = wrapper.style.transform.match(/translateX\((-?[\d.]+)px\)/);
        const x = match ? Number(match[1]) : movedX;
        expect(Math.abs(x)).toBeLessThan(movedX * 0.4);
      },
      { timeout: 3000 },
    );
  }, 8000);
});

describe("Parallax", () => {
  it("renders its children (normal)", () => {
    const { getByText } = render(
      <Parallax>
        <p>content</p>
      </Parallax>,
    );
    expect(getByText("content")).toBeInTheDocument();
  });

  it("maps the default speed=0.2 into a -20%..20% translateY output range (normal: verifies the useTransform mapping, not just presence)", () => {
    // jsdom has no real layout/scroll, so useScroll's scrollYProgress reads
    // as its initial value (0) — useTransform([0,1], [-20%, 20%]) at input 0
    // must resolve to the range's start, -20%.
    const { container } = render(
      <Parallax speed={0.2}>
        <p>content</p>
      </Parallax>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toContain("translateY(-20%)");
  });

  it("scales the output range with a different speed prop (boundary: larger speed)", () => {
    const { container } = render(
      <Parallax speed={0.5}>
        <p>content</p>
      </Parallax>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toContain("translateY(-50%)");
  });
});

describe("Cursor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders null when the device is touch (normal)", async () => {
    const { useIsTouch } = await import("@/hooks/useIsTouch");
    vi.mocked(useIsTouch).mockReturnValue(true);
    const { container } = render(<Cursor />);
    expect(container).toBeEmptyDOMElement();
    vi.mocked(useIsTouch).mockReturnValue(false);
  });

  it("renders null when reduced motion is preferred (error path: a11y override)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const { container } = render(<Cursor />);
    expect(container).toBeEmptyDOMElement();
    vi.mocked(useReducedMotionPref).mockReturnValue(false);
  });

  it("renders the dot and ring, and sets data-custom-cursor on <html>, when not touch and not reduced (normal)", () => {
    const { container } = render(<Cursor />);
    expect(container.querySelector(".cursor-dot")).not.toBeNull();
    expect(container.querySelector(".cursor-ring")).not.toBeNull();
    expect(document.documentElement.dataset.customCursor).toBe("true");
  });

  it("removes data-custom-cursor from <html> on unmount (boundary: cleanup symmetry)", () => {
    const { unmount } = render(<Cursor />);
    expect(document.documentElement.dataset.customCursor).toBe("true");
    unmount();
    expect(document.documentElement.dataset.customCursor).toBeUndefined();
  });

  it("snaps the dot exactly to the pointer and eases the ring toward it as RAF ticks fire (normal: the actual animation loop)", () => {
    const { container } = render(<Cursor />);
    const dot = container.querySelector(".cursor-dot") as HTMLElement;
    const ring = container.querySelector(".cursor-ring") as HTMLElement;
    expect(dot.style.transform).toBe("");

    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 200, clientY: 100 }));
      vi.advanceTimersByTime(50);
    });

    expect(dot.style.transform).toBe("translate3d(200px, 100px, 0)");

    const ringMatch = ring.style.transform.match(/translate3d\((-?[\d.]+)px, (-?[\d.]+)px, 0\)/);
    expect(ringMatch).not.toBeNull();
    const ringX = Number(ringMatch![1]);
    expect(ringX).toBeGreaterThan(0);
    expect(ringX).toBeLessThan(200);
  });

  it("adds is-hover to the ring (CSS-driven size, no scale() in the inline transform) when the pointer is over a [data-cursor=hover] element", () => {
    const { container } = render(
      <div>
        <Cursor />
        <button data-cursor="hover">target</button>
      </div>,
    );
    const target = container.querySelector("button")!;
    const ring = container.querySelector(".cursor-ring") as HTMLElement;

    act(() => {
      target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
      vi.advanceTimersByTime(100);
    });
    expect(ring.classList.contains("is-hover")).toBe(true);
    expect(ring.style.transform).not.toContain("scale(");
  });

  it("hides the cursor until the first pointermove, then reveals both elements (boundary: first move)", () => {
    const { container } = render(<Cursor />);
    const dot = container.querySelector(".cursor-dot") as HTMLElement;
    const ring = container.querySelector(".cursor-ring") as HTMLElement;
    expect(dot.classList.contains("is-visible")).toBe(false);
    expect(ring.classList.contains("is-visible")).toBe(false);

    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 10, clientY: 10 }));
      vi.advanceTimersByTime(16);
    });

    expect(dot.classList.contains("is-visible")).toBe(true);
    expect(ring.classList.contains("is-visible")).toBe(true);
  });

  it("exports follow-model constants that keep the dot exact and the ring within its intended ease range (error-guard: regressing the constants)", () => {
    expect(DOT_FACTOR).toBe(1);
    expect(RING_FACTOR).toBeGreaterThan(0.3);
    expect(RING_FACTOR).toBeLessThan(0.5);
  });

  it("removes the pointermove/pointerover window listeners and cancels the RAF loop on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<Cursor />);
    const moveHandler = addSpy.mock.calls.find(([type]) => type === "pointermove")?.[1];
    const overHandler = addSpy.mock.calls.find(([type]) => type === "pointerover")?.[1];
    expect(moveHandler).toBeDefined();
    expect(overHandler).toBeDefined();

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("pointermove", moveHandler);
    expect(removeSpy).toHaveBeenCalledWith("pointerover", overHandler);
    expect(cancelSpy).toHaveBeenCalledTimes(1);
    addSpy.mockRestore();
    removeSpy.mockRestore();
    cancelSpy.mockRestore();
  });
});
