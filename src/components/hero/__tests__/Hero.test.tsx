import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Hero } from "@/components/hero/Hero";

vi.mock("@/components/hero/NetworkCanvas", () => ({
  NetworkCanvas: () => <canvas data-testid="canvas-stub" />,
}));

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(true),
}));

afterEach(() => {
  cleanup();
});

describe("Hero", () => {
  it("renders name, title, and tagline (normal)", () => {
    const { getByRole, getByText } = render(<Hero name="최영기" title="Backend Engineer" tagline="실전에 강한" />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("최영기");
    expect(getByText("Backend Engineer")).toBeInTheDocument();
    expect(getByText("실전에 강한")).toBeInTheDocument();
  });

  it("renders no third output paragraph when tagline is omitted (boundary)", () => {
    const { container, getByText } = render(<Hero name="최영기" title="Backend Engineer" />);
    expect(getByText("Backend Engineer")).toBeInTheDocument();
    expect(container.querySelector(".intro-out")?.querySelectorAll("p")).toHaveLength(2);
  });

  it("marks the canvas layer aria-hidden so it never enters the a11y tree (a11y)", () => {
    const { container } = render(<Hero name="최영기" title="Backend Engineer" />);
    const canvasLayer = container.querySelector('[aria-hidden="true"]');
    expect(canvasLayer).not.toBeNull();
    expect(canvasLayer?.querySelector('[data-testid="canvas-stub"]')).not.toBeNull();
  });

  it("marks the root section with data-hero and drops the old min-h-dvh sizing (contract)", () => {
    const { container } = render(<Hero name="최영기" title="Backend Engineer" />);
    const section = container.querySelector("section[data-hero]");
    expect(section).not.toBeNull();
    expect(section?.className).not.toContain("min-h-dvh");
  });

  it("renders the code-intro editor panel as a code-frame (structure)", () => {
    const { container } = render(<Hero name="최영기" title="Backend Engineer" />);
    expect(container.querySelector('.code-frame[data-file="profile.ts"]')).not.toBeNull();
  });
});
