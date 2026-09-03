import { prisma } from "@/lib/db/prisma";
import { timelineEventInputSchema, type TimelineEventInput } from "@/lib/schemas/content";
import type { Company, Experience, TimelineEvent } from "@/generated/prisma/client";

export type TimelineItem =
  | {
      kind: "event";
      id: string;
      title: string;
      description: string;
      date: Date;
      endDate: Date | null;
      category: TimelineEvent["category"];
      icon: string | null;
      imageUrl: string | null;
      company: { name: string; logoUrl: string | null; url: string | null } | null;
    }
  | {
      kind: "experience";
      id: string;
      title: string;
      description: string;
      date: Date;
      endDate: Date | null;
      category: "CAREER";
      company: { name: string; logoUrl: string | null; url: string | null };
      techStack: string[];
      achievements: string[];
    };

export function mergeTimeline(
  events: (TimelineEvent & { company: Company | null })[],
  experiences: (Experience & { company: Company })[]
): TimelineItem[] {
  const eventItems: (TimelineItem & { sortOrder: number })[] = events.map((e) => ({
    kind: "event",
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    endDate: e.endDate,
    category: e.category,
    icon: e.icon,
    imageUrl: e.imageUrl,
    company: e.company ? { name: e.company.name, logoUrl: e.company.logoUrl, url: e.company.url } : null,
    sortOrder: e.sortOrder,
  }));

  const experienceItems: (TimelineItem & { sortOrder: number })[] = experiences.map((x) => ({
    kind: "experience",
    id: x.id,
    title: x.role,
    description: x.summary,
    date: x.startDate,
    endDate: x.endDate,
    category: "CAREER",
    company: { name: x.company.name, logoUrl: x.company.logoUrl, url: x.company.url },
    techStack: x.techStack,
    achievements: x.achievements,
    sortOrder: x.sortOrder,
  }));

  return [...eventItems, ...experienceItems]
    .sort((a, b) => {
      const dateDiff = b.date.getTime() - a.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.sortOrder - b.sortOrder;
    })
    .map((item): TimelineItem => {
      const { sortOrder, ...rest } = item;
      void sortOrder;
      return rest as TimelineItem;
    });
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  return prisma.timelineEvent.findMany({ orderBy: [{ date: "desc" }, { sortOrder: "asc" }] });
}

export async function getTimeline(): Promise<TimelineItem[]> {
  const [events, experiences] = await Promise.all([
    prisma.timelineEvent.findMany({ include: { company: true } }),
    prisma.experience.findMany({ include: { company: true } }),
  ]);
  return mergeTimeline(events, experiences);
}

export async function createTimelineEvent(input: TimelineEventInput): Promise<TimelineEvent> {
  const data = timelineEventInputSchema.parse(input);
  return prisma.timelineEvent.create({ data });
}

export async function updateTimelineEvent(id: string, input: TimelineEventInput): Promise<TimelineEvent> {
  const data = timelineEventInputSchema.parse(input);
  return prisma.timelineEvent.update({ where: { id }, data });
}

export async function deleteTimelineEvent(id: string): Promise<TimelineEvent> {
  return prisma.timelineEvent.delete({ where: { id } });
}
