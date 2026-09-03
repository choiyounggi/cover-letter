import { getTimelineEvents, getCompaniesWithExperiences } from "@/lib/data";
import { AdminPageHeader, DeleteButton } from "@/components/admin";
import { TimelineEventForm } from "@/components/admin-timeline/TimelineEventForm";
import { TIMELINE_CATEGORY_LABELS } from "@/components/admin-timeline/labels";
import { groupEventsByYear } from "@/components/admin-timeline/group-by-year";
import { createTimelineEventAction, deleteTimelineEventAction } from "@/app/actions/admin/timeline";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const [events, companies] = await Promise.all([getTimelineEvents(), getCompaniesWithExperiences()]);
  const grouped = groupEventsByYear(events);
  const companyOptions = companies.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader title="타임라인" description="인생/학업/경력/프로젝트/이정표 이벤트를 관리합니다." />
      {grouped.length === 0 ? (
        <p className="text-sm text-fg-muted">등록된 타임라인 이벤트가 없어요.</p>
      ) : (
        grouped.map(([year, yearEvents]) => (
          <section key={year} className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-semibold text-fg">{year}</h2>
            <ul className="flex flex-col gap-2">
              {yearEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-fg-muted">
                      {TIMELINE_CATEGORY_LABELS[event.category] ?? event.category}
                    </span>
                    {event.title}
                  </span>
                  <div className="flex items-center gap-3">
                    <a href={`/admin/timeline/${event.id}`} className="text-sm text-accent">
                      수정
                    </a>
                    <DeleteButton action={deleteTimelineEventAction} id={event.id} label={event.title} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-fg">새 이벤트 추가</h2>
        <TimelineEventForm companies={companyOptions} action={createTimelineEventAction} />
      </div>
    </div>
  );
}
