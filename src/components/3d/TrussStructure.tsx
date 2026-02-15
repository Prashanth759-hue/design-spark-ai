import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DesignParams } from "@/lib/parseDesignParams";

export function TrussStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
  });

  const span = params.beamLength;
  const trussH = params.beamHeight * 2.5;
  const trussD = params.beamWidth;
  const segments = Math.max(4, Math.round(span / 0.8));
  const segLen = span / segments;
  const memberR = 0.03;

  return (
    <group ref={groupRef}>
      {/* Top chord */}
      <mesh position={[0, 0.5 + trussH, 0]}>
        <boxGeometry args={[span, memberR * 2.5, trussD]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Bottom chord */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[span, memberR * 2.5, trussD]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Vertical and diagonal web members */}
      {Array.from({ length: segments + 1 }).map((_, i) => {
        const x = -span / 2 + i * segLen;
        return (
          <group key={`seg-${i}`}>
            {/* Vertical */}
            <mesh position={[x, 0.5 + trussH / 2, 0]}>
              <cylinderGeometry args={[memberR, memberR, trussH, 8]} />
              <meshStandardMaterial color={params.columnColor} metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Diagonal (alternating direction) */}
            {i < segments && (
              <mesh
                position={[x + segLen / 2, 0.5 + trussH / 2, 0]}
                rotation={[0, 0, Math.atan2(trussH, segLen) * (i % 2 === 0 ? 1 : -1)]}
              >
                <cylinderGeometry args={[memberR * 0.8, memberR * 0.8, Math.sqrt(segLen ** 2 + trussH ** 2), 8]} />
                <meshStandardMaterial color={params.materialColor} metalness={0.5} roughness={0.5} opacity={0.85} transparent />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Depth cross-braces (front & back faces) */}
      {[-1, 1].map((side) => (
        <group key={`face-${side}`}>
          {Array.from({ length: segments + 1 }).map((_, i) => {
            const x = -span / 2 + i * segLen;
            return (
              <mesh key={`vf-${i}`} position={[x, 0.5 + trussH / 2, side * trussD * 0.48]}>
                <cylinderGeometry args={[memberR * 0.6, memberR * 0.6, trussH, 6]} />
                <meshStandardMaterial color={params.columnColor} metalness={0.5} roughness={0.5} opacity={0.6} transparent />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Support columns at ends */}
      {[-span / 2, span / 2].map((x, i) => (
        <group key={`support-${i}`}>
          <mesh position={[x, 0.5 - params.columnHeight / 2, 0]}>
            <boxGeometry args={[params.columnWidth, params.columnHeight, params.columnWidth]} />
            <meshStandardMaterial color={params.columnColor} metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Base plate */}
          <mesh position={[x, 0.5 - params.columnHeight - 0.05, 0]}>
            <boxGeometry args={[params.columnWidth * 2, 0.1, params.columnWidth * 2]} />
            <meshStandardMaterial color={params.baseColor} metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Gusset plates at joints (top chord) */}
      {Array.from({ length: segments + 1 }).map((_, i) => {
        const x = -span / 2 + i * segLen;
        return (
          <mesh key={`gusset-${i}`} position={[x, 0.5 + trussH, 0]}>
            <boxGeometry args={[0.08, 0.08, trussD * 0.6]} />
            <meshStandardMaterial color={params.baseColor} metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}
