"use client";

import { useRef } from "react";
import { useGsap } from "@/hooks";
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

  useGsap(
    () => {
      if (!wrapperRef.current || !barRef.current || !counterRef.current) return;
      const fraction = maxMonths > 0 ? months / maxMonths : 0;
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
    [months, maxMonths],
    wrapperRef,
  );

  return (
    <div ref={wrapperRef} className="mt-2 flex items-center gap-2" data-testid="duration-meter">
      <div className="h-px flex-1 bg-border">
        <div ref={barRef} className="h-px origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
      </div>
      <span ref={counterRef} className="font-mono text-xs tabular-nums text-fg-muted">
        0개월
      </span>
    </div>
  );
}
