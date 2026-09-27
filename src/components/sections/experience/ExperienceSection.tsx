import type { Company, Experience } from "@/generated/prisma/client";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { monthsBetween } from "./duration";
import { CompanyCard } from "./CompanyCard";

export function ExperienceSection({
  companies,
}: {
  companies: (Company & { experiences: Experience[] })[];
}): React.JSX.Element {
  const now = new Date();

  return (
    <section id="experience" className="scroll-mt-24 py-24" aria-labelledby="experience-heading">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading id="experience-heading" eyebrow="Experience" title="경력" />
        <div className="mt-12 space-y-12">
          {companies.map((company) => {
            const experiencesWithMonths = company.experiences.map((experience) => ({
              ...experience,
              months: monthsBetween(experience.startDate, experience.endDate, now),
            }));
            const maxMonths = experiencesWithMonths.reduce(
              (max, experience) => Math.max(max, experience.months),
              0,
            );
            return (
              <CompanyCard
                key={company.id}
                company={company}
                experiences={experiencesWithMonths}
                maxMonths={maxMonths}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
