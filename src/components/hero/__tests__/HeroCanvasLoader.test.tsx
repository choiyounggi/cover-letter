import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { HeroCanvasLoader } from "@/components/hero/HeroCanvasLoader";

const { dynamicOptsSpy } = vi.hoisted(() => ({ dynamicOptsSpy: vi.fn() }));

vi.mock("next/dynamic", () => ({
  default: (_loader: unknown, opts: unknown) => {
    dynamicOptsSpy(opts);
    return function CanvasStub({ inView }: { inView: boolean }) {
      return <div data-testid="canvas-stub" data-inview={String(inView)} />;
    };
  },
}));

class FakeIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  static instances: FakeIntersectionObserver[] = [];
  cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    FakeIntersectionObserver.instances.push(this);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  FakeIntersectionObserver.instances.length = 0;
});

describe("HeroCanvasLoader", () => {
  it("loads HeroCanvas with ssr:false so it never renders during SSR (normal: D1 client-only mount)", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    render(<HeroCanvasLoader />);
    expect(dynamicOptsSpy).toHaveBeenCalledTimes(1);
    expect(dynamicOptsSpy.mock.calls[0][0]).toMatchObject({ ssr: false });
  });

  it("starts inView=false and flips to true once the wrapper intersects (normal: observer wiring drives the prop)", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const { getByTestId } = render(<HeroCanvasLoader />);
    expect(getByTestId("canvas-stub")).toHaveAttribute("data-inview", "false");

    const observer = FakeIntersectionObserver.instances[0];
    act(() => {
      observer.cb([{ isIntersecting: true } as IntersectionObserverEntry], observer);
    });

    expect(getByTestId("canvas-stub")).toHaveAttribute("data-inview", "true");
  });

  it("flips back to inView=false once the wrapper leaves the viewport (error/negative: the callback runs both ways)", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const { getByTestId } = render(<HeroCanvasLoader />);
    const observer = FakeIntersectionObserver.instances[0];

    act(() => {
      observer.cb([{ isIntersecting: true } as IntersectionObserverEntry], observer);
    });
    expect(getByTestId("canvas-stub")).toHaveAttribute("data-inview", "true");

    act(() => {
      observer.cb([{ isIntersecting: false } as IntersectionObserverEntry], observer);
    });
    expect(getByTestId("canvas-stub")).toHaveAttribute("data-inview", "false");
  });

  it("disconnects the observer on unmount (boundary: cleanup symmetry)", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const disconnectSpy = vi.spyOn(FakeIntersectionObserver.prototype, "disconnect");
    const { unmount } = render(<HeroCanvasLoader />);
    unmount();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    disconnectSpy.mockRestore();
  });
});
