import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { navVisibility } from "@/components/layout/nav-visibility";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ScrollTrigger } from "@/lib/gsap";

vi.mock("@/components/motion", () => ({
  Magnetic: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/hooks", () => ({ useGsap: vi.fn((cb: () => void) => cb()) }));
vi.mock("@/lib/gsap", () => ({ ScrollTrigger: { create: vi.fn(() => ({ kill: vi.fn() })) } }));

const setTheme = vi.fn();
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "dark", setTheme }) }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("navVisibility (pure)", () => {
  it("hides while scrolling down past the top threshold (normal)", () => {
    expect(navVisibility(1, 500)).toBe("hidden");
  });

  it("stays visible while scrolling up (normal)", () => {
    expect(navVisibility(-1, 500)).toBe("visible");
  });

  it("stays visible near the top regardless of direction (boundary: y < 40)", () => {
    expect(navVisibility(1, 10)).toBe("visible");
  });
});

describe("Nav", () => {
  it("renders all 6 links with the exact hrefs and the theme toggle", () => {
    render(<Nav />);
    const expected: [string, string][] = [
      ["소개", "#about"],
      ["기술", "#skills"],
      ["타임라인", "#timeline"],
      ["경력", "#experience"],
      ["프로젝트", "#projects"],
      ["연락", "#contact"],
    ];
    for (const [label, href] of expected) {
      const links = screen.getAllByRole("link", { name: label });
      expect(links.some((a) => a.getAttribute("href") === href)).toBe(true);
    }
    expect(screen.getByRole("button", { name: "테마 전환" })).toBeInTheDocument();
  });

  it("toggles aria-expanded on the mobile menu button (error/negative: closed by default)", () => {
    render(<Nav />);
    const menuButton = screen.getByRole("button", { name: "메뉴 열기" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  it("wires ScrollTrigger's onUpdate to navVisibility and toggles -translate-y-full (D7 scroll wiring)", () => {
    render(<Nav />);
    const header = screen.getByRole("banner");
    expect(header.className).not.toContain("-translate-y-full");

    const onUpdate = vi.mocked(ScrollTrigger.create).mock.calls[0][0]?.onUpdate;
    expect(onUpdate).toBeInstanceOf(Function);

    act(() => onUpdate?.({ direction: 1, scroll: () => 500 } as never));
    expect(header.className).toContain("-translate-y-full");

    act(() => onUpdate?.({ direction: -1, scroll: () => 500 } as never));
    expect(header.className).not.toContain("-translate-y-full");
  });
});

describe("Footer", () => {
  it("renders links with rel=noopener noreferrer and the current year (normal)", () => {
    render(<Footer links={[{ label: "GitHub", url: "https://github.com/x" }]} />);
    const link = screen.getByRole("link", { name: "GitHub" });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText(`© ${new Date().getFullYear()} 최영기`)).toBeInTheDocument();
  });

  it("renders with no links (boundary: empty array)", () => {
    render(<Footer links={[]} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText(/Built with Next.js/)).toBeInTheDocument();
  });
});

describe("SectionHeading", () => {
  it("renders eyebrow text and an h2 with the given id", () => {
    render(<SectionHeading id="about" eyebrow="About" title="소개" />);
    expect(screen.getByText("About")).toBeInTheDocument();
    const heading = screen.getByRole("heading", { level: 2, name: "소개" });
    expect(heading).toHaveAttribute("id", "about");
  });
});
