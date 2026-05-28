import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { CarConfig } from "@/components/CarConfigurator";

function WheelAssembly({ position, wheelR, wheelW, rimColor, rimStyle }: {
  position: [number, number, number]; wheelR: number; wheelW: number;
  rimColor: string; rimStyle: string;
}) {
  const spokeCount = rimStyle === "mesh" ? 10 : rimStyle === "turbine" ? 5 : 7;
  return (
    <group position={position}>
      <mesh castShadow>
        <torusGeometry args={[wheelR, wheelW * 0.42, 28, 64]} />
        <meshPhysicalMaterial color="#111" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[wheelR * 0.6, wheelR * 0.6, wheelW * 0.3, 32]} />
        <meshPhysicalMaterial color={rimColor} metalness={0.96} roughness={0.05} clearcoat={1} envMapIntensity={2.5} />
      </mesh>
      {Array.from({ length: spokeCount }).map((_, si) => (
        <mesh key={si} rotation={[0, 0, (si / spokeCount) * Math.PI * 2]} castShadow>
          <boxGeometry args={[0.03, wheelR * 0.52, wheelW * 0.18]} />
          <meshPhysicalMaterial color={rimColor} metalness={0.92} roughness={0.08} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.13, wheelR * 0.13, wheelW * 0.34, 16]} />
        <meshPhysicalMaterial color="#666" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function Convertible({ config, autoRotate }: { config: CarConfig; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += delta * 0.25;
  });

  const bodyColor = config.bodyColor;
  const rimColor = config.rimColor;
  const windowOpacity = 1 - config.windowTint * 0.82;
  const windowColor = config.windowTint > 0.5 ? "#1a1a2e" : "#93c5fd";
  const paintRoughness = config.paintFinish === "matte" ? 0.65 : config.paintFinish === "satin" ? 0.3 : 0.08;
  const paintMetalness = config.paintFinish === "matte" ? 0.1 : 0.82;

  const wb = 2.6;
  const tw = 1.58;
  const gc = 0.12;
  const bodyLen = 4.4;
  const bodyW = tw * 1.05;
  const bodyH = 0.42;
  const wheelR = 0.33;
  const wheelW = 0.22;
  const bodyY = wheelR + gc + bodyH / 2;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2, wheelR + gc * 0.5, tw / 2],
    [-wb / 2, wheelR + gc * 0.5, -tw / 2],
    [wb / 2, wheelR + gc * 0.5, tw / 2],
    [wb / 2, wheelR + gc * 0.5, -tw / 2],
  ];

  return (
    <group ref={groupRef} position={[0, -0.96, 0]}>
      {/* Underbody */}
      <mesh position={[0, bodyY - bodyH / 2 - 0.04, 0]}>
        <boxGeometry args={[bodyLen * 1.02, 0.025, bodyW * 0.88]} />
        <meshPhysicalMaterial color="#0d0d0d" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Main body — low and elegant */}
      <RoundedBox args={[bodyLen, bodyH, bodyW]} radius={0.05} position={[0, bodyY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness}
          clearcoat={config.paintFinish === "gloss" ? 1 : 0.3} clearcoatRoughness={0.03} envMapIntensity={3.5}
          sheen={0.45} sheenColor="#ffffff" sheenRoughness={0.45} />
      </RoundedBox>

      {/* Long sculpted hood */}
      <RoundedBox args={[bodyLen * 0.38, bodyH * 0.5, bodyW * 0.92]} radius={0.04}
        position={[-bodyLen * 0.28, bodyY + bodyH * 0.25, 0]} rotation={[0, 0, 0.12]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} envMapIntensity={2.2} />
      </RoundedBox>

      {/* Rear deck — low and flat (no roof!) */}
      <RoundedBox args={[bodyLen * 0.3, bodyH * 0.6, bodyW * 0.88]} radius={0.04}
        position={[bodyLen * 0.28, bodyY + bodyH * 0.15, 0]} rotation={[0, 0, -0.08]} castShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} envMapIntensity={2.2} />
      </RoundedBox>

      {/* Low windshield frame (no roof) */}
      <mesh position={[-wb * 0.2, bodyY + bodyH + 0.22, 0]} rotation={[0, 0, 0.45]} castShadow>
        <boxGeometry args={[0.36, 0.015, bodyW * 0.78]} />
        <meshPhysicalMaterial color={windowColor} metalness={0.05} roughness={0.02}
          transmission={0.75} thickness={0.2} ior={1.52} envMapIntensity={3}
          opacity={windowOpacity} transparent />
      </mesh>
      {/* Windshield frame */}
      <mesh position={[-wb * 0.22, bodyY + bodyH + 0.25, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.38, 0.025, bodyW * 0.82]} />
        <meshPhysicalMaterial color="#222" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Interior — visible seats (2-seater) */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.05, bodyY + bodyH * 0.6, s * 0.38]}>
          {/* Seat back */}
          <RoundedBox args={[0.12, 0.32, 0.38]} radius={0.03}
            position={[0.12, 0.06, 0]}>
            <meshPhysicalMaterial color="#1a1a1a" metalness={0.1} roughness={0.8} />
          </RoundedBox>
          {/* Seat cushion */}
          <RoundedBox args={[0.3, 0.08, 0.36]} radius={0.02}
            position={[0, -0.06, 0]}>
            <meshPhysicalMaterial color="#1a1a1a" metalness={0.1} roughness={0.8} />
          </RoundedBox>
          {/* Headrest */}
          <RoundedBox args={[0.06, 0.14, 0.2]} radius={0.03}
            position={[0.14, 0.26, 0]}>
            <meshPhysicalMaterial color="#1a1a1a" metalness={0.1} roughness={0.8} />
          </RoundedBox>
        </group>
      ))}

      {/* Roll hoops behind seats */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[wb * 0.15, bodyY + bodyH + 0.15, s * 0.32]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.35, 12]} />
          <meshPhysicalMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
        </mesh>
      ))}

      {/* Side sculpting / character line */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, bodyY + bodyH * 0.35, s * bodyW * 0.51]}>
          <boxGeometry args={[bodyLen * 0.7, 0.02, 0.015]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Rear fender flares */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.25, bodyH * 1.2, bodyW * 0.15]} radius={0.04}
          position={[wb / 2 * 0.55, bodyY + 0.02, s * (bodyW / 2 + 0.04)]} castShadow>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} envMapIntensity={2} />
        </RoundedBox>
      ))}

      {/* Headlights */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-bodyLen * 0.49, bodyY + bodyH * 0.08, s * bodyW * 0.38]}>
          <mesh><boxGeometry args={[0.05, 0.07, 0.22]} />
            <meshPhysicalMaterial color="#ddd" metalness={0.3} roughness={0.1} /></mesh>
          <mesh position={[-0.01, 0.01, 0]}>
            <boxGeometry args={[0.015, 0.03, 0.18]} />
            <meshStandardMaterial color={config.headlightColor} emissive={config.headlightColor} emissiveIntensity={4} />
          </mesh>
        </group>
      ))}

      {/* Tail lights */}
      {[-1, 1].map((s) => (
        <group key={s} position={[bodyLen * 0.49, bodyY + bodyH * 0.06, s * bodyW * 0.36]}>
          <mesh><boxGeometry args={[0.035, 0.06, 0.22]} />
            <meshPhysicalMaterial color="#3a0000" metalness={0.3} roughness={0.12} /></mesh>
          <mesh position={[0.012, 0, 0]}>
            <boxGeometry args={[0.015, 0.035, 0.18]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4} />
          </mesh>
        </group>
      ))}

      {/* Side mirrors */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.1, 0.05, 0.04]} radius={0.01}
          position={[-wb * 0.16, bodyY + bodyH + 0.08, s * bodyW * 0.48]}>
          <meshPhysicalMaterial color={bodyColor} metalness={paintMetalness} roughness={paintRoughness} clearcoat={1} />
        </RoundedBox>
      ))}

      {/* Aero kit */}
      {config.bodyKit !== "stock" && (
        <RoundedBox args={[0.05, 0.06, bodyW * 0.7]} radius={0.015}
          position={[bodyLen * 0.44, bodyY + bodyH * 0.35, 0]} castShadow>
          <meshPhysicalMaterial color={config.bodyKit === "carbon" ? "#111" : bodyColor} metalness={0.6} roughness={config.bodyKit === "carbon" ? 0.35 : 0.15} />
        </RoundedBox>
      )}

      {/* Exhaust tips */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[bodyLen * 0.5, bodyY - bodyH * 0.2, s * bodyW * 0.25]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.036, 0.1, 20]} />
          <meshPhysicalMaterial color="#888" metalness={0.95} roughness={0.05} />
        </mesh>
      ))}

      {/* License plates */}
      <mesh position={[-bodyLen * 0.502, bodyY - bodyH * 0.05, 0]}>
        <boxGeometry args={[0.005, 0.07, 0.28]} />
        <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[bodyLen * 0.502, bodyY - bodyH * 0.05, 0]}>
        <boxGeometry args={[0.005, 0.07, 0.28]} />
        <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.15} />
      </mesh>
      {/* Badge */}
      <mesh position={[-bodyLen * 0.502, bodyY + bodyH * 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.005, 32]} />
        <meshPhysicalMaterial color="#e5e7eb" metalness={0.98} roughness={0.03} clearcoat={1} envMapIntensity={3} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <WheelAssembly key={i} position={pos} wheelR={wheelR} wheelW={wheelW}
          rimColor={rimColor} rimStyle={config.rimStyle} />
      ))}
    </group>
  );
}
