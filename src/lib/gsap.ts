import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** D16: under prefers-reduced-motion every GSAP tween completes effectively instantly. */
export function applyReducedMotion(
  g: { globalTimeline: { timeScale: (v: number) => unknown }; defaults: (v: object) => unknown },
  matches: boolean,
): boolean {
  if (!matches) return false;
  g.globalTimeline.timeScale(1000);
  g.defaults({ overwrite: "auto" });
  return true;
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  applyReducedMotion(gsap, window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
}

export { gsap, ScrollTrigger };
