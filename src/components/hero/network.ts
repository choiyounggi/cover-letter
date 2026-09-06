export type Node = { x: number; y: number; vx: number; vy: number };

export const EDGE_DIST = 130;
export const POINTER_RADIUS = 160;
export const POINTER_INNER_RADIUS = 32;

const DRIFT_SPEED = 0.3;
const POINTER_PULL = 0.02;

export function seedNodes(count: number, width: number, height: number, rand: () => number = Math.random): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    nodes.push({
      x: rand() * width,
      y: rand() * height,
      vx: Math.cos(angle) * DRIFT_SPEED,
      vy: Math.sin(angle) * DRIFT_SPEED,
    });
  }
  return nodes;
}

export function stepNodes(
  nodes: Node[],
  width: number,
  height: number,
  pointer: { x: number; y: number } | null,
  dt: number = 1,
): void {
  for (const n of nodes) {
    n.x += n.vx * dt;
    n.y += n.vy * dt;

    if (n.x < 0) {
      n.x = 0;
      n.vx = Math.abs(n.vx);
    } else if (n.x > width) {
      n.x = width;
      n.vx = -Math.abs(n.vx);
    }
    if (n.y < 0) {
      n.y = 0;
      n.vy = Math.abs(n.vy);
    } else if (n.y > height) {
      n.y = height;
      n.vy = -Math.abs(n.vy);
    }

    if (pointer) {
      const dx = pointer.x - n.x;
      const dy = pointer.y - n.y;
      const dist = Math.hypot(dx, dy);
      // Pull only outside the inner radius, and clamp the step so it can never overshoot
      // past that radius — nodes settle into an orbit around the pointer instead of
      // collapsing onto it when the cursor rests or the drift is too weak to carry them away.
      if (dist > POINTER_INNER_RADIUS && dist < POINTER_RADIUS) {
        const step = Math.min(dist * POINTER_PULL, dist - POINTER_INNER_RADIUS);
        const ratio = step / dist;
        n.x += dx * ratio;
        n.y += dy * ratio;
      }
    }
  }
}

export function nodeCountFor(width: number): number {
  return width >= 768 ? 70 : 35;
}
