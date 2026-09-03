import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { isAdminSession } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";

export const metadata = { title: "관리자 로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (isAdminSession(session)) redirect("/admin");
  const { callbackUrl, error } = await searchParams;
  const redirectTo = safeCallbackUrl(callbackUrl);
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo });
        }}
        className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-8 text-center"
      >
        <h1 className="font-display text-2xl font-semibold">관리자 로그인</h1>
        <p className="mt-2 text-sm text-fg-muted">허용된 GitHub 계정만 입장할 수 있습니다.</p>
        {error ? <p role="alert" className="mt-4 text-sm text-red-500">로그인에 실패했습니다. 허용된 계정인지 확인하세요.</p> : null}
        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg"
        >
          GitHub로 로그인
        </button>
      </form>
    </main>
  );
}
