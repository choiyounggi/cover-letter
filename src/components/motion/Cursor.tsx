"use client";

import { useEffect, useRef } from "react";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import "./cursor.css";

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
      dot.current.x += (target.current.x - dot.current.x) * 0.15;
      dot.current.y += (target.current.y - dot.current.y) * 0.15;
      ring.current.x += (target.current.x - ring.current.x) * 0.08;
      ring.current.y += (target.current.y - ring.current.y) * 0.08;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dot.current.x}px, ${dot.current.y}px)`;
      }
      if (ringRef.current) {
        const scale = hover.current ? " scale(2)" : "";
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)${scale}`;
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
