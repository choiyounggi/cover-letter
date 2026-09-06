import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Company, Experience, Project } from "@/generated/prisma/client";
import { ExperienceSection } from "@/components/sections/experience/ExperienceSection";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection";

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));
vi.mock("@/components/motion", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

afterEach(() => cleanup());

function makeExperience(overrides: Partial<Experience> = {}): Experience {
  return {
    id: overrides.id ?? "x1",
    companyId: "c1",
    role: "백엔드 엔지니어",
    startDate: new Date("2021-01-01T00:00:00Z"),
    endDate: null,
    summary: "요약",
    achievements: ["성과 1", "성과 2"],
    techStack: ["Node.js"],
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCompany(overrides: Partial<Company> = {}, experiences: Experience[] = [makeExperience()]) {
  return {
    id: overrides.id ?? "c1",
    name: "ACME",
    logoUrl: null,
    url: null,
    description: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
    experiences,
  };
}

describe("ExperienceSection", () => {
  it("renders one article per company with its achievements (normal)", () => {
    render(
      <ExperienceSection
        companies={[
          makeCompany({ id: "c1", name: "ACME" }),
          makeCompany({ id: "c2", name: "Globex" }, [makeExperience({ id: "x2", companyId: "c2" })]),
        ]}
      />,
    );
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getAllByText("성과 1")).toHaveLength(2);
  });

  it("renders the company name as plain text, not a link, when url is absent (boundary)", () => {
    render(<ExperienceSection companies={[makeCompany({ url: null })]} />);
    expect(screen.queryByRole("link", { name: "ACME" })).toBeNull();
    expect(screen.getByText("ACME")).toBeInTheDocument();
  });

  it("renders the company name as a link when url is present", () => {
    render(<ExperienceSection companies={[makeCompany({ url: "https://acme.example" })]} />);
    expect(screen.getByRole("link", { name: "ACME" })).toHaveAttribute("href", "https://acme.example");
  });

  it("renders no articles for an empty company list (error/boundary)", () => {
    render(<ExperienceSection companies={[]} />);
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("wraps each company in a code-frame labelled with its name (normal)", () => {
    const { container } = render(<ExperienceSection companies={[makeCompany({ id: "c1", name: "ACME" })]} />);
    expect(container.querySelector('article.code-frame[data-file="ACME"]')).toBeInTheDocument();
  });
});

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: overrides.id ?? "p1",
    title: "포트폴리오",
    summary: "개인 포트폴리오 사이트",
    description: "",
    techStack: ["Next.js"],
    repoUrl: "https://github.com/x/repo",
    liveUrl: "https://example.com",
    imageUrl: null,
    startDate: null,
    endDate: null,
    featured: false,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("ProjectsSection", () => {
  it("places featured projects in the 2-col grid and the rest in the 3-col grid (normal: structural partition)", () => {
    const { container } = render(
      <ProjectsSection
        projects={[
          makeProject({ id: "p1", title: "Featured", featured: true }),
          makeProject({ id: "p2", title: "Regular", featured: false }),
        ]}
      />,
    );
    const featuredGrid = container.querySelector(".md\\:grid-cols-2");
    const restGrid = container.querySelector(".md\\:grid-cols-3");
    expect(featuredGrid).toContainElement(screen.getByText("Featured"));
    expect(restGrid).toContainElement(screen.getByText("Regular"));
    expect(featuredGrid).not.toContainElement(screen.getByText("Regular"));
    expect(restGrid).not.toContainElement(screen.getByText("Featured"));
  });

  it("renders external links with rel/target, and omits missing repo/live links (normal + boundary)", () => {
    render(
      <ProjectsSection
        projects={[makeProject({ id: "p1", repoUrl: "https://github.com/x/repo", liveUrl: null })]}
      />,
    );
    const repoLink = screen.getByRole("link", { name: "Repo" });
    expect(repoLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(repoLink).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("link", { name: "Live" })).toBeNull();
  });

  it("renders an image when imageUrl is present, a placeholder when it's missing (boundary)", () => {
    const { container, rerender } = render(
      <ProjectsSection projects={[makeProject({ id: "p1", imageUrl: "/images/p1.png" })]} />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("src", "/images/p1.png");
    expect(container.querySelector('[data-placeholder="true"]')).toBeNull();

    rerender(<ProjectsSection projects={[makeProject({ id: "p1", imageUrl: null })]} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector('[data-placeholder="true"]')).toBeInTheDocument();
  });

  it("shows an empty state when there are no projects (error/boundary)", () => {
    render(<ProjectsSection projects={[]} />);
    expect(screen.getByText("프로젝트를 준비 중이에요")).toBeInTheDocument();
  });

  it("wraps each project card in a code-frame labelled with its title (normal)", () => {
    const { container } = render(<ProjectsSection projects={[makeProject({ id: "p1", title: "Featured" })]} />);
    expect(container.querySelector('.code-frame[data-file="Featured"]')).toBeInTheDocument();
  });

  it("shows the grid-textured placeholder text when imageUrl is missing (boundary)", () => {
    const { container } = render(<ProjectsSection projects={[makeProject({ id: "p1", imageUrl: null })]} />);
    expect(container.querySelector('[data-placeholder="true"]')).toHaveTextContent("// no preview");
  });
});
