import { getSkillsByCategory } from "@/lib/data";
import { AdminPageHeader, EntityTable, ReorderList, DeleteButton } from "@/components/admin";
import { SkillForm, SKILL_CATEGORY_LABELS } from "@/components/admin/forms/SkillForm";
import { createSkillAction, deleteSkillAction, reorderSkillsAction } from "@/app/actions/admin/skills";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const grouped = await getSkillsByCategory();
  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader title="기술" description="카테고리별 기술 스택을 관리합니다." />
      {Object.entries(grouped).map(([category, skills]) => (
        <section key={category} className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold text-fg">
            {SKILL_CATEGORY_LABELS[category] ?? category}
          </h2>
          <EntityTable
            columns={[
              { key: "name", header: "이름" },
              { key: "level", header: "숙련도" },
            ]}
            rows={skills}
            renderActions={(skill) => (
              <div className="flex items-center gap-3">
                <a href={`/admin/skills/${skill.id}`} className="text-sm text-accent">
                  수정
                </a>
                <DeleteButton action={deleteSkillAction} id={skill.id} label={skill.name} />
              </div>
            )}
          />
          <ReorderList items={skills.map((s) => ({ id: s.id, label: s.name }))} action={reorderSkillsAction} />
        </section>
      ))}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-fg">새 기술 추가</h2>
        <SkillForm action={createSkillAction} />
      </div>
    </div>
  );
}
