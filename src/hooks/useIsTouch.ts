"use client";

import { useEffect, useState } from "react";

function readIsTouch(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
}

export function useIsTouch(): boolean {
  // Initial value is computable during render (effects-usage.md rule 1); the
  // effect only subscribes to the external matchMedia change event.
  const [isTouch, setIsTouch] = useState(readIsTouch);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia("(pointer: coarse)");
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isTouch;
}
