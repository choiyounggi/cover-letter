import { describe, it, expect, vi, beforeEach } from "vitest";
import { GENERIC_ERROR } from "../../_helpers";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  createSkill: vi.fn(),
  updateSkill: vi.fn(),
  deleteSkill: vi.fn(),
  reorderSkills: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/data", () => ({
  createSkill: mocks.createSkill,
  updateSkill: mocks.updateSkill,
  deleteSkill: mocks.deleteSkill,
  reorderSkills: mocks.reorderSkills,
}));

import { createSkillAction, updateSkillAction, deleteSkillAction, reorderSkillsAction } from "../../skills";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

describe("createSkillAction", () => {
  it("creates a valid skill (normal)", async () => {
    mocks.createSkill.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("name", "TypeScript");
    fd.set("category", "FRONTEND");
    fd.set("level", "4");
    const result = await createSkillAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.createSkill).toHaveBeenCalled();
  });

  it("returns fieldErrors.level for an out-of-range level (error)", async () => {
    const fd = new FormData();
    fd.set("name", "TypeScript");
    fd.set("category", "FRONTEND");
    fd.set("level", "6");
    const result = await createSkillAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(result.fieldErrors?.level?.length).toBeGreaterThan(0);
    expect(mocks.createSkill).not.toHaveBeenCalled();
  });

  it("returns fieldErrors.category for an invalid category (error)", async () => {
    const fd = new FormData();
    fd.set("name", "TypeScript");
    fd.set("category", "NOT_A_CATEGORY");
    fd.set("level", "3");
    const result = await createSkillAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.category?.length).toBeGreaterThan(0);
    expect(mocks.createSkill).not.toHaveBeenCalled();
  });
});

describe("updateSkillAction", () => {
  it("updates the skill identified by the hidden id field (normal)", async () => {
    mocks.updateSkill.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    fd.set("name", "TypeScript");
    fd.set("category", "FRONTEND");
    fd.set("level", "4");
    const result = await updateSkillAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.updateSkill).toHaveBeenCalledWith("1", expect.objectContaining({ name: "TypeScript" }));
  });

  it("converts the hidden sortOrder field to a number so an edit preserves ordering (normal)", async () => {
    mocks.updateSkill.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    fd.set("name", "TypeScript");
    fd.set("category", "FRONTEND");
    fd.set("level", "4");
    fd.set("sortOrder", "3");
    const result = await updateSkillAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.updateSkill).toHaveBeenCalledWith("1", expect.objectContaining({ sortOrder: 3 }));
  });
});

describe("reorderSkillsAction", () => {
  it("parses the ids JSON field and calls reorderSkills (normal)", async () => {
    mocks.reorderSkills.mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("ids", JSON.stringify(["b", "a"]));
    const result = await reorderSkillsAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.reorderSkills).toHaveBeenCalledWith(["b", "a"]);
  });

  it("rejects an empty ids array without calling reorderSkills (boundary)", async () => {
    const fd = new FormData();
    fd.set("ids", JSON.stringify([]));
    const result = await reorderSkillsAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(mocks.reorderSkills).not.toHaveBeenCalled();
  });

  it("returns the generic error for malformed ids JSON instead of throwing (error)", async () => {
    const fd = new FormData();
    fd.set("ids", "not-json");
    const result = await reorderSkillsAction({ status: "idle" }, fd);
    expect(result).toEqual({ status: "error", message: GENERIC_ERROR });
    expect(mocks.reorderSkills).not.toHaveBeenCalled();
  });
});

describe("deleteSkillAction", () => {
  it("deletes and revalidates on success (normal)", async () => {
    mocks.deleteSkill.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    const result = await deleteSkillAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.deleteSkill).toHaveBeenCalledWith("1");
  });

  it("returns a generic error state when deleting an unknown id rejects (error)", async () => {
    mocks.deleteSkill.mockRejectedValue(new Error("not found"));
    const fd = new FormData();
    fd.set("id", "missing");
    const result = await deleteSkillAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(mocks.requireAdmin).toHaveBeenCalled();
  });
});
