import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { CodeIntro } from "@/components/hero/CodeIntro";

vi.mock("@/hooks/useReducedMotionPref", () => ({
  useReducedMotionPref: vi.fn().mockReturnValue(false),
}));

afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
  vi.mocked(useReducedMotionPref).mockReturnValue(false);
});

describe("CodeIntro", () => {
  it("shows the real name as an h1 immediately (normal)", () => {
    const { getByRole } = render(<CodeIntro name="최영기" title="Backend Engineer" tagline="실전에 강한" />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("최영기");
  });

  it("reveals the output panel only after the typing loop finishes (normal)", () => {
    vi.useFakeTimers();
    const { container } = render(<CodeIntro name="최영기" title="Backend Engineer" tagline="실전에 강한" />);
    const outWrapper = container.querySelector(".intro-out");
    expect(outWrapper).not.toHaveClass("is-done");
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(outWrapper).toHaveClass("is-done");
  });

  it("types the profile fields with syntax-colored string tokens once complete (normal)", () => {
    vi.useFakeTimers();
    const { container } = render(<CodeIntro name="최영기" title="Backend Engineer" tagline="실전에 강한" />);
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    const codeFrame = container.querySelector(".code-frame");
    expect(codeFrame?.textContent).toContain('name: "최영기"');
    expect(container.querySelector(".text-syn-string")).not.toBeNull();
  });

  it("reveals the script character by character rather than jumping straight to done (normal)", () => {
    vi.useFakeTimers();
    const { container } = render(<CodeIntro name="최영기" title="Backend Engineer" tagline="실전에 강한" />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const codeFrame = container.querySelector(".code-frame");
    const partialText = codeFrame?.textContent ?? "";
    expect(partialText.length).toBeGreaterThan(0);
    expect(partialText).not.toContain("render(engineer);");
    expect(container.querySelector(".intro-out")).not.toHaveClass("is-done");
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(codeFrame?.textContent?.length).toBeGreaterThan(partialText.length);
    expect(codeFrame?.textContent).toContain("render(engineer);");
  });

  it("renders no third output paragraph when tagline is omitted (boundary)", () => {
    const { container } = render(<CodeIntro name="최영기" title="Backend Engineer" />);
    const outWrapper = container.querySelector(".intro-out");
    expect(outWrapper?.querySelectorAll("p")).toHaveLength(2);
  });

  it("marks the editor panel aria-hidden so it never enters the a11y tree (a11y)", () => {
    const { container } = render(<CodeIntro name="최영기" title="Backend Engineer" />);
    expect(container.querySelector(".code-frame")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the done state immediately and schedules no rAF under reduced motion (reduced)", async () => {
    const { useReducedMotionPref } = await import("@/hooks/useReducedMotionPref");
    vi.mocked(useReducedMotionPref).mockReturnValue(true);
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    const { container } = render(<CodeIntro name="최영기" title="Backend Engineer" tagline="실전에 강한" />);
    expect(container.querySelector(".intro-out")).toHaveClass("is-done");
    expect(rafSpy).not.toHaveBeenCalled();
    const codeFrame = container.querySelector(".code-frame");
    expect(codeFrame?.textContent).toContain('name: "최영기"');
    expect(codeFrame?.textContent).toContain("render(engineer);");
  });

  it("cancels the pending animation frame on unmount (cleanup)", () => {
    vi.useFakeTimers();
    const cafSpy = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<CodeIntro name="최영기" title="Backend Engineer" />);
    unmount();
    expect(cafSpy).toHaveBeenCalled();
  });
});
