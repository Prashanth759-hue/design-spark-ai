import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { CarConfig } from "@/components/CarConfigurator";

function WheelAssembly({ position, wheelR, wheelW, rimColor, rimStyle }: {
  position: [number, number, number]; wheelR: number; wheelW: number;
  rimColor: string; rimStyle: string;
}) {
  const spokeCount = rimStyle === "mesh" ? 10 : rimStyle === "turbine" ? 5 : 6;
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[wheelR, wheelW * 0.42, 28, 64]} />
        <meshPhysicalMaterial color="#111" roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[wheelR * 0.58, wheelR * 0.58, wheelW * 0.3, 32]} />
        <meshPhysicalMaterial color={rimColor} metalness={0.95} roughness={0.06} clearcoat={1} envMapIntensity={2.5} />
      </mesh>
      {Array.from({ length: spokeCount }).map((_, si) => (
        <mesh key={si} rotation={[Math.PI / 2, 0, (si / spokeCount) * Math.PI * 2]} castShadow>
          <boxGeometry args={[0.032, wheelW * 0.26, wheelR * 0.5]} />
          <meshPhysicalMaterial color={rimColor} metalness={0.92} roughness={0.08} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.14, wheelR * 0.14, wheelW * 0.34, 16]} />
        <meshPhysicalMaterial color="#666" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function VanVehicle({ config, autoRotate }: { config: CarConfig; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += delta * 0.25;
  });

  const bodyColor = config.bodyColor;
  const accentColor = (config as any).accentColor || bodyColor;
  const rimColor = config.rimColor;
  const windowOpacity = 1 - config.windowTint * 0.82;
  const windowColor = config.windowTint > 0.5 ? "#1a1a2e" : "#a8c5e8";
  const paintRoughness = config.paintFinish === "matte" ? 0.62 : config.paintFinish === "satin" ? 0.28 : 0.06;
  const paintMetalness = config.paintFinish === "matte" ? 0.08 : 0.82;

  const wb = 3.1;
  const tw = 1.7;
  const gc = 0.18;
  const bodyLen = 5.1;
  const bodyW = tw * 1.1;
  const bodyH = 0.4;
  const cabinH = 1.0;
  const wheelR = 0.35;
  const wheelW = 0.22;
  const bodyY = wheelR + gc + bodyH / 2;
  const cabinY = bodyY + bodyH / 2 + cabinH / 2 - 0.04;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2, wheelR + gc * 0.5, tw / 2],
    [-wb / 2, wheelR + gc * 0.5, -tw / 2],
    [wb / 2, wheelR + gc * 0.5, tw / 2],
    [wb / 2, wheelR + gc * 0.5, -tw / 2],
  ];

  return (
    <group ref={groupRef} position={[0, -0.7, 0]}>
      {/* Chassis */}
      <RoundedBox args={[bodyLen * 0.9, 0.07, bodyW * 0.8]} radius={0.02}
        position={[0, bodyY - bodyH / 2 - 0.06, 0]} castShadow>
        <meshPhysicalMaterial color="#111" metalness={0.6} roughness={0.5} />
      </RoundedBox>

      {/* Main body — tall box shape */}
      <RoundedBox args={[bodyLen, bodyH, bodyW]} radius={0.08} position={[0, bodyY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness}
          clearcoat={config.paintFinish === "gloss" ? 1 : 0.2} clearcoatRoughness={0.04} envMapIntensity={2.2} />
      </RoundedBox>

      {/* Tall cabin walls */}
      <RoundedBox args={[bodyLen * 0.92, cabinH, bodyW * 0.98]} radius={0.07}
        position={[bodyLen * 0.02, cabinY, 0]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness}
          clearcoat={config.paintFinish === "gloss" ? 1 : 0.2} envMapIntensity={2} />
      </RoundedBox>

      {/* Roof */}
      <RoundedBox args={[bodyLen * 0.94, 0.07, bodyW * 1.0]} radius={0.035}
        position={[bodyLen * 0.02, cabinY + cabinH / 2 + 0.02, 0]} castShadow>
        <meshPhysicalMaterial color={accentColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} envMapIntensity={2} />
      </RoundedBox>

      {/* Front windshield — large and upright */}
      <mesh position={[-bodyLen * 0.42, cabinY + 0.12, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[cabinH * 0.75, 0.014, bodyW * 0.88]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.75} thickness={0.3}
          ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Rear window */}
      <mesh position={[bodyLen * 0.46, cabinY + 0.1, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[cabinH * 0.65, 0.014, bodyW * 0.82]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.3}
          ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Side windows — large panels */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* Front side window */}
          <mesh position={[-bodyLen * 0.2, cabinY + 0.08, s * bodyW * 0.5]}>
            <boxGeometry args={[bodyLen * 0.2, cabinH * 0.6, 0.012]} />
            <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.25}
              ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
          </mesh>
          {/* Mid side window */}
          <mesh position={[bodyLen * 0.08, cabinY + 0.08, s * bodyW * 0.5]}>
            <boxGeometry args={[bodyLen * 0.22, cabinH * 0.6, 0.012]} />
            <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.25}
              ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
          </mesh>
          {/* Rear side window */}
          <mesh position={[bodyLen * 0.32, cabinY + 0.08, s * bodyW * 0.5]}>
            <boxGeometry args={[bodyLen * 0.18, cabinH * 0.6, 0.012]} />
            <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.25}
              ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
          </mesh>
          {/* B-pillar */}
          <mesh position={[-bodyLen * 0.06, cabinY, s * bodyW * 0.5]}>
            <boxGeometry args={[0.045, cabinH * 0.9, 0.04]} />
            <meshPhysicalMaterial color="#111" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* C-pillar */}
          <mesh position={[bodyLen * 0.22, cabinY, s * bodyW * 0.5]}>
            <boxGeometry args={[0.045, cabinH * 0.9, 0.04]} />
            <meshPhysicalMaterial color="#111" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Sliding door track */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[bodyLen * 0.08, cabinY - cabinH * 0.1, s * bodyW * 0.505]}>
          <boxGeometry args={[bodyLen * 0.35, 0.02, 0.01]} />
          <meshPhysicalMaterial color="#555" metalness={0.8} roughness={0.15} />
        </mesh>
      ))}

      {/* Front bumper */}
      <RoundedBox args={[0.12, bodyH * 0.7, bodyW * 0.96]} radius={0.03}
        position={[-bodyLen * 0.49, bodyY - 0.04, 0]} castShadow>
        <meshPhysicalMaterial color="#222" metalness={0.5} roughness={0.35} />
      </RoundedBox>

      {/* Headlights */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-bodyLen * 0.47, cabinY - cabinH * 0.28, s * bodyW * 0.42]}>
          <mesh><boxGeometry args={[0.06, 0.14, 0.2]} />
            <meshPhysicalMaterial color="#ddd" metalness={0.3} roughness={0.1} /></mesh>
          <mesh position={[-0.015, 0, 0]}>
            <boxGeometry args={[0.02, 0.07, 0.16]} />
            <meshStandardMaterial color={config.headlightColor} emissive={config.headlightColor} emissiveIntensity={3.5} />
          </mesh>
        </group>
      ))}

      {/* Tail lights — vertical */}
      {[-1, 1].map((s) => (
        <group key={s} position={[bodyLen * 0.49, cabinY - cabinH * 0.15, s * bodyW * 0.42]}>
          <mesh><boxGeometry args={[0.04, 0.22, 0.12]} />
            <meshPhysicalMaterial color="#3a0000" metalness={0.3} roughness={0.12} /></mesh>
          <mesh position={[0.015, 0, 0]}>
            <boxGeometry args={[0.018, 0.16, 0.08]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={4} />
          </mesh>
        </group>
      ))}

      {/* Rear doors (hinges) */}
      <mesh position={[bodyLen * 0.49, cabinY - cabinH * 0.02, 0]}>
        <boxGeometry args={[0.015, cabinH * 0.75, bodyW * 0.85]} />
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} />
      </mesh>

      {/* Mirrors */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.12, 0.09, 0.05]} radius={0.015}
          position={[-bodyLen * 0.38, cabinY + cabinH * 0.1, s * bodyW * 0.52]}>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} />
        </RoundedBox>
      ))}

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <WheelAssembly key={i} position={pos} wheelR={wheelR} wheelW={wheelW}
          rimColor={rimColor} rimStyle={config.rimStyle} />
      ))}
    </group>
  );
}
