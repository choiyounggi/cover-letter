import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { useIsTouch } from "@/hooks/useIsTouch";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Probe() {
  const isTouch = useIsTouch();
  return <div data-testid="touch">{String(isTouch)}</div>;
}

/** A fake MediaQueryList that can actually dispatch a "change" event. */
function makeFakeMql(initialMatches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches: initialMatches,
    addEventListener: vi.fn((_type: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb)),
    removeEventListener: vi.fn((_type: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb)),
    fire(matches: boolean) {
      mql.matches = matches;
      for (const cb of listeners) cb({ matches } as MediaQueryListEvent);
    },
  };
  return mql;
}

function stubMatchMedia(mql: ReturnType<typeof makeFakeMql> | undefined) {
  if (!mql) {
    vi.stubGlobal("matchMedia", undefined);
    return undefined;
  }
  const matchMedia = vi.fn().mockReturnValue(mql);
  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}

describe("useIsTouch", () => {
  it("returns true when (pointer: coarse) matches on mount (normal)", async () => {
    const matchMedia = stubMatchMedia(makeFakeMql(true));
    const { getByTestId } = render(<Probe />);
    await waitFor(() => expect(getByTestId("touch").textContent).toBe("true"));
    expect(matchMedia).toHaveBeenCalledWith("(pointer: coarse)");
  });

  it("returns false when (pointer: coarse) does not match on mount (normal/negative)", async () => {
    stubMatchMedia(makeFakeMql(false));
    const { getByTestId } = render(<Probe />);
    await waitFor(() => expect(getByTestId("touch").textContent).toBe("false"));
  });

  it("defaults to false when matchMedia is unavailable (boundary)", () => {
    stubMatchMedia(undefined);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId("touch").textContent).toBe("false");
  });

  it("updates when the media query's change event fires, and unsubscribes on unmount", async () => {
    const mql = makeFakeMql(false);
    stubMatchMedia(mql);
    const { getByTestId, unmount } = render(<Probe />);
    await waitFor(() => expect(getByTestId("touch").textContent).toBe("false"));
    expect(mql.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    act(() => {
      mql.fire(true);
    });
    await waitFor(() => expect(getByTestId("touch").textContent).toBe("true"));

    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1);
    const [, registeredHandler] = mql.addEventListener.mock.calls[0];
    const [, removedHandler] = mql.removeEventListener.mock.calls[0];
    expect(removedHandler).toBe(registeredHandler);
  });
});
