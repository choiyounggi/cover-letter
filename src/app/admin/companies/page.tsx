import { getCompaniesWithExperiences } from "@/lib/data";
import { AdminPageHeader, EntityTable, ReorderList, DeleteButton } from "@/components/admin";
import { CompanyForm } from "@/components/admin-timeline/CompanyForm";
import { createCompanyAction, deleteCompanyAction, reorderCompaniesAction } from "@/app/actions/admin/companies";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await getCompaniesWithExperiences();
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="회사" description="경력 정보를 등록할 회사를 관리합니다." />
      <EntityTable
        columns={[
          { key: "name", header: "회사명" },
          { key: "logoUrl", header: "로고 URL" },
          { key: "experienceCount", header: "경력 수" },
        ]}
        rows={companies.map((c) => ({ ...c, experienceCount: c.experiences.length }))}
        renderActions={(company) => (
          <div className="flex items-center gap-3">
            <a href={`/admin/companies/${company.id}`} className="text-sm text-accent">
              수정
            </a>
            <DeleteButton
              action={deleteCompanyAction}
              id={company.id}
              label={`회사 ${company.name} (경력 ${company.experiences.length}개 포함)`}
            />
          </div>
        )}
      />
      <ReorderList items={companies.map((c) => ({ id: c.id, label: c.name }))} action={reorderCompaniesAction} />
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-fg">새 회사 추가</h2>
        <CompanyForm action={createCompanyAction} />
      </div>
    </div>
  );
}
