export type MotionPrefs = { frameloop: "always" | "demand"; particles: boolean; smoothScroll: boolean; morph: boolean };

export function motionPreferences({ reduced, inView }: { reduced: boolean; inView: boolean }): MotionPrefs {
  return { frameloop: reduced || !inView ? "demand" : "always", particles: !reduced, smoothScroll: !reduced, morph: !reduced };
}

export const frameloopFor = (a: { reduced: boolean; inView: boolean }) => motionPreferences(a).frameloop;

export function nextMorphTarget(rand: () => number = Math.random): number {
  return 0.4 + rand() * 0.6;
}

export function easeTowards(current: number, target: number, k: number): number {
  return current + (target - current) * k;
}

export function nextMorphDelayMs(rand: () => number = Math.random): number {
  return 6000 + rand() * 4000;
}
