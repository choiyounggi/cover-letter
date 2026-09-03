export function SkillChip({ name, level }: { name: string; level: number }) {
  return (
    <span
      aria-label={`${name} 숙련도 ${level}/5`}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm"
    >
      <span aria-hidden>{name}</span>
      <span aria-hidden className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < level ? "bg-accent" : "bg-border"}`} />
        ))}
      </span>
    </span>
  );
}
