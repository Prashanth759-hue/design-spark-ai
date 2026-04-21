import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function Skyscraper({ floors = 20, color = "#64748b", autoRotate = true }: {
  floors?: number; color?: string; autoRotate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.04;
  });

  const floorH = 0.16;
  const totalH = floors * floorH;
  const baseW = 1.3;
  const baseD = 1.0;
  const baseY = -totalH / 2;

  // Pre-computed lit window pattern — stable across re-renders
  const litMask = useMemo(() => {
    const arr: boolean[][] = [];
    for (let f = 0; f < floors; f++) {
      const row: boolean[] = [];
      for (let i = 0; i < 16; i++) row.push(Math.random() < 0.32);
      arr.push(row);
    }
    return arr;
  }, [floors]);

  // Setback taper for realism
  const getWidth = (f: number) => {
    const ratio = f / floors;
    if (ratio > 0.85) return baseW * 0.6; // Crown
    if (ratio > 0.7) return baseW * 0.75;
    return baseW * (1 - ratio * 0.15);
  };
  const getDepth = (f: number) => {
    const ratio = f / floors;
    if (ratio > 0.85) return baseD * 0.6;
    if (ratio > 0.7) return baseD * 0.75;
    return baseD * (1 - ratio * 0.12);
  };

  return (
    <group ref={groupRef}>
      {/* Foundation / podium */}
      <RoundedBox args={[baseW * 1.5, 0.2, baseD * 1.5]} radius={0.04}
        position={[0, baseY - 0.1, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial color="#44403c" metalness={0.25} roughness={0.75} />
      </RoundedBox>
      {/* Podium detail */}
      <mesh position={[0, baseY + 0.02, 0]} castShadow>
        <boxGeometry args={[baseW * 1.3, 0.04, baseD * 1.3]} />
        <meshPhysicalMaterial color="#525252" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Floor slabs & curtain wall */}
      {Array.from({ length: floors }).map((_, f) => {
        const y = baseY + f * floorH;
        const w = getWidth(f);
        const d = getDepth(f);
        const isSetback = (f === Math.floor(floors * 0.7)) || (f === Math.floor(floors * 0.85));
        const ratio = f / floors;

        // Glass tint varies by height
        const glassColor = ratio > 0.7 ? "#93c5fd" : ratio > 0.4 ? "#60a5fa" : "#3b82f6";
        const glassOpacity = 0.75 + ratio * 0.15;
        const litCount = litMask[f]?.filter(Boolean).length ?? 0;

        return (
          <group key={f}>
            {/* Slab - thicker at setback levels */}
            <mesh position={[0, y + floorH, 0]} castShadow>
              <boxGeometry args={[w + 0.02, isSetback ? 0.035 : 0.018, d + 0.02]} />
              <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Glass curtain wall - all 4 sides */}
            {/* Front */}
            <mesh position={[0, y + floorH / 2 + 0.009, d / 2 + 0.006]}>
              <boxGeometry args={[w * 0.96, floorH * 0.78, 0.008]} />
              <meshPhysicalMaterial color={glassColor} metalness={0.12} roughness={0.02}
                transmission={0.55} thickness={0.3} ior={1.52} envMapIntensity={4}
                clearcoat={1} clearcoatRoughness={0.02}
                opacity={glassOpacity} transparent />
            </mesh>
            {/* Back */}
            <mesh position={[0, y + floorH / 2 + 0.009, -d / 2 - 0.006]}>
              <boxGeometry args={[w * 0.96, floorH * 0.78, 0.008]} />
              <meshPhysicalMaterial color={glassColor} metalness={0.12} roughness={0.02}
                transmission={0.55} thickness={0.3} ior={1.52} envMapIntensity={4}
                clearcoat={1} clearcoatRoughness={0.02}
                opacity={glassOpacity} transparent />
            </mesh>
            {/* Left */}
            <mesh position={[w / 2 + 0.006, y + floorH / 2 + 0.009, 0]}>
              <boxGeometry args={[0.008, floorH * 0.78, d * 0.96]} />
              <meshPhysicalMaterial color={glassColor} metalness={0.12} roughness={0.02}
                transmission={0.55} thickness={0.3} ior={1.52} envMapIntensity={4}
                clearcoat={1} clearcoatRoughness={0.02}
                opacity={glassOpacity} transparent />
            </mesh>
            {/* Right */}
            <mesh position={[-w / 2 - 0.006, y + floorH / 2 + 0.009, 0]}>
              <boxGeometry args={[0.008, floorH * 0.78, d * 0.96]} />
              <meshPhysicalMaterial color={glassColor} metalness={0.12} roughness={0.02}
                transmission={0.55} thickness={0.3} ior={1.52} envMapIntensity={4}
                clearcoat={1} clearcoatRoughness={0.02}
                opacity={glassOpacity} transparent />
            </mesh>

            {/* Lit windows — emissive warm yellow squares behind the glass */}
            {litMask[f]?.map((lit, i) => {
              if (!lit) return null;
              // distribute across 4 sides
              const side = i % 4;
              const idxOnSide = Math.floor(i / 4); // 0..3
              const t = (idxOnSide + 1) / 5; // 0.2 .. 0.8
              const wOff = -w * 0.4 + t * w * 0.8;
              const dOff = -d * 0.4 + t * d * 0.8;
              let pos: [number, number, number] = [0, y + floorH / 2 + 0.005, 0];
              if (side === 0) pos = [wOff, y + floorH / 2, d / 2 + 0.002];
              if (side === 1) pos = [wOff, y + floorH / 2, -d / 2 - 0.002];
              if (side === 2) pos = [w / 2 + 0.002, y + floorH / 2, dOff];
              if (side === 3) pos = [-w / 2 - 0.002, y + floorH / 2, dOff];
              return (
                <mesh key={`lit-${i}`} position={pos}>
                  <boxGeometry args={
                    side < 2
                      ? [w * 0.08, floorH * 0.55, 0.002]
                      : [0.002, floorH * 0.55, d * 0.08]
                  } />
                  <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={1.4} toneMapped={false} />
                </mesh>
              );
            })}
            {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
            {(() => { void litCount; return null; })()}

            {/* Vertical mullions - front & back */}
            {Array.from({ length: Math.max(3, Math.round(w / 0.35)) }).map((_, mi) => {
              const mx = -w * 0.45 + mi * (w * 0.9 / Math.max(2, Math.round(w / 0.35) - 1));
              if (Math.abs(mx) > w / 2) return null;
              return (
                <group key={`m-${mi}`}>
                  <mesh position={[mx, y + floorH / 2 + 0.009, d / 2 + 0.01]}>
                    <boxGeometry args={[0.008, floorH * 0.82, 0.004]} />
                    <meshPhysicalMaterial color={color} metalness={0.65} roughness={0.25} />
                  </mesh>
                  <mesh position={[mx, y + floorH / 2 + 0.009, -d / 2 - 0.01]}>
                    <boxGeometry args={[0.008, floorH * 0.82, 0.004]} />
                    <meshPhysicalMaterial color={color} metalness={0.65} roughness={0.25} />
                  </mesh>
                </group>
              );
            })}

            {/* Corner columns */}
            {[[-w/2, -d/2], [w/2, -d/2], [-w/2, d/2], [w/2, d/2]].map(([cx, cz], ci) => (
              <mesh key={`col-${ci}`} position={[cx, y + floorH / 2 + 0.009, cz]} castShadow>
                <boxGeometry args={[0.025, floorH * 0.85, 0.025]} />
                <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.3} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Crown / architectural top */}
      {(() => {
        const crownY = baseY + totalH;
        const crownW = getWidth(floors - 1) * 0.7;
        return (
          <group>
            {/* Spire base */}
            <mesh position={[0, crownY + 0.05, 0]} castShadow>
              <boxGeometry args={[crownW * 0.5, 0.1, crownW * 0.5]} />
              <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Rooftop antenna array */}
            {[[0.06, 0.06], [-0.06, 0.06], [0.06, -0.06], [-0.06, -0.06]].map(([ax, az], i) => (
              <mesh key={`ant-${i}`} position={[ax, crownY + 0.18, az]}>
                <cylinderGeometry args={[0.004, 0.004, 0.16, 6]} />
                <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.3} />
              </mesh>
            ))}
            {/* HVAC unit on roof */}
            <mesh position={[crownW * 0.15, crownY + 0.075, -crownW * 0.1]} castShadow>
              <boxGeometry args={[crownW * 0.18, 0.05, crownW * 0.18]} />
              <meshPhysicalMaterial color="#a8a29e" metalness={0.4} roughness={0.55} />
            </mesh>
            {/* Spire */}
            <mesh position={[0, crownY + 0.4, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.003, 0.7, 8]} />
              <meshPhysicalMaterial color="#d4d4d8" metalness={1} roughness={0.04} envMapIntensity={3} />
            </mesh>
            {/* Aviation light */}
            <mesh position={[0, crownY + 0.75, 0]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={6} toneMapped={false} />
            </mesh>
            <pointLight position={[0, crownY + 0.75, 0]} intensity={0.4} color="#ef4444" distance={2} />
          </group>
        );
      })()}

      {/* Entrance canopy */}
      <mesh position={[0, baseY + 0.06, baseD * 0.75 + 0.15]} castShadow>
        <boxGeometry args={[baseW * 0.4, 0.02, 0.3]} />
        <meshPhysicalMaterial color="#d4d4d8" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Entrance glass */}
      <mesh position={[0, baseY + floorH * 0.5, baseD * 0.5 + 0.008]}>
        <boxGeometry args={[baseW * 0.3, floorH * 0.85, 0.005]} />
        <meshPhysicalMaterial color="#93c5fd" transmission={0.6} thickness={0.2} ior={1.52} roughness={0.01} />
      </mesh>

      {/* Ground / plaza */}
      <mesh position={[0, baseY - 0.21, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[baseW * 4, baseD * 4]} />
        <meshPhysicalMaterial color="#1f2937" metalness={0.1} roughness={0.78} clearcoat={0.15} clearcoatRoughness={0.5} envMapIntensity={0.5} />
      </mesh>
      {/* Plaza paving lines */}
      {[-1, -0.5, 0.5, 1].map((px, i) => (
        <mesh key={`pv-${i}`} position={[px * baseW, baseY - 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.01, baseD * 3.8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      {/* Landscaping - small trees */}
      {[[-baseW, -baseD], [baseW, -baseD], [-baseW, baseD], [baseW, baseD]].map(([tx, tz], i) => (
        <group key={`tree-${i}`} position={[tx, baseY - 0.12, tz]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.15, 6]} />
            <meshPhysicalMaterial color="#5c3d1e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshPhysicalMaterial color="#22c55e" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
