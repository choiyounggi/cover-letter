import type { Project } from "@/generated/prisma/client";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <section id="projects" className="scroll-mt-24 py-32" aria-labelledby="projects-heading">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading id="projects-heading" eyebrow="Projects" title="프로젝트" />
        {projects.length === 0 ? (
          <p className="mt-12 text-fg-muted">프로젝트를 준비 중이에요</p>
        ) : (
          <div className="mt-12 space-y-12">
            {featured.length > 0 && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {featured.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {rest.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
