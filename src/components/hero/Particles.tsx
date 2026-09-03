"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 1200;

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function buildShellPositions(count: number): Float32Array {
  const rand = seededRandom(42);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3 + rand() * 3;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

export function Particles({ color }: { color: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => buildShellPositions(PARTICLE_COUNT), []);

  useFrame((_state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    points.rotation.y += delta * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} transparent opacity={0.6} blending={THREE.AdditiveBlending} color={color} />
    </points>
  );
}
