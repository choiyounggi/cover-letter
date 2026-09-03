import { describe, it, expect, vi, beforeEach } from "vitest";
import { GENERIC_ERROR } from "../../_helpers";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  createExperience: vi.fn(),
  updateExperience: vi.fn(),
  deleteExperience: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/data", () => ({
  createExperience: mocks.createExperience,
  updateExperience: mocks.updateExperience,
  deleteExperience: mocks.deleteExperience,
}));

import { createExperienceAction, updateExperienceAction, deleteExperienceAction } from "../../experiences";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

function validFd(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set("companyId", "c1");
  fd.set("role", "Backend Engineer");
  fd.set("startDate", "2021-07-01");
  fd.set("endDate", "");
  fd.set("summary", "");
  fd.set("achievements", "a\nb");
  fd.set("techStack", "Java, Spring");
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

describe("createExperienceAction", () => {
  it("converts an empty endDate to null (normal)", async () => {
    mocks.createExperience.mockResolvedValue({ id: "1" });
    const result = await createExperienceAction({ status: "idle" }, validFd());
    expect(result.status).toBe("ok");
    expect(mocks.createExperience).toHaveBeenCalledWith(expect.objectContaining({ endDate: null }));
  });

  it("splits the achievements textarea into an array of lines (normal)", async () => {
    mocks.createExperience.mockResolvedValue({ id: "1" });
    await createExperienceAction({ status: "idle" }, validFd());
    expect(mocks.createExperience).toHaveBeenCalledWith(expect.objectContaining({ achievements: ["a", "b"] }));
  });

  it("splits the comma-separated techStack field (normal)", async () => {
    mocks.createExperience.mockResolvedValue({ id: "1" });
    await createExperienceAction({ status: "idle" }, validFd());
    expect(mocks.createExperience).toHaveBeenCalledWith(
      expect.objectContaining({ techStack: ["Java", "Spring"] }),
    );
  });

  it("returns fieldErrors.companyId when companyId is missing (error)", async () => {
    const fd = validFd();
    fd.delete("companyId");
    const result = await createExperienceAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.companyId?.length).toBeGreaterThan(0);
    expect(mocks.createExperience).not.toHaveBeenCalled();
  });

  it("returns fieldErrors.startDate for an empty required startDate (boundary)", async () => {
    const result = await createExperienceAction({ status: "idle" }, validFd({ startDate: "" }));
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.startDate?.length).toBeGreaterThan(0);
    expect(mocks.createExperience).not.toHaveBeenCalled();
  });

  it("revalidates the experiences list and the owning company's hub page (normal)", async () => {
    mocks.createExperience.mockResolvedValue({ id: "1" });
    await createExperienceAction({ status: "idle" }, validFd());
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/experiences");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/companies/c1");
  });

  it("returns the generic error when the data call rejects (error)", async () => {
    mocks.createExperience.mockRejectedValue(new Error("db down"));
    const result = await createExperienceAction({ status: "idle" }, validFd());
    expect(result).toEqual({ status: "error", message: GENERIC_ERROR });
  });
});

describe("updateExperienceAction", () => {
  it("updates the experience identified by the hidden id field (normal)", async () => {
    mocks.updateExperience.mockResolvedValue({ id: "1" });
    const fd = validFd({ id: "1" });
    const result = await updateExperienceAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.updateExperience).toHaveBeenCalledWith("1", expect.objectContaining({ role: "Backend Engineer" }));
  });

  it("converts the hidden sortOrder field to a number so an edit preserves ordering (normal)", async () => {
    mocks.updateExperience.mockResolvedValue({ id: "1" });
    const fd = validFd({ id: "1", sortOrder: "3" });
    const result = await updateExperienceAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.updateExperience).toHaveBeenCalledWith("1", expect.objectContaining({ sortOrder: 3 }));
  });
});

describe("deleteExperienceAction", () => {
  it("deletes by the hidden id field, then revalidates the owning company's hub page (normal)", async () => {
    mocks.deleteExperience.mockResolvedValue({ id: "1", companyId: "c1" });
    const fd = new FormData();
    fd.set("id", "1");
    const result = await deleteExperienceAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.deleteExperience).toHaveBeenCalledWith("1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/companies/c1");
  });

  it("returns a generic error state when the data call rejects (error)", async () => {
    mocks.deleteExperience.mockRejectedValue(new Error("not found"));
    const fd = new FormData();
    fd.set("id", "missing");
    const result = await deleteExperienceAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });
});
