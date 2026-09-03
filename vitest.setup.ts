import "@testing-library/jest-dom/vitest";

// jsdom does not implement window.matchMedia. gsap's ScrollTrigger touches it
// as a side effect of registerPlugin (independent of our own reduced-motion
// check), and several hooks in this task (useIsTouch, useReducedMotionPref)
// call it directly. Provide a default (matches: false) so importing real
// modules under jsdom does not throw; individual tests override it per-case.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
