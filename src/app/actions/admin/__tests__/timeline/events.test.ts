import { describe, it, expect, vi, beforeEach } from "vitest";
import { GENERIC_ERROR } from "../../_helpers";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  createTimelineEvent: vi.fn(),
  updateTimelineEvent: vi.fn(),
  deleteTimelineEvent: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/data", () => ({
  createTimelineEvent: mocks.createTimelineEvent,
  updateTimelineEvent: mocks.updateTimelineEvent,
  deleteTimelineEvent: mocks.deleteTimelineEvent,
}));

import { createTimelineEventAction, updateTimelineEventAction, deleteTimelineEventAction } from "../../timeline";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

function validFd(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set("title", "입대");
  fd.set("description", "");
  fd.set("date", "2015-03-01");
  fd.set("endDate", "");
  fd.set("category", "LIFE");
  fd.set("icon", "");
  fd.set("imageUrl", "");
  fd.set("companyId", "");
  fd.set("sortOrder", "0");
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

describe("createTimelineEventAction", () => {
  it("creates a valid LIFE-category event (normal)", async () => {
    mocks.createTimelineEvent.mockResolvedValue({ id: "1" });
    const result = await createTimelineEventAction({ status: "idle" }, validFd());
    expect(result.status).toBe("ok");
    expect(mocks.createTimelineEvent).toHaveBeenCalledWith(expect.objectContaining({ category: "LIFE" }));
  });

  it("returns fieldErrors.category for an invalid category (error)", async () => {
    const fd = validFd({ category: "NOT_A_CATEGORY" });
    const result = await createTimelineEventAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.category?.length).toBeGreaterThan(0);
    expect(mocks.createTimelineEvent).not.toHaveBeenCalled();
  });

  it("converts an empty companyId to null (boundary)", async () => {
    mocks.createTimelineEvent.mockResolvedValue({ id: "1" });
    await createTimelineEventAction({ status: "idle" }, validFd());
    expect(mocks.createTimelineEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: null }));
  });

  it("returns fieldErrors.date for an empty required date (boundary)", async () => {
    const result = await createTimelineEventAction({ status: "idle" }, validFd({ date: "" }));
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.date?.length).toBeGreaterThan(0);
    expect(mocks.createTimelineEvent).not.toHaveBeenCalled();
  });

  it("returns fieldErrors.sortOrder for a non-numeric sortOrder (error)", async () => {
    const fd = validFd({ sortOrder: "abc" });
    const result = await createTimelineEventAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.sortOrder?.length).toBeGreaterThan(0);
    expect(mocks.createTimelineEvent).not.toHaveBeenCalled();
  });

  it("returns the generic error when the data call rejects (error)", async () => {
    mocks.createTimelineEvent.mockRejectedValue(new Error("db down"));
    const result = await createTimelineEventAction({ status: "idle" }, validFd());
    expect(result).toEqual({ status: "error", message: GENERIC_ERROR });
  });
});

describe("updateTimelineEventAction", () => {
  it("updates the event identified by the hidden id field (normal)", async () => {
    mocks.updateTimelineEvent.mockResolvedValue({ id: "1" });
    const fd = validFd({ id: "1" });
    const result = await updateTimelineEventAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.updateTimelineEvent).toHaveBeenCalledWith("1", expect.objectContaining({ title: "입대" }));
  });
});

describe("deleteTimelineEventAction", () => {
  it("deletes and revalidates on success (normal)", async () => {
    mocks.deleteTimelineEvent.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    const result = await deleteTimelineEventAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.deleteTimelineEvent).toHaveBeenCalledWith("1");
  });

  it("returns a generic error state when the data call rejects (error)", async () => {
    mocks.deleteTimelineEvent.mockRejectedValue(new Error("not found"));
    const fd = new FormData();
    fd.set("id", "missing");
    const result = await deleteTimelineEventAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });
});
