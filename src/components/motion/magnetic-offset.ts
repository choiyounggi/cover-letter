export function magneticOffset(dx: number, dy: number, radius: number, strength: number): { x: number; y: number } {
  const d = Math.hypot(dx, dy);
  if (!radius || d > radius) return { x: 0, y: 0 };
  const f = strength * (1 - d / radius);
  return { x: dx * f, y: dy * f };
}
