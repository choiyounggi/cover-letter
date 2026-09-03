import { describe, it, expect, vi, beforeEach } from "vitest";
import { GENERIC_ERROR } from "../../_helpers";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  reorderProjects: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/data", () => ({
  createProject: mocks.createProject,
  updateProject: mocks.updateProject,
  deleteProject: mocks.deleteProject,
  reorderProjects: mocks.reorderProjects,
}));

import { createProjectAction, updateProjectAction, deleteProjectAction, reorderProjectsAction } from "../../projects";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

function validFd(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set("title", "Portfolio");
  fd.set("summary", "A portfolio site");
  fd.set("description", "");
  fd.set("techStack", "Next.js, Prisma");
  fd.set("repoUrl", "");
  fd.set("liveUrl", "");
  fd.set("imageUrl", "");
  fd.set("startDate", "");
  fd.set("endDate", "");
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

describe("createProjectAction", () => {
  it("creates a valid project (normal)", async () => {
    mocks.createProject.mockResolvedValue({ id: "1" });
    const result = await createProjectAction({ status: "idle" }, validFd());
    expect(result.status).toBe("ok");
    expect(mocks.createProject).toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/projects");
  });

  it("defaults featured to false when the checkbox is absent (boundary)", async () => {
    mocks.createProject.mockResolvedValue({ id: "1" });
    const fd = validFd();
    fd.delete("featured");
    await createProjectAction({ status: "idle" }, fd);
    expect(mocks.createProject).toHaveBeenCalledWith(expect.objectContaining({ featured: false }));
  });

  it("sets featured to true when the checkbox is checked (normal)", async () => {
    mocks.createProject.mockResolvedValue({ id: "1" });
    await createProjectAction({ status: "idle" }, validFd({ featured: "on" }));
    expect(mocks.createProject).toHaveBeenCalledWith(expect.objectContaining({ featured: true }));
  });

  it("returns fieldErrors.repoUrl for an invalid repo url (error)", async () => {
    const fd = validFd({ repoUrl: "not-a-url" });
    const result = await createProjectAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.repoUrl?.length).toBeGreaterThan(0);
    expect(mocks.createProject).not.toHaveBeenCalled();
  });

  it("converts empty startDate/endDate to null (normal)", async () => {
    mocks.createProject.mockResolvedValue({ id: "1" });
    await createProjectAction({ status: "idle" }, validFd());
    expect(mocks.createProject).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: null, endDate: null }),
    );
  });

  it("returns the generic error when the data call rejects (error)", async () => {
    mocks.createProject.mockRejectedValue(new Error("db down"));
    const result = await createProjectAction({ status: "idle" }, validFd());
    expect(result).toEqual({ status: "error", message: GENERIC_ERROR });
  });
});

describe("updateProjectAction", () => {
  it("updates the project identified by the hidden id field (normal)", async () => {
    mocks.updateProject.mockResolvedValue({ id: "1" });
    const fd = validFd({ id: "1" });
    const result = await updateProjectAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.updateProject).toHaveBeenCalledWith("1", expect.objectContaining({ title: "Portfolio" }));
  });
});

describe("deleteProjectAction", () => {
  it("deletes and revalidates on success (normal)", async () => {
    mocks.deleteProject.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    const result = await deleteProjectAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.deleteProject).toHaveBeenCalledWith("1");
  });

  it("returns a generic error state when the data call rejects (error)", async () => {
    mocks.deleteProject.mockRejectedValue(new Error("not found"));
    const fd = new FormData();
    fd.set("id", "missing");
    const result = await deleteProjectAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });
});

describe("reorderProjectsAction", () => {
  it("parses the ids JSON field and calls reorderProjects (normal)", async () => {
    mocks.reorderProjects.mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("ids", JSON.stringify(["b", "a"]));
    const result = await reorderProjectsAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.reorderProjects).toHaveBeenCalledWith(["b", "a"]);
  });

  it("rejects an empty ids array without calling reorderProjects (boundary)", async () => {
    const fd = new FormData();
    fd.set("ids", JSON.stringify([]));
    const result = await reorderProjectsAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(mocks.reorderProjects).not.toHaveBeenCalled();
  });
});
