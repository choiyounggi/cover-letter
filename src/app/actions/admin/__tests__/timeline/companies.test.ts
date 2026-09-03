import { describe, it, expect, vi, beforeEach } from "vitest";
import { GENERIC_ERROR } from "../../_helpers";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  deleteCompany: vi.fn(),
  reorderCompanies: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/data", () => ({
  createCompany: mocks.createCompany,
  updateCompany: mocks.updateCompany,
  deleteCompany: mocks.deleteCompany,
  reorderCompanies: mocks.reorderCompanies,
}));

import {
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
  reorderCompaniesAction,
} from "../../companies";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
});

describe("createCompanyAction", () => {
  it("creates a valid company and revalidates the companies pages (normal)", async () => {
    mocks.createCompany.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("name", "Acme");
    fd.set("logoUrl", "");
    fd.set("url", "");
    fd.set("description", "");
    const result = await createCompanyAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.createCompany).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Acme", logoUrl: null, url: null }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/companies");
  });

  it("returns fieldErrors.name for an empty name (error)", async () => {
    const fd = new FormData();
    fd.set("name", "");
    const result = await createCompanyAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.name?.length).toBeGreaterThan(0);
    expect(mocks.createCompany).not.toHaveBeenCalled();
  });

  it("returns fieldErrors.logoUrl for an invalid logo url (error)", async () => {
    const fd = new FormData();
    fd.set("name", "Acme");
    fd.set("logoUrl", "nope");
    const result = await createCompanyAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.logoUrl?.length).toBeGreaterThan(0);
    expect(mocks.createCompany).not.toHaveBeenCalled();
  });

  it("returns the generic error when the data call rejects (error)", async () => {
    mocks.createCompany.mockRejectedValue(new Error("db down"));
    const fd = new FormData();
    fd.set("name", "Acme");
    const result = await createCompanyAction({ status: "idle" }, fd);
    expect(result).toEqual({ status: "error", message: GENERIC_ERROR });
  });
});

describe("updateCompanyAction", () => {
  it("updates the company identified by the hidden id field (normal)", async () => {
    mocks.updateCompany.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    fd.set("name", "Acme Inc");
    const result = await updateCompanyAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.updateCompany).toHaveBeenCalledWith("1", expect.objectContaining({ name: "Acme Inc" }));
  });

  it("converts the hidden sortOrder field to a number so an edit preserves ordering (normal)", async () => {
    mocks.updateCompany.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    fd.set("name", "Acme Inc");
    fd.set("sortOrder", "3");
    const result = await updateCompanyAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.updateCompany).toHaveBeenCalledWith("1", expect.objectContaining({ sortOrder: 3 }));
  });
});

describe("deleteCompanyAction", () => {
  it("deletes and revalidates on success (normal)", async () => {
    mocks.deleteCompany.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    const result = await deleteCompanyAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.deleteCompany).toHaveBeenCalledWith("1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/companies");
  });

  it("returns a generic error state when the cascade delete rejects (error)", async () => {
    mocks.deleteCompany.mockRejectedValue(new Error("fk violation"));
    const fd = new FormData();
    fd.set("id", "missing");
    const result = await deleteCompanyAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
  });
});

describe("reorderCompaniesAction", () => {
  it("parses the ids JSON field and calls reorderCompanies (normal)", async () => {
    mocks.reorderCompanies.mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("ids", JSON.stringify(["b", "a"]));
    const result = await reorderCompaniesAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.reorderCompanies).toHaveBeenCalledWith(["b", "a"]);
  });

  it("rejects an empty ids array without calling reorderCompanies (boundary)", async () => {
    const fd = new FormData();
    fd.set("ids", JSON.stringify([]));
    const result = await reorderCompaniesAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    expect(mocks.reorderCompanies).not.toHaveBeenCalled();
  });
});
