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
        <torusGeometry args={[wheelR, wheelW * 0.44, 28, 64]} />
        <meshPhysicalMaterial color="#111" roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[wheelR * 0.58, wheelR * 0.58, wheelW * 0.32, 32]} />
        <meshPhysicalMaterial color={rimColor} metalness={0.95} roughness={0.06} clearcoat={1} envMapIntensity={2.5} />
      </mesh>
      {Array.from({ length: spokeCount }).map((_, si) => (
        <mesh key={si} rotation={[Math.PI / 2, 0, (si / spokeCount) * Math.PI * 2]} castShadow>
          <boxGeometry args={[0.035, wheelW * 0.28, wheelR * 0.5]} />
          <meshPhysicalMaterial color={rimColor} metalness={0.92} roughness={0.08} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.14, wheelR * 0.14, wheelW * 0.36, 16]} />
        <meshPhysicalMaterial color="#666" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function PickupTruck({ config, autoRotate }: { config: CarConfig; autoRotate: boolean }) {
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
  const paintMetalness = config.paintFinish === "matte" ? 0.08 : 0.85;

  const wb = 3.4;
  const tw = 1.7;
  const gc = 0.22;
  const bodyLen = 5.8;
  const bodyW = tw * 1.08;
  const bodyH = 0.35;
  const cabinH = 0.7;
  const wheelR = 0.4;
  const wheelW = 0.28;
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
      {/* Frame rails */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.95, 0.08, 0.1]} radius={0.02}
          position={[0, bodyY - bodyH / 2 - 0.08, s * bodyW * 0.3]} castShadow>
          <meshPhysicalMaterial color="#222" metalness={0.7} roughness={0.4} />
        </RoundedBox>
      ))}

      {/* Front cabin body */}
      <RoundedBox args={[bodyLen * 0.42, bodyH, bodyW]} radius={0.06}
        position={[-bodyLen * 0.18, bodyY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness}
          clearcoat={config.paintFinish === "gloss" ? 1 : 0.2} clearcoatRoughness={0.04} envMapIntensity={2.2} />
      </RoundedBox>

      {/* Hood */}
      <RoundedBox args={[bodyLen * 0.3, bodyH * 0.4, bodyW * 0.94]} radius={0.04}
        position={[-bodyLen * 0.35, bodyY + bodyH * 0.2, 0]} rotation={[0, 0, 0.06]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} envMapIntensity={2.2} />
      </RoundedBox>

      {/* Cabin */}
      <RoundedBox args={[wb * 0.42, cabinH, bodyW * 0.9]} radius={0.06}
        position={[-bodyLen * 0.08, cabinY, 0]} castShadow>
        <meshPhysicalMaterial color="#0a1020" metalness={0.15} roughness={0.04}
          transmission={0.5} thickness={0.45} ior={1.5} envMapIntensity={2}
          opacity={windowOpacity} transparent />
      </RoundedBox>

      {/* Cabin roof */}
      <RoundedBox args={[wb * 0.44, 0.06, bodyW * 0.92]} radius={0.03}
        position={[-bodyLen * 0.08, cabinY + cabinH / 2, 0]} castShadow>
        <meshPhysicalMaterial color={accentColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} envMapIntensity={2} />
      </RoundedBox>

      {/* Windshield */}
      <mesh position={[-bodyLen * 0.22, cabinY + 0.08, 0]} rotation={[0, 0, 0.32]} castShadow>
        <boxGeometry args={[cabinH * 0.6, 0.013, bodyW * 0.84]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.75} thickness={0.25}
          ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Rear window */}
      <mesh position={[bodyLen * 0.05, cabinY + 0.06, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[cabinH * 0.5, 0.013, bodyW * 0.8]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.72} thickness={0.25}
          ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Truck bed */}
      <RoundedBox args={[bodyLen * 0.42, bodyH * 0.8, bodyW * 0.98]} radius={0.04}
        position={[bodyLen * 0.26, bodyY - 0.02, 0]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness}
          clearcoat={config.paintFinish === "gloss" ? 1 : 0.2} envMapIntensity={2.2} />
      </RoundedBox>

      {/* Bed interior (darker) */}
      <RoundedBox args={[bodyLen * 0.38, bodyH * 0.5, bodyW * 0.88]} radius={0.02}
        position={[bodyLen * 0.26, bodyY + bodyH * 0.2, 0]}>
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </RoundedBox>

      {/* Bed side walls */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.4, bodyH * 0.55, 0.06]} radius={0.02}
          position={[bodyLen * 0.26, bodyY + bodyH * 0.15, s * bodyW * 0.46]} castShadow>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} envMapIntensity={2} />
        </RoundedBox>
      ))}

      {/* Tailgate */}
      <RoundedBox args={[0.06, bodyH * 0.55, bodyW * 0.92]} radius={0.02}
        position={[bodyLen * 0.465, bodyY + bodyH * 0.15, 0]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} envMapIntensity={2} />
      </RoundedBox>

      {/* Front bumper / grille */}
      <RoundedBox args={[0.14, bodyH * 0.8, bodyW * 0.95]} radius={0.03}
        position={[-bodyLen * 0.49, bodyY - 0.02, 0]} castShadow>
        <meshPhysicalMaterial color="#222" metalness={0.6} roughness={0.3} />
      </RoundedBox>

      {/* Grille chrome bars */}
      {[-0.06, 0, 0.06].map((y, i) => (
        <mesh key={i} position={[-bodyLen * 0.5, bodyY + y, 0]}>
          <boxGeometry args={[0.02, 0.025, bodyW * 0.6]} />
          <meshPhysicalMaterial color="#c8c8c8" metalness={0.98} roughness={0.04} />
        </mesh>
      ))}

      {/* Headlights */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-bodyLen * 0.49, bodyY + bodyH * 0.08, s * bodyW * 0.4]}>
          <mesh><boxGeometry args={[0.06, 0.12, 0.2]} />
            <meshPhysicalMaterial color="#ddd" metalness={0.3} roughness={0.1} /></mesh>
          <mesh position={[-0.015, 0, 0]}>
            <boxGeometry args={[0.02, 0.06, 0.16]} />
            <meshStandardMaterial color={config.headlightColor} emissive={config.headlightColor} emissiveIntensity={3.5} />
          </mesh>
        </group>
      ))}

      {/* Tail lights */}
      {[-1, 1].map((s) => (
        <group key={s} position={[bodyLen * 0.47, bodyY + bodyH * 0.06, s * bodyW * 0.4]}>
          <mesh><boxGeometry args={[0.04, 0.12, 0.18]} />
            <meshPhysicalMaterial color="#3a0000" metalness={0.3} roughness={0.12} /></mesh>
          <mesh position={[0.015, 0, 0]}>
            <boxGeometry args={[0.018, 0.07, 0.14]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={4} />
          </mesh>
        </group>
      ))}

      {/* Side steps */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.35, 0.04, 0.12]} radius={0.01}
          position={[-bodyLen * 0.05, bodyY - bodyH * 0.6, s * bodyW * 0.52]} castShadow>
          <meshPhysicalMaterial color="#333" metalness={0.7} roughness={0.3} />
        </RoundedBox>
      ))}

      {/* Mirrors */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.12, 0.08, 0.05]} radius={0.015}
          position={[-bodyLen * 0.2, cabinY - cabinH * 0.2, s * bodyW * 0.5]}>
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
