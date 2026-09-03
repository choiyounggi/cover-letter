import { notFound } from "next/navigation";
import { getLinks } from "@/lib/data";
import { AdminPageHeader } from "@/components/admin";
import { LinkForm } from "@/components/admin/forms/LinkForm";
import { updateLinkAction } from "@/app/actions/admin/links";

export const dynamic = "force-dynamic";

export default async function EditLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const links = await getLinks();
  const link = links.find((l) => l.id === id);
  if (!link) notFound();
  return (
    <div>
      <AdminPageHeader title="링크 수정" />
      <LinkForm link={link} action={updateLinkAction} />
    </div>
  );
}
