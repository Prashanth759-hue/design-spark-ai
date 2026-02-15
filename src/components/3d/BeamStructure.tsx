import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DesignParams } from "@/lib/parseDesignParams";

export function BeamStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
  });

  const colSpacing = params.beamLength * 0.375;
  const braceSpacing = params.beamLength * 0.1875;
  const colY = -(params.columnHeight / 2) + params.beamHeight / 2;
  const baseY = -params.columnHeight + params.beamHeight / 2 - 0.05;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[params.beamLength, params.beamHeight, params.beamWidth]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {[-colSpacing, colSpacing].map((x, i) => (
        <mesh key={i} position={[x, 0.5 + colY, 0]}>
          <boxGeometry args={[params.columnWidth, params.columnHeight, params.columnWidth]} />
          <meshStandardMaterial color={params.columnColor} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {[-braceSpacing, braceSpacing].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x, 0.5 + colY * 0.5, 0]} rotation={[0, 0, (Math.PI / 6) * (i === 0 ? 1 : -1)]}>
          <boxGeometry args={[0.08, params.columnHeight * 0.8, 0.08]} />
          <meshStandardMaterial color={params.materialColor} metalness={0.5} roughness={0.5} opacity={0.8} transparent />
        </mesh>
      ))}
      <mesh position={[0, 0.5 + baseY, 0]}>
        <boxGeometry args={[params.beamLength * 1.1, 0.1, params.beamWidth * 1.5]} />
        <meshStandardMaterial color={params.baseColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
