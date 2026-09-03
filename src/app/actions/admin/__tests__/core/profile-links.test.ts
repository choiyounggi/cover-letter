import { describe, it, expect, vi, beforeEach } from "vitest";
import { GENERIC_ERROR } from "../../_helpers";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  upsertProfile: vi.fn(),
  getLinks: vi.fn(),
  createLink: vi.fn(),
  updateLink: vi.fn(),
  deleteLink: vi.fn(),
  reorderLinks: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/data", () => ({
  upsertProfile: mocks.upsertProfile,
  getLinks: mocks.getLinks,
  createLink: mocks.createLink,
  updateLink: mocks.updateLink,
  deleteLink: mocks.deleteLink,
  reorderLinks: mocks.reorderLinks,
}));

import { saveProfile } from "../../profile";
import { createLinkAction, updateLinkAction, deleteLinkAction, reorderLinksAction } from "../../links";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

describe("saveProfile", () => {
  it("saves a valid profile and revalidates (normal)", async () => {
    mocks.upsertProfile.mockResolvedValue({ id: "main" });
    const fd = new FormData();
    fd.set("name", "최영기");
    fd.set("title", "Full-stack Developer");
    const result = await saveProfile({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.upsertProfile).toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/profile");
  });

  it("returns fieldErrors.name for an empty name and does not call upsertProfile (error)", async () => {
    const fd = new FormData();
    fd.set("name", "");
    fd.set("title", "Full-stack Developer");
    const result = await saveProfile({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(result.fieldErrors?.name?.length).toBeGreaterThan(0);
    expect(mocks.upsertProfile).not.toHaveBeenCalled();
  });
});

describe("createLinkAction", () => {
  it("returns fieldErrors.url for an invalid url (error)", async () => {
    const fd = new FormData();
    fd.set("label", "GitHub");
    fd.set("url", "not-a-url");
    const result = await createLinkAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(result.fieldErrors?.url?.length).toBeGreaterThan(0);
    expect(mocks.createLink).not.toHaveBeenCalled();
  });

  it("creates a valid link (normal)", async () => {
    mocks.createLink.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("label", "GitHub");
    fd.set("url", "https://github.com/choiyounggi");
    const result = await createLinkAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.createLink).toHaveBeenCalled();
  });
});

describe("updateLinkAction", () => {
  it("updates the link identified by the hidden id field (normal)", async () => {
    mocks.updateLink.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    fd.set("label", "GitHub");
    fd.set("url", "https://github.com/choiyounggi");
    const result = await updateLinkAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.updateLink).toHaveBeenCalledWith("1", expect.objectContaining({ label: "GitHub" }));
  });

  it("passes an empty id when the hidden id field is missing, so the wrong record would be targeted (boundary)", async () => {
    mocks.updateLink.mockResolvedValue({ id: "" });
    const fd = new FormData();
    fd.set("label", "GitHub");
    fd.set("url", "https://github.com/choiyounggi");
    const result = await updateLinkAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.updateLink).toHaveBeenCalledWith("", expect.objectContaining({ label: "GitHub" }));
  });
});

describe("deleteLinkAction", () => {
  it("returns a generic error state when the data call rejects (error)", async () => {
    mocks.deleteLink.mockRejectedValue(new Error("not found"));
    const fd = new FormData();
    fd.set("id", "missing");
    const result = await deleteLinkAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(mocks.requireAdmin).toHaveBeenCalled();
  });

  it("deletes and revalidates on success (normal)", async () => {
    mocks.deleteLink.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    const result = await deleteLinkAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.deleteLink).toHaveBeenCalledWith("1");
  });
});

describe("reorderLinksAction", () => {
  it("parses the ids JSON field and calls reorderLinks (normal)", async () => {
    mocks.reorderLinks.mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("ids", JSON.stringify(["b", "a"]));
    const result = await reorderLinksAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.reorderLinks).toHaveBeenCalledWith(["b", "a"]);
  });

  it("rejects an empty ids array without calling reorderLinks (boundary)", async () => {
    const fd = new FormData();
    fd.set("ids", JSON.stringify([]));
    const result = await reorderLinksAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(mocks.reorderLinks).not.toHaveBeenCalled();
  });

  it("returns the generic error for malformed ids JSON instead of throwing (error)", async () => {
    const fd = new FormData();
    fd.set("ids", "not-json");
    const result = await reorderLinksAction({ status: "idle" }, fd);
    expect(result).toEqual({ status: "error", message: GENERIC_ERROR });
    expect(mocks.reorderLinks).not.toHaveBeenCalled();
  });
});
