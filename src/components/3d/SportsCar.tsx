import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { CarConfig } from "@/components/CarConfigurator";

export function SportsCar({ config, autoRotate }: { config: CarConfig; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += delta * 0.25;
  });

  const bodyColor = config.bodyColor;
  const rimColor = config.rimColor;
  const windowOpacity = 1 - config.windowTint * 0.85;
  const windowColor = config.windowTint > 0.5 ? "#1a1a2e" : "#93c5fd";
  const paintRoughness = config.paintFinish === "matte" ? 0.65 : config.paintFinish === "satin" ? 0.3 : 0.08;
  const paintMetalness = config.paintFinish === "matte" ? 0.1 : 0.82;
  // Realistic paint: high envMapIntensity, anisotropic clearcoat, slight color shift
  const paintProps = {
    color: bodyColor,
    metalness: paintMetalness,
    roughness: paintRoughness,
    clearcoat: config.paintFinish === "gloss" ? 1 : 0.3,
    clearcoatRoughness: 0.03,
    envMapIntensity: 3.2,
    sheen: config.paintFinish === "gloss" ? 0.4 : 0,
    sheenRoughness: 0.6,
    sheenColor: "#ffffff",
  } as const;

  // Realistic supercar proportions — taller, less "pancake"
  const wb = 2.7;
  const tw = 1.55;
  const gc = 0.18;
  const bodyLen = 4.5;
  const bodyW = tw * 1.05;
  const bodyH = 0.46;            // ↑ from 0.18, gives the body actual mass
  const cabinH = 0.5;             // ↑ slightly to keep proportion
  const wheelR = 0.36;
  const wheelW = 0.24;

  // Body sits above tires; wheels tuck under the fenders
  const bodyY = wheelR + gc + bodyH / 2;
  const cabinY = bodyY + bodyH / 2 + cabinH / 2 - 0.08;

  // Wheel center is exactly wheelR above the ground (ground = y 0 in local space)
  const wheelY = wheelR;
  // Track sits the tires just inside the body width so they're flush with fenders
  const wheelZ = bodyW / 2 - wheelW * 0.55;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2,  wheelY,  wheelZ],
    [-wb / 2,  wheelY, -wheelZ],
    [ wb / 2,  wheelY,  wheelZ],
    [ wb / 2,  wheelY, -wheelZ],
  ];

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Flat underbody diffuser */}
      <mesh position={[0, bodyY - bodyH / 2 - 0.04, 0]}>
        <boxGeometry args={[bodyLen * 1.05, 0.025, bodyW * 0.9]} />
        <meshPhysicalMaterial color="#0d0d0d" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Main body — very flat & wide */}
      <RoundedBox args={[bodyLen, bodyH, bodyW]} radius={0.04} position={[0, bodyY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial {...paintProps} />
      </RoundedBox>

      {/* Wide rear haunches */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.38, bodyH * 1.3, bodyW * 0.18]} radius={0.04}
          position={[wb / 2 * 0.6, bodyY + 0.02, s * (bodyW / 2 + 0.04)]} castShadow>
          <meshPhysicalMaterial {...paintProps} />
        </RoundedBox>
      ))}
      {/* Front fender flares */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.32, bodyH * 1.2, bodyW * 0.16]} radius={0.04}
          position={[-wb / 2 * 0.65, bodyY + 0.02, s * (bodyW / 2 + 0.04)]} castShadow>
          <meshPhysicalMaterial {...paintProps} />
        </RoundedBox>
      ))}

      {/* Low sloping hood */}
      <RoundedBox args={[bodyLen * 0.38, bodyH * 0.5, bodyW * 0.9]} radius={0.035}
        position={[-bodyLen * 0.28, bodyY + bodyH * 0.25, 0]} rotation={[0, 0, 0.18]} castShadow>
        <meshPhysicalMaterial {...paintProps} />
      </RoundedBox>

      {/* Engine cover / rear deck */}
      <RoundedBox args={[bodyLen * 0.22, bodyH * 0.6, bodyW * 0.85]} radius={0.03}
        position={[bodyLen * 0.33, bodyY + bodyH * 0.18, 0]} rotation={[0, 0, -0.12]} castShadow>
        <meshPhysicalMaterial {...paintProps} />
      </RoundedBox>

      {/* Low cabin */}
      <RoundedBox args={[wb * 0.5, cabinH, bodyW * 0.8]} radius={0.05}
        position={[0, cabinY, 0]} castShadow>
        <meshPhysicalMaterial color="#0a0a1a" metalness={0.2} roughness={0.05}
          transmission={0.5} thickness={0.4} ior={1.5} envMapIntensity={1.5}
          opacity={windowOpacity} transparent />
      </RoundedBox>

      {/* Windshield */}
      <mesh position={[-wb * 0.17, cabinY + 0.05, 0]} rotation={[0, 0, 0.55]} castShadow>
        <boxGeometry args={[cabinH * 0.7, 0.012, bodyW * 0.72]} />
        <meshPhysicalMaterial color={windowColor} metalness={0.05} roughness={0.02}
          transmission={0.75} thickness={0.2} ior={1.52} envMapIntensity={3}
          opacity={windowOpacity} transparent />
      </mesh>

      {/* Rear fastback glass */}
      <mesh position={[wb * 0.28, cabinY + 0.06, 0]} rotation={[0, 0, -0.65]}>
        <boxGeometry args={[cabinH * 0.6, 0.012, bodyW * 0.68]} />
        <meshPhysicalMaterial color={windowColor} transmission={0.75} thickness={0.2}
          ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
      </mesh>

      {/* Side windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.05, cabinY + 0.02, s * bodyW * 0.41]}>
          <boxGeometry args={[wb * 0.38, cabinH * 0.55, 0.01]} />
          <meshPhysicalMaterial color={windowColor} transmission={0.7} thickness={0.2}
            ior={1.52} roughness={0.02} opacity={windowOpacity} transparent />
        </mesh>
      ))}

      {/* Active rear wing */}
      {config.bodyKit !== "stock" && (
        <RoundedBox args={[0.06, 0.12, bodyW * 0.85]} radius={0.02}
          position={[bodyLen * 0.46, bodyY + bodyH * 0.5 + 0.18, 0]} castShadow>
          <meshPhysicalMaterial color={config.bodyKit === "carbon" ? "#1a1a1a" : bodyColor} metalness={0.6} roughness={config.bodyKit === "carbon" ? 0.35 : 0.15} clearcoat={0.5} />
        </RoundedBox>
      )}

      {/* Front splitter */}
      {(config.bodyKit === "aero" || config.bodyKit === "carbon") && (
        <mesh position={[-bodyLen * 0.5, bodyY - bodyH * 0.3, 0]}>
          <boxGeometry args={[0.12, 0.018, bodyW * 1.1]} />
          <meshPhysicalMaterial color={config.bodyKit === "carbon" ? "#111" : "#1e293b"} metalness={0.5} roughness={0.3} />
        </mesh>
      )}

      {/* Headlights — angular LED strips */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-bodyLen * 0.49, bodyY + bodyH * 0.05, s * bodyW * 0.38]}>
          <mesh><boxGeometry args={[0.04, 0.06, 0.25]} />
            <meshPhysicalMaterial color="#d4d4d8" metalness={0.3} roughness={0.1} /></mesh>
          <mesh position={[-0.01, 0.01, 0]}>
            <boxGeometry args={[0.015, 0.025, 0.22]} />
            <meshStandardMaterial color={config.headlightColor} emissive={config.headlightColor} emissiveIntensity={4} />
          </mesh>
          {/* DRL strip */}
          <mesh position={[-0.015, 0.032, 0]}>
            <boxGeometry args={[0.01, 0.012, 0.2]} />
            <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={3} />
          </mesh>
        </group>
      ))}

      {/* Tail lights */}
      {[-1, 1].map((s) => (
        <group key={s} position={[bodyLen * 0.49, bodyY + bodyH * 0.04, s * bodyW * 0.38]}>
          <mesh><boxGeometry args={[0.03, 0.05, 0.28]} />
            <meshPhysicalMaterial color="#4a0000" metalness={0.3} roughness={0.15} /></mesh>
          <mesh position={[0.01, 0, 0]}>
            <boxGeometry args={[0.015, 0.03, 0.22]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4} />
          </mesh>
        </group>
      ))}
      {/* Tail light bar */}
      <mesh position={[bodyLen * 0.5, bodyY + bodyH * 0.06, 0]}>
        <boxGeometry args={[0.012, 0.018, bodyW * 0.7]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <WheelAssembly key={i} position={pos} wheelR={wheelR} wheelW={wheelW}
          rimColor={rimColor} rimStyle={config.rimStyle} />
      ))}

      {/* Side skirts */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[bodyLen * 0.55, 0.06, 0.035]} radius={0.01}
          position={[0.08, bodyY - bodyH * 0.38, s * bodyW * 0.52]} castShadow>
          <meshPhysicalMaterial color={config.bodyKit === "carbon" ? "#111" : "#0d0d0d"} metalness={0.6} roughness={0.25} />
        </RoundedBox>
      ))}

      {/* Side mirrors */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.1, 0.055, 0.04]} radius={0.01}
          position={[-wb * 0.15, cabinY - cabinH * 0.15, s * bodyW * 0.47]}>
          <meshPhysicalMaterial {...paintProps} />
        </RoundedBox>
      ))}

      {/* Exhaust tips */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[bodyLen * 0.5, bodyY - bodyH * 0.25, s * bodyW * 0.28]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.04, 0.1, 20]} />
          <meshPhysicalMaterial color="#aaaaaa" metalness={1} roughness={0.08} envMapIntensity={3} />
        </mesh>
      ))}

      {/* Heat-burnt exhaust ring (blue/purple anodised look) */}
      {[-1, 1].map((s) => (
        <mesh key={`burn-${s}`} position={[bodyLen * 0.51, bodyY - bodyH * 0.25, s * bodyW * 0.28]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.04, 0.005, 8, 24]} />
          <meshStandardMaterial color="#312e81" metalness={0.9} roughness={0.3} emissive="#1e1b4b" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Front grille mesh — black honeycomb suggestion */}
      <mesh position={[-bodyLen * 0.495, bodyY - bodyH * 0.05, 0]}>
        <boxGeometry args={[0.015, bodyH * 0.55, bodyW * 0.55]} />
        <meshPhysicalMaterial color="#0a0a0a" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Grille frame */}
      <RoundedBox args={[0.03, bodyH * 0.65, bodyW * 0.6]} radius={0.01} position={[-bodyLen * 0.49, bodyY - bodyH * 0.04, 0]}>
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.85} roughness={0.2} envMapIntensity={2} />
      </RoundedBox>

      {/* Carbon-fiber roof panel */}
      <mesh position={[0, cabinY + cabinH * 0.5 + 0.001, 0]}>
        <boxGeometry args={[wb * 0.42, 0.008, bodyW * 0.7]} />
        <meshPhysicalMaterial color="#0d0d0f" metalness={0.55} roughness={0.35} clearcoat={0.85} clearcoatRoughness={0.15} envMapIntensity={2} />
      </mesh>
    </group>
  );
}

function WheelAssembly({ position, wheelR, wheelW, rimColor, rimStyle }: {
  position: [number, number, number]; wheelR: number; wheelW: number;
  rimColor: string; rimStyle: string;
}) {
  const spokeCount = rimStyle === "mesh" ? 10 : rimStyle === "turbine" ? 5 : 5;
  return (
    <group position={position}>
      {/* Tire */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[wheelR, wheelW * 0.42, 28, 64]} />
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.95} metalness={0.02} sheen={0.2} sheenColor="#222222" />
      </mesh>
      {/* Tire sidewall lettering hint */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, wheelW * 0.21]}>
        <torusGeometry args={[wheelR * 0.85, 0.005, 6, 32]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>
      {/* Rim face */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[wheelR * 0.6, wheelR * 0.6, wheelW * 0.32, 32]} />
        <meshPhysicalMaterial color={rimColor} metalness={1} roughness={0.05} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={3.5} />
      </mesh>
      {/* Spokes */}
      {Array.from({ length: spokeCount }).map((_, si) => {
        const ang = (si / spokeCount) * Math.PI * 2;
        const isTurbine = rimStyle === "turbine";
        return (
          <mesh key={si} rotation={[Math.PI / 2, 0, ang + (isTurbine ? 0.3 : 0)]} castShadow>
            <boxGeometry args={[0.03, wheelW * 0.28, wheelR * 0.52]} />
            <meshPhysicalMaterial color={rimColor} metalness={1} roughness={0.07} envMapIntensity={3} />
          </mesh>
        );
      })}
      {/* Center cap */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.14, wheelR * 0.14, wheelW * 0.36, 16]} />
        <meshPhysicalMaterial color="#666" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Brake disc */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[wheelR * 0.44, wheelR * 0.44, wheelW * 0.07, 24]} />
        <meshPhysicalMaterial color="#9ca3af" metalness={0.95} roughness={0.25} envMapIntensity={2} />
      </mesh>
      {/* Brake disc drilled holes (visual rings) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
        <ringGeometry args={[wheelR * 0.28, wheelR * 0.32, 32]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Brake caliper */}
      <mesh position={[0, -wheelR * 0.38, 0]}>
        <boxGeometry args={[wheelW * 0.3, wheelR * 0.22, wheelR * 0.14]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.4} roughness={0.45} clearcoat={0.6} clearcoatRoughness={0.2} emissive="#7f1d1d" emissiveIntensity={0.05} />
      </mesh>
    </group>
  );
}
