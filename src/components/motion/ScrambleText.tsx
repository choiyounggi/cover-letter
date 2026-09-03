"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { scrambleFrame } from "./scramble";

export function ScrambleText({
  text,
  as: Tag = "span",
  duration = 1200,
  className,
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "p";
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotionPref();
  // Render-computable initial value (effects-usage.md rule 1); when reduced
  // motion is preferred, the final text is rendered directly below with no
  // animation state involved at all.
  const [frame, setFrame] = useState(() => scrambleFrame(text, 0));
  const wrapperRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;

    const el = wrapperRef.current;
    if (!el) return;

    let rafId: number | null = null;
    let observer: IntersectionObserver | null = null;

    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setFrame(scrambleFrame(text, progress));
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          animate();
          observer?.disconnect();
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [text, duration, reduced]);

  const displayed = reduced ? text : frame;

  return (
    <Tag
      ref={wrapperRef as Ref<HTMLSpanElement & HTMLHeadingElement & HTMLParagraphElement>}
      aria-label={text}
      className={className}
    >
      <span aria-hidden="true">{displayed}</span>
    </Tag>
  );
}
