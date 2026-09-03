"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { MotionConfig } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

function LenisGsapBridge({ lenisRef }: { lenisRef: RefObject<LenisRef | null> }) {
  useEffect(() => {
    // lenisRef never changes identity, but the underlying `lenis` instance
    // it points to is only populated asynchronously (ReactLenis creates it
    // in its own effect and exposes it via useImperativeHandle on a later
    // render) — so a plain "read once on mount" here would almost always
    // see `lenis` as undefined and wire up nothing. Poll via rAF instead of
    // pulling in the useLenis() hook.
    let rafId: number;
    let teardown: (() => void) | undefined;

    const trySetup = () => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) {
        rafId = requestAnimationFrame(trySetup);
        return;
      }
      const onScroll = () => ScrollTrigger.update();
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", onScroll);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      teardown = () => {
        lenis.off("scroll", onScroll);
        gsap.ticker.remove(tick);
      };
    };

    trySetup();

    return () => {
      cancelAnimationFrame(rafId);
      teardown?.();
    };
  }, [lenisRef]);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionPref();
  const lenisRef = useRef<LenisRef | null>(null);

  if (reduced) return <MotionConfig reducedMotion="user">{children}</MotionConfig>;

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root ref={lenisRef} options={{ lerp: 0.1, smoothWheel: true, autoRaf: false }}>
        <LenisGsapBridge lenisRef={lenisRef} />
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
