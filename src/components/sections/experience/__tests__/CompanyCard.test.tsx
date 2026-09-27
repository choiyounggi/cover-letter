import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { Company, Experience } from "@/generated/prisma/client";

const { toSpy } = vi.hoisted(() => ({ toSpy: vi.fn() }));

vi.mock("@/lib/gsap", () => {
  const context = vi.fn((cb: (self: unknown) => void) => {
    cb({});
    return { revert: vi.fn() };
  });
  return { gsap: { context, to: toSpy }, ScrollTrigger: {} };
});

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

vi.mock("@/components/motion", () => ({
  StaggerGroup: ({
    as: Tag = "div",
    children,
    className,
  }: {
    as?: "div" | "ul" | "li" | "span" | "ol";
    children?: React.ReactNode;
    className?: string;
  }) => <Tag className={className}>{children}</Tag>,
  StaggerItem: ({
    as: Tag = "div",
    children,
    className,
  }: {
    as?: "div" | "ul" | "li" | "span" | "ol";
    children?: React.ReactNode;
    className?: string;
  }) => <Tag className={className}>{children}</Tag>,
}));

vi.mock("@/components/sections/experience/DurationMeter", () => ({
  DurationMeter: () => <div data-testid="duration-meter-stub" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeExperience(overrides: Partial<Experience & { months: number }> = {}): Experience & { months: number } {
  return {
    id: overrides.id ?? "x1",
    companyId: "c1",
    role: "백엔드 엔지니어",
    startDate: new Date("2021-01-01T00:00:00Z"),
    endDate: null,
    summary: "요약",
    achievements: ["성과 1"],
    techStack: ["Node.js"],
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    months: 6,
    ...overrides,
  };
}

function makeCompany(overrides: Partial<Company> = {}): Company {
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
  };
}

describe("CompanyCard", () => {
  it("creates one header-typing gsap.to tween per card, targeting the article with once:true (normal)", async () => {
    const { CompanyCard } = await import("@/components/sections/experience/CompanyCard");
    const { container } = render(
      <CompanyCard company={makeCompany()} experiences={[makeExperience()]} maxMonths={6} />,
    );

    expect(toSpy).toHaveBeenCalledTimes(1);
    const [target, vars] = toSpy.mock.calls[0];
    expect(target).toEqual({ chars: 0 });
    expect(vars.scrollTrigger).toMatchObject({ once: true, trigger: container.querySelector("article") });
  });

  it("completes the header-typing tween back to the full company name (error/boundary: manual tween completion)", async () => {
    const { CompanyCard } = await import("@/components/sections/experience/CompanyCard");
    const { container } = render(
      <CompanyCard company={makeCompany({ name: "ACME" })} experiences={[makeExperience()]} maxMonths={6} />,
    );

    const [target, vars] = toSpy.mock.calls[0];
    target.chars = "ACME".length;
    vars.onUpdate();

    expect(container.querySelector("article")).toHaveAttribute("data-file", "ACME");
  });

  it("creates one gsap.to call per rendered card — two CompanyCards yield two calls (boundary: card-count matches trigger-count)", async () => {
    const { CompanyCard } = await import("@/components/sections/experience/CompanyCard");
    render(
      <>
        <CompanyCard company={makeCompany({ id: "c1", name: "ACME" })} experiences={[makeExperience()]} maxMonths={6} />
        <CompanyCard
          company={makeCompany({ id: "c2", name: "Globex" })}
          experiences={[makeExperience({ id: "x2" })]}
          maxMonths={6}
        />
      </>,
    );

    expect(toSpy).toHaveBeenCalledTimes(2);
  });
});
