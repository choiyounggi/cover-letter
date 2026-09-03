import { notFound } from "next/navigation";
import { getSkills } from "@/lib/data";
import { AdminPageHeader } from "@/components/admin";
import { SkillForm } from "@/components/admin/forms/SkillForm";
import { updateSkillAction } from "@/app/actions/admin/skills";

export const dynamic = "force-dynamic";

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skills = await getSkills();
  const skill = skills.find((s) => s.id === id);
  if (!skill) notFound();
  return (
    <div>
      <AdminPageHeader title="기술 수정" />
      <SkillForm skill={skill} action={updateSkillAction} />
    </div>
  );
}
