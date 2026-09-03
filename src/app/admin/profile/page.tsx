import { getProfile } from "@/lib/data";
import { AdminPageHeader } from "@/components/admin";
import { ProfileForm } from "@/components/admin/forms/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();
  return (
    <div>
      <AdminPageHeader title="프로필" description="공개 프로필 정보를 관리합니다." />
      <ProfileForm profile={profile} />
    </div>
  );
}
