import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { DesignParams } from "@/lib/parseDesignParams";

export function CarStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;
  });

  const wb = params.wheelbase || 2.85;
  const tw = params.trackWidth || 1.58;
  const gc = params.groundClearance || 0.145;
  const bodyLen = wb * 1.6;
  const bodyW = tw * 1.05;
  const bodyH = 0.32;
  const cabinH = 0.5;
  const wheelR = 0.33;
  const wheelW = 0.22;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2, wheelR + gc * 0.3, tw / 2],
    [-wb / 2, wheelR + gc * 0.3, -tw / 2],
    [wb / 2, wheelR + gc * 0.3, tw / 2],
    [wb / 2, wheelR + gc * 0.3, -tw / 2],
  ];

  const bodyY = wheelR + gc * 0.3 + bodyH / 2 + 0.12;
  const cabinY = bodyY + bodyH / 2 + cabinH / 2 - 0.04;

  return (
    <group ref={groupRef}>
      {/* Underbody chassis */}
      <RoundedBox args={[wb * 1.15, 0.06, bodyW * 0.85]} radius={0.015} position={[0, bodyY - bodyH / 2 - 0.05, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
      </RoundedBox>

      {/* Main body panel */}
      <RoundedBox args={[bodyLen, bodyH, bodyW]} radius={0.06} position={[0, bodyY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={params.materialColor}
          metalness={0.75}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* Front hood — slightly curved via rotation */}
      <RoundedBox args={[bodyLen * 0.3, bodyH * 0.35, bodyW * 0.94]} radius={0.04} position={[-bodyLen * 0.32, bodyY + bodyH * 0.12, 0]} rotation={[0, 0, 0.12]} castShadow>
        <meshPhysicalMaterial color={params.materialColor} metalness={0.75} roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.5} />
      </RoundedBox>

      {/* Rear trunk */}
      <RoundedBox args={[bodyLen * 0.2, bodyH * 0.3, bodyW * 0.92]} radius={0.03} position={[bodyLen * 0.35, bodyY + bodyH * 0.08, 0]} rotation={[0, 0, -0.08]} castShadow>
        <meshPhysicalMaterial color={params.materialColor} metalness={0.75} roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.5} />
      </RoundedBox>

      {/* Cabin / greenhouse */}
      <RoundedBox args={[wb * 0.58, cabinH, bodyW * 0.86]} radius={0.05} position={[0.1, cabinY, 0]} castShadow>
        <meshPhysicalMaterial
          color="#0f172a"
          metalness={0.2}
          roughness={0.05}
          transmission={0.6}
          thickness={0.5}
          ior={1.5}
          envMapIntensity={2}
        />
      </RoundedBox>

      {/* Windshield */}
      <mesh position={[-wb * 0.2, cabinY + 0.04, 0]} rotation={[0, 0, 0.42]} castShadow>
        <boxGeometry args={[cabinH * 0.65, 0.015, bodyW * 0.8]} />
        <meshPhysicalMaterial color="#93c5fd" metalness={0.05} roughness={0.02} transmission={0.7} thickness={0.3} ior={1.52} envMapIntensity={2.5} />
      </mesh>

      {/* Rear glass */}
      <mesh position={[wb * 0.32, cabinY + 0.02, 0]} rotation={[0, 0, -0.48]}>
        <boxGeometry args={[cabinH * 0.5, 0.015, bodyW * 0.76]} />
        <meshPhysicalMaterial color="#93c5fd" metalness={0.05} roughness={0.02} transmission={0.7} thickness={0.3} ior={1.52} envMapIntensity={2.5} />
      </mesh>

      {/* Side windows */}
      {[-1, 1].map((side) => (
        <mesh key={`sidewin-${side}`} position={[0.1, cabinY + 0.02, side * bodyW * 0.435]}>
          <boxGeometry args={[wb * 0.45, cabinH * 0.6, 0.012]} />
          <meshPhysicalMaterial color="#bfdbfe" metalness={0.05} roughness={0.02} transmission={0.65} thickness={0.3} ior={1.52} />
        </mesh>
      ))}

      {/* A-pillars */}
      {[-1, 1].map((side) => (
        <mesh key={`apillar-${side}`} position={[-wb * 0.17, cabinY, side * bodyW * 0.42]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.04, cabinH * 0.9, 0.04]} />
          <meshPhysicalMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Spoiler */}
      <RoundedBox args={[0.08, 0.05, bodyW * 0.65]} radius={0.015} position={[bodyLen * 0.46, bodyY + bodyH * 0.28, 0]} castShadow>
        <meshPhysicalMaterial color={params.columnColor} metalness={0.8} roughness={0.2} clearcoat={0.5} />
      </RoundedBox>

      {/* Front headlights — LED style */}
      {[-1, 1].map((side) => (
        <group key={`headlight-${side}`} position={[-bodyLen * 0.48, bodyY + bodyH * 0.05, side * bodyW * 0.35]}>
          <mesh>
            <boxGeometry args={[0.05, 0.08, 0.18]} />
            <meshPhysicalMaterial color="#e2e8f0" metalness={0.3} roughness={0.1} />
          </mesh>
          <mesh position={[-0.01, 0, 0]}>
            <boxGeometry args={[0.02, 0.04, 0.14]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
          </mesh>
        </group>
      ))}

      {/* DRL light bar */}
      <mesh position={[-bodyLen * 0.49, bodyY + bodyH * 0.12, 0]}>
        <boxGeometry args={[0.02, 0.025, bodyW * 0.6]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#e0f2fe" emissiveIntensity={2} />
      </mesh>

      {/* Rear tail lights */}
      {[-1, 1].map((side) => (
        <group key={`tail-${side}`} position={[bodyLen * 0.49, bodyY + bodyH * 0.05, side * bodyW * 0.32]}>
          <mesh>
            <boxGeometry args={[0.04, 0.07, 0.2]} />
            <meshPhysicalMaterial color="#7f1d1d" metalness={0.3} roughness={0.15} />
          </mesh>
          <mesh position={[0.01, 0, 0]}>
            <boxGeometry args={[0.02, 0.04, 0.16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
          </mesh>
        </group>
      ))}

      {/* Wheels with tire, rim, and brake disc */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Tire */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[wheelR, wheelW * 0.42, 24, 48]} />
            <meshPhysicalMaterial color="#1a1a1a" roughness={0.92} metalness={0.05} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[wheelR * 0.62, wheelR * 0.62, wheelW * 0.35, 24]} />
            <meshPhysicalMaterial color="#d4d4d8" metalness={0.95} roughness={0.05} clearcoat={0.8} envMapIntensity={2} />
          </mesh>
          {/* Rim spokes (simplified) */}
          {Array.from({ length: 5 }).map((_, si) => (
            <mesh key={`spoke-${si}`} rotation={[Math.PI / 2, 0, (si / 5) * Math.PI * 2]} castShadow>
              <boxGeometry args={[0.03, wheelW * 0.3, wheelR * 0.55]} />
              <meshPhysicalMaterial color="#a1a1aa" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Brake disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[wheelR * 0.45, wheelR * 0.45, wheelW * 0.08, 24]} />
            <meshPhysicalMaterial color="#78716c" metalness={0.7} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* Side skirts */}
      {[-1, 1].map((side) => (
        <RoundedBox key={`skirt-${side}`} args={[bodyLen * 0.7, 0.04, 0.03]} radius={0.01} position={[0, bodyY - bodyH * 0.42, side * bodyW * 0.5]} castShadow>
          <meshPhysicalMaterial color={params.columnColor} metalness={0.7} roughness={0.25} />
        </RoundedBox>
      ))}

      {/* Front splitter */}
      <mesh position={[-bodyLen * 0.48, bodyY - bodyH * 0.35, 0]} castShadow>
        <boxGeometry args={[0.06, 0.02, bodyW * 0.9]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Rear diffuser */}
      <mesh position={[bodyLen * 0.47, bodyY - bodyH * 0.35, 0]} castShadow>
        <boxGeometry args={[0.08, 0.03, bodyW * 0.85]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Exhaust tips */}
      {[-1, 1].map((side) => (
        <mesh key={`exhaust-${side}`} position={[bodyLen * 0.5, bodyY - bodyH * 0.3, side * bodyW * 0.25]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.03, 0.08, 16]} />
          <meshPhysicalMaterial color="#a3a3a3" metalness={0.95} roughness={0.05} />
        </mesh>
      ))}

      {/* Side mirrors */}
      {[-1, 1].map((side) => (
        <group key={`mirror-${side}`} position={[-wb * 0.12, cabinY - cabinH * 0.2, side * bodyW * 0.52]}>
          <RoundedBox args={[0.08, 0.06, 0.04]} radius={0.01}>
            <meshPhysicalMaterial color={params.materialColor} metalness={0.75} roughness={0.15} clearcoat={1} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}
