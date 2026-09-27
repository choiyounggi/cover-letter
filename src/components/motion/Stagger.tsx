"use client";

// contract: t1-motion-stagger owns the implementation — this stub fixes the
// signature that t2-timeline-motion and t3-experience-motion import; the
// bodies below are placeholders that render children without animation.

import { createElement, type ReactNode } from "react";

export type StaggerTag = "div" | "ul" | "li" | "span" | "ol";
export type StaggerFrom = "up" | "left" | "scale";

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
  void from;
  void stagger;
  void delay;
  void once;
  return createElement(as, { className }, children);
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
  return createElement(as, { className }, children);
}
