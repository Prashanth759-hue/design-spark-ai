import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DesignParams } from "@/lib/parseDesignParams";

export function CarStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  const wb = params.wheelbase || 2.85;
  const tw = params.trackWidth || 1.58;
  const gc = params.groundClearance || 0.145;
  const bodyLen = wb * 1.6;
  const bodyW = tw * 1.05;
  const bodyH = 0.35;
  const cabinH = 0.55;
  const wheelR = 0.33;
  const wheelW = 0.22;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2, wheelR + gc * 0.3, tw / 2],
    [-wb / 2, wheelR + gc * 0.3, -tw / 2],
    [wb / 2, wheelR + gc * 0.3, tw / 2],
    [wb / 2, wheelR + gc * 0.3, -tw / 2],
  ];

  const bodyY = wheelR + gc * 0.3 + bodyH / 2 + 0.1;
  const cabinY = bodyY + bodyH / 2 + cabinH / 2 - 0.05;

  return (
    <group ref={groupRef}>
      {/* Underbody */}
      <mesh position={[0, bodyY - bodyH / 2 - 0.06, 0]}>
        <boxGeometry args={[wb * 1.1, 0.08, bodyW * 0.85]} />
        <meshStandardMaterial color={params.baseColor} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, bodyY, 0]}>
        <boxGeometry args={[bodyLen, bodyH, bodyW]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Front hood */}
      <mesh position={[-bodyLen * 0.32, bodyY + bodyH * 0.15, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[bodyLen * 0.28, bodyH * 0.4, bodyW * 0.95]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0.15, cabinY, 0]}>
        <boxGeometry args={[wb * 0.62, cabinH, bodyW * 0.88]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.1} opacity={0.7} transparent />
      </mesh>
      {/* Windshield */}
      <mesh position={[-wb * 0.18, cabinY + 0.05, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[cabinH * 0.7, 0.03, bodyW * 0.82]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.1} roughness={0.05} opacity={0.5} transparent />
      </mesh>
      {/* Rear glass */}
      <mesh position={[wb * 0.32, cabinY + 0.02, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[cabinH * 0.55, 0.03, bodyW * 0.78]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.1} roughness={0.05} opacity={0.5} transparent />
      </mesh>
      {/* Spoiler */}
      <mesh position={[bodyLen * 0.46, bodyY + bodyH * 0.25, 0]}>
        <boxGeometry args={[0.12, 0.08, bodyW * 0.7]} />
        <meshStandardMaterial color={params.columnColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Front light bar */}
      <mesh position={[-bodyLen * 0.49, bodyY + bodyH * 0.1, 0]}>
        <boxGeometry args={[0.04, 0.06, bodyW * 0.85]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>
      {/* Rear light bar */}
      <mesh position={[bodyLen * 0.49, bodyY + bodyH * 0.1, 0]}>
        <boxGeometry args={[0.04, 0.06, bodyW * 0.8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>
      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[wheelR, wheelW * 0.45, 16, 32]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[wheelR * 0.6, wheelR * 0.6, wheelW * 0.5, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
      {/* Side skirts */}
      {[-1, 1].map((side) => (
        <mesh key={`skirt-${side}`} position={[0, bodyY - bodyH * 0.4, side * bodyW * 0.5]}>
          <boxGeometry args={[bodyLen * 0.75, 0.05, 0.03]} />
          <meshStandardMaterial color={params.columnColor} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
