import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getCompaniesWithExperiences: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/data", () => ({ getCompaniesWithExperiences: mocks.getCompaniesWithExperiences }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import ExperiencesPage from "../page";
import ExperienceEditPage from "../[id]/page";

const companies = [
  {
    id: "c1",
    name: "Acme",
    experiences: [
      {
        id: "e1",
        companyId: "c1",
        role: "Backend Engineer",
        startDate: new Date("2021-07-01T00:00:00Z"),
        endDate: null,
        summary: "",
        achievements: [],
        techStack: [],
        sortOrder: 0,
      },
    ],
  },
  {
    id: "c2",
    name: "Globex",
    experiences: [
      {
        id: "e2",
        companyId: "c2",
        role: "Frontend Engineer",
        startDate: new Date("2019-01-01T00:00:00Z"),
        endDate: new Date("2020-01-01T00:00:00Z"),
        summary: "",
        achievements: [],
        techStack: [],
        sortOrder: 0,
      },
    ],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

describe("ExperiencesPage", () => {
  it("flattens every company's experiences into one list ordered by startDate desc (normal)", async () => {
    mocks.getCompaniesWithExperiences.mockResolvedValue(companies);
    render(await ExperiencesPage());
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent("Backend Engineer");
    expect(rows[2]).toHaveTextContent("Frontend Engineer");
  });

  it("renders only the header row when there are no experiences (boundary)", async () => {
    mocks.getCompaniesWithExperiences.mockResolvedValue([{ id: "c1", name: "Acme", experiences: [] }]);
    render(await ExperiencesPage());
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });
});

describe("ExperienceEditPage", () => {
  it("renders the experience form pre-filled for a known id (normal)", async () => {
    mocks.getCompaniesWithExperiences.mockResolvedValue(companies);
    render(await ExperienceEditPage({ params: Promise.resolve({ id: "e2" }) }));
    expect(screen.getByDisplayValue("Frontend Engineer")).toBeInTheDocument();
  });

  it("calls notFound for an unknown id (error)", async () => {
    mocks.getCompaniesWithExperiences.mockResolvedValue(companies);
    await expect(ExperienceEditPage({ params: Promise.resolve({ id: "missing" }) })).rejects.toThrow("NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalled();
  });
});
