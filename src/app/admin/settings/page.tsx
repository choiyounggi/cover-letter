import { getSettings } from "@/lib/data";
import { AdminPageHeader } from "@/components/admin";
import { SettingsForm } from "@/components/admin/forms/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <AdminPageHeader title="설정" description="텔레그램 알림과 사이트 설정을 관리합니다." />
      <SettingsForm settings={settings} />
    </div>
  );
}
