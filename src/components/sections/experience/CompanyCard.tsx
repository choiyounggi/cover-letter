"use client";

import { useRef } from "react";
import Image from "next/image";
import type { Company, Experience } from "@/generated/prisma/client";
import { useGsap } from "@/hooks";
import { gsap } from "@/lib/gsap";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { formatRange } from "@/components/sections/timeline/timeline-utils";
import { DurationMeter } from "./DurationMeter";

export function CompanyCard({
  company,
  experiences,
  maxMonths,
}: {
  company: Company;
  experiences: (Experience & { months: number })[];
  maxMonths: number;
}): React.JSX.Element {
  const articleRef = useRef<HTMLElement>(null);

  useGsap(
    () => {
      if (!articleRef.current) return;
      const state = { chars: 0 };
      gsap.to(state, {
        chars: company.name.length,
        duration: company.name.length * 0.04,
        ease: "none",
        scrollTrigger: {
          trigger: articleRef.current,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          articleRef.current?.setAttribute("data-file", company.name.slice(0, Math.round(state.chars)));
        },
      });
    },
    [company.name],
    articleRef,
  );

  return (
    <article ref={articleRef} className="code-frame" data-file={company.name}>
      <div className="p-6 md:p-8">
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
              className="font-display text-xl transition-colors hover:text-accent"
            >
              {company.name}
            </a>
          ) : (
            <span className="font-display text-xl">{company.name}</span>
          )}
        </div>
        <div className="mt-6 space-y-8">
          {experiences.map((experience) => (
            <div key={experience.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg">{experience.role}</h3>
                <span className="font-mono text-xs tabular-nums text-fg-muted">
                  {formatRange(experience.startDate, experience.endDate)}
                </span>
              </div>
              <DurationMeter months={experience.months} maxMonths={maxMonths} />
              {experience.summary && <p className="mt-2 text-sm text-fg-muted">{experience.summary}</p>}
              {experience.achievements.length > 0 && (
                <StaggerGroup
                  as="ul"
                  from="left"
                  stagger={0.08}
                  className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted marker:text-accent"
                >
                  {experience.achievements.map((achievement, i) => (
                    <StaggerItem as="li" key={i}>
                      {achievement}
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              )}
              {experience.techStack.length > 0 && (
                <StaggerGroup as="ul" from="scale" className="mt-3 flex flex-wrap gap-2">
                  {experience.techStack.map((tech) => (
                    <StaggerItem
                      as="li"
                      key={tech}
                      className="font-mono text-xs text-fg-muted before:content-['['] after:content-[']']"
                    >
                      {tech}
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              )}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
