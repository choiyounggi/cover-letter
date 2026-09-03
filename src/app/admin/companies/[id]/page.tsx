import { notFound } from "next/navigation";
import { getCompaniesWithExperiences } from "@/lib/data";
import { AdminPageHeader, DeleteButton } from "@/components/admin";
import { CompanyForm } from "@/components/admin-timeline/CompanyForm";
import { ExperienceForm } from "@/components/admin-timeline/ExperienceForm";
import { toDateInput } from "@/components/admin-timeline/date-input";
import { updateCompanyAction } from "@/app/actions/admin/companies";
import { createExperienceAction, deleteExperienceAction } from "@/app/actions/admin/experiences";

export const dynamic = "force-dynamic";

export default async function CompanyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companies = await getCompaniesWithExperiences();
  const company = companies.find((c) => c.id === id);
  if (!company) notFound();
  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader title={`${company.name} 수정`} />
      <CompanyForm company={company} action={updateCompanyAction} />
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold text-fg">경력</h2>
        {company.experiences.length === 0 ? (
          <p className="text-sm text-fg-muted">등록된 경력이 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {company.experiences.map((experience) => (
              <li
                key={experience.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-3 py-2 text-sm"
              >
                <span>
                  {experience.role} ({toDateInput(experience.startDate)} ~ {toDateInput(experience.endDate) || "현재"})
                </span>
                <div className="flex items-center gap-3">
                  <a href={`/admin/experiences/${experience.id}`} className="text-sm text-accent">
                    수정
                  </a>
                  <DeleteButton action={deleteExperienceAction} id={experience.id} label={experience.role} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-fg">경력 추가</h2>
        <ExperienceForm fixedCompanyId={company.id} action={createExperienceAction} />
      </div>
    </div>
  );
}
