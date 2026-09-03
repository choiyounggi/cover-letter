import { describe, it, expect } from "vitest";
import type { Company, Experience, TimelineEvent } from "@/generated/prisma/client";

// timeline.ts also exports Prisma-backed queries and transitively imports the
// prisma singleton, which throws at import time without DATABASE_URL. This
// pure-function test never runs a query, so a placeholder is safe here.
process.env.DATABASE_URL ||= "postgresql://placeholder:placeholder@localhost:5432/placeholder";
const { mergeTimeline } = await import("../timeline");

const company: Company = {
  id: "co1",
  name: "ACME",
  logoUrl: null,
  url: null,
  description: null,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeEvent(overrides: Partial<TimelineEvent & { company: Company | null }> = {}) {
  return {
    id: "ev1",
    title: "Event",
    description: "",
    date: new Date("2020-03-01"),
    endDate: null,
    category: "MILESTONE" as const,
    icon: null,
    imageUrl: null,
    companyId: null,
    company: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeExperience(overrides: Partial<Experience & { company: Company }> = {}) {
  return {
    id: "ex1",
    companyId: company.id,
    company,
    role: "Engineer",
    startDate: new Date("2021-07-01"),
    endDate: null,
    summary: "",
    achievements: [],
    techStack: [],
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("mergeTimeline", () => {
  it("merges one event and one experience, sorted by date desc", () => {
    const result = mergeTimeline([makeEvent()], [makeExperience()]);
    expect(result.map((r) => r.kind)).toEqual(["experience", "event"]);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].category).toBe("CAREER");
  });

  it("returns [] when both inputs are empty", () => {
    expect(mergeTimeline([], [])).toEqual([]);
  });

  it("on a tie, orders by sortOrder ascending, not insertion order", () => {
    const tiedDate = new Date("2022-01-01");
    // event's sortOrder (1) is HIGHER than experience's (0), so a correct
    // tie-break must reorder them opposite to the [...events, ...experiences]
    // concatenation order below — a no-op tie-break would fail this.
    const event = makeEvent({ date: tiedDate, sortOrder: 1 });
    const experience = makeExperience({ startDate: tiedDate, sortOrder: 0 });

    const result = mergeTimeline([event], [experience]);
    expect(result.map((r) => r.kind)).toEqual(["experience", "event"]);
  });
});
