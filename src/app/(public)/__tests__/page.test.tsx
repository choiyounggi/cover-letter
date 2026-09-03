import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  getSkillsByCategory: vi.fn(),
  getTimeline: vi.fn(),
  getCompaniesWithExperiences: vi.fn(),
  getProjects: vi.fn(),
  getSetting: vi.fn(),
  getLinksCached: vi.fn(),
  buildMetadata: vi.fn(() => ({ title: "mock" })),
}));

vi.mock("@/lib/data", () => ({
  getProfile: mocks.getProfile,
  getSkillsByCategory: mocks.getSkillsByCategory,
  getTimeline: mocks.getTimeline,
  getCompaniesWithExperiences: mocks.getCompaniesWithExperiences,
  getProjects: mocks.getProjects,
  getSetting: mocks.getSetting,
}));
vi.mock("@/lib/cached-queries", () => ({ getLinksCached: mocks.getLinksCached }));
vi.mock("@/lib/site-metadata", () => ({ buildMetadata: mocks.buildMetadata }));

import { generateMetadata } from "../page";
import { SETTING_KEYS } from "@/lib/schemas/settings";

const profile = { id: "1", name: "최영기", title: "Backend Engineer", tagline: "" };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getProfile.mockResolvedValue(profile);
  mocks.getSetting.mockResolvedValue("");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("generateMetadata", () => {
  it("reads the ogImageUrl setting by the site.ogImageUrl key from SETTING_KEYS (normal)", async () => {
    mocks.getSetting.mockResolvedValue("https://example.com/og.png");
    await generateMetadata();
    expect(SETTING_KEYS[2]).toBe("site.ogImageUrl");
    expect(mocks.getSetting).toHaveBeenCalledWith(SETTING_KEYS[2]);
  });

  it("passes NEXT_PUBLIC_SITE_URL and the resolved ogImageUrl through to buildMetadata (normal)", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://younggi.dev");
    mocks.getSetting.mockResolvedValue("https://example.com/og.png");
    await generateMetadata();
    expect(mocks.buildMetadata).toHaveBeenCalledWith(profile, {
      siteUrl: "https://younggi.dev",
      ogImageUrl: "https://example.com/og.png",
    });
  });

  it("passes an empty ogImageUrl through to buildMetadata when the setting is unset (boundary)", async () => {
    mocks.getSetting.mockResolvedValue("");
    await generateMetadata();
    expect(mocks.buildMetadata).toHaveBeenCalledWith(profile, expect.objectContaining({ ogImageUrl: "" }));
  });

  it("still resolves metadata when getProfile returns null (error/boundary: no profile row)", async () => {
    mocks.getProfile.mockResolvedValue(null);
    const result = await generateMetadata();
    expect(mocks.buildMetadata).toHaveBeenCalledWith(null, expect.anything());
    expect(result).toEqual({ title: "mock" });
  });
});
