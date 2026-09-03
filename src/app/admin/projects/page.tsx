import { getProjects } from "@/lib/data";
import { AdminPageHeader, EntityTable, ReorderList, DeleteButton } from "@/components/admin";
import { ProjectForm } from "@/components/admin-timeline/ProjectForm";
import { createProjectAction, deleteProjectAction, reorderProjectsAction } from "@/app/actions/admin/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const sorted = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="프로젝트" description="추천 프로젝트를 상단에 노출합니다." />
      <EntityTable
        columns={[
          { key: "title", header: "제목" },
          { key: "featuredLabel", header: "추천" },
        ]}
        rows={sorted.map((p) => ({ ...p, featuredLabel: p.featured ? "예" : "아니오" }))}
        renderActions={(project) => (
          <div className="flex items-center gap-3">
            <a href={`/admin/projects/${project.id}`} className="text-sm text-accent">
              수정
            </a>
            <DeleteButton action={deleteProjectAction} id={project.id} label={project.title} />
          </div>
        )}
      />
      <ReorderList items={sorted.map((p) => ({ id: p.id, label: p.title }))} action={reorderProjectsAction} />
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-fg">새 프로젝트 추가</h2>
        <ProjectForm action={createProjectAction} />
      </div>
    </div>
  );
}
