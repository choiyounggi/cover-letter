import Image from "next/image";
import type { TimelineItem } from "@/lib/data";
import { formatRange } from "./timeline-utils";
import { StaggerGroup, StaggerItem } from "@/components/motion";

const CATEGORY_LABELS: Record<TimelineItem["category"], string> = {
  LIFE: "인생",
  EDUCATION: "학업",
  CAREER: "경력",
  PROJECT: "프로젝트",
  MILESTONE: "이정표",
};

export function TimelineItemCard({ item }: { item: TimelineItem }) {
  const techStack = item.kind === "experience" ? item.techStack : undefined;

  return (
    <article className="border-l border-border pl-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-accent before:content-['['] after:content-[']']">
          {CATEGORY_LABELS[item.category]}
        </span>
        <span className="font-mono text-xs tabular-nums text-fg-muted">
          {formatRange(item.date, item.endDate)}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {item.company?.logoUrl && (
          <Image
            src={item.company.logoUrl}
            alt={item.company.name}
            width={28}
            height={28}
            className="h-[28px] w-[28px] rounded-full"
          />
        )}
        <h3 className="font-display text-lg">{item.title}</h3>
      </div>
      {item.company && <p className="text-sm text-fg-muted">{item.company.name}</p>}
      <p className="mt-2 text-sm text-fg-muted">{item.description}</p>
      {techStack && techStack.length > 0 && (
        <StaggerGroup as="ul" from="scale" className="mt-3 flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <StaggerItem key={tech} as="li" className="font-mono text-xs text-fg-muted before:content-['['] after:content-[']']">
              {tech}
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </article>
  );
}
