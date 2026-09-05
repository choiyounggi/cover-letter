import { Reveal } from "@/components/motion";

export function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <Reveal>
      <p className="font-mono text-xs text-syn-comment">{`// ${eyebrow}`}</p>
      <h2 id={id} className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-6xl">
        {title}
      </h2>
    </Reveal>
  );
}
