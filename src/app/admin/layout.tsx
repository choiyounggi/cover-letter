import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NAV_ITEMS } from "@/components/admin/nav-items";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="grid min-h-dvh md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-6 border-b border-border p-6 md:border-r md:border-b-0">
        <span className="font-display text-lg font-semibold text-fg">관리자</span>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-fg hover:bg-bg-elevated"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-sm text-fg-muted">{session.user.login}</span>
          <ThemeToggle />
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="w-full rounded-full border border-border px-4 py-2 text-sm text-fg">
            로그아웃
          </button>
        </form>
      </aside>
      <main className="p-8">{children}</main>
    </div>
  );
}
