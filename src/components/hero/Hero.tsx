import { Reveal } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { HeroCanvasLoader } from "./HeroCanvasLoader";
import { ScrollHint } from "./ScrollHint";

export function Hero({ name, title, tagline }: { name: string; title: string; tagline?: string }) {
  return (
    <section data-hero className="relative min-h-dvh overflow-hidden">
      <HeroCanvasLoader />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-40">
        <ScrambleText as="h1" text={name} className="font-display text-6xl font-semibold tracking-tighter md:text-8xl" />
        <Reveal delay={0.2}>
          <p className="text-2xl text-fg-muted">{title}</p>
        </Reveal>
        {tagline && (
          <Reveal delay={0.35}>
            <p className="text-lg text-fg-muted">{tagline}</p>
          </Reveal>
        )}
      </div>
      <div className="absolute bottom-8 left-6 z-10 flex flex-col items-start gap-2">
        <Reveal delay={0.6}>
          <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">scroll</span>
        </Reveal>
        <ScrollHint />
      </div>
    </section>
  );
}
