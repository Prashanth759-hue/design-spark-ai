import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { DesignParams } from "@/lib/parseDesignParams";

export function BeamStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  const colSpacing = params.beamLength * 0.375;
  const braceSpacing = params.beamLength * 0.1875;
  const colY = -(params.columnHeight / 2) + params.beamHeight / 2;
  const baseY = -params.columnHeight + params.beamHeight / 2 - 0.05;

  // I-beam flange geometry
  const flangeH = params.beamHeight * 0.15;
  const webW = params.beamWidth * 0.12;

  return (
    <group ref={groupRef}>
      {/* I-Beam: Top flange */}
      <RoundedBox args={[params.beamLength, flangeH, params.beamWidth]} radius={0.01} position={[0, 0.5 + params.beamHeight / 2 - flangeH / 2, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={params.materialColor} metalness={0.85} roughness={0.15} clearcoat={0.3} clearcoatRoughness={0.2} envMapIntensity={1.2} />
      </RoundedBox>

      {/* I-Beam: Bottom flange */}
      <RoundedBox args={[params.beamLength, flangeH, params.beamWidth]} radius={0.01} position={[0, 0.5 - params.beamHeight / 2 + flangeH / 2, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={params.materialColor} metalness={0.85} roughness={0.15} clearcoat={0.3} clearcoatRoughness={0.2} envMapIntensity={1.2} />
      </RoundedBox>

      {/* I-Beam: Web */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[params.beamLength, params.beamHeight - flangeH * 2, webW]} />
        <meshPhysicalMaterial color={params.materialColor} metalness={0.8} roughness={0.2} envMapIntensity={1} />
      </mesh>

      {/* Stiffener plates along beam */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = -params.beamLength * 0.4 + i * params.beamLength * 0.2;
        return (
          <mesh key={`stiff-${i}`} position={[x, 0.5, 0]} castShadow>
            <boxGeometry args={[0.02, params.beamHeight * 0.85, params.beamWidth * 0.9]} />
            <meshPhysicalMaterial color={params.columnColor} metalness={0.75} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Columns with H-profile look */}
      {[-colSpacing, colSpacing].map((x, i) => (
        <group key={i} position={[x, 0.5 + colY, 0]}>
          <RoundedBox args={[params.columnWidth, params.columnHeight, params.columnWidth]} radius={0.008} castShadow receiveShadow>
            <meshPhysicalMaterial color={params.columnColor} metalness={0.75} roughness={0.25} envMapIntensity={0.9} />
          </RoundedBox>
          {/* Column cap plate */}
          <mesh position={[0, params.columnHeight / 2 + 0.02, 0]} castShadow>
            <boxGeometry args={[params.columnWidth * 1.4, 0.03, params.columnWidth * 1.4]} />
            <meshPhysicalMaterial color={params.baseColor} metalness={0.8} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Diagonal braces with cylindrical members */}
      {[-braceSpacing, braceSpacing].map((x, i) => {
        const angle = (Math.PI / 6) * (i === 0 ? 1 : -1);
        return (
          <mesh key={`brace-${i}`} position={[x, 0.5 + colY * 0.5, 0]} rotation={[0, 0, angle]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, params.columnHeight * 0.8, 12]} />
            <meshPhysicalMaterial color={params.materialColor} metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Foundation base */}
      <RoundedBox args={[params.beamLength * 1.1, 0.12, params.beamWidth * 1.5]} radius={0.02} position={[0, 0.5 + baseY, 0]} receiveShadow>
        <meshPhysicalMaterial color={params.baseColor} metalness={0.6} roughness={0.4} envMapIntensity={0.7} />
      </RoundedBox>

      {/* Bolt details on base */}
      {[-colSpacing, colSpacing].map((x, ci) =>
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dz], bi) => (
          <mesh key={`bolt-${ci}-${bi}`} position={[x + dx * params.columnWidth * 0.5, 0.5 + baseY + 0.07, dz * params.columnWidth * 0.5]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.025, 8]} />
            <meshPhysicalMaterial color="#94a3b8" metalness={0.95} roughness={0.05} />
          </mesh>
        ))
      )}
    </group>
  );
}
