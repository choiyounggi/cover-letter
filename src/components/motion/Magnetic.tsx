"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { type PointerEvent, type ReactNode, useRef } from "react";
import { magneticOffset } from "./magnetic-offset";

export function Magnetic({
  children,
  radius = 80,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  radius?: number;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 200, damping: 20 });
  const y = useSpring(rawY, { stiffness: 200, damping: 20 });

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const { x: ox, y: oy } = magneticOffset(e.clientX - cx, e.clientY - cy, radius, strength);
    rawX.set(ox);
    rawY.set(oy);
  };

  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      data-cursor="hover"
      className={className}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </motion.div>
  );
}
