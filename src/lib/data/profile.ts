import { prisma } from "@/lib/db/prisma";
import { profileInputSchema, type ProfileInput } from "@/lib/schemas/content";
import type { Profile } from "@/generated/prisma/client";

export async function getProfile(): Promise<Profile | null> {
  return prisma.profile.findUnique({ where: { id: "main" } });
}

export async function upsertProfile(input: ProfileInput): Promise<Profile> {
  const data = profileInputSchema.parse(input);
  return prisma.profile.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  });
}
