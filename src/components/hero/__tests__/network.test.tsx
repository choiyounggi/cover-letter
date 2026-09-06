import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { nodeCountFor, POINTER_INNER_RADIUS, POINTER_RADIUS, seedNodes, stepNodes } from "@/components/hero/network";

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(false),
}));

vi.mock("@/hooks/useThemeColors", () => ({
  useThemeColors: vi.fn().mockReturnValue({ bg: "#0a0a0c", fg: "#f5f5f7", accent: "#7c9cff" }),
}));

// Wrap (not replace) stepNodes so pure-function tests below still exercise the real
// implementation, while the NetworkCanvas describe can assert it was actually invoked
// from the rAF loop instead of only asserting the loop's negative (never-runs) paths.
vi.mock("@/components/hero/network", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/hero/network")>();
  return { ...actual, stepNodes: vi.fn(actual.stepNodes) };
});

describe("seedNodes", () => {
  it("seeds the requested count of nodes inside the given bounds (normal)", () => {
    const nodes = seedNodes(5, 100, 50, () => 0.5);
    expect(nodes).toHaveLength(5);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(100);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(50);
    }
  });
});

describe("nodeCountFor", () => {
  it("returns 70 for a desktop-width viewport (normal)", () => {
    expect(nodeCountFor(1024)).toBe(70);
  });

  it("returns 35 just below the 768 breakpoint (boundary)", () => {
    expect(nodeCountFor(767)).toBe(35);
  });

  it("returns 70 exactly at the 768 breakpoint (boundary)", () => {
    expect(nodeCountFor(768)).toBe(70);
  });
});

describe("stepNodes", () => {
  it("keeps every node inside the bounds after 100 steps (normal/boundary)", () => {
    const nodes = seedNodes(10, 200, 120, () => Math.random());
    for (let i = 0; i < 100; i++) stepNodes(nodes, 200, 120, null);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(200);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(120);
    }
  });

  it("pulls a node within the pointer radius closer to the pointer (normal)", () => {
    const nodes = [{ x: 100, y: 100, vx: 0, vy: 0 }];
    const pointer = { x: 100 + POINTER_RADIUS / 2, y: 100 };
    const before = Math.hypot(pointer.x - nodes[0].x, pointer.y - nodes[0].y);
    stepNodes(nodes, 1000, 1000, pointer);
    const after = Math.hypot(pointer.x - nodes[0].x, pointer.y - nodes[0].y);
    expect(after).toBeLessThan(before);
  });

  it("leaves a node outside the pointer radius unaffected by the pointer (boundary)", () => {
    const nodes = [{ x: 100, y: 100, vx: 0, vy: 0 }];
    const pointer = { x: 100 + POINTER_RADIUS + 50, y: 100 };
    stepNodes(nodes, 1000, 1000, pointer);
    expect(nodes[0].x).toBe(100);
    expect(nodes[0].y).toBe(100);
  });

  it("never lets a resting pointer pull a node closer than the inner radius, even after many steps (regression F1)", () => {
    const nodes = [{ x: 100, y: 100, vx: 0, vy: 0 }];
    const pointer = { x: 100 + POINTER_INNER_RADIUS + 20, y: 100 };
    for (let i = 0; i < 1000; i++) stepNodes(nodes, 1000, 1000, pointer);
    const dist = Math.hypot(pointer.x - nodes[0].x, pointer.y - nodes[0].y);
    expect(dist).toBeGreaterThanOrEqual(POINTER_INNER_RADIUS - 1e-6);
  });

  it("does not pull a node that is already inside the inner radius (boundary)", () => {
    const nodes = [{ x: 100, y: 100, vx: 0, vy: 0 }];
    const pointer = { x: 100 + POINTER_INNER_RADIUS - 5, y: 100 };
    stepNodes(nodes, 1000, 1000, pointer);
    expect(nodes[0].x).toBe(100);
    expect(nodes[0].y).toBe(100);
  });
});

function fakeCtx() {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    scale: vi.fn(),
    strokeStyle: "",
    fillStyle: "",
    globalAlpha: 1,
  };
}

class FakeIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    ioInstances.push(this);
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class FakeResizeObserver implements ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  constructor() {
    roInstances.push(this);
  }
}

let ioInstances: FakeIntersectionObserver[] = [];
let roInstances: FakeResizeObserver[] = [];
let rafCallbacks: FrameRequestCallback[] = [];
const originalGetContext = HTMLCanvasElement.prototype.getContext;
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, "clientWidth");
const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, "clientHeight");

// jsdom reports clientWidth/clientHeight as 0 (no real layout), which would make every
// in-bounds pointer position look "outside" the canvas. Stub a realistic size so the
// pointer in/out-of-bounds logic is actually exercised.
beforeEach(async () => {
  ioInstances = [];
  roInstances = [];
  rafCallbacks = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", { value: 800, configurable: true });
  Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", { value: 400, configurable: true });
  const { stepNodes: mockedStepNodes } = await import("@/components/hero/network");
  vi.mocked(mockedStepNodes).mockClear();
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  if (originalClientWidth) Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", originalClientWidth);
  if (originalClientHeight) Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", originalClientHeight);
  const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
  vi.mocked(useReducedMotionPref).mockReturnValue(false);
});

describe("NetworkCanvas", () => {
  it("renders without throwing and schedules no rAF when getContext returns null (error/boundary)", async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof originalGetContext;
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    expect(() => render(<NetworkCanvas />)).not.toThrow();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("draws exactly once and schedules no rAF under reduced motion (boundary)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    render(<NetworkCanvas />);
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("schedules no rAF when the intersection observer reports out-of-view (boundary)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    render(<NetworkCanvas />);
    act(() => {
      ioInstances[0].callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        ioInstances[0] as unknown as IntersectionObserver,
      );
    });
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("schedules the frame loop and steps/draws each frame once the section is in view (normal)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { stepNodes: mockedStepNodes } = await import("@/components/hero/network");
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    render(<NetworkCanvas />);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();

    act(() => {
      ioInstances[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        ioInstances[0] as unknown as IntersectionObserver,
      );
    });
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    ctx.clearRect.mockClear();
    act(() => {
      rafCallbacks[0](0);
    });
    expect(mockedStepNodes).toHaveBeenCalledTimes(1);
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it("feeds the latest pointermove position into stepNodes on the next frame (normal)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { stepNodes: mockedStepNodes } = await import("@/components/hero/network");
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    render(<NetworkCanvas />);

    act(() => {
      ioInstances[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        ioInstances[0] as unknown as IntersectionObserver,
      );
    });
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 42, clientY: 24 }));
    });
    act(() => {
      rafCallbacks[0](0);
    });
    expect(mockedStepNodes).toHaveBeenCalledWith(expect.anything(), expect.any(Number), expect.any(Number), {
      x: 42,
      y: 24,
    });
  });

  it("clears the pointer once it moves outside the canvas bounds (regression F1)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { stepNodes: mockedStepNodes } = await import("@/components/hero/network");
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    render(<NetworkCanvas />);

    act(() => {
      ioInstances[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        ioInstances[0] as unknown as IntersectionObserver,
      );
    });
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 42, clientY: 24 }));
    });
    // Move past the stubbed 400px-tall canvas — this is the "cursor left the section" case
    // from F1 that must release the pull instead of leaving nodes clamped to the last spot.
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 42, clientY: 999 }));
    });
    act(() => {
      rafCallbacks[0](0);
    });
    expect(mockedStepNodes).toHaveBeenCalledWith(expect.anything(), expect.any(Number), expect.any(Number), null);
  });

  it("disconnects both observers and removes the pointermove listener on unmount (cleanup)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    const { unmount } = render(<NetworkCanvas />);
    unmount();
    expect(ioInstances[0].disconnect).toHaveBeenCalled();
    expect(roInstances[0].disconnect).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith("pointermove", expect.any(Function));
  });
});
