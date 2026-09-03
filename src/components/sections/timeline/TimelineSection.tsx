"use client";

import { useRef } from "react";
import type { TimelineItem } from "@/lib/data";
import { Reveal } from "@/components/motion";
import { useGsap } from "@/hooks";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { groupByYear } from "./timeline-utils";
import { TimelineItemCard } from "./TimelineItemCard";

export function TimelineSection({ items }: { items: TimelineItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const groups = groupByYear(items);

  useGsap(
    () => {
      if (!lineRef.current) return;
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 70%",
            scrub: true,
          },
        },
      );
    },
    [items.length],
    sectionRef,
  );

  return (
    <section id="timeline" ref={sectionRef} className="scroll-mt-24 py-32" aria-labelledby="timeline-heading">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading id="timeline-heading" eyebrow="Timeline" title="타임라인" />
        {groups.length === 0 ? (
          <p className="mt-12 text-fg-muted">아직 기록이 없어요</p>
        ) : (
          <div className="relative mt-16 pl-6 md:pl-0">
            <div aria-hidden className="absolute inset-y-0 left-0 w-px bg-border md:left-1/2" />
            <div
              ref={lineRef}
              aria-hidden
              className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-accent md:left-1/2"
            />
            <div className="space-y-16">
              {groups.map((group) => (
                <div key={group.year}>
                  <div className="sticky top-24 z-10 mb-6 md:text-center">
                    <span className="font-mono text-sm text-fg-muted">{group.year}</span>
                  </div>
                  <div className="space-y-8">
                    {group.items.map((item, i) => (
                      <Reveal
                        key={item.id}
                        className={cn(
                          "md:w-1/2",
                          i % 2 === 0 ? "md:mr-auto md:pr-6" : "md:ml-auto md:pl-6",
                        )}
                      >
                        <TimelineItemCard item={item} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
