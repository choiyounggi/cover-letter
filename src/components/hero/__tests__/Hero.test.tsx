import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Hero } from "@/components/hero/Hero";

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="canvas-stub" />,
}));

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(false),
}));

class FakeIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
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
});

describe("Hero", () => {
  it("renders name, title, and tagline (normal)", () => {
    const { getByLabelText, getByText } = render(<Hero name="최영기" title="Backend Engineer" tagline="실전에 강한" />);
    expect(getByLabelText("최영기")).toBeInTheDocument();
    expect(getByText("Backend Engineer")).toBeInTheDocument();
    expect(getByText("실전에 강한")).toBeInTheDocument();
  });

  it("renders no empty tagline paragraph when tagline is omitted (boundary)", () => {
    const { container, getByText } = render(<Hero name="최영기" title="Backend Engineer" />);
    expect(getByText("Backend Engineer")).toBeInTheDocument();
    // Only one <p> (title) should exist — no empty tagline <p>.
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("marks the canvas layer aria-hidden so it never enters the a11y tree (a11y)", () => {
    const { container } = render(<Hero name="최영기" title="Backend Engineer" />);
    const canvasLayer = container.querySelector('[aria-hidden="true"]');
    expect(canvasLayer).not.toBeNull();
    expect(canvasLayer?.querySelector('[data-testid="canvas-stub"]')).not.toBeNull();
  });

  it("marks the root section with data-hero per D11 (normal)", () => {
    const { container } = render(<Hero name="최영기" title="Backend Engineer" />);
    expect(container.querySelector("section[data-hero]")).not.toBeNull();
  });
});
