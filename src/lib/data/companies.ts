import { prisma } from "@/lib/db/prisma";
import {
  companyInputSchema,
  experienceInputSchema,
  reorderSchema,
  type CompanyInput,
  type ExperienceInput,
} from "@/lib/schemas/content";
import type { Company, Experience } from "@/generated/prisma/client";

export async function getCompaniesWithExperiences(): Promise<(Company & { experiences: Experience[] })[]> {
  return prisma.company.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { experiences: { orderBy: { startDate: "desc" } } },
  });
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  const data = companyInputSchema.parse(input);
  return prisma.company.create({ data });
}

export async function updateCompany(id: string, input: CompanyInput): Promise<Company> {
  const data = companyInputSchema.parse(input);
  return prisma.company.update({ where: { id }, data });
}

export async function deleteCompany(id: string): Promise<Company> {
  return prisma.company.delete({ where: { id } });
}

export async function reorderCompanies(ids: string[]): Promise<void> {
  const parsed = reorderSchema.parse(ids);
  await prisma.$transaction(
    parsed.map((id, i) => prisma.company.update({ where: { id }, data: { sortOrder: i } }))
  );
}

export async function createExperience(input: ExperienceInput): Promise<Experience> {
  const data = experienceInputSchema.parse(input);
  return prisma.experience.create({ data });
}

export async function updateExperience(id: string, input: ExperienceInput): Promise<Experience> {
  const data = experienceInputSchema.parse(input);
  return prisma.experience.update({ where: { id }, data });
}

export async function deleteExperience(id: string): Promise<Experience> {
  return prisma.experience.delete({ where: { id } });
}
