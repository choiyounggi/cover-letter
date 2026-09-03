import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { useThemeColors } from "@/hooks/useThemeColors";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("style");
  document.documentElement.removeAttribute("data-theme");
});

function Probe() {
  const colors = useThemeColors();
  return <div data-testid="colors">{JSON.stringify(colors)}</div>;
}

describe("useThemeColors", () => {
  it("reads --accent from computed style on mount (normal)", async () => {
    document.documentElement.style.setProperty("--accent", "#123456");
    const { getByTestId } = render(<Probe />);
    await waitFor(() => {
      expect(JSON.parse(getByTestId("colors").textContent!).accent).toBe("#123456");
    });
  });

  it("re-reads colors when the html element's data-theme attribute changes (normal)", async () => {
    const { getByTestId } = render(<Probe />);
    act(() => {
      document.documentElement.style.setProperty("--accent", "#abcdef");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await waitFor(() => {
      expect(JSON.parse(getByTestId("colors").textContent!).accent).toBe("#abcdef");
    });
  });

  it("disconnects the MutationObserver on unmount (boundary: cleanup symmetry)", () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
    const { unmount } = render(<Probe />);
    expect(disconnectSpy).not.toHaveBeenCalled();
    unmount();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    disconnectSpy.mockRestore();
  });
});
