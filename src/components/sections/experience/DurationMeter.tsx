"use client";

import { useRef } from "react";
import { useGsap, useReducedMotionPref } from "@/hooks";
import { gsap } from "@/lib/gsap";

export function DurationMeter({
  months,
  maxMonths,
}: {
  months: number;
  maxMonths: number;
}): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotionPref();

  useGsap(
    () => {
      if (!wrapperRef.current || !barRef.current || !counterRef.current) return;
      const fraction = maxMonths > 0 ? months / maxMonths : 0;

      // Scrub sets the tween's progress directly from scroll position
      // (bypassing gsap.globalTimeline.timeScale, unlike a normally-played
      // tween), so reduced motion must skip the ScrollTrigger entirely and
      // render the end state directly.
      if (reduced) {
        gsap.set(barRef.current, { scaleX: fraction });
        counterRef.current.textContent = `${months}개월`;
        return;
      }

      const counter = { value: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 85%",
          end: "top 45%",
          scrub: true,
        },
      });
      tl.fromTo(barRef.current, { scaleX: 0 }, { scaleX: fraction, ease: "none" }, 0);
      tl.fromTo(
        counter,
        { value: 0 },
        {
          value: months,
          ease: "none",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = `${Math.round(counter.value)}개월`;
            }
          },
        },
        0,
      );
    },
    [months, maxMonths, reduced],
    wrapperRef,
  );

  return (
    <div ref={wrapperRef} className="mt-2 flex items-center gap-2" data-testid="duration-meter">
      <div aria-hidden className="h-px flex-1 bg-border">
        <div ref={barRef} className="h-px origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
      </div>
      <span ref={counterRef} className="font-mono text-xs tabular-nums text-fg-muted">
        0개월
      </span>
    </div>
  );
}
