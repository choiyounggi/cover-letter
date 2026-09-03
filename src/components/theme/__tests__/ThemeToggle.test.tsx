import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
});
