"use client";

import { useRef } from "react";
import { useGsap } from "@/hooks/useGsap";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { gsap } from "@/lib/gsap";

export function ScrollHint() {
  const lineRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotionPref();

  useGsap(() => {
    const line = lineRef.current;
    // D16: the loop is not started at all when reduced motion is preferred —
    // the line renders statically at scaleY: 1 (set via inline style below).
    if (reduced || !line) return;
    gsap.fromTo(
      line,
      { scaleY: 0 },
      { scaleY: 1, repeat: -1, yoyo: true, duration: 1.4, ease: "power2.inOut", transformOrigin: "top" },
    );
  }, [reduced]);

  return (
    <span
      ref={lineRef}
      aria-hidden="true"
      className="block h-8 w-px bg-fg-muted"
      style={reduced ? { transform: "scaleY(1)" } : undefined}
    />
  );
}
