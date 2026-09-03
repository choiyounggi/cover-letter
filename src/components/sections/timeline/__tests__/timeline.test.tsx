import { describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import type { TimelineItem } from "@/lib/data";
import { groupByYear, formatRange } from "@/components/sections/timeline/timeline-utils";

vi.mock("@/components/motion", () => ({
  Reveal: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));
vi.mock("@/hooks", () => ({ useGsap: vi.fn() }));
vi.mock("@/lib/gsap", () => ({ gsap: { fromTo: vi.fn() } }));
vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

afterEach(() => cleanup());

function eventItem(overrides: Partial<Extract<TimelineItem, { kind: "event" }>> = {}): TimelineItem {
  return {
    kind: "event",
    id: overrides.id ?? "e1",
    title: "졸업",
    description: "학교를 졸업했어요",
    date: new Date("2020-02-01T00:00:00Z"),
    endDate: null,
    category: "EDUCATION",
    icon: null,
    imageUrl: null,
    company: null,
    ...overrides,
  };
}

function experienceItem(overrides: Partial<Extract<TimelineItem, { kind: "experience" }>> = {}): TimelineItem {
  return {
    kind: "experience",
    id: overrides.id ?? "x1",
    title: "백엔드 엔지니어",
    description: "백엔드 개발",
    date: new Date("2021-07-01T00:00:00Z"),
    endDate: null,
    category: "CAREER",
    company: { name: "ACME", logoUrl: null, url: null },
    techStack: ["Node.js"],
    achievements: [],
    ...overrides,
  };
}

describe("groupByYear (pure)", () => {
  it("groups by year descending, items within a year sorted descending by date (normal)", () => {
    const items = [
      eventItem({ id: "a", date: new Date("2020-01-01T00:00:00Z") }),
      experienceItem({ id: "b", date: new Date("2021-06-01T00:00:00Z") }),
      eventItem({ id: "c", date: new Date("2021-01-01T00:00:00Z") }),
    ];
    const groups = groupByYear(items);
    expect(groups.map((g) => g.year)).toEqual([2021, 2020]);
    expect(groups[0].items.map((i) => i.id)).toEqual(["b", "c"]);
  });

  it("returns an empty array for no items (boundary)", () => {
    expect(groupByYear([])).toEqual([]);
  });

  it("puts three same-year items into a single group of 3 (boundary)", () => {
    const items = [
      eventItem({ id: "a", date: new Date("2022-01-01T00:00:00Z") }),
      eventItem({ id: "b", date: new Date("2022-05-01T00:00:00Z") }),
      eventItem({ id: "c", date: new Date("2022-09-01T00:00:00Z") }),
    ];
    const groups = groupByYear(items);
    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(3);
  });
});

describe("formatRange (pure)", () => {
  it("renders an open-ended range as '현재' (normal)", () => {
    expect(formatRange(new Date("2021-07-01T00:00:00Z"), null)).toBe("2021.07 – 현재");
  });

  it("collapses a same-year-month range into a single label (boundary)", () => {
    expect(formatRange(new Date("2022-04-01T00:00:00Z"), new Date("2022-04-28T00:00:00Z"))).toBe("2022.04");
  });

  it("renders distinct start/end months as a range (error/negative: different months)", () => {
    expect(formatRange(new Date("2020-01-01T00:00:00Z"), new Date("2020-03-01T00:00:00Z"))).toBe(
      "2020.01 – 2020.03",
    );
  });
});

describe("TimelineSection (RTL)", () => {
  it("renders the #timeline section id, category badge text, and company logo image", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { container } = render(
      <TimelineSection
        items={[experienceItem({ company: { name: "ACME", logoUrl: "/images/acme.png", url: null } })]}
      />,
    );
    expect(container.querySelector("#timeline")).toBeInTheDocument();
    expect(screen.getByText("경력")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ACME" })).toHaveAttribute("src", "/images/acme.png");
  });

  it("shows an empty state when there are no items (boundary)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    render(<TimelineSection items={[]} />);
    expect(screen.getByText("아직 기록이 없어요")).toBeInTheDocument();
  });

  it("alternates items to the left/right column by index parity within a year (D5 layout)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { container } = render(
      <TimelineSection
        items={[
          eventItem({ id: "a", date: new Date("2022-01-01T00:00:00Z") }),
          eventItem({ id: "b", date: new Date("2022-06-01T00:00:00Z") }),
        ]}
      />,
    );
    const rows = container.querySelectorAll("#timeline .space-y-8 > div");
    expect(rows).toHaveLength(2);
    expect(rows[0].className).toContain("md:mr-auto");
    expect(rows[1].className).toContain("md:ml-auto");
  });
});
