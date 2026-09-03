import { describe, expect, it, vi } from "vitest";

const { getLinksMock } = vi.hoisted(() => ({
  getLinksMock: vi.fn(async () => [{ id: "1", label: "GitHub", url: "https://github.com/x" }]),
}));
vi.mock("@/lib/data", () => ({ getLinks: getLinksMock }));

describe("getLinksCached", () => {
  it("wraps getLinks and forwards its resolved value (normal: D17 cache() wrapper)", async () => {
    const { getLinksCached } = await import("@/lib/cached-queries");
    const result = await getLinksCached();
    expect(result).toEqual([{ id: "1", label: "GitHub", url: "https://github.com/x" }]);
    expect(getLinksMock).toHaveBeenCalled();
  });

  it("forwards an empty-array result from getLinks unchanged (boundary: no links yet)", async () => {
    getLinksMock.mockResolvedValueOnce([]);
    const { getLinksCached } = await import("@/lib/cached-queries");
    await expect(getLinksCached()).resolves.toEqual([]);
  });

  it("propagates a rejection from the underlying getLinks (error path)", async () => {
    getLinksMock.mockRejectedValueOnce(new Error("db down"));
    const { getLinksCached } = await import("@/lib/cached-queries");
    await expect(getLinksCached()).rejects.toThrow("db down");
  });
});
