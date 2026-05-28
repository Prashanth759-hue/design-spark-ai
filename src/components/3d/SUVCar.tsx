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
      <mesh castShadow>
        <torusGeometry args={[wheelR, wheelW * 0.46, 28, 64]} />
        <meshPhysicalMaterial color="#0d0d0d" roughness={0.86} metalness={0.08} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[wheelR * 0.6, wheelR * 0.6, wheelW * 0.34, 32]} />
        <meshPhysicalMaterial color={rimColor} metalness={0.95} roughness={0.06} clearcoat={1} envMapIntensity={2.5} />
      </mesh>
      {Array.from({ length: spokeCount }).map((_, si) => (
        <mesh key={si} rotation={[0, 0, (si / spokeCount) * Math.PI * 2]} castShadow>
          <boxGeometry args={[0.04, wheelR * 0.52, wheelW * 0.18]} />
          <meshPhysicalMaterial color={rimColor} metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.44, wheelR * 0.44, wheelW * 0.08, 24]} />
        <meshPhysicalMaterial color="#5a5a5a" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function SUVCar({ config, autoRotate }: { config: CarConfig; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += delta * 0.25;
  });

  const bodyColor = config.bodyColor;
  const rimColor = config.rimColor;
  const windowOpacity = 1 - config.windowTint * 0.82;
  const windowColor = config.windowTint > 0.5 ? "#1a1a2e" : "#a0bdd8";
  const paintRoughness = config.paintFinish === "matte" ? 0.6 : config.paintFinish === "satin" ? 0.28 : 0.07;
  const paintMetalness = config.paintFinish === "matte" ? 0.1 : 0.82;

  // Large SUV proportions — tall, wide, long
  const wb = 3.0;
  const tw = 1.7;
  const gc = 0.22;
  const bodyLen = 4.9;
  const bodyW = tw * 1.08;
  const bodyH = 0.4;
  const cabinH = 0.72;
  const wheelR = 0.38;
  const wheelW = 0.26;
  const bodyY = wheelR + gc + bodyH / 2;
  const cabinY = bodyY + bodyH / 2 + cabinH / 2 - 0.02;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2, wheelR + gc * 0.4, tw / 2],
    [-wb / 2, wheelR + gc * 0.4, -tw / 2],
    [wb / 2, wheelR + gc * 0.4, tw / 2],
    [wb / 2, wheelR + gc * 0.4, -tw / 2],
  ];

  return (
    <group ref={groupRef} position={[0, -0.99, 0]}>
      {/* Skid plate / underbody */}
      <RoundedBox args={[wb * 1.08, 0.06, bodyW * 0.86]} radius={0.02}
        position={[0, bodyY - bodyH / 2 - 0.06, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.5} roughness={0.6} />
      </RoundedBox>

      {/* Main body — tall and boxy */}
      <RoundedBox args={[bodyLen, bodyH, bodyW]} radius={0.08} position={[0, bodyY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness}
          clearcoat={config.paintFinish === "gloss" ? 1 : 0.2} clearcoatRoughness={0.04} envMapIntensity={3.2}
          sheen={0.4} sheenColor="#ffffff" sheenRoughness={0.5} />
      </RoundedBox>

      {/* Wide fender flares front */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.28, bodyH * 1.6, bodyW * 0.22]} radius={0.06}
          position={[-bodyLen * 0.25, bodyY + 0.05, s * (bodyW / 2 + 0.07)]} castShadow>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.8} />
        </RoundedBox>
      ))}
      {/* Rear fender flares */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.28, bodyH * 1.5, bodyW * 0.22]} radius={0.06}
          position={[bodyLen * 0.22, bodyY + 0.04, s * (bodyW / 2 + 0.065)]} castShadow>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.8} />
        </RoundedBox>
      ))}

      {/* Hood — slightly sloped */}
      <RoundedBox args={[bodyLen * 0.28, bodyH * 0.6, bodyW * 0.9]} radius={0.06}
        position={[-bodyLen * 0.3, bodyY + bodyH * 0.35, 0]} rotation={[0, 0, 0.07]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.8} />
      </RoundedBox>

      {/* Rear hatch */}
      <RoundedBox args={[bodyLen * 0.16, bodyH * 0.7, bodyW * 0.9]} radius={0.05}
        position={[bodyLen * 0.38, bodyY + bodyH * 0.35, 0]} rotation={[0, 0, -0.05]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.8} />
      </RoundedBox>

      {/* Tall upright cabin */}
      <RoundedBox args={[wb * 0.72, cabinH, bodyW * 0.89]} radius={0.065}
        position={[0.05, cabinY, 0]} castShadow>
        <meshPhysicalMaterial color="#0a1020" metalness={0.15} roughness={0.05}
          transmission={0.52} thickness={0.5} ior={1.5} envMapIntensity={1.8}
          opacity={windowOpacity} transparent />
      </RoundedBox>

      {/* Windshield */}
      <mesh position={[-wb * 0.26, cabinY + 0.06, 0]} rotation={[0, 0, 0.28]} castShadow>
        <boxGeometry args={[cabinH * 0.65, 0.013, bodyW * 0.84]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.74} thickness={0.3} ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Rear hatch glass */}
      <mesh position={[wb * 0.38, cabinY + 0.06, 0]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[cabinH * 0.55, 0.013, bodyW * 0.8]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.74} thickness={0.3} ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Side windows — 3 per side */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {[-0.3, 0.1, 0.46].map((xo, wi) => (
            <mesh key={wi} position={[xo, cabinY + 0.03, s * bodyW * 0.45]}>
              <boxGeometry args={[wb * 0.22, cabinH * 0.65, 0.01]} />
              <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.25} ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
            </mesh>
          ))}
        </group>
      ))}

      {/* Roof rails */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.05, cabinY + cabinH / 2 + 0.025, s * bodyW * 0.4]}>
          <boxGeometry args={[bodyLen * 0.58, 0.04, 0.04]} />
          <meshPhysicalMaterial color="#888" metalness={0.9} roughness={0.1} clearcoat={0.8} />
        </mesh>
      ))}

      {/* Bold front grille */}
      <mesh position={[-bodyLen * 0.5, bodyY + bodyH * 0.04, 0]}>
        <boxGeometry args={[0.06, bodyH * 0.75, bodyW * 0.72]} />
        <meshPhysicalMaterial color="#111" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Chrome surround */}
      <mesh position={[-bodyLen * 0.5, bodyY + bodyH * 0.04, 0]}>
        <boxGeometry args={[0.055, bodyH * 0.8, bodyW * 0.76]} />
        <meshPhysicalMaterial color="#b0b0b0" metalness={0.95} roughness={0.04} wireframe={true} />
      </mesh>

      {/* Headlights — wide & tall */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-bodyLen * 0.49, bodyY + bodyH * 0.12, s * bodyW * 0.36]}>
          <mesh><boxGeometry args={[0.06, 0.15, 0.26]} />
            <meshPhysicalMaterial color="#d4d4d8" metalness={0.4} roughness={0.08} /></mesh>
          <mesh position={[-0.02, 0.02, 0]}>
            <boxGeometry args={[0.025, 0.06, 0.22]} />
            <meshStandardMaterial color={config.headlightColor} emissive={config.headlightColor} emissiveIntensity={3.5} />
          </mesh>
          <mesh position={[-0.025, -0.04, 0]}>
            <boxGeometry args={[0.01, 0.014, 0.2]} />
            <meshStandardMaterial color="#e0f2fe" emissive="#e0f2fe" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}

      {/* Tail lights — wide horizontal */}
      {[-1, 1].map((s) => (
        <group key={s} position={[bodyLen * 0.49, bodyY + bodyH * 0.12, s * bodyW * 0.34]}>
          <mesh><boxGeometry args={[0.045, 0.14, 0.28]} />
            <meshPhysicalMaterial color="#3a0000" metalness={0.3} roughness={0.12} /></mesh>
          <mesh position={[0.018, 0, 0]}>
            <boxGeometry args={[0.02, 0.085, 0.22]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={4} />
          </mesh>
        </group>
      ))}
      {/* Full-width tail light bar */}
      <mesh position={[bodyLen * 0.5, bodyY + bodyH * 0.14, 0]}>
        <boxGeometry args={[0.012, 0.018, bodyW * 0.6]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={2} />
      </mesh>

      {/* Cladding / body armor sides */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.62, 0.08, 0.05]} radius={0.02}
          position={[0.05, bodyY - bodyH * 0.36, s * bodyW * 0.53]} castShadow>
          <meshPhysicalMaterial color="#222" metalness={0.3} roughness={0.55} />
        </RoundedBox>
      ))}

      {/* Roof spoiler */}
      {config.bodyKit !== "stock" && (
        <RoundedBox args={[0.06, 0.06, bodyW * 0.6]} radius={0.015}
          position={[bodyLen * 0.38, cabinY + cabinH / 2 + 0.04, 0]}>
          <meshPhysicalMaterial color={config.bodyKit === "carbon" ? "#111" : bodyColor} metalness={0.6} roughness={config.bodyKit === "carbon" ? 0.35 : 0.12} clearcoat={0.5} />
        </RoundedBox>
      )}

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <WheelAssembly key={i} position={pos} wheelR={wheelR} wheelW={wheelW}
          rimColor={rimColor} rimStyle={config.rimStyle} />
      ))}

      {/* Mirrors */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.12, 0.08, 0.05]} radius={0.015}
          position={[-wb * 0.22, cabinY - cabinH * 0.2, s * bodyW * 0.48]}>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} />
        </RoundedBox>
      ))}

      {/* Exhaust */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[bodyLen * 0.5, bodyY - bodyH * 0.28, s * bodyW * 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.034, 0.04, 0.1, 20]} />
          <meshPhysicalMaterial color="#999" metalness={0.95} roughness={0.04} />
        </mesh>
      ))}
    </group>
  );
}
