import { getLinks } from "@/lib/data";
import { AdminPageHeader, EntityTable, ReorderList, DeleteButton } from "@/components/admin";
import { LinkForm } from "@/components/admin/forms/LinkForm";
import { createLinkAction, deleteLinkAction, reorderLinksAction } from "@/app/actions/admin/links";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const links = await getLinks();
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="링크" description="공개 프로필에 표시할 링크를 관리합니다." />
      <EntityTable
        columns={[
          { key: "label", header: "라벨" },
          { key: "url", header: "URL" },
        ]}
        rows={links}
        renderActions={(link) => (
          <div className="flex items-center gap-3">
            <a href={`/admin/links/${link.id}`} className="text-sm text-accent">
              수정
            </a>
            <DeleteButton action={deleteLinkAction} id={link.id} label={link.label} />
          </div>
        )}
      />
      <ReorderList items={links.map((l) => ({ id: l.id, label: l.label }))} action={reorderLinksAction} />
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-fg">새 링크 추가</h2>
        <LinkForm action={createLinkAction} />
      </div>
    </div>
  );
}
