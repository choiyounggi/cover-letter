export const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";

export function scrambleFrame(target: string, progress: number, rand: () => number = Math.random): string {
  if (progress >= 1) return target;
  const revealCount = Math.floor(progress * target.length);
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const char = target[i];
    if (i < revealCount || char === " ") {
      out += char;
    } else {
      out += GLYPHS[Math.floor(rand() * GLYPHS.length)];
    }
  }
  return out;
}
