import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getProjects: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/data", () => ({ getProjects: mocks.getProjects }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import ProjectsPage from "../page";
import ProjectEditPage from "../[id]/page";

const projects = [
  {
    id: "p1",
    title: "Side Project",
    summary: "s",
    description: "",
    techStack: [],
    repoUrl: null,
    liveUrl: null,
    imageUrl: null,
    startDate: null,
    endDate: null,
    featured: false,
    sortOrder: 0,
  },
  {
    id: "p2",
    title: "Flagship",
    summary: "s",
    description: "",
    techStack: [],
    repoUrl: null,
    liveUrl: null,
    imageUrl: null,
    startDate: null,
    endDate: null,
    featured: true,
    sortOrder: 1,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

describe("ProjectsPage", () => {
  it("lists the featured project before the non-featured one (normal)", async () => {
    mocks.getProjects.mockResolvedValue(projects);
    render(await ProjectsPage());
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Flagship");
    expect(rows[2]).toHaveTextContent("Side Project");
  });

  it("renders only the header row for no projects (boundary)", async () => {
    mocks.getProjects.mockResolvedValue([]);
    render(await ProjectsPage());
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });
});

describe("ProjectEditPage", () => {
  it("renders the project form pre-filled for a known id (normal)", async () => {
    mocks.getProjects.mockResolvedValue(projects);
    render(await ProjectEditPage({ params: Promise.resolve({ id: "p2" }) }));
    expect(screen.getByDisplayValue("Flagship")).toBeInTheDocument();
  });

  it("calls notFound for an unknown id (error)", async () => {
    mocks.getProjects.mockResolvedValue(projects);
    await expect(ProjectEditPage({ params: Promise.resolve({ id: "missing" }) })).rejects.toThrow("NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalled();
  });
});
