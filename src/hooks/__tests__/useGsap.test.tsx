import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { useGsap } from "@/hooks/useGsap";
import * as gsapLib from "@/lib/gsap";

vi.mock("@/lib/gsap", () => {
  const revert = vi.fn();
  // Mirrors real gsap.context (gsap-core.js: `func.apply(self, arguments)`
  // with no internal try/catch): the init function is invoked synchronously
  // and a throw from it propagates straight out of gsap.context(). useGsap
  // itself — not gsap — is responsible for never leaving a dangling context.
  const context = vi.fn((cb: (self: unknown) => void) => {
    cb({});
    return { revert };
  });
  return { gsap: { context }, ScrollTrigger: {}, __revert: revert };
});

const context = gsapLib.gsap.context as unknown as ReturnType<typeof vi.fn>;
const revert = (gsapLib as unknown as { __revert: ReturnType<typeof vi.fn> }).__revert;

beforeEach(() => {
  context.mockClear();
  revert.mockClear();
});

afterEach(() => {
  cleanup();
});

function Probe({ cb, deps }: { cb: (ctx: unknown) => void; deps: unknown[] }) {
  useGsap(cb, deps);
  return null;
}

describe("useGsap", () => {
  it("invokes the callback once inside a gsap.context on mount (normal)", () => {
    const cb = vi.fn();
    render(<Probe cb={cb} deps={[]} />);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(context).toHaveBeenCalledTimes(1);
  });

  it("reverts the gsap context on unmount (normal)", () => {
    const cb = vi.fn();
    const { unmount } = render(<Probe cb={cb} deps={[]} />);
    expect(revert).not.toHaveBeenCalled();
    unmount();
    expect(revert).toHaveBeenCalledTimes(1);
  });

  it("passes scope.current as gsap.context's scope argument (normal)", () => {
    const scope = { current: document.createElement("div") };
    const cb = vi.fn();
    function ScopedProbe() {
      useGsap(cb, [], scope);
      return null;
    }
    render(<ScopedProbe />);
    expect(context).toHaveBeenCalledWith(expect.any(Function), scope.current);
  });

  it("re-runs the callback and reverts the previous context when deps change (boundary: dependency-array edge)", () => {
    const cb = vi.fn();
    const { rerender } = render(<Probe cb={cb} deps={[1]} />);
    expect(context).toHaveBeenCalledTimes(1);
    rerender(<Probe cb={cb} deps={[2]} />);
    expect(revert).toHaveBeenCalledTimes(1);
    expect(context).toHaveBeenCalledTimes(2);
  });

  it("does not leave a dangling context and still reverts on unmount when the callback throws (error path)", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("boom");
    const cb = vi.fn(() => {
      throw err;
    });
    // With the faithful (non-swallowing) mock above, a real throw from cb
    // would propagate straight out of gsap.context if useGsap did not guard
    // it — so render() succeeding here proves useGsap itself contains it.
    const { unmount } = render(<Probe cb={cb} deps={[]} />);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(context).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(err);
    unmount();
    expect(revert).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
