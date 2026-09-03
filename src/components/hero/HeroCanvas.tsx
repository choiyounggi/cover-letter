"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Blob } from "./Blob";
import { motionPreferences } from "./motion-prefs";
import { Particles } from "./Particles";

function InvalidateOnDemand() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate]);
  return null;
}

export default function HeroCanvas({ inView }: { inView: boolean }) {
  const reduced = useReducedMotionPref();
  const colors = useThemeColors();
  const prefs = motionPreferences({ reduced, inView });

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={prefs.frameloop}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      {prefs.frameloop === "demand" && <InvalidateOnDemand />}
      <Blob colors={colors} morph={prefs.morph} />
      {prefs.particles && <Particles color={colors.fg} />}
    </Canvas>
  );
}
