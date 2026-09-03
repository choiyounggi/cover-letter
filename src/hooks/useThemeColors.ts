"use client";

import { useEffect, useState } from "react";

export type ThemeColors = { bg: string; fg: string; accent: string };

const FALLBACK: ThemeColors = { bg: "#0a0a0c", fg: "#f5f5f7", accent: "#7c9cff" };

export function readThemeColors(get: (name: string) => string): ThemeColors {
  const pick = (n: string, fb: string) => {
    const v = get(n).trim();
    return v || fb;
  };
  return { bg: pick("--bg", FALLBACK.bg), fg: pick("--fg", FALLBACK.fg), accent: pick("--accent", FALLBACK.accent) };
}

export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(FALLBACK);

  useEffect(() => {
    const read = () => setColors(readThemeColors((n) => getComputedStyle(document.documentElement).getPropertyValue(n)));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    return () => mo.disconnect();
  }, []);

  return colors;
}
