import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getTimelineEvents: vi.fn(),
  getCompaniesWithExperiences: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/data", () => ({
  getTimelineEvents: mocks.getTimelineEvents,
  getCompaniesWithExperiences: mocks.getCompaniesWithExperiences,
}));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import TimelinePage from "../page";
import TimelineEventEditPage from "../[id]/page";

const events = [
  {
    id: "ev1",
    title: "입대",
    description: "",
    date: new Date("2015-03-01T00:00:00Z"),
    endDate: null,
    category: "LIFE",
    icon: null,
    imageUrl: null,
    companyId: null,
    sortOrder: 0,
  },
  {
    id: "ev2",
    title: "입사",
    description: "",
    date: new Date("2021-07-01T00:00:00Z"),
    endDate: null,
    category: "CAREER",
    icon: null,
    imageUrl: null,
    companyId: null,
    sortOrder: 0,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
  mocks.getCompaniesWithExperiences.mockResolvedValue([]);
});

describe("TimelinePage", () => {
  it("groups events under their years, most recent first, with Korean category badges (normal)", async () => {
    mocks.getTimelineEvents.mockResolvedValue(events);
    render(await TimelinePage());
    expect(screen.getByText("2021")).toBeInTheDocument();
    expect(screen.getByText("2015")).toBeInTheDocument();
    expect(screen.getAllByText("경력").length).toBeGreaterThan(0);
    expect(screen.getAllByText("인생").length).toBeGreaterThan(0);
  });

  it("shows an empty-state message with no events (boundary)", async () => {
    mocks.getTimelineEvents.mockResolvedValue([]);
    render(await TimelinePage());
    expect(screen.getByText("등록된 타임라인 이벤트가 없어요.")).toBeInTheDocument();
  });
});

describe("TimelineEventEditPage", () => {
  it("renders the event form pre-filled for a known id (normal)", async () => {
    mocks.getTimelineEvents.mockResolvedValue(events);
    render(await TimelineEventEditPage({ params: Promise.resolve({ id: "ev2" }) }));
    expect(screen.getByDisplayValue("입사")).toBeInTheDocument();
  });

  it("calls notFound for an unknown id (error)", async () => {
    mocks.getTimelineEvents.mockResolvedValue(events);
    await expect(TimelineEventEditPage({ params: Promise.resolve({ id: "missing" }) })).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(mocks.notFound).toHaveBeenCalled();
  });
});
