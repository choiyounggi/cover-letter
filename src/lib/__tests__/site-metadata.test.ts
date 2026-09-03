import { describe, expect, it } from "vitest";
import { buildMetadata } from "@/lib/site-metadata";

describe("buildMetadata (pure)", () => {
  it("builds title/description from the profile (normal)", () => {
    const meta = buildMetadata({ name: "최영기", title: "Backend Engineer", tagline: "실전에 강한 엔지니어" });
    expect(meta.title).toBe("최영기 · Backend Engineer");
    expect(meta.description).toBe("실전에 강한 엔지니어");
  });

  it("falls back to a default title/description when profile is null (boundary)", () => {
    const meta = buildMetadata(null);
    expect(meta.title).toBe("최영기 · Backend Engineer");
    expect(meta.description).toBe("실전에 강한 백엔드 엔지니어 최영기의 포트폴리오");
  });

  it("falls back the description to the title when tagline is empty (error/negative: blank tagline)", () => {
    const meta = buildMetadata({ name: "최영기", title: "Backend Engineer", tagline: "" });
    expect(meta.description).toBe("Backend Engineer");
  });

  it("falls back the description to the title when tagline is null", () => {
    const meta = buildMetadata({ name: "최영기", title: "Backend Engineer", tagline: null });
    expect(meta.description).toBe("Backend Engineer");
  });

  it("falls back the description to the title when tagline is whitespace-only (boundary: .trim() branch)", () => {
    const meta = buildMetadata({ name: "최영기", title: "Backend Engineer", tagline: "   " });
    expect(meta.description).toBe("Backend Engineer");
  });

  it("omits openGraph when ogImageUrl is an empty string (boundary)", () => {
    const meta = buildMetadata(
      { name: "최영기", title: "Backend Engineer", tagline: "" },
      { siteUrl: "https://example.com", ogImageUrl: "" },
    );
    expect(meta.openGraph).toBeUndefined();
  });

  it("omits metadataBase when siteUrl fails new URL() parsing (error)", () => {
    const meta = buildMetadata(
      { name: "최영기", title: "Backend Engineer", tagline: "" },
      { siteUrl: "not-a-url", ogImageUrl: "https://example.com/og.png" },
    );
    expect(meta.metadataBase).toBeUndefined();
  });

  it("sets both metadataBase and openGraph when siteUrl and ogImageUrl are both valid (normal)", () => {
    const meta = buildMetadata(
      { name: "최영기", title: "Backend Engineer", tagline: "실전에 강한 엔지니어" },
      { siteUrl: "https://example.com", ogImageUrl: "https://example.com/og.png" },
    );
    expect(meta.metadataBase).toEqual(new URL("https://example.com"));
    expect(meta.openGraph).toEqual({
      title: "최영기 · Backend Engineer",
      description: "실전에 강한 엔지니어",
      images: ["https://example.com/og.png"],
    });
  });
});
