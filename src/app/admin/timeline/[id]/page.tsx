import { notFound } from "next/navigation";
import { getTimelineEvents, getCompaniesWithExperiences } from "@/lib/data";
import { AdminPageHeader } from "@/components/admin";
import { TimelineEventForm } from "@/components/admin-timeline/TimelineEventForm";
import { updateTimelineEventAction } from "@/app/actions/admin/timeline";

export const dynamic = "force-dynamic";

export default async function TimelineEventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [events, companies] = await Promise.all([getTimelineEvents(), getCompaniesWithExperiences()]);
  const event = events.find((e) => e.id === id);
  if (!event) notFound();
  return (
    <div>
      <AdminPageHeader title="타임라인 이벤트 수정" />
      <TimelineEventForm
        event={event}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
        action={updateTimelineEventAction}
      />
    </div>
  );
}
