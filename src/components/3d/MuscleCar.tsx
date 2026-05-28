import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { CarConfig } from "@/components/CarConfigurator";

function WheelAssembly({ position, wheelR, wheelW, rimColor, rimStyle }: {
  position: [number, number, number]; wheelR: number; wheelW: number;
  rimColor: string; rimStyle: string;
}) {
  const spokeCount = rimStyle === "mesh" ? 8 : rimStyle === "turbine" ? 5 : 6;
  return (
    <group position={position}>
      <mesh castShadow>
        <torusGeometry args={[wheelR, wheelW * 0.44, 28, 64]} />
        <meshPhysicalMaterial color="#111" roughness={0.88} metalness={0.06} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[wheelR * 0.6, wheelR * 0.6, wheelW * 0.32, 32]} />
        <meshPhysicalMaterial color={rimColor} metalness={0.95} roughness={0.06} clearcoat={1} envMapIntensity={2.5} />
      </mesh>
      {Array.from({ length: spokeCount }).map((_, si) => (
        <mesh key={si} rotation={[0, 0, (si / spokeCount) * Math.PI * 2]} castShadow>
          <boxGeometry args={[0.042, wheelR * 0.54, wheelW * 0.18]} />
          <meshPhysicalMaterial color={rimColor} metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.44, wheelR * 0.44, wheelW * 0.07, 24]} />
        <meshPhysicalMaterial color="#5a5a5a" metalness={0.7} roughness={0.38} />
      </mesh>
    </group>
  );
}

export function MuscleCar({ config, autoRotate }: { config: CarConfig; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += delta * 0.25;
  });

  const bodyColor = config.bodyColor;
  const rimColor = config.rimColor;
  const windowOpacity = 1 - config.windowTint * 0.82;
  const windowColor = config.windowTint > 0.5 ? "#1a1a2e" : "#b0cce8";
  const paintRoughness = config.paintFinish === "matte" ? 0.6 : config.paintFinish === "satin" ? 0.28 : 0.07;
  const paintMetalness = config.paintFinish === "matte" ? 0.1 : 0.84;

  // Mustang/Camaro proportions — long hood, short rear
  const wb = 2.87;
  const tw = 1.6;
  const gc = 0.14;
  const bodyLen = 4.8;
  const bodyW = tw * 1.08;
  const bodyH = 0.48;
  const cabinH = 0.58;
  const wheelR = 0.36;
  const wheelW = 0.26;
  const bodyY = wheelR + gc + bodyH / 2;
  const cabinY = bodyY + bodyH / 2 + cabinH / 2 - 0.04;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2, wheelR + gc * 0.5, tw / 2],
    [-wb / 2, wheelR + gc * 0.5, -tw / 2],
    [wb / 2, wheelR + gc * 0.5, tw / 2],
    [wb / 2, wheelR + gc * 0.5, -tw / 2],
  ];

  return (
    <group ref={groupRef} position={[0, -0.97, 0]}>
      {/* Chassis */}
      <RoundedBox args={[wb * 1.12, 0.08, bodyW * 0.84]} radius={0.02}
        position={[0, bodyY - bodyH / 2 - 0.07, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#111" metalness={0.6} roughness={0.5} />
      </RoundedBox>

      {/* Wide muscular body */}
      <RoundedBox args={[bodyLen, bodyH, bodyW]} radius={0.065} position={[0, bodyY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness}
          clearcoat={config.paintFinish === "gloss" ? 1 : 0.2} clearcoatRoughness={0.04} envMapIntensity={3.2}
          sheen={0.35} sheenColor="#ffffff" sheenRoughness={0.5} />
      </RoundedBox>

      {/* Wide front fenders — muscular bulge */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.3, bodyH * 1.5, bodyW * 0.18]} radius={0.05}
          position={[-bodyLen * 0.28, bodyY + 0.04, s * (bodyW / 2 + 0.055)]} castShadow>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2} />
        </RoundedBox>
      ))}

      {/* Rear haunches */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.3, bodyH * 1.4, bodyW * 0.17]} radius={0.05}
          position={[bodyLen * 0.28, bodyY + 0.03, s * (bodyW / 2 + 0.05)]} castShadow>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2} />
        </RoundedBox>
      ))}

      {/* Long hood with power bulge */}
      <RoundedBox args={[bodyLen * 0.42, bodyH * 0.55, bodyW * 0.88]} radius={0.05}
        position={[-bodyLen * 0.24, bodyY + bodyH * 0.28, 0]} rotation={[0, 0, 0.08]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2} />
      </RoundedBox>

      {/* Hood power bulge */}
      <RoundedBox args={[bodyLen * 0.35, bodyH * 0.22, bodyW * 0.22]} radius={0.03}
        position={[-bodyLen * 0.22, bodyY + bodyH * 0.62, 0]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2} />
      </RoundedBox>

      {/* Short rear trunk */}
      <RoundedBox args={[bodyLen * 0.2, bodyH * 0.55, bodyW * 0.88]} radius={0.04}
        position={[bodyLen * 0.36, bodyY + bodyH * 0.2, 0]} rotation={[0, 0, -0.1]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2} />
      </RoundedBox>

      {/* Fastback cabin */}
      <RoundedBox args={[wb * 0.52, cabinH, bodyW * 0.84]} radius={0.055}
        position={[0.06, cabinY, 0]} castShadow>
        <meshPhysicalMaterial color="#0a0a18" metalness={0.2} roughness={0.04}
          transmission={0.52} thickness={0.45} ior={1.5} envMapIntensity={1.8}
          opacity={windowOpacity} transparent />
      </RoundedBox>

      {/* Windshield */}
      <mesh position={[-wb * 0.18, cabinY + 0.05, 0]} rotation={[0, 0, 0.46]} castShadow>
        <boxGeometry args={[cabinH * 0.68, 0.013, bodyW * 0.78]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.74} thickness={0.25} ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Rear glass */}
      <mesh position={[wb * 0.3, cabinY + 0.04, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[cabinH * 0.6, 0.013, bodyW * 0.74]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.74} thickness={0.25} ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Side windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.06, cabinY + 0.02, s * bodyW * 0.43]}>
          <boxGeometry args={[wb * 0.38, cabinH * 0.58, 0.01]} />
          <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.22} ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
        </mesh>
      ))}

      {/* Aggressive front grille */}
      <mesh position={[-bodyLen * 0.5, bodyY + bodyH * 0.0, 0]}>
        <boxGeometry args={[0.055, bodyH * 0.7, bodyW * 0.75]} />
        <meshPhysicalMaterial color="#111" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Headlights — tri-bar style */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-bodyLen * 0.49, bodyY + bodyH * 0.1, s * bodyW * 0.36]}>
          <mesh><boxGeometry args={[0.05, 0.12, 0.28]} />
            <meshPhysicalMaterial color="#c8c8c8" metalness={0.4} roughness={0.1} /></mesh>
          {[0, 0.035, -0.035].map((zo, li) => (
            <mesh key={li} position={[-0.01, 0, zo]}>
              <boxGeometry args={[0.018, 0.025, 0.07]} />
              <meshStandardMaterial color={config.headlightColor} emissive={config.headlightColor} emissiveIntensity={4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Sequential tail lights */}
      {[-1, 1].map((s) => (
        <group key={s} position={[bodyLen * 0.49, bodyY + bodyH * 0.08, s * bodyW * 0.34]}>
          <mesh><boxGeometry args={[0.04, 0.1, 0.32]} />
            <meshPhysicalMaterial color="#3d0000" metalness={0.3} roughness={0.12} /></mesh>
          {[0.08, 0, -0.08].map((zo, li) => (
            <mesh key={li} position={[0.015, 0, zo]}>
              <boxGeometry args={[0.018, 0.06, 0.07]} />
              <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={3.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Ducktail spoiler */}
      {config.bodyKit !== "stock" && (
        <RoundedBox args={[0.07, 0.08, bodyW * 0.7]} radius={0.02}
          position={[bodyLen * 0.46, bodyY + bodyH * 0.45, 0]} castShadow>
          <meshPhysicalMaterial color={config.bodyKit === "carbon" ? "#111" : bodyColor} metalness={0.6} roughness={config.bodyKit === "carbon" ? 0.35 : 0.15} clearcoat={0.6} />
        </RoundedBox>
      )}

      {/* Chin splitter */}
      {(config.bodyKit === "aero" || config.bodyKit === "carbon") && (
        <mesh position={[-bodyLen * 0.51, bodyY - bodyH * 0.26, 0]}>
          <boxGeometry args={[0.1, 0.02, bodyW * 1.05]} />
          <meshPhysicalMaterial color="#111" metalness={0.4} roughness={0.35} />
        </mesh>
      )}

      {/* Side stripe accent */}
      <mesh position={[0, bodyY + bodyH * 0.48, 0]}>
        <boxGeometry args={[bodyLen * 0.8, 0.01, 0.06]} />
        <meshPhysicalMaterial color="#c8c8c8" metalness={0.9} roughness={0.06} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <WheelAssembly key={i} position={pos} wheelR={wheelR} wheelW={wheelW}
          rimColor={rimColor} rimStyle={config.rimStyle} />
      ))}

      {/* Side skirts */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.52, 0.07, 0.04]} radius={0.01}
          position={[0.06, bodyY - bodyH * 0.42, s * bodyW * 0.52]} castShadow>
          <meshPhysicalMaterial color="#0d0d0d" metalness={0.5} roughness={0.28} />
        </RoundedBox>
      ))}

      {/* Mirrors */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.1, 0.065, 0.04]} radius={0.012}
          position={[-wb * 0.16, cabinY - cabinH * 0.18, s * bodyW * 0.47]}>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} />
        </RoundedBox>
      ))}

      {/* Quad exhaust */}
      {[[-1, -0.14], [-1, 0.14], [1, -0.14], [1, 0.14] as [number, number]].map(([s, zo], i) => (
        <mesh key={i} position={[bodyLen * 0.5, bodyY - bodyH * 0.3, s * bodyW * 0.28 + zo]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.038, 0.09, 20]} />
          <meshPhysicalMaterial color="#888" metalness={0.96} roughness={0.04} />
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
      {/* Badge */}
      <mesh position={[-bodyLen * 0.502, bodyY + bodyH * 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.006, 24]} />
        <meshPhysicalMaterial color="#e5e7eb" metalness={0.98} roughness={0.04} clearcoat={1} />
      </mesh>
    </group>
  );
}
