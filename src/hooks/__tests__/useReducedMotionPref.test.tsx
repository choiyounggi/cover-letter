import { describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

vi.mock("motion/react", () => ({
  useReducedMotion: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

function Probe() {
  const reduced = useReducedMotionPref();
  return <div data-testid="reduced">{String(reduced)}</div>;
}

describe("useReducedMotionPref", () => {
  it("returns true when motion's useReducedMotion reports true (normal)", async () => {
    const { useReducedMotion } = await import("motion/react");
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId("reduced").textContent).toBe("true");
  });

  it("returns false when motion's useReducedMotion reports false (normal/negative)", async () => {
    const { useReducedMotion } = await import("motion/react");
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId("reduced").textContent).toBe("false");
  });

  it("falls back to false when motion's useReducedMotion returns null (boundary)", async () => {
    const { useReducedMotion } = await import("motion/react");
    vi.mocked(useReducedMotion).mockReturnValue(null);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId("reduced").textContent).toBe("false");
  });
});
