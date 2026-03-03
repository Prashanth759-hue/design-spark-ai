import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function Skyscraper({ floors = 20, color = "#64748b", autoRotate = true }: {
  floors?: number; color?: string; autoRotate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.06;
  });

  const floorH = 0.18;
  const totalH = floors * floorH;
  const baseW = 1.2;
  const baseD = 0.9;
  const baseY = -totalH / 2;

  // Tapered design - narrows toward top
  const getWidth = (f: number) => baseW * (1 - f / floors * 0.2);
  const getDepth = (f: number) => baseD * (1 - f / floors * 0.15);

  return (
    <group ref={groupRef}>
      {/* Foundation */}
      <RoundedBox args={[baseW * 1.4, 0.15, baseD * 1.4]} radius={0.03}
        position={[0, baseY - 0.08, 0]} receiveShadow>
        <meshPhysicalMaterial color="#44403c" metalness={0.2} roughness={0.8} />
      </RoundedBox>

      {/* Floor slabs & glass curtain wall */}
      {Array.from({ length: floors }).map((_, f) => {
        const y = baseY + f * floorH;
        const w = getWidth(f);
        const d = getDepth(f);
        return (
          <group key={f}>
            {/* Slab */}
            <mesh position={[0, y + floorH, 0]} castShadow>
              <boxGeometry args={[w, 0.02, d]} />
              <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.5} />
            </mesh>

            {/* Glass panels - front & back */}
            <mesh position={[0, y + floorH / 2 + 0.01, d / 2 + 0.005]}>
              <boxGeometry args={[w * 0.95, floorH * 0.75, 0.01]} />
              <meshPhysicalMaterial color="#60a5fa" metalness={0.1} roughness={0.02}
                transmission={0.4} thickness={0.3} ior={1.5} envMapIntensity={2} opacity={0.8} transparent />
            </mesh>
            <mesh position={[0, y + floorH / 2 + 0.01, -d / 2 - 0.005]}>
              <boxGeometry args={[w * 0.95, floorH * 0.75, 0.01]} />
              <meshPhysicalMaterial color="#60a5fa" metalness={0.1} roughness={0.02}
                transmission={0.4} thickness={0.3} ior={1.5} envMapIntensity={2} opacity={0.8} transparent />
            </mesh>

            {/* Glass panels - sides */}
            <mesh position={[w / 2 + 0.005, y + floorH / 2 + 0.01, 0]}>
              <boxGeometry args={[0.01, floorH * 0.75, d * 0.95]} />
              <meshPhysicalMaterial color="#60a5fa" metalness={0.1} roughness={0.02}
                transmission={0.4} thickness={0.3} ior={1.5} envMapIntensity={2} opacity={0.8} transparent />
            </mesh>
            <mesh position={[-w / 2 - 0.005, y + floorH / 2 + 0.01, 0]}>
              <boxGeometry args={[0.01, floorH * 0.75, d * 0.95]} />
              <meshPhysicalMaterial color="#60a5fa" metalness={0.1} roughness={0.02}
                transmission={0.4} thickness={0.3} ior={1.5} envMapIntensity={2} opacity={0.8} transparent />
            </mesh>

            {/* Mullions */}
            {[-0.3, 0, 0.3].filter(x => Math.abs(x) < w / 2).map((x, mi) => (
              <mesh key={mi} position={[x, y + floorH / 2 + 0.01, d / 2 + 0.008]}>
                <boxGeometry args={[0.01, floorH * 0.8, 0.005]} />
                <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.3} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Crown / antenna */}
      <mesh position={[0, baseY + totalH + 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.005, 0.6, 8]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Ground */}
      <mesh position={[0, baseY - 0.16, 0]} receiveShadow>
        <boxGeometry args={[baseW * 3, 0.01, baseD * 3]} />
        <meshPhysicalMaterial color="#4ade80" metalness={0} roughness={0.95} />
      </mesh>
    </group>
  );
}
