import { CodeIntro } from "./CodeIntro";
import { NetworkCanvas } from "./NetworkCanvas";
import { ScrollHint } from "./ScrollHint";

export function Hero({ name, title, tagline }: { name: string; title: string; tagline?: string }) {
  return (
    <section data-hero className="relative overflow-hidden pt-36 pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
        <NetworkCanvas />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <CodeIntro name={name} title={title} tagline={tagline} />
      </div>
      <div className="relative z-10 mx-auto mt-16 flex max-w-6xl flex-col items-start gap-2 px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">scroll</span>
        <ScrollHint />
      </div>
    </section>
  );
}
