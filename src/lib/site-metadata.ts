import type { Metadata } from "next";
import type { Profile } from "@/generated/prisma/client";

const FALLBACK_TITLE = "최영기 · Backend Engineer";
const FALLBACK_DESCRIPTION = "실전에 강한 백엔드 엔지니어 최영기의 포트폴리오";

export function buildMetadata(
  profile: Pick<Profile, "name" | "title" | "tagline"> | null,
  opts: { siteUrl?: string; ogImageUrl?: string } = {},
): Metadata {
  const title = profile ? `${profile.name} · ${profile.title}` : FALLBACK_TITLE;
  const description = profile
    ? profile.tagline?.trim()
      ? profile.tagline
      : profile.title
    : FALLBACK_DESCRIPTION;

  const metadata: Metadata = { title, description };

  if (opts.siteUrl) {
    try {
      metadata.metadataBase = new URL(opts.siteUrl);
    } catch {
      /* invalid siteUrl: leave metadataBase unset */
    }
  }

  if (opts.ogImageUrl) {
    metadata.openGraph = { title, description, images: [opts.ogImageUrl] };
  }

  return metadata;
}
