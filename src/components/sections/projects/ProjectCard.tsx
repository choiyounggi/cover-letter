import Image from "next/image";
import type { Project } from "@/generated/prisma/client";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="code-frame overflow-hidden" data-file={project.title}>
      {project.imageUrl ? (
        <div className="relative aspect-video w-full">
          <Image src={project.imageUrl} alt={project.title} fill className="object-cover" />
        </div>
      ) : (
        <div
          data-placeholder="true"
          className="grid-bg flex aspect-video w-full items-center justify-center font-mono text-xs text-syn-comment"
        >
          {"// no preview"}
        </div>
      )}
      <div className="p-6">
        <h3 className="font-display text-lg">{project.title}</h3>
        <p className="mt-2 text-sm text-fg-muted">{project.summary}</p>
        {project.techStack.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li key={tech} className="font-mono text-xs text-fg-muted before:content-['['] after:content-[']']">
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
              aria-label="Repo"
              className="font-mono text-sm text-fg-muted transition-colors hover:text-accent"
            >
              repo ↗
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live"
              className="font-mono text-sm text-fg-muted transition-colors hover:text-accent"
            >
              live ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
