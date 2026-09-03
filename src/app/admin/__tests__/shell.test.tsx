import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  signOut: vi.fn(),
  getLinks: vi.fn(),
  getSkills: vi.fn(),
  getCompaniesWithExperiences: vi.fn(),
  getProjects: vi.fn(),
  getTimelineEvents: vi.fn(),
  listMessages: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/auth", () => ({ signOut: mocks.signOut }));
vi.mock("@/lib/data", () => ({
  getLinks: mocks.getLinks,
  getSkills: mocks.getSkills,
  getCompaniesWithExperiences: mocks.getCompaniesWithExperiences,
  getProjects: mocks.getProjects,
  getTimelineEvents: mocks.getTimelineEvents,
  listMessages: mocks.listMessages,
}));

import AdminLayout from "../layout";
import AdminDashboardPage from "../page";
import { NAV_ITEMS } from "@/components/admin/nav-items";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
  mocks.getLinks.mockResolvedValue([{ id: "1" }, { id: "2" }, { id: "3" }]);
  mocks.getSkills.mockResolvedValue([{ id: "1" }, { id: "2" }]);
  mocks.getCompaniesWithExperiences.mockResolvedValue([{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }]);
  mocks.getProjects.mockResolvedValue([{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }]);
  mocks.getTimelineEvents.mockResolvedValue([
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
  ]);
  mocks.listMessages.mockResolvedValue([
    { id: "1", readAt: null },
    { id: "2", readAt: new Date() },
  ]);
});

describe("NAV_ITEMS", () => {
  it("has 10 entries covering every admin route (normal)", () => {
    expect(NAV_ITEMS.length).toBe(10);
    expect(NAV_ITEMS.every((i) => i.href === "/admin" || i.href.startsWith("/admin/"))).toBe(true);
  });

  it("includes t6's own 6 routes plus t7's 4 routes, exactly once each (boundary)", () => {
    const hrefs = NAV_ITEMS.map((i) => i.href);
    const expected = [
      "/admin",
      "/admin/profile",
      "/admin/links",
      "/admin/skills",
      "/admin/companies",
      "/admin/experiences",
      "/admin/timeline",
      "/admin/projects",
      "/admin/messages",
      "/admin/settings",
    ];
    expect(new Set(hrefs)).toEqual(new Set(expected));
    expect(hrefs.length).toBe(new Set(hrefs).size);
  });
});

describe("AdminLayout", () => {
  it("shows the login, 10 nav links and a sign-out button (normal)", async () => {
    render(await AdminLayout({ children: <p>x</p> }));
    expect(screen.getByText("choiyounggi")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(10);
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
  });

  it("rejects when requireAdmin rejects (error)", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("REDIRECT"));
    await expect(AdminLayout({ children: <p>x</p> })).rejects.toThrow("REDIRECT");
  });
});

describe("AdminDashboardPage", () => {
  it("shows the unread message count from fixtures (normal)", async () => {
    render(await AdminDashboardPage());
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows zero unread when every message is read (boundary)", async () => {
    mocks.listMessages.mockResolvedValue([{ id: "1", readAt: new Date() }]);
    render(await AdminDashboardPage());
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
