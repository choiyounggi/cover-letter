"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { useThemeColors, type ThemeColors } from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";
import { EDGE_DIST, type Node, clampNodes, nodeCountFor, seedNodes, stepNodes } from "./network";

export function NetworkCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionPref();
  const colors = useThemeColors();
  const colorsRef = useRef<ThemeColors>(colors);
  const drawRef = useRef<(() => void) | null>(null);

  // Keep the latest theme colors available to the rAF loop without making the lifecycle
  // effect below depend on `colors` — useThemeColors hands back a new object on every
  // <html> class/style/data-theme mutation (e.g. Lenis toggling scroll classes), and
  // keying the loop's effect on that identity would tear down + reseed on every scroll.
  // Under reduced motion there is no rAF loop to pick up the new ref on its own, so this
  // also triggers a one-off repaint (never a re-seed) whenever colors actually change —
  // otherwise the single static frame stays painted with useThemeColors' initial
  // FALLBACK value forever, since its own first real read only lands after this mounts.
  useEffect(() => {
    colorsRef.current = colors;
    if (reduced) drawRef.current?.();
  }, [colors, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let nodes: Node[] = [];
    let nodeCount = 0;
    let pointer: { x: number; y: number } | null = null;
    let rafId: number | null = null;
    let width = 0;
    let height = 0;

    const size = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const seed = () => {
      nodeCount = nodeCountFor(width);
      nodes = seedNodes(nodeCount, width, height);
    };

    const draw = () => {
      const themeColors = colorsRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = themeColors.accent;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < EDGE_DIST) {
            ctx.globalAlpha = (1 - d / EDGE_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = themeColors.fg;
      ctx.globalAlpha = 0.7;
      for (const n of nodes) ctx.fillRect(n.x - 0.75, n.y - 0.75, 1.5, 1.5);
      ctx.globalAlpha = 1;
    };

    size();
    seed();
    drawRef.current = draw;

    if (reduced) {
      draw();
      return () => {};
    }

    const tick = () => {
      stepNodes(nodes, width, height, pointer);
      draw();
      rafId = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (rafId === null) rafId = requestAnimationFrame(tick);
          } else if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Release the pull once the pointer leaves the canvas rect — otherwise nodes stay
      // clamped toward the last in-bounds position even after the cursor moves away.
      pointer = x >= 0 && x <= width && y >= 0 && y <= height ? { x, y } : null;
    };
    window.addEventListener("pointermove", onPointerMove);

    const ro = new ResizeObserver(() => {
      size();
      // Only re-seed when the target node count actually changes (a real breakpoint
      // crossing). A same-count resize — e.g. a mobile URL bar collapsing the viewport
      // height by a few dozen px on every scroll — just clamps the existing nodes into
      // the new bounds instead of re-randomising the whole network.
      const nextCount = nodeCountFor(width);
      if (nextCount !== nodeCount) {
        seed();
      } else {
        clampNodes(nodes, width, height);
      }
    });
    ro.observe(canvas);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("absolute inset-0 h-full w-full", className)} />;
}
