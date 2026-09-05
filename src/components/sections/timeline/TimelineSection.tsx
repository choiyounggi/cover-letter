"use client";

import { useRef } from "react";
import type { TimelineItem } from "@/lib/data";
import { Reveal } from "@/components/motion";
import { useGsap } from "@/hooks";
import { gsap } from "@/lib/gsap";
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
          <div className="relative mt-16 pl-8">
            <div aria-hidden className="absolute inset-y-0 left-0 w-px bg-border" />
            <div
              ref={lineRef}
              aria-hidden
              className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-accent"
            />
            <div className="space-y-16">
              {groups.map((group) => (
                <div key={group.year}>
                  <div className="sticky top-24 z-10 mb-6">
                    <span className="font-mono text-sm tabular-nums text-syn-comment">{`// ${group.year}`}</span>
                  </div>
                  <div className="space-y-8">
                    {group.items.map((item) => (
                      <Reveal key={item.id} className="relative">
                        <span aria-hidden className="absolute -left-8 top-6 font-mono text-accent">
                          *
                        </span>
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
