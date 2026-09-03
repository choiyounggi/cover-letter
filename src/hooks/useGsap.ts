"use client";

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useGsap(
  cb: (ctx: gsap.Context) => void,
  deps: DependencyList = [],
  scope?: RefObject<HTMLElement | null>,
) {
  useIsoLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      // gsap.context has no internal try/catch around the init function
      // (gsap-core.js calls it as a plain func.apply): a throwing cb would
      // otherwise propagate out of gsap.context() and leave no context to
      // revert. Contain it here so a context is always created and reverted.
      try {
        cb(self);
      } catch (err) {
        console.error(err);
      }
    }, scope?.current ?? undefined);
    return () => ctx.revert();
  }, deps);
}
