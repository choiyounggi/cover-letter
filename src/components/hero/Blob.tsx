"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ThemeColors } from "@/hooks/useThemeColors";
import { easeTowards, nextMorphDelayMs, nextMorphTarget } from "./motion-prefs";
import { BLOB_FRAGMENT, BLOB_VERTEX } from "./shaders";

export function Blob({ colors, morph }: { colors: ThemeColors; morph: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const morphTarget = useRef(0);
  const invalidate = useThree((state) => state.invalidate);

  // D3: uniforms live in a ref, mutated in place every frame inside useFrame
  // rather than through React component state — the standard R3F/Three.js
  // imperative uniform pattern, avoiding 60 setState calls/sec (D3's actual
  // requirement; every official three-fiber uniform example mutates this
  // way). React's initial value expression here (including the one-time
  // Math.random() seed) is only ever consulted on the first render — React
  // discards it on every later render — so reading .current for the initial
  // ShaderMaterial construction, and calling Math.random() to seed it, are
  // both safe despite the generic react-hooks/refs and react-hooks/purity
  // render-purity rules (aimed at React's own render/commit cycle, which
  // useFrame's R3F-driven render loop runs entirely outside of).
  /* eslint-disable react-hooks/refs, react-hooks/purity */
  const uniforms = useRef({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
    uMorph: { value: 0 },
    uSeed: { value: Math.random() * 1000 },
    uColorA: { value: new THREE.Color(colors.accent) },
    uColorB: { value: new THREE.Color(colors.fg) },
    uBg: { value: new THREE.Color(colors.bg) },
  }).current;
  /* eslint-enable react-hooks/refs, react-hooks/purity */

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!morph) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = () => {
      const delay = nextMorphDelayMs();
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          morphTarget.current = nextMorphTarget();
          timers.push(
            setTimeout(() => {
              if (cancelled) return;
              morphTarget.current = 0;
              schedule();
            }, 1200),
          );
        }, delay),
      );
    };
    schedule();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [morph]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    (material.uniforms.uColorA.value as THREE.Color).set(colors.accent);
    (material.uniforms.uColorB.value as THREE.Color).set(colors.fg);
    (material.uniforms.uBg.value as THREE.Color).set(colors.bg);
    // D10's "invalidate() once" only covers the initial static frame; under
    // frameloop="demand" (reduced motion or out of view) nothing else would
    // ever request another paint, so a theme change would silently never
    // repaint the canvas without this.
    invalidate();
  }, [colors, invalidate]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    uniforms.uTime.value += delta;

    const pointerVec = uniforms.uMouse.value as THREE.Vector2;
    mouse.current.x += (state.pointer.x - mouse.current.x) * 0.05;
    mouse.current.y += (state.pointer.y - mouse.current.y) * 0.05;
    pointerVec.set(mouse.current.x, mouse.current.y);

    uniforms.uScroll.value = scrollRef.current;
    uniforms.uMorph.value = easeTowards(uniforms.uMorph.value, morphTarget.current, 0.03);
  });

  return (
    <mesh>
      <icosahedronGeometry args={[1.6, 48]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={BLOB_VERTEX}
        fragmentShader={BLOB_FRAGMENT}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
