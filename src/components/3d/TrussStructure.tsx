import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { DesignParams } from "@/lib/parseDesignParams";

export function TrussStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  const span = params.beamLength;
  const trussH = params.beamHeight * 2.5;
  const trussD = params.beamWidth;
  const segments = Math.max(4, Math.round(span / 0.8));
  const segLen = span / segments;
  const memberR = 0.028;

  return (
    <group ref={groupRef}>
      {/* Top chord — angle steel profile */}
      <mesh position={[0, 0.5 + trussH, 0]} castShadow>
        <boxGeometry args={[span + 0.02, memberR * 3, trussD * 0.12]} />
        <meshPhysicalMaterial color={params.materialColor} metalness={0.9} roughness={0.25} clearcoat={0.4} clearcoatRoughness={0.2} envMapIntensity={2.8} />
      </mesh>
      <mesh position={[0, 0.5 + trussH, 0]} castShadow>
        <boxGeometry args={[span + 0.02, trussD * 0.12, memberR * 3]} />
        <meshPhysicalMaterial color={params.materialColor} metalness={0.9} roughness={0.25} clearcoat={0.4} clearcoatRoughness={0.2} envMapIntensity={2.8} />
      </mesh>

      {/* Bottom chord */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[span + 0.02, memberR * 3, trussD * 0.12]} />
        <meshPhysicalMaterial color={params.materialColor} metalness={0.9} roughness={0.25} clearcoat={0.4} clearcoatRoughness={0.2} envMapIntensity={2.8} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[span + 0.02, trussD * 0.12, memberR * 3]} />
        <meshPhysicalMaterial color={params.materialColor} metalness={0.9} roughness={0.25} clearcoat={0.4} clearcoatRoughness={0.2} envMapIntensity={2.8} />
      </mesh>

      {/* Vertical and diagonal web members */}
      {Array.from({ length: segments + 1 }).map((_, i) => {
        const x = -span / 2 + i * segLen;
        return (
          <group key={`seg-${i}`}>
            {/* Vertical member */}
            <mesh position={[x, 0.5 + trussH / 2, 0]} castShadow>
              <cylinderGeometry args={[memberR, memberR, trussH, 12]} />
              <meshPhysicalMaterial color={params.columnColor} metalness={0.8} roughness={0.18} envMapIntensity={1} />
            </mesh>

            {/* Diagonal member — Warren-style */}
            {i < segments && (
              <mesh
                position={[x + segLen / 2, 0.5 + trussH / 2, 0]}
                rotation={[0, 0, Math.atan2(trussH, segLen) * (i % 2 === 0 ? 1 : -1)]}
                castShadow
              >
                <cylinderGeometry args={[memberR * 0.85, memberR * 0.85, Math.sqrt(segLen ** 2 + trussH ** 2), 12]} />
                <meshPhysicalMaterial color={params.materialColor} metalness={0.75} roughness={0.2} envMapIntensity={0.9} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Front & back face depth braces */}
      {[-1, 1].map((side) => (
        <group key={`face-${side}`}>
          {Array.from({ length: segments + 1 }).map((_, i) => {
            const x = -span / 2 + i * segLen;
            return (
              <mesh key={`vf-${i}`} position={[x, 0.5 + trussH / 2, side * trussD * 0.48]} castShadow>
                <cylinderGeometry args={[memberR * 0.6, memberR * 0.6, trussH, 10]} />
                <meshPhysicalMaterial color={params.columnColor} metalness={0.75} roughness={0.2} />
              </mesh>
            );
          })}
          {/* Horizontal lateral bracing */}
          {[0.5, 0.5 + trussH].map((y, yi) => (
            <mesh key={`lat-${side}-${yi}`} position={[0, y, side * trussD * 0.48]} castShadow>
              <boxGeometry args={[span, memberR * 2, memberR * 2]} />
              <meshPhysicalMaterial color={params.columnColor} metalness={0.8} roughness={0.15} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Cross bracing between front and back faces */}
      {Array.from({ length: Math.floor(segments / 2) }).map((_, i) => {
        const x = -span / 2 + (i * 2 + 1) * segLen;
        return (
          <group key={`xbrace-${i}`}>
            <mesh position={[x, 0.5 + trussH, 0]} castShadow>
              <boxGeometry args={[memberR * 2, memberR * 2, trussD * 0.96]} />
              <meshPhysicalMaterial color={params.baseColor} metalness={0.75} roughness={0.2} />
            </mesh>
            <mesh position={[x, 0.5, 0]} castShadow>
              <boxGeometry args={[memberR * 2, memberR * 2, trussD * 0.96]} />
              <meshPhysicalMaterial color={params.baseColor} metalness={0.75} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Gusset plates at top chord joints */}
      {Array.from({ length: segments + 1 }).map((_, i) => {
        const x = -span / 2 + i * segLen;
        return (
          <mesh key={`gusset-top-${i}`} position={[x, 0.5 + trussH, 0]} castShadow>
            <boxGeometry args={[0.09, 0.09, trussD * 0.55]} />
            <meshPhysicalMaterial color={params.baseColor} metalness={0.7} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Gusset plates at bottom chord joints */}
      {Array.from({ length: segments + 1 }).map((_, i) => {
        const x = -span / 2 + i * segLen;
        return (
          <mesh key={`gusset-bot-${i}`} position={[x, 0.5, 0]} castShadow>
            <boxGeometry args={[0.09, 0.09, trussD * 0.55]} />
            <meshPhysicalMaterial color={params.baseColor} metalness={0.7} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Support columns at ends */}
      {[-span / 2, span / 2].map((x, i) => (
        <group key={`support-${i}`}>
          <RoundedBox args={[params.columnWidth * 1.2, params.columnHeight, params.columnWidth * 1.2]} radius={0.01} position={[x, 0.5 - params.columnHeight / 2, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={params.columnColor} metalness={0.6} roughness={0.35} envMapIntensity={0.8} />
          </RoundedBox>
          {/* Base plate with bolts */}
          <RoundedBox args={[params.columnWidth * 2.2, 0.08, params.columnWidth * 2.2]} radius={0.01} position={[x, 0.5 - params.columnHeight - 0.04, 0]} receiveShadow>
            <meshPhysicalMaterial color={params.baseColor} metalness={0.7} roughness={0.2} />
          </RoundedBox>
          {/* Anchor bolts */}
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dz], bi) => (
            <mesh key={`bolt-${i}-${bi}`} position={[x + dx * params.columnWidth * 0.7, 0.5 - params.columnHeight + 0.01, dz * params.columnWidth * 0.7]}>
              <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
              <meshPhysicalMaterial color="#a1a1aa" metalness={0.95} roughness={0.05} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
