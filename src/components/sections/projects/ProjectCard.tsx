import Image from "next/image";
import type { Project } from "@/generated/prisma/client";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg-elevated">
      {project.imageUrl ? (
        <div className="relative aspect-video w-full">
          <Image src={project.imageUrl} alt={project.title} fill className="object-cover" />
        </div>
      ) : (
        <div data-placeholder="true" className="aspect-video w-full bg-gradient-to-br from-accent/30 to-fg/10" />
      )}
      <div className="p-6">
        <h3 className="font-display text-lg">{project.title}</h3>
        <p className="mt-2 text-sm text-fg-muted">{project.summary}</p>
        {project.techStack.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li key={tech} className="rounded-full border border-border px-2 py-1 text-xs text-fg-muted">
                {tech}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex gap-4">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg"
            >
              Repo
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg"
            >
              Live
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
