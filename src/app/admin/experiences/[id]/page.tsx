import { notFound } from "next/navigation";
import { getCompaniesWithExperiences } from "@/lib/data";
import { AdminPageHeader } from "@/components/admin";
import { ExperienceForm } from "@/components/admin-timeline/ExperienceForm";
import { updateExperienceAction } from "@/app/actions/admin/experiences";

export const dynamic = "force-dynamic";

export default async function ExperienceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companies = await getCompaniesWithExperiences();
  const experience = companies.flatMap((c) => c.experiences).find((e) => e.id === id);
  if (!experience) notFound();
  return (
    <div>
      <AdminPageHeader title="경력 수정" />
      <ExperienceForm
        experience={experience}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
        action={updateExperienceAction}
      />
    </div>
  );
}
