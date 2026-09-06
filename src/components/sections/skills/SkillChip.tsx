export function SkillChip({ name, level }: { name: string; level: number }) {
  return (
    <span
      aria-label={`${name} 숙련도 ${level}/5`}
      className="inline-flex items-center gap-2 border-b border-border px-1 py-1 font-mono text-sm"
    >
      <span aria-hidden>{name}</span>
      <span aria-hidden className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`h-1.5 w-1.5 ${i < level ? "bg-accent" : "bg-border"}`} />
        ))}
      </span>
    </span>
  );
}
