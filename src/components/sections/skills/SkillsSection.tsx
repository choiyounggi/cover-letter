import type { Skill, SkillCategory } from "@/generated/prisma/client";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SkillChip } from "./SkillChip";

const CATEGORY_ORDER: SkillCategory[] = ["BACKEND", "FRONTEND", "DEVOPS", "TOOLS", "OTHER"];
const CATEGORY_LABELS: Record<SkillCategory, string> = {
  BACKEND: "백엔드",
  FRONTEND: "프론트엔드",
  DEVOPS: "DevOps",
  TOOLS: "도구",
  OTHER: "기타",
};

export function SkillsSection({ skillsByCategory }: { skillsByCategory: Record<SkillCategory, Skill[]> }) {
  return (
    <section id="skills" className="scroll-mt-24 py-24" aria-labelledby="skills-heading">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading id="skills-heading" eyebrow="Skills" title="기술" />
        <div className="mt-12 space-y-10">
          {CATEGORY_ORDER.map((category) => {
            const skills = skillsByCategory[category] ?? [];
            if (skills.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="font-mono text-sm text-syn-comment">{`// ${CATEGORY_LABELS[category]}`}</h3>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <li key={skill.id}>
                      <SkillChip name={skill.name} level={skill.level} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
