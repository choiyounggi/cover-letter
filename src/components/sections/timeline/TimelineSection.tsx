"use client";

import { useRef } from "react";
import type { TimelineItem } from "@/lib/data";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { useGsap } from "@/hooks";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { groupByYear } from "./timeline-utils";
import { TimelineItemCard } from "./TimelineItemCard";

export function TimelineSection({ items }: { items: TimelineItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const groups = groupByYear(items);

  useGsap(
    (ctx) => {
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

      const prefersReduced =
        typeof window !== "undefined" &&
        (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

      const cardEls: Element[] = ctx.selector?.("[data-timeline-card]") ?? [];
      for (const cardEl of cardEls) {
        const marker = cardEl.querySelector("[data-timeline-marker]");
        if (!marker) continue;
        if (prefersReduced) {
          marker.classList.remove("text-fg-muted");
          marker.classList.add("text-accent", "scale-125");
          continue;
        }
        ScrollTrigger.create({
          trigger: cardEl,
          start: "top 70%",
          onEnter: () => {
            marker.classList.remove("text-fg-muted");
            marker.classList.add("text-accent", "scale-125");
          },
          onLeaveBack: () => {
            marker.classList.remove("text-accent", "scale-125");
            marker.classList.add("text-fg-muted");
          },
        });
      }

      const groupEls: Element[] = ctx.selector?.("[data-timeline-year-group]") ?? [];
      for (const groupEl of groupEls) {
        const label = groupEl.querySelector("[data-timeline-year-label]");
        if (!label) continue;
        if (prefersReduced) {
          label.classList.remove("text-syn-comment");
          label.classList.add("text-accent");
          continue;
        }
        ScrollTrigger.create({
          trigger: groupEl,
          start: "top 70%",
          end: "bottom 70%",
          onEnter: () => {
            label.classList.remove("text-syn-comment");
            label.classList.add("text-accent");
          },
          onEnterBack: () => {
            label.classList.remove("text-syn-comment");
            label.classList.add("text-accent");
          },
          onLeave: () => {
            label.classList.remove("text-accent");
            label.classList.add("text-syn-comment");
          },
          onLeaveBack: () => {
            label.classList.remove("text-accent");
            label.classList.add("text-syn-comment");
          },
        });
      }
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
                <div key={group.year} data-timeline-year-group>
                  <div className="sticky top-24 z-10 mb-6">
                    <span data-timeline-year-label className="font-mono text-sm tabular-nums text-syn-comment">{`// ${group.year}`}</span>
                  </div>
                  <div className="space-y-8">
                    {group.items.map((item) => (
                      <div key={item.id} className="relative" data-timeline-card>
                        <StaggerGroup as="div" from="left">
                          <StaggerItem>
                            <span aria-hidden data-timeline-marker className="absolute -left-8 top-6 font-mono text-fg-muted">
                              *
                            </span>
                            <TimelineItemCard item={item} />
                          </StaggerItem>
                        </StaggerGroup>
                      </div>
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
