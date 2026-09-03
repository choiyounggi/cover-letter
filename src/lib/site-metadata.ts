import type { Metadata } from "next";
import type { Profile } from "@/generated/prisma/client";

const FALLBACK_TITLE = "최영기 · Backend Engineer";
const FALLBACK_DESCRIPTION = "실전에 강한 백엔드 엔지니어 최영기의 포트폴리오";

export function buildMetadata(profile: Pick<Profile, "name" | "title" | "tagline"> | null): Metadata {
  if (!profile) {
    return { title: FALLBACK_TITLE, description: FALLBACK_DESCRIPTION };
  }
  return {
    title: `${profile.name} · ${profile.title}`,
    description: profile.tagline?.trim() ? profile.tagline : profile.title,
  };
}
