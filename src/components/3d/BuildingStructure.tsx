import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DesignParams } from "@/lib/parseDesignParams";

export function BuildingStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  const width = params.beamWidth * 3;
  const depth = params.beamWidth * 2.5;
  const floors = Math.max(2, Math.round(params.columnHeight * 3));
  const floorH = 0.6;
  const totalH = floors * floorH;
  const baseY = -totalH / 2;

  return (
    <group ref={groupRef}>
      {/* Foundation */}
      <mesh position={[0, baseY - 0.1, 0]}>
        <boxGeometry args={[width * 1.15, 0.2, depth * 1.15]} />
        <meshStandardMaterial color={params.baseColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Floor slabs & columns per floor */}
      {Array.from({ length: floors }).map((_, f) => {
        const y = baseY + f * floorH;
        return (
          <group key={`floor-${f}`}>
            {/* Floor slab */}
            <mesh position={[0, y + floorH, 0]}>
              <boxGeometry args={[width, 0.08, depth]} />
              <meshStandardMaterial color={params.materialColor} metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Corner columns */}
            {[
              [-width * 0.42, -depth * 0.42],
              [width * 0.42, -depth * 0.42],
              [-width * 0.42, depth * 0.42],
              [width * 0.42, depth * 0.42],
            ].map(([cx, cz], ci) => (
              <mesh key={`col-${f}-${ci}`} position={[cx, y + floorH / 2 + 0.04, cz]}>
                <boxGeometry args={[0.12, floorH - 0.08, 0.12]} />
                <meshStandardMaterial color={params.columnColor} metalness={0.6} roughness={0.4} />
              </mesh>
            ))}

            {/* Windows (front face) */}
            {Array.from({ length: 3 }).map((_, w) => {
              const wx = -width * 0.25 + w * width * 0.25;
              return (
                <mesh key={`win-${f}-${w}`} position={[wx, y + floorH / 2 + 0.04, -depth * 0.5 - 0.01]}>
                  <boxGeometry args={[width * 0.18, floorH * 0.5, 0.02]} />
                  <meshStandardMaterial color="#38bdf8" metalness={0.1} roughness={0.05} opacity={0.4} transparent />
                </mesh>
              );
            })}

            {/* Windows (side face) */}
            {Array.from({ length: 2 }).map((_, w) => {
              const wz = -depth * 0.2 + w * depth * 0.4;
              return (
                <mesh key={`swin-${f}-${w}`} position={[width * 0.5 + 0.01, y + floorH / 2 + 0.04, wz]}>
                  <boxGeometry args={[0.02, floorH * 0.5, depth * 0.2]} />
                  <meshStandardMaterial color="#38bdf8" metalness={0.1} roughness={0.05} opacity={0.4} transparent />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Roof */}
      <mesh position={[0, baseY + totalH + 0.12, 0]}>
        <boxGeometry args={[width * 1.05, 0.1, depth * 1.05]} />
        <meshStandardMaterial color={params.columnColor} metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Roof equipment (AC units etc) */}
      {[[-0.3, -0.2], [0.3, 0.15]].map(([rx, rz], ri) => (
        <mesh key={`roof-eq-${ri}`} position={[rx, baseY + totalH + 0.25, rz]}>
          <boxGeometry args={[0.25, 0.15, 0.2]} />
          <meshStandardMaterial color={params.baseColor} metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* Entrance */}
      <mesh position={[0, baseY + 0.3, -depth * 0.5 - 0.02]}>
        <boxGeometry args={[width * 0.25, 0.5, 0.03]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.1} roughness={0.05} opacity={0.5} transparent />
      </mesh>
    </group>
  );
}
