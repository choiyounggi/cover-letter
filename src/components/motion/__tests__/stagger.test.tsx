import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { StaggerGroup, StaggerItem } from "@/components/motion";

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(false),
}));

// This suite skips a dedicated "error case": StaggerGroup/StaggerItem are
// total functions over their prop types (every prop is optional with a
// default, `as`/`from` are closed unions the type checker enforces) — there
// is no reachable input that throws. The zero-children boundary test below
// stands in as the DoD's designated boundary/error-path proof (per
// wiki/testing/quality/minimum-case-set.md's "cannot error by construction"
// edge case).

// Counting *observed elements* rather than constructed observers is
// deliberate: framer-motion caches one IntersectionObserver per
// root+{threshold,margin} key in a module-level WeakMap
// (node_modules/framer-motion/dist/es/motion/features/viewport/observers.mjs),
// so the constructor fires only for the first test in this file while
// `observe(element)` is still called once per element that registers a
// viewport trigger. This probe therefore survives both the cache and any
// test reordering.
let observedTargets: Element[] = [];

class FakeIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe(target: Element) {
    observedTargets.push(target);
    this.cb([{ isIntersecting: true, target } as IntersectionObserverEntry], this);
  }
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeEach(() => {
  observedTargets = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("StaggerGroup/StaggerItem", () => {
  it("renders the as='ul'/'li' tags given (R1, R2 normal)", () => {
    const { container } = render(
      <StaggerGroup as="ul">
        <StaggerItem as="li">a</StaggerItem>
      </StaggerGroup>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("UL");
    expect(root.firstElementChild?.tagName).toBe("LI");
  });

  it("registers a viewport trigger on the group element only — 3 items add none of their own (R3 normal)", () => {
    const { container } = render(
      <StaggerGroup as="ul">
        <StaggerItem as="li">a</StaggerItem>
        <StaggerItem as="li">b</StaggerItem>
        <StaggerItem as="li">c</StaggerItem>
      </StaggerGroup>,
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group.querySelectorAll("li")).toHaveLength(3);
    expect(observedTargets).toHaveLength(1);
    expect(observedTargets[0]).toBe(group);
  });

  it("from='up' sets the item's hidden translateY(16px)/opacity 0 (R4 normal)", () => {
    const { container } = render(
      <StaggerGroup from="up">
        <StaggerItem>a</StaggerItem>
      </StaggerGroup>,
    );
    const item = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(item.style.opacity).toBe("0");
    expect(item.style.transform).toContain("translateY(16px)");
  });

  it("from='left' sets the item's hidden translateX(-24px) (R4 normal)", () => {
    const { container } = render(
      <StaggerGroup from="left">
        <StaggerItem>a</StaggerItem>
      </StaggerGroup>,
    );
    const item = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(item.style.transform).toContain("translateX(-24px)");
  });

  it("from='scale' sets the item's hidden scale(0.85) (R4 normal)", () => {
    const { container } = render(
      <StaggerGroup from="scale">
        <StaggerItem>a</StaggerItem>
      </StaggerGroup>,
    );
    const item = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(item.style.transform).toContain("scale(0.85)");
  });

  it("renders the final state immediately when reduced motion is preferred (R5 normal: a11y override)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const { container } = render(
      <StaggerGroup from="left">
        <StaggerItem>a</StaggerItem>
      </StaggerGroup>,
    );
    const item = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(item.style.opacity).toBe("1");
    expect(item.style.transform ?? "").not.toContain("translateX(-24px)");
    vi.mocked(useReducedMotionPref).mockReturnValue(false);
  });

  it("renders with zero children without throwing (R6 boundary)", () => {
    expect(() => render(<StaggerGroup />)).not.toThrow();
    expect(() => render(<StaggerItem />)).not.toThrow();
  });

  it("passes className through unchanged on both components (R7 normal)", () => {
    const { container: groupContainer } = render(<StaggerGroup className="group-x" />);
    expect(groupContainer.firstElementChild as HTMLElement).toHaveClass("group-x");

    const { container: itemContainer } = render(<StaggerItem className="item-y" />);
    expect(itemContainer.firstElementChild as HTMLElement).toHaveClass("item-y");
  });

  it("a non-default stagger actually offsets later items' starts (R10 normal: staggerChildren carries the prop, not the default)", async () => {
    const { container } = render(
      <StaggerGroup as="ul" stagger={0.5}>
        <StaggerItem as="li">a</StaggerItem>
        <StaggerItem as="li">b</StaggerItem>
        <StaggerItem as="li">c</StaggerItem>
      </StaggerGroup>,
    );
    const items = Array.from(container.querySelectorAll("li")) as HTMLElement[];
    expect(items).toHaveLength(3);
    // Positive control: the first item does start, so a still-hidden third
    // item below cannot be a vacuous pass from an animation that never ran.
    await waitFor(() => expect(items[0].style.opacity).not.toBe("0"), { timeout: 2000 });
    // The third item's turn is 2 x 0.5s away. At 150ms past the first item's
    // start it must still be untouched — with the 0.06s default it would
    // already be 30ms into its own animation.
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(items[2].style.opacity).toBe("0");
    await waitFor(() => expect(items[2].style.opacity).not.toBe("0"), { timeout: 4000 });
  });

  it("a non-default delay defers even the first item's start (R11 normal: delayChildren carries the prop, not the default)", async () => {
    const { container } = render(
      <StaggerGroup as="ul" delay={0.6}>
        <StaggerItem as="li">a</StaggerItem>
      </StaggerGroup>,
    );
    const item = container.querySelector("li") as HTMLElement;
    // With delayChildren 0.6s nothing may have moved yet at 150ms; with the
    // 0 default the item would already be well into its 0.5s animation.
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(item.style.opacity).toBe("0");
    // Positive control: it does eventually start, so the assertion above is
    // about the delay and not about a dead animation.
    await waitFor(() => expect(item.style.opacity).not.toBe("0"), { timeout: 4000 });
  });

  it("an orphan StaggerItem — rendered with no StaggerGroup above it — stays visible instead of being stranded at opacity 0 (R9 boundary)", () => {
    const { container } = render(<StaggerItem>orphan</StaggerItem>);
    const item = container.firstElementChild as HTMLElement;
    expect(item.textContent).toBe("orphan");
    expect(item.style.opacity).not.toBe("0");
  });

  it("resolves both components through the @/components/motion barrel (R8 normal)", () => {
    expect(typeof StaggerGroup).toBe("function");
    expect(typeof StaggerItem).toBe("function");
  });
});
