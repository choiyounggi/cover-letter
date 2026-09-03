export type NavVisibility = "visible" | "hidden";

/**
 * D7: near the top (y < 40) the nav always stays visible; below that it
 * hides on scroll-down (direction 1) and reappears on scroll-up (direction -1).
 */
export function navVisibility(direction: 1 | -1, y: number): NavVisibility {
  if (y < 40) return "visible";
  return direction === 1 ? "hidden" : "visible";
}
