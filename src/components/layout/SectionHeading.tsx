import { Reveal } from "@/components/motion";

export function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <Reveal>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{eyebrow}</p>
      <h2 id={id} className="font-display text-4xl tracking-tight md:text-6xl">
        {title}
      </h2>
    </Reveal>
  );
}
