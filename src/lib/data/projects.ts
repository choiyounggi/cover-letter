import { prisma } from "@/lib/db/prisma";
import { projectInputSchema, reorderSchema, type ProjectInput } from "@/lib/schemas/content";
import type { Project } from "@/generated/prisma/client";

export async function getProjects(): Promise<Project[]> {
  return prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: { sort: "desc", nulls: "last" } }],
  });
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return prisma.project.findMany({
    where: { featured: true },
    orderBy: [{ sortOrder: "asc" }, { startDate: { sort: "desc", nulls: "last" } }],
  });
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const data = projectInputSchema.parse(input);
  return prisma.project.create({ data });
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const data = projectInputSchema.parse(input);
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id: string): Promise<Project> {
  return prisma.project.delete({ where: { id } });
}

export async function reorderProjects(ids: string[]): Promise<void> {
  const parsed = reorderSchema.parse(ids);
  await prisma.$transaction(
    parsed.map((id, i) => prisma.project.update({ where: { id }, data: { sortOrder: i } }))
  );
}
