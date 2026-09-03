import { notFound } from "next/navigation";
import { getProjects } from "@/lib/data";
import { AdminPageHeader } from "@/components/admin";
import { ProjectForm } from "@/components/admin-timeline/ProjectForm";
import { updateProjectAction } from "@/app/actions/admin/projects";

export const dynamic = "force-dynamic";

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();
  return (
    <div>
      <AdminPageHeader title="프로젝트 수정" />
      <ProjectForm project={project} action={updateProjectAction} />
    </div>
  );
}
