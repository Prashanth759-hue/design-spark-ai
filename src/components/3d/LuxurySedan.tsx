import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { CarConfig } from "@/components/CarConfigurator";

function WheelAssembly({ position, wheelR, wheelW, rimColor, rimStyle }: {
  position: [number, number, number]; wheelR: number; wheelW: number;
  rimColor: string; rimStyle: string;
}) {
  const spokeCount = rimStyle === "mesh" ? 12 : rimStyle === "turbine" ? 5 : 8;
  return (
    <group position={position}>
      <mesh castShadow>
        <torusGeometry args={[wheelR, wheelW * 0.38, 28, 64]} />
        <meshPhysicalMaterial color="#0d0d0d" roughness={0.88} metalness={0.06} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[wheelR * 0.62, wheelR * 0.62, wheelW * 0.3, 32]} />
        <meshPhysicalMaterial color={rimColor} metalness={0.96} roughness={0.05} clearcoat={1} envMapIntensity={2.5} />
      </mesh>
      {Array.from({ length: spokeCount }).map((_, si) => (
        <mesh key={si} rotation={[0, 0, (si / spokeCount) * Math.PI * 2]} castShadow>
          <boxGeometry args={[0.032, wheelR * 0.55, wheelW * 0.18]} />
          <meshPhysicalMaterial color={rimColor} metalness={0.92} roughness={0.08} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.12, wheelR * 0.12, wheelW * 0.34, 16]} />
        <meshPhysicalMaterial color="#555" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.42, wheelR * 0.42, wheelW * 0.065, 24]} />
        <meshPhysicalMaterial color="#6b6b6b" metalness={0.7} roughness={0.38} />
      </mesh>
    </group>
  );
}

export function LuxurySedan({ config, autoRotate }: { config: CarConfig; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += delta * 0.25;
  });

  const bodyColor = config.bodyColor;
  const rimColor = config.rimColor;
  const windowOpacity = 1 - config.windowTint * 0.82;
  const windowColor = config.windowTint > 0.5 ? "#1a1a2e" : "#a8c5e8";
  const paintRoughness = config.paintFinish === "matte" ? 0.62 : config.paintFinish === "satin" ? 0.28 : 0.06;
  const paintMetalness = config.paintFinish === "matte" ? 0.08 : 0.85;

  // BMW/Mercedes long sedan proportions
  const wb = 2.97;
  const tw = 1.56;
  const gc = 0.15;
  const bodyLen = 5.0;
  const bodyW = tw * 1.06;
  const bodyH = 0.5;
  const cabinH = 0.62;
  const wheelR = 0.32;
  const wheelW = 0.2;
  const bodyY = wheelR + gc + bodyH / 2;
  const cabinY = bodyY + bodyH / 2 + cabinH / 2 - 0.04;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2, wheelR + gc * 0.6, tw / 2],
    [-wb / 2, wheelR + gc * 0.6, -tw / 2],
    [wb / 2, wheelR + gc * 0.6, tw / 2],
    [wb / 2, wheelR + gc * 0.6, -tw / 2],
  ];

  return (
    <group ref={groupRef} position={[0, -0.99, 0]}>
      {/* Chassis */}
      <RoundedBox args={[wb * 1.1, 0.07, bodyW * 0.82]} radius={0.02}
        position={[0, bodyY - bodyH / 2 - 0.06, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#111" metalness={0.6} roughness={0.5} />
      </RoundedBox>

      {/* Main body */}
      <RoundedBox args={[bodyLen, bodyH, bodyW]} radius={0.07} position={[0, bodyY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness}
          clearcoat={config.paintFinish === "gloss" ? 1 : 0.2} clearcoatRoughness={0.03} envMapIntensity={3.5}
          sheen={0.5} sheenColor="#ffffff" sheenRoughness={0.4} />
      </RoundedBox>

      {/* Long graceful hood */}
      <RoundedBox args={[bodyLen * 0.34, bodyH * 0.45, bodyW * 0.92]} radius={0.05}
        position={[-bodyLen * 0.3, bodyY + bodyH * 0.22, 0]} rotation={[0, 0, 0.1]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2.2} />
      </RoundedBox>

      {/* Boot/trunk — three-box classic */}
      <RoundedBox args={[bodyLen * 0.22, bodyH * 0.5, bodyW * 0.9]} radius={0.04}
        position={[bodyLen * 0.34, bodyY + bodyH * 0.16, 0]} rotation={[0, 0, -0.06]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2.2} />
      </RoundedBox>

      {/* Tall upright cabin */}
      <RoundedBox args={[wb * 0.62, cabinH, bodyW * 0.88]} radius={0.06}
        position={[0.05, cabinY, 0]} castShadow>
        <meshPhysicalMaterial color="#0a1020" metalness={0.15} roughness={0.04}
          transmission={0.55} thickness={0.5} ior={1.5} envMapIntensity={2}
          opacity={windowOpacity} transparent />
      </RoundedBox>

      {/* Windshield */}
      <mesh position={[-wb * 0.22, cabinY + 0.05, 0]} rotation={[0, 0, 0.38]} castShadow>
        <boxGeometry args={[cabinH * 0.65, 0.013, bodyW * 0.82]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.75} thickness={0.3}
          ior={1.52} roughness={0.02} envMapIntensity={2.5} opacity={windowOpacity} transparent />
      </mesh>

      {/* Rear window */}
      <mesh position={[wb * 0.32, cabinY + 0.04, 0]} rotation={[0, 0, -0.38]}>
        <boxGeometry args={[cabinH * 0.6, 0.013, bodyW * 0.78]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.75} thickness={0.3}
          ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Side windows (front + rear) */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[-0.12, cabinY + 0.03, s * bodyW * 0.445]}>
            <boxGeometry args={[wb * 0.24, cabinH * 0.62, 0.01]} />
            <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.25} ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
          </mesh>
          <mesh position={[0.24, cabinY + 0.03, s * bodyW * 0.445]}>
            <boxGeometry args={[wb * 0.24, cabinH * 0.62, 0.01]} />
            <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.25} ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
          </mesh>
        </group>
      ))}

      {/* B-pillars */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.08, cabinY, s * bodyW * 0.445]}>
          <boxGeometry args={[0.045, cabinH * 0.92, 0.04]} />
          <meshPhysicalMaterial color="#0d0d0d" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Chrome kidney grille (BMW style) */}
      {[-0.1, 0.1].map((x, i) => (
        <RoundedBox key={i} args={[0.3, 0.25, 0.06]} radius={0.04}
          position={[-bodyLen * 0.49, bodyY + bodyH * 0.06, x]} castShadow>
          <meshPhysicalMaterial color="#c8c8c8" metalness={0.95} roughness={0.05} clearcoat={0.8} />
        </RoundedBox>
      ))}

      {/* Headlights (angel-eye style) */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-bodyLen * 0.49, bodyY + bodyH * 0.07, s * bodyW * 0.38]}>
          <mesh>
            <boxGeometry args={[0.05, 0.1, 0.22]} />
            <meshPhysicalMaterial color="#e2e8f0" metalness={0.4} roughness={0.08} />
          </mesh>
          {/* Angel eye ring */}
          <mesh position={[-0.02, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.055, 0.008, 8, 24]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
          </mesh>
          <mesh position={[-0.015, 0, 0]}>
            <boxGeometry args={[0.02, 0.05, 0.16]} />
            <meshStandardMaterial color={config.headlightColor} emissive={config.headlightColor} emissiveIntensity={3.5} />
          </mesh>
        </group>
      ))}

      {/* Tail lights */}
      {[-1, 1].map((s) => (
        <group key={s} position={[bodyLen * 0.49, bodyY + bodyH * 0.06, s * bodyW * 0.36]}>
          <mesh><boxGeometry args={[0.04, 0.09, 0.26]} />
            <meshPhysicalMaterial color="#3a0000" metalness={0.3} roughness={0.12} /></mesh>
          <mesh position={[0.015, 0, 0]}>
            <boxGeometry args={[0.018, 0.055, 0.2]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={4} />
          </mesh>
        </group>
      ))}

      {/* Trunk spoiler lip (optional) */}
      {config.bodyKit !== "stock" && (
        <RoundedBox args={[0.04, 0.04, bodyW * 0.55]} radius={0.01}
          position={[bodyLen * 0.44, bodyY + bodyH * 0.4, 0]}>
          <meshPhysicalMaterial color={config.bodyKit === "carbon" ? "#111" : bodyColor} metalness={0.7} roughness={config.bodyKit === "carbon" ? 0.35 : 0.12} clearcoat={0.6} />
        </RoundedBox>
      )}

      {/* Chrome trim */}
      <mesh position={[0, bodyY + bodyH * 0.48, 0]}>
        <boxGeometry args={[bodyLen * 0.72, 0.014, bodyW * 0.94]} />
        <meshPhysicalMaterial color="#c8c8c8" metalness={0.98} roughness={0.04} clearcoat={0.9} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <WheelAssembly key={i} position={pos} wheelR={wheelR} wheelW={wheelW}
          rimColor={rimColor} rimStyle={config.rimStyle} />
      ))}

      {/* Side skirts */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.6, 0.05, 0.035]} radius={0.01}
          position={[0.05, bodyY - bodyH * 0.44, s * bodyW * 0.51]} castShadow>
          <meshPhysicalMaterial color="#0d0d0d" metalness={0.5} roughness={0.3} />
        </RoundedBox>
      ))}

      {/* Mirrors */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.11, 0.07, 0.045]} radius={0.015}
          position={[-wb * 0.18, cabinY - cabinH * 0.22, s * bodyW * 0.48]}>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} />
        </RoundedBox>
      ))}

      {/* Exhaust */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[bodyLen * 0.5, bodyY - bodyH * 0.32, s * bodyW * 0.22]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.034, 0.09, 20]} />
          <meshPhysicalMaterial color="#999" metalness={0.95} roughness={0.04} />
        </mesh>
      ))}

      {/* License plates */}
      <mesh position={[-bodyLen * 0.502, bodyY - bodyH * 0.15, 0]}>
        <boxGeometry args={[0.005, 0.075, 0.3]} />
        <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[bodyLen * 0.502, bodyY - bodyH * 0.15, 0]}>
        <boxGeometry args={[0.005, 0.075, 0.3]} />
        <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.15} />
      </mesh>
      {/* Roundel badge — front */}
      <mesh position={[-bodyLen * 0.502, bodyY + bodyH * 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.005, 32]} />
        <meshPhysicalMaterial color="#f1f5f9" metalness={0.98} roughness={0.03} clearcoat={1} envMapIntensity={3} />
      </mesh>
      {/* Roundel badge — rear */}
      <mesh position={[bodyLen * 0.502, bodyY + bodyH * 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.005, 32]} />
        <meshPhysicalMaterial color="#f1f5f9" metalness={0.98} roughness={0.03} clearcoat={1} envMapIntensity={3} />
      </mesh>
    </group>
  );
}
