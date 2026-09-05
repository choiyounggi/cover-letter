"use client";

import { useEffect, useRef } from "react";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import "./cursor.css";

export const DOT_FACTOR = 1;
export const RING_FACTOR = 0.35;

export function Cursor() {
  const isTouch = useIsTouch();
  const reduced = useReducedMotionPref();
  const disabled = isTouch || reduced;

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const dot = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const hover = useRef(false);
  const visible = useRef(false);

  useEffect(() => {
    if (disabled) return;
    document.documentElement.dataset.customCursor = "true";
    return () => {
      delete document.documentElement.dataset.customCursor;
    };
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;

    const onPointerMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible.current) {
        visible.current = true;
        dotRef.current?.classList.add("is-visible");
        ringRef.current?.classList.add("is-visible");
      }
    };
    const onPointerOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      const isHover = !!el?.closest('[data-cursor="hover"]');
      hover.current = isHover;
      ringRef.current?.classList.toggle("is-hover", isHover);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerover", onPointerOver);

    let rafId = requestAnimationFrame(function tick() {
      dot.current.x += (target.current.x - dot.current.x) * DOT_FACTOR;
      dot.current.y += (target.current.y - dot.current.y) * DOT_FACTOR;
      ring.current.x += (target.current.x - ring.current.x) * RING_FACTOR;
      ring.current.y += (target.current.y - ring.current.y) * RING_FACTOR;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
