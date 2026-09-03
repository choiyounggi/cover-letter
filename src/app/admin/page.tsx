import {
  getLinks,
  getSkills,
  getCompaniesWithExperiences,
  getProjects,
  getTimelineEvents,
  listMessages,
} from "@/lib/data";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NAV_ITEMS } from "@/components/admin/nav-items";

export default async function AdminDashboardPage() {
  const [links, skills, companies, projects, events, messages] = await Promise.all([
    getLinks(),
    getSkills(),
    getCompaniesWithExperiences(),
    getProjects(),
    getTimelineEvents(),
    listMessages(),
  ]);
  const unread = messages.filter((m) => !m.readAt).length;

  const counts: Partial<Record<string, number>> = {
    "/admin/links": links.length,
    "/admin/skills": skills.length,
    "/admin/companies": companies.length,
    "/admin/projects": projects.length,
    "/admin/timeline": events.length,
    "/admin/messages": unread,
  };

  return (
    <div>
      <AdminPageHeader title="대시보드" description="콘텐츠 현황을 한눈에 확인하세요." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {NAV_ITEMS.filter((item) => item.href !== "/admin").map((item) => {
          const count = counts[item.href];
          return (
            <a
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius-md)] border border-border bg-bg-elevated p-6"
            >
              <span aria-hidden className="text-2xl">
                {item.icon}
              </span>
              <p className="mt-2 text-sm text-fg-muted">{item.label}</p>
              {count !== undefined ? <p className="mt-1 text-3xl font-semibold text-fg">{count}</p> : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}
