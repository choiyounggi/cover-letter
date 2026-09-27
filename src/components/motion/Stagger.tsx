"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

export type StaggerTag = "div" | "ul" | "li" | "span" | "ol";
export type StaggerFrom = "up" | "left" | "scale";

type PresetTarget = { opacity: number; x?: number; y?: number; scale?: number };

const FROM_PRESETS: Record<StaggerFrom, { hidden: PresetTarget; visible: PresetTarget }> = {
  up: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } },
};

const ITEM_TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };

const StaggerFromContext = createContext<StaggerFrom>("up");

export function StaggerGroup({
  as = "div",
  from = "up",
  stagger = 0.06,
  delay = 0,
  once = true,
  className,
  children,
}: {
  as?: StaggerTag;
  from?: StaggerFrom;
  stagger?: number;
  delay?: number;
  once?: boolean;
  className?: string;
  children?: ReactNode;
}): React.JSX.Element {
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
  const viewport = { once, margin: "-10% 0px" };
  const content = <StaggerFromContext.Provider value={from}>{children}</StaggerFromContext.Provider>;

  switch (as) {
    case "ul":
      return (
        <motion.ul className={className} variants={variants} initial="hidden" whileInView="visible" viewport={viewport}>
          {content}
        </motion.ul>
      );
    case "li":
      return (
        <motion.li className={className} variants={variants} initial="hidden" whileInView="visible" viewport={viewport}>
          {content}
        </motion.li>
      );
    case "span":
      return (
        <motion.span className={className} variants={variants} initial="hidden" whileInView="visible" viewport={viewport}>
          {content}
        </motion.span>
      );
    case "ol":
      return (
        <motion.ol className={className} variants={variants} initial="hidden" whileInView="visible" viewport={viewport}>
          {content}
        </motion.ol>
      );
    default:
      return (
        <motion.div className={className} variants={variants} initial="hidden" whileInView="visible" viewport={viewport}>
          {content}
        </motion.div>
      );
  }
}

export function StaggerItem({
  as = "div",
  className,
  children,
}: {
  as?: StaggerTag;
  className?: string;
  children?: ReactNode;
}): React.JSX.Element {
  const from = useContext(StaggerFromContext);
  const reducedMotion = useReducedMotionPref();
  const preset = FROM_PRESETS[from];
  const variants: Variants = reducedMotion
    ? { hidden: preset.visible, visible: preset.visible }
    : { hidden: preset.hidden, visible: { ...preset.visible, transition: ITEM_TRANSITION } };

  switch (as) {
    case "ul":
      return (
        <motion.ul className={className} variants={variants}>
          {children}
        </motion.ul>
      );
    case "li":
      return (
        <motion.li className={className} variants={variants}>
          {children}
        </motion.li>
      );
    case "span":
      return (
        <motion.span className={className} variants={variants}>
          {children}
        </motion.span>
      );
    case "ol":
      return (
        <motion.ol className={className} variants={variants}>
          {children}
        </motion.ol>
      );
    default:
      return (
        <motion.div className={className} variants={variants}>
          {children}
        </motion.div>
      );
  }
}
