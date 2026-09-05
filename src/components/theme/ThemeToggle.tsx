"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- D15: SSR/client mount guard, the documented next-themes hydration-mismatch fix
  useEffect(() => setMounted(true), []);
  const isDark = (resolvedTheme ?? "dark") === "dark";
  return (
    <button
      type="button"
      aria-label="테마 전환"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-bg-elevated text-fg",
        "transition-transform duration-200 hover:scale-105 active:scale-95",
        !mounted && "opacity-0",
        className,
      )}
    >
      <span aria-hidden>{isDark ? "☾" : "☀"}</span>
    </button>
  );
}
