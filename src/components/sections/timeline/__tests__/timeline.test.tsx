import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import type { TimelineItem } from "@/lib/data";
import { groupByYear, formatRange } from "@/components/sections/timeline/timeline-utils";

vi.mock("@/components/motion", () => ({
  Reveal: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  StaggerGroup: ({
    as: Tag = "div",
    from,
    className,
    children,
  }: {
    as?: "div" | "ul" | "li" | "span" | "ol";
    from?: string;
    className?: string;
    children?: React.ReactNode;
  }) => createElement(Tag, { className, "data-from": from }, children),
  StaggerItem: ({
    as: Tag = "div",
    className,
    children,
  }: {
    as?: "div" | "ul" | "li" | "span" | "ol";
    className?: string;
    children?: React.ReactNode;
  }) => createElement(Tag, { className }, children),
}));
vi.mock("@/hooks", async () => {
  const { useEffect } = await import("react");
  return {
    useGsap: (
      cb: (ctx: { selector: (q: string) => Element[] }) => void,
      _deps?: unknown[],
      scope?: { current: HTMLElement | null },
    ) => {
      useEffect(() => {
        const root: ParentNode = scope?.current ?? document;
        cb({ selector: (q: string) => Array.from(root.querySelectorAll(q)) });
      });
    },
  };
});

vi.mock("@/lib/gsap", () => ({
  gsap: { fromTo: vi.fn() },
  ScrollTrigger: { create: vi.fn() },
}));
vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

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

  it("renders every item on a single rail column with no L/R alternation, one glyph each (D5 layout)", async () => {
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
    for (const row of rows) {
      expect(row.className).toContain("relative");
      expect(row.className).not.toContain("md:ml-auto");
      expect(row.className).not.toContain("md:mr-auto");
      const glyphs = Array.from(row.querySelectorAll("span[aria-hidden]")).filter(
        (s) => s.textContent === "*",
      );
      expect(glyphs).toHaveLength(1);
    }
  });

  it("renders the sticky year label in mono comment form (boundary)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    render(<TimelineSection items={[eventItem({ date: new Date("2024-03-01T00:00:00Z") })]} />);
    expect(screen.getByText("// 2024")).toBeInTheDocument();
  });
});

describe("TimelineItemCard tech chips", () => {
  it("renders tech chips as a StaggerGroup ul with from=scale wrapping StaggerItem li's (normal)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { container } = render(
      <TimelineSection items={[experienceItem({ techStack: ["Node.js", "Go"] })]} />,
    );
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    expect(ul!.querySelectorAll("li")).toHaveLength(2);
    expect(ul!.getAttribute("data-from")).toBe("scale");
  });

  it("renders no ul when techStack is empty (boundary)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { container } = render(<TimelineSection items={[experienceItem({ techStack: [] })]} />);
    expect(container.querySelector("ul")).toBeNull();
  });
});

describe("TimelineSection card slide-in", () => {
  it("wraps each card in a data-timeline-card native div containing a StaggerGroup from=left (normal)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { container } = render(
      <TimelineSection
        items={[
          eventItem({ id: "a", date: new Date("2022-01-01T00:00:00Z") }),
          eventItem({ id: "b", date: new Date("2022-06-01T00:00:00Z") }),
        ]}
      />,
    );
    const cards = container.querySelectorAll("#timeline [data-timeline-card]");
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      const staggerGroup = card.querySelector("[data-from]");
      expect(staggerGroup).not.toBeNull();
      expect(staggerGroup!.getAttribute("data-from")).toBe("left");
    }
  });

  it("renders the empty state with no card wrappers when items is empty (boundary)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { container } = render(<TimelineSection items={[]} />);
    expect(screen.getByText("아직 기록이 없어요")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-timeline-card]")).toHaveLength(0);
  });
});

describe("TimelineSection marker point-lighting", () => {
  it("creates one marker ScrollTrigger per card with start=top 70% and trigger=that card (normal)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { ScrollTrigger } = await import("@/lib/gsap");
    const { container } = render(
      <TimelineSection
        items={[
          eventItem({ id: "a", date: new Date("2022-01-01T00:00:00Z") }),
          eventItem({ id: "b", date: new Date("2022-06-01T00:00:00Z") }),
          experienceItem({ id: "c", date: new Date("2022-09-01T00:00:00Z") }),
        ]}
      />,
    );
    const create = ScrollTrigger.create as ReturnType<typeof vi.fn>;
    const markerCalls = create.mock.calls.filter((c) => !("end" in c[0]));
    expect(markerCalls).toHaveLength(3);
    const cardEls = Array.from(container.querySelectorAll("[data-timeline-card]"));
    for (const call of markerCalls) {
      expect(call[0].start).toBe("top 70%");
      expect(cardEls).toContain(call[0].trigger);
    }
  });

  it("lights the marker on onEnter and dims it back on onLeaveBack (normal: callback behavior)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { ScrollTrigger } = await import("@/lib/gsap");
    render(<TimelineSection items={[eventItem()]} />);
    const create = ScrollTrigger.create as ReturnType<typeof vi.fn>;
    const markerCall = create.mock.calls.find((c) => !("end" in c[0]))!;
    const marker = (markerCall[0].trigger as Element).querySelector("[data-timeline-marker]")!;
    expect(marker.className).toContain("text-fg-muted");

    act(() => markerCall[0].onEnter?.({} as never));
    expect(marker.className).toContain("text-accent");
    expect(marker.className).toContain("scale-125");
    expect(marker.className).not.toContain("text-fg-muted");

    act(() => markerCall[0].onLeaveBack?.({} as never));
    expect(marker.className).toContain("text-fg-muted");
    expect(marker.className).not.toContain("text-accent");
    expect(marker.className).not.toContain("scale-125");
  });

  it("creates no ScrollTrigger when items is empty (boundary)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { ScrollTrigger } = await import("@/lib/gsap");
    render(<TimelineSection items={[]} />);
    expect((ScrollTrigger.create as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(0);
  });

  it("lights the marker immediately with zero ScrollTrigger.create calls under prefers-reduced-motion (boundary)", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { ScrollTrigger } = await import("@/lib/gsap");
    const { container } = render(<TimelineSection items={[eventItem()]} />);
    expect((ScrollTrigger.create as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(0);
    const marker = container.querySelector("[data-timeline-marker]")!;
    expect(marker.className).toContain("text-accent");
    expect(marker.className).toContain("scale-125");
    expect(marker.className).not.toContain("text-fg-muted");
  });
});

describe("TimelineSection year-header emphasis", () => {
  it("creates one year-header ScrollTrigger per year group with start/end matching the line scrub (normal)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { ScrollTrigger } = await import("@/lib/gsap");
    const { container } = render(
      <TimelineSection
        items={[
          eventItem({ id: "a", date: new Date("2022-01-01T00:00:00Z") }),
          eventItem({ id: "b", date: new Date("2024-01-01T00:00:00Z") }),
        ]}
      />,
    );
    const create = ScrollTrigger.create as ReturnType<typeof vi.fn>;
    const yearHeaderCalls = create.mock.calls.filter((c) => "end" in c[0]);
    expect(yearHeaderCalls).toHaveLength(2);
    const groupEls = Array.from(container.querySelectorAll("[data-timeline-year-group]"));
    for (const call of yearHeaderCalls) {
      expect(call[0].start).toBe("top 70%");
      expect(call[0].end).toBe("bottom 70%");
      expect(groupEls).toContain(call[0].trigger);
    }
  });

  it("swaps the year header to accent on onEnter/onEnterBack and back to muted on onLeave/onLeaveBack (normal: callback behavior)", async () => {
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { ScrollTrigger } = await import("@/lib/gsap");
    render(<TimelineSection items={[eventItem({ date: new Date("2022-01-01T00:00:00Z") })]} />);
    const create = ScrollTrigger.create as ReturnType<typeof vi.fn>;
    const yearHeaderCall = create.mock.calls.find((c) => "end" in c[0])!;
    const label = (yearHeaderCall[0].trigger as Element).querySelector("[data-timeline-year-label]")!;
    expect(label.className).toContain("text-syn-comment");

    act(() => yearHeaderCall[0].onEnter?.({} as never));
    expect(label.className).toContain("text-accent");
    expect(label.className).not.toContain("text-syn-comment");

    act(() => yearHeaderCall[0].onLeave?.({} as never));
    expect(label.className).toContain("text-syn-comment");
    expect(label.className).not.toContain("text-accent");

    act(() => yearHeaderCall[0].onEnterBack?.({} as never));
    expect(label.className).toContain("text-accent");
    expect(label.className).not.toContain("text-syn-comment");

    act(() => yearHeaderCall[0].onLeaveBack?.({} as never));
    expect(label.className).toContain("text-syn-comment");
    expect(label.className).not.toContain("text-accent");
  });

  it("lights every year header immediately with zero year-header ScrollTrigger.create calls under prefers-reduced-motion (boundary)", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
    const { TimelineSection } = await import("@/components/sections/timeline/TimelineSection");
    const { ScrollTrigger } = await import("@/lib/gsap");
    const { container } = render(
      <TimelineSection
        items={[
          eventItem({ id: "a", date: new Date("2022-01-01T00:00:00Z") }),
          eventItem({ id: "b", date: new Date("2024-01-01T00:00:00Z") }),
        ]}
      />,
    );
    const create = ScrollTrigger.create as ReturnType<typeof vi.fn>;
    const yearHeaderCalls = create.mock.calls.filter((c) => "end" in c[0]);
    expect(yearHeaderCalls).toHaveLength(0);
    const labels = container.querySelectorAll("[data-timeline-year-label]");
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.className).toContain("text-accent");
      expect(label.className).not.toContain("text-syn-comment");
    }
  });
});
