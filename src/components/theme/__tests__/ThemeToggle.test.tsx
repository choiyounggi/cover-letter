import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const setTheme = vi.fn();
let resolvedTheme: string | undefined = "dark";
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => { setTheme.mockClear(); resolvedTheme = "dark"; });

  it("renders an accessible button and switches dark → light on click", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: "테마 전환" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(btn);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("switches light → dark", () => {
    resolvedTheme = "light";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "테마 전환" }));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("treats an undefined resolvedTheme (pre-hydration boundary) as dark and stays disabled-safe", () => {
    resolvedTheme = undefined;
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: "테마 전환" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(btn);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("hydrates without a mismatch when the stored theme (light) differs from the SSR default (dark)", async () => {
    // Server: next-themes has no storage, so resolvedTheme is undefined and the toggle renders dark.
    resolvedTheme = undefined;
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ThemeToggle />);
    document.body.appendChild(container);
    expect(container.querySelector("button")).toHaveAttribute("aria-pressed", "true");

    // Client: next-themes reads "light" from localStorage before the first render.
    // A mismatch here makes React re-render the whole root on the client, which also
    // re-creates next-themes' no-flash <script> and triggers the React 19 warning.
    resolvedTheme = "light";
    const recoverable: string[] = [];
    const consoleErrors: string[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      consoleErrors.push(args.map(String).join(" "));
    });
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <ThemeToggle />, {
        onRecoverableError: (err) => recoverable.push(String(err)),
      });
    });
    spy.mockRestore();

    expect(recoverable).toEqual([]);
    expect(consoleErrors.filter((m) => /hydrat/i.test(m))).toEqual([]);
    // After mount the toggle reflects the real (light) theme.
    expect(container.querySelector("button")).toHaveAttribute("aria-pressed", "false");

    await act(async () => root.unmount());
    container.remove();
  });
});
