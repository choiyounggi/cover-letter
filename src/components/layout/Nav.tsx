"use client";

import { useState } from "react";
import { Magnetic } from "@/components/motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "소개", href: "#about" },
  { label: "기술", href: "#skills" },
  { label: "타임라인", href: "#timeline" },
  { label: "경력", href: "#experience" },
  { label: "프로젝트", href: "#projects" },
  { label: "연락", href: "#contact" },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-bg/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="font-mono text-base font-semibold tracking-tight text-fg">
          ~/yg
        </a>
        <ul className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Magnetic>
                <a href={link.href} className="font-mono text-sm text-fg-muted transition-colors hover:text-accent">
                  {link.label}
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            aria-label="메뉴 열기"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-border md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden>{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>
      <ul
        id="nav-menu"
        className={cn("flex-col gap-1 border-t border-border px-6 py-4 md:hidden", menuOpen ? "flex" : "hidden")}
      >
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="block py-2 font-mono text-sm text-fg-muted"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
