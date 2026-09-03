import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Link, Profile, Skill, SkillCategory } from "@/generated/prisma/client";
import { AboutSection } from "@/components/sections/about/AboutSection";
import { SkillsSection } from "@/components/sections/skills/SkillsSection";
import { SkillChip } from "@/components/sections/skills/SkillChip";

vi.mock("@/components/motion", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Magnetic: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Parallax: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

afterEach(() => cleanup());

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "main",
    name: "최영기",
    nameEn: null,
    title: "Backend Engineer",
    tagline: null,
    bio: "",
    avatarUrl: null,
    email: null,
    location: null,
    resumeUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("AboutSection", () => {
  it("splits bio on blank lines into paragraphs (normal)", () => {
    render(<AboutSection profile={makeProfile({ bio: "a\n\nb" })} links={[]} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("renders script-tag bio text as plain text, never executes it (XSS)", () => {
    const { container } = render(
      <AboutSection profile={makeProfile({ bio: "<script>alert(1)</script>" })} links={[]} />,
    );
    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });

  it("falls back to initials when avatarUrl is absent (boundary)", () => {
    render(<AboutSection profile={makeProfile({ name: "최영기", avatarUrl: null })} links={[]} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("최영")).toBeInTheDocument();
  });

  it("renders an avatar image when avatarUrl is present", () => {
    render(<AboutSection profile={makeProfile({ avatarUrl: "/images/me.png" })} links={[]} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/images/me.png");
  });

  it("renders provided links as external anchors (error/boundary: empty links renders none)", () => {
    render(<AboutSection profile={makeProfile()} links={[]} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);

    const link: Link = {
      id: "l1",
      label: "GitHub",
      url: "https://github.com/x",
      icon: null,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    render(<AboutSection profile={makeProfile()} links={[link]} />);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/x");
  });
});

function makeSkill(overrides: Partial<Skill>): Skill {
  return {
    id: overrides.name ?? "skill",
    name: "Java",
    category: "BACKEND",
    level: 3,
    icon: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Skill;
}

function emptyGrouped(): Record<SkillCategory, Skill[]> {
  return { BACKEND: [], FRONTEND: [], DEVOPS: [], TOOLS: [], OTHER: [] };
}

describe("SkillsSection", () => {
  it("renders category headings in the fixed BACKEND→OTHER order regardless of input key order (normal)", () => {
    // Populate OTHER (last in CATEGORY_ORDER) before BACKEND (first) in object-literal insertion
    // order, so a regression to `Object.entries(skillsByCategory)` iteration (source order) would
    // yield ["기타", "백엔드"] instead of the fixed order — this actually pins the ordering.
    const grouped: Record<SkillCategory, Skill[]> = {
      OTHER: [makeSkill({ name: "Notion", category: "OTHER" })],
      TOOLS: [],
      DEVOPS: [],
      FRONTEND: [makeSkill({ name: "React", category: "FRONTEND", level: 5 })],
      BACKEND: [makeSkill({ name: "Java", level: 4 })],
    };
    render(<SkillsSection skillsByCategory={grouped} />);

    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(["백엔드", "프론트엔드", "기타"]);
    expect(screen.getByLabelText("Java 숙련도 4/5")).toBeInTheDocument();
  });

  it("omits a category heading with zero skills (boundary)", () => {
    const grouped = emptyGrouped();
    grouped.BACKEND = [makeSkill({ name: "Java" })];
    render(<SkillsSection skillsByCategory={grouped} />);
    expect(screen.queryByRole("heading", { level: 3, name: "기타" })).toBeNull();
  });

  it("renders no category headings when every category is empty (error/boundary)", () => {
    render(<SkillsSection skillsByCategory={emptyGrouped()} />);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });
});

describe("SkillChip", () => {
  it("fills exactly `level` dots with the accent color, the rest with border (normal)", () => {
    const { container } = render(<SkillChip name="Java" level={3} />);
    const dots = container.querySelectorAll("span.bg-accent, span.bg-border");
    expect(dots).toHaveLength(5);
    expect(container.querySelectorAll("span.bg-accent")).toHaveLength(3);
    expect(container.querySelectorAll("span.bg-border")).toHaveLength(2);
  });

  it("leaves every dot as border color at level 0 (boundary)", () => {
    const { container } = render(<SkillChip name="Java" level={0} />);
    expect(container.querySelectorAll("span.bg-accent")).toHaveLength(0);
    expect(container.querySelectorAll("span.bg-border")).toHaveLength(5);
  });

  it("fills every dot as accent color at level 5 (boundary)", () => {
    const { container } = render(<SkillChip name="Java" level={5} />);
    expect(container.querySelectorAll("span.bg-accent")).toHaveLength(5);
    expect(container.querySelectorAll("span.bg-border")).toHaveLength(0);
  });
});
