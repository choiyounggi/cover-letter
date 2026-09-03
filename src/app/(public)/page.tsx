import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-start justify-center gap-6 px-6">
      <ThemeToggle />
      <h1 className="font-display text-5xl font-semibold tracking-tight md:text-7xl">최영기</h1>
      <p className="text-lg text-fg-muted">Backend Engineer · portfolio-v2 scaffold</p>
    </main>
  );
}
