"use client";

import { useRef, useState } from "react";
import { useGsap } from "@/hooks";
import { ScrollTrigger } from "@/lib/gsap";
import { Magnetic } from "@/components/motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { navVisibility } from "./nav-visibility";

const LINKS = [
  { label: "소개", href: "#about" },
  { label: "기술", href: "#skills" },
  { label: "타임라인", href: "#timeline" },
  { label: "경력", href: "#experience" },
  { label: "프로젝트", href: "#projects" },
  { label: "연락", href: "#contact" },
];

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useGsap(
    () => {
      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          setHidden(navVisibility(self.direction as 1 | -1, self.scroll()) === "hidden");
        },
      });
      return () => trigger.kill();
    },
    [],
    navRef,
  );

  return (
    <header
      ref={navRef}
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-border bg-bg/60 backdrop-blur-md transition-transform duration-300",
        hidden && "-translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="font-display text-lg font-semibold tracking-tight">
          YG.
        </a>
        <ul className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Magnetic>
                <a href={link.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden"
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
              className="block py-2 text-sm text-fg-muted"
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
