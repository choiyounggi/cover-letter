import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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

import CompaniesPage from "../page";
import CompanyEditPage from "../[id]/page";

const company = {
  id: "c1",
  name: "Acme",
  logoUrl: null,
  url: null,
  description: null,
  sortOrder: 0,
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
    {
      id: "e2",
      companyId: "c1",
      role: "Tech Lead",
      startDate: new Date("2022-01-01T00:00:00Z"),
      endDate: new Date("2023-01-01T00:00:00Z"),
      summary: "",
      achievements: [],
      techStack: [],
      sortOrder: 1,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

describe("CompaniesPage", () => {
  it("lists companies with an experience count (normal)", async () => {
    mocks.getCompaniesWithExperiences.mockResolvedValue([company]);
    render(await CompaniesPage());
    expect(screen.getAllByText("Acme").length).toBeGreaterThan(0);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders no rows for an empty company list (boundary)", async () => {
    mocks.getCompaniesWithExperiences.mockResolvedValue([]);
    render(await CompaniesPage());
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("warns about the cascade-deleted experience count before deleting a company (normal)", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    mocks.getCompaniesWithExperiences.mockResolvedValue([company]);
    render(await CompaniesPage());
    const deleteButton = screen.getByRole("button", { name: "삭제" });
    const form = deleteButton.closest("form");
    if (!form) throw new Error("expected a delete form");
    fireEvent.submit(form);
    expect(confirmSpy).toHaveBeenCalledWith("회사 Acme (경력 2개 포함)을(를) 삭제할까요?");
    confirmSpy.mockRestore();
  });
});

describe("CompanyEditPage", () => {
  it("renders the company name, its experiences, and the add-experience form (normal)", async () => {
    mocks.getCompaniesWithExperiences.mockResolvedValue([company]);
    render(await CompanyEditPage({ params: Promise.resolve({ id: "c1" }) }));
    expect(screen.getByText("Acme 수정")).toBeInTheDocument();
    expect(screen.getByText(/Backend Engineer/)).toBeInTheDocument();
    expect(screen.getByText(/Tech Lead/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "경력 추가" })).toBeInTheDocument();
  });

  it("calls notFound for an unknown id (error)", async () => {
    mocks.getCompaniesWithExperiences.mockResolvedValue([company]);
    await expect(CompanyEditPage({ params: Promise.resolve({ id: "missing" }) })).rejects.toThrow("NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalled();
  });
});
