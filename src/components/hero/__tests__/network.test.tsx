import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEffect, useState } from "react";
import { act, cleanup, render } from "@testing-library/react";
import {
  clampNodes,
  nodeCountFor,
  POINTER_INNER_RADIUS,
  POINTER_RADIUS,
  seedNodes,
  stepNodes,
} from "@/components/hero/network";

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(false),
}));

// A stateful stand-in for useThemeColors (real one: FALLBACK on first render, then its
// own MutationObserver-driven effect resolves the real value, and can push again later on
// a theme toggle) — needed to reproduce and regression-test r3-F1, where the reduced-motion
// static paint must repaint on each of those later flushes, not just read whatever value
// happened to be current at mount.
const themeColorsMock = vi.hoisted(() => {
  const FALLBACK = { bg: "#0a0a0c", fg: "#f5f5f7", accent: "#7c9cff" };
  let current = FALLBACK;
  const listeners = new Set<(c: typeof FALLBACK) => void>();
  return {
    FALLBACK,
    get current() {
      return current;
    },
    subscribe(fn: (c: typeof FALLBACK) => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    push(next: typeof FALLBACK) {
      current = next;
      listeners.forEach((fn) => fn(next));
    },
    reset() {
      current = FALLBACK;
    },
  };
});

vi.mock("@/hooks/useThemeColors", () => ({
  useThemeColors: () => {
    const [colors, setColors] = useState(themeColorsMock.current);
    useEffect(() => {
      setColors(themeColorsMock.current);
      return themeColorsMock.subscribe(setColors);
    }, []);
    return colors;
  },
}));

// Wrap (not replace) stepNodes/seedNodes so pure-function tests below still exercise the
// real implementation, while the NetworkCanvas describe can assert they were actually
// invoked (or, for the r2 regression tests, NOT re-invoked) from the lifecycle effect
// instead of only asserting the loop's negative (never-runs) paths.
vi.mock("@/components/hero/network", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/hero/network")>();
  return {
    ...actual,
    stepNodes: vi.fn(actual.stepNodes),
    seedNodes: vi.fn(actual.seedNodes),
    clampNodes: vi.fn(actual.clampNodes),
  };
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

describe("clampNodes", () => {
  it("pulls an out-of-bounds node back to the nearest edge on each axis (normal)", () => {
    const nodes = [{ x: -10, y: 500, vx: 1, vy: -1 }];
    clampNodes(nodes, 200, 300);
    expect(nodes[0]).toMatchObject({ x: 0, y: 300 });
  });

  it("leaves an already-in-bounds node untouched (boundary)", () => {
    const nodes = [{ x: 50, y: 50, vx: 1, vy: 1 }];
    clampNodes(nodes, 200, 300);
    expect(nodes[0]).toMatchObject({ x: 50, y: 50 });
  });

  it("does not move a node that sits exactly on the new edge (boundary)", () => {
    const nodes = [{ x: 150, y: 250, vx: 0, vy: 0 }];
    clampNodes(nodes, 150, 250);
    expect(nodes[0]).toMatchObject({ x: 150, y: 250 });
  });

  it("is a no-op on an empty node list (error/edge)", () => {
    const nodes: ReturnType<typeof seedNodes> = [];
    expect(() => clampNodes(nodes, 200, 300)).not.toThrow();
    expect(nodes).toHaveLength(0);
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
  callback: ResizeObserverCallback;
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
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
  const {
    stepNodes: mockedStepNodes,
    seedNodes: mockedSeedNodes,
    clampNodes: mockedClampNodes,
  } = await import("@/components/hero/network");
  vi.mocked(mockedStepNodes).mockClear();
  vi.mocked(mockedSeedNodes).mockClear();
  vi.mocked(mockedClampNodes).mockClear();
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  if (originalClientWidth) Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", originalClientWidth);
  if (originalClientHeight) Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", originalClientHeight);
  const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
  vi.mocked(useReducedMotionPref).mockReturnValue(false);
  themeColorsMock.reset();
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

  it("does not re-seed or restart the loop when colors change identity, but draws with the new colors on the next frame (regression r2-F1)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { seedNodes: mockedSeedNodes } = await import("@/components/hero/network");
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    render(<NetworkCanvas />);

    act(() => {
      ioInstances[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        ioInstances[0] as unknown as IntersectionObserver,
      );
    });
    const seedCallsBefore = vi.mocked(mockedSeedNodes).mock.calls.length;
    const ioCountBefore = ioInstances.length;
    const roCountBefore = roInstances.length;

    // Simulate the theme hook handing back a fresh object identity, as it does on every
    // <html> class/style/data-theme mutation (e.g. Lenis toggling scroll classes).
    act(() => {
      themeColorsMock.push({ bg: "#111111", fg: "#eeeeee", accent: "#00ffff" });
    });

    // The lifecycle effect must not have torn down and re-run: no re-seed, no new
    // observer instances (a teardown+rebuild would call `new IntersectionObserver(...)`
    // and `new ResizeObserver(...)` again).
    expect(vi.mocked(mockedSeedNodes).mock.calls.length).toBe(seedCallsBefore);
    expect(ioInstances.length).toBe(ioCountBefore);
    expect(roInstances.length).toBe(roCountBefore);

    act(() => {
      rafCallbacks[rafCallbacks.length - 1](0);
    });
    expect(ctx.strokeStyle).toBe("#00ffff");
    expect(ctx.fillStyle).toBe("#eeeeee");
  });

  it("repaints (never re-seeds) under reduced motion once useThemeColors resolves, and again on a later theme change (regression r3-F1)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const { seedNodes: mockedSeedNodes } = await import("@/components/hero/network");
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");

    render(<NetworkCanvas />);
    // First paint used whatever the hook's fallback happened to be at mount.
    expect(ctx.strokeStyle).toBe(themeColorsMock.FALLBACK.accent);
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    const seedCallsAfterMount = vi.mocked(mockedSeedNodes).mock.calls.length;

    // useThemeColors' own effect resolving the real theme colors shortly after mount.
    act(() => {
      themeColorsMock.push({ bg: "#111111", fg: "#eeeeee", accent: "#00ffff" });
    });
    expect(ctx.strokeStyle).toBe("#00ffff");
    expect(ctx.fillStyle).toBe("#eeeeee");
    expect(ctx.clearRect).toHaveBeenCalledTimes(2);

    // A later theme toggle must repaint again, not just update the ref silently.
    act(() => {
      themeColorsMock.push({ bg: "#222222", fg: "#dddddd", accent: "#ff00ff" });
    });
    expect(ctx.strokeStyle).toBe("#ff00ff");
    expect(ctx.fillStyle).toBe("#dddddd");
    expect(ctx.clearRect).toHaveBeenCalledTimes(3);

    expect(vi.mocked(mockedSeedNodes).mock.calls.length).toBe(seedCallsAfterMount);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("clamps existing nodes into a resized canvas instead of re-seeding when the node count is unchanged (regression r2-F2)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { seedNodes: mockedSeedNodes, clampNodes: mockedClampNodes } = await import("@/components/hero/network");
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    render(<NetworkCanvas />);
    const seedCallsBefore = vi.mocked(mockedSeedNodes).mock.calls.length;

    // Shrink the height only (mobile URL-bar collapse), keep width the same (800, still
    // >=768) so nodeCountFor(width) does not change — this must clamp, not re-seed.
    Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", { value: 340, configurable: true });
    act(() => {
      roInstances[0].callback([] as ResizeObserverEntry[], roInstances[0] as unknown as ResizeObserver);
    });

    expect(vi.mocked(mockedSeedNodes).mock.calls.length).toBe(seedCallsBefore);
    expect(mockedClampNodes).toHaveBeenCalledTimes(1);
    expect(mockedClampNodes).toHaveBeenCalledWith(expect.anything(), 800, 340);
  });

  it("re-seeds (does not merely clamp) when a resize crosses the node-count breakpoint (boundary, regression r2-F2)", async () => {
    const ctx = fakeCtx();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof originalGetContext;
    const { seedNodes: mockedSeedNodes, clampNodes: mockedClampNodes } = await import("@/components/hero/network");
    const { NetworkCanvas } = await import("@/components/hero/NetworkCanvas");
    render(<NetworkCanvas />);
    const seedCallsBefore = vi.mocked(mockedSeedNodes).mock.calls.length;

    // Shrink width across the 768px breakpoint — nodeCountFor now returns 35 instead of
    // 70, so this genuinely needs a re-seed rather than a clamp.
    Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", { value: 400, configurable: true });
    act(() => {
      roInstances[0].callback([] as ResizeObserverEntry[], roInstances[0] as unknown as ResizeObserver);
    });

    expect(vi.mocked(mockedSeedNodes).mock.calls.length).toBe(seedCallsBefore + 1);
    expect(mockedClampNodes).not.toHaveBeenCalled();
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
