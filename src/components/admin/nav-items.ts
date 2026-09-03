export type NavItem = { href: string; label: string; icon: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "대시보드", icon: "🏠" },
  { href: "/admin/profile", label: "프로필", icon: "👤" },
  { href: "/admin/links", label: "링크", icon: "🔗" },
  { href: "/admin/skills", label: "기술", icon: "🛠" },
  { href: "/admin/companies", label: "회사", icon: "🏢" },
  { href: "/admin/experiences", label: "경력", icon: "💼" },
  { href: "/admin/timeline", label: "타임라인", icon: "🕰" },
  { href: "/admin/projects", label: "프로젝트", icon: "🚀" },
  { href: "/admin/messages", label: "수신함", icon: "📥" },
  { href: "/admin/settings", label: "설정", icon: "⚙️" },
];
