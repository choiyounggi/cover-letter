import Image from "next/image";
import type { Company, Experience } from "@/generated/prisma/client";
import { formatRange } from "@/components/sections/timeline/timeline-utils";
import { SectionHeading } from "@/components/layout/SectionHeading";

export function ExperienceSection({ companies }: { companies: (Company & { experiences: Experience[] })[] }) {
  return (
    <section id="experience" className="scroll-mt-24 py-32" aria-labelledby="experience-heading">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading id="experience-heading" eyebrow="Experience" title="경력" />
        <div className="mt-12 space-y-12">
          {companies.map((company) => (
            <article
              key={company.id}
              className="rounded-[var(--radius-md)] border border-border bg-bg-elevated p-8"
            >
              <div className="flex items-center gap-3">
                {company.logoUrl && (
                  <Image
                    src={company.logoUrl}
                    alt={company.name}
                    width={40}
                    height={40}
                    className="h-[40px] w-[40px] rounded-full"
                  />
                )}
                {company.url ? (
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-xl"
                  >
                    {company.name}
                  </a>
                ) : (
                  <span className="font-display text-xl">{company.name}</span>
                )}
              </div>
              <div className="mt-6 space-y-8">
                {company.experiences.map((experience) => (
                  <div key={experience.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg">{experience.role}</h3>
                      <span className="text-xs text-fg-muted">
                        {formatRange(experience.startDate, experience.endDate)}
                      </span>
                    </div>
                    {experience.summary && <p className="mt-2 text-sm text-fg-muted">{experience.summary}</p>}
                    {experience.achievements.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted">
                        {experience.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                    {experience.techStack.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {experience.techStack.map((tech) => (
                          <li
                            key={tech}
                            className="rounded-full border border-border px-2 py-1 text-xs text-fg-muted"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
