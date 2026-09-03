import { getCompaniesWithExperiences } from "@/lib/data";
import { AdminPageHeader, EntityTable, DeleteButton } from "@/components/admin";
import { toDateInput } from "@/components/admin-timeline/date-input";
import { deleteExperienceAction } from "@/app/actions/admin/experiences";

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  const companies = await getCompaniesWithExperiences();
  const rows = companies
    .flatMap((company) =>
      company.experiences.map((experience) => ({
        id: experience.id,
        companyName: company.name,
        role: experience.role,
        range: `${toDateInput(experience.startDate)} ~ ${toDateInput(experience.endDate) || "현재"}`,
        startDate: experience.startDate,
      })),
    )
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="경력" description="회사별 경력을 한눈에 확인합니다." />
      <EntityTable
        columns={[
          { key: "companyName", header: "회사" },
          { key: "role", header: "직무" },
          { key: "range", header: "기간" },
        ]}
        rows={rows}
        renderActions={(row) => (
          <div className="flex items-center gap-3">
            <a href={`/admin/experiences/${row.id}`} className="text-sm text-accent">
              수정
            </a>
            <DeleteButton action={deleteExperienceAction} id={row.id} label={row.role} />
          </div>
        )}
      />
    </div>
  );
}
