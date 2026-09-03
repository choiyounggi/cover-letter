"use client";

import { useReducedMotion } from "motion/react";

export function useReducedMotionPref(): boolean {
  return useReducedMotion() ?? false;
}
