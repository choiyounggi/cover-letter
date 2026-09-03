import { prisma } from "@/lib/db/prisma";
import { skillInputSchema, skillCategoryEnum, reorderSchema, type SkillInput } from "@/lib/schemas/content";
import type { Skill } from "@/generated/prisma/client";

export async function getSkills(): Promise<Skill[]> {
  return prisma.skill.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function getSkillsByCategory(): Promise<Record<string, Skill[]>> {
  const skills = await getSkills();
  const grouped: Record<string, Skill[]> = Object.fromEntries(skillCategoryEnum.options.map((c) => [c, []]));
  for (const skill of skills) grouped[skill.category].push(skill);
  return grouped;
}

export async function createSkill(input: SkillInput): Promise<Skill> {
  const data = skillInputSchema.parse(input);
  return prisma.skill.create({ data });
}

export async function updateSkill(id: string, input: SkillInput): Promise<Skill> {
  const data = skillInputSchema.parse(input);
  return prisma.skill.update({ where: { id }, data });
}

export async function deleteSkill(id: string): Promise<Skill> {
  return prisma.skill.delete({ where: { id } });
}

export async function reorderSkills(ids: string[]): Promise<void> {
  const parsed = reorderSchema.parse(ids);
  await prisma.$transaction(parsed.map((id, i) => prisma.skill.update({ where: { id }, data: { sortOrder: i } })));
}
