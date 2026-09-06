"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { useThemeColors } from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";
import { EDGE_DIST, type Node, nodeCountFor, seedNodes, stepNodes } from "./network";

export function NetworkCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionPref();
  const colors = useThemeColors();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let nodes: Node[] = [];
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
      nodes = seedNodes(nodeCountFor(width), width, height);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = colors.accent;
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
      ctx.fillStyle = colors.fg;
      ctx.globalAlpha = 0.7;
      for (const n of nodes) ctx.fillRect(n.x - 0.75, n.y - 0.75, 1.5, 1.5);
      ctx.globalAlpha = 1;
    };

    size();
    seed();

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
      seed();
    });
    ro.observe(canvas);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reduced, colors]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("absolute inset-0 h-full w-full", className)} />;
}
