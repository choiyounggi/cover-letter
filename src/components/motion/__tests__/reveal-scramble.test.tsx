import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { Reveal } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { scrambleFrame, GLYPHS } from "@/components/motion/scramble";

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(false),
}));

class FakeIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this);
  }
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Reveal", () => {
  it("renders its children, applies the given className, and sets the D6 initial style from the y prop (normal)", () => {
    const { getByText, container } = render(
      <Reveal className="my-class" y={24}>
        <p>hello</p>
      </Reveal>,
    );
    expect(getByText("hello")).toBeInTheDocument();
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("my-class");
    expect(root.style.opacity).toBe("0");
    expect(root.style.transform).toContain("translateY(24px)");
  });

  it("still starts at opacity 0 with a y=0 initial offset (boundary: no-op translate)", () => {
    const { container } = render(
      <Reveal y={0}>
        <p>hi</p>
      </Reveal>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe("0");
  });
});

describe("scrambleFrame", () => {
  it("GLYPHS is exactly the D6-specified glyph set", () => {
    expect(GLYPHS).toBe("!<>-_\\/[]{}—=+*^?#01");
  });

  it("progress 0 keeps only spaces real; non-space chars become the rand()-selected glyph (normal)", () => {
    const frame = scrambleFrame("a b", 0, () => 0);
    expect(frame[1]).toBe(" ");
    expect(frame[0]).toBe(GLYPHS[0]);
    expect(frame[2]).toBe(GLYPHS[0]);
  });

  it("progress 1 returns the exact target (boundary)", () => {
    expect(scrambleFrame("최영기", 1, () => 0)).toBe("최영기");
  });

  it("progress 0.5 on a 4-char target reveals exactly the first 2 chars and scrambles the rest (normal)", () => {
    expect(scrambleFrame("abcd", 0.5, () => 0)).toBe(`ab${GLYPHS[0]}${GLYPHS[0]}`);
  });
});

describe("ScrambleText", () => {
  it("renders aria-label on the wrapper, aria-hidden on the animated span, and settles to the target text (normal)", () => {
    vi.useFakeTimers();
    const { container } = render(<ScrambleText text="최영기" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute("aria-label", "최영기");
    const span = wrapper.querySelector("span");
    expect(span).toHaveAttribute("aria-hidden", "true");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(span?.textContent).toBe("최영기");
  });

  it("renders an empty label without throwing when text is empty (boundary)", () => {
    vi.useFakeTimers();
    expect(() => render(<ScrambleText text="" />)).not.toThrow();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });

  it("shows the final text immediately with zero animation frames when reduced motion is preferred (error path: a11y override)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    const { container } = render(<ScrambleText text="최영기" />);
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("최영기");
    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
    vi.mocked(useReducedMotionPref).mockReturnValue(false);
  });
});
