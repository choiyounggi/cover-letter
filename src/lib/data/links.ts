import { prisma } from "@/lib/db/prisma";
import { linkInputSchema, reorderSchema, type LinkInput } from "@/lib/schemas/content";
import type { Link } from "@/generated/prisma/client";

export async function getLinks(): Promise<Link[]> {
  return prisma.link.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function createLink(input: LinkInput): Promise<Link> {
  const data = linkInputSchema.parse(input);
  return prisma.link.create({ data });
}

export async function updateLink(id: string, input: LinkInput): Promise<Link> {
  const data = linkInputSchema.parse(input);
  return prisma.link.update({ where: { id }, data });
}

export async function deleteLink(id: string): Promise<Link> {
  return prisma.link.delete({ where: { id } });
}

export async function reorderLinks(ids: string[]): Promise<void> {
  const parsed = reorderSchema.parse(ids);
  await prisma.$transaction(parsed.map((id, i) => prisma.link.update({ where: { id }, data: { sortOrder: i } })));
}
