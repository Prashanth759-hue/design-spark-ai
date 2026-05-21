import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Motorcycle({ color = "#f97316", autoRotate = true }: { color?: string; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const frontWheelRef = useRef<THREE.Group>(null);
  const rearWheelRef = useRef<THREE.Group>(null);

  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.15;
    if (frontWheelRef.current) frontWheelRef.current.rotation.x += d * 2;
    if (rearWheelRef.current) rearWheelRef.current.rotation.x += d * 2;
  });

  const wheelR = 0.32;
  const wheelW = 0.11;
  const wb = 1.45;

  const Wheel = ({ pos, ref: wheelRef }: { pos: [number, number, number]; ref: React.RefObject<THREE.Group> }) => (
    <group position={pos} ref={wheelRef}>
      {/* Tire */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[wheelR, 0.055, 20, 48]} />
        <meshPhysicalMaterial color="#111" roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[wheelR * 0.72, wheelR * 0.72, wheelW * 0.6, 32]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Spokes - Y-spoke design */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} rotation={[Math.PI / 2, 0, a]} position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.02, wheelW * 0.4, wheelR * 0.65]} />
            <meshPhysicalMaterial color="#e0e0e0" metalness={0.92} roughness={0.06} />
          </mesh>
        );
      })}
      {/* Hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, wheelW * 0.7, 16]} />
        <meshPhysicalMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Brake disc */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wheelW * 0.2, 0]}>
        <cylinderGeometry args={[wheelR * 0.55, wheelR * 0.55, 0.008, 32]} />
        <meshPhysicalMaterial color="#888" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Disc holes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`dh-${i}`} rotation={[Math.PI / 2, 0, 0]}
            position={[Math.cos(a) * wheelR * 0.4, wheelW * 0.2, Math.sin(a) * wheelR * 0.4]}>
            <cylinderGeometry args={[0.012, 0.012, 0.012, 8]} />
            <meshPhysicalMaterial color="#444" metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}
      {/* Brake caliper */}
      <mesh position={[0, wheelW * 0.22, -wheelR * 0.42]}>
        <boxGeometry args={[0.06, 0.03, 0.08]} />
        <meshPhysicalMaterial color="#d4a017" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );

  return (
    // Place the bike so wheel bottoms (y = 0 local) sit on the ground plane
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* Rear wheel — directly under the seat/swingarm pivot */}
      <Wheel pos={[-wb / 2, wheelR, 0]} ref={rearWheelRef} />
      {/* Front wheel — directly under the fork */}
      <Wheel pos={[ wb / 2, wheelR, 0]} ref={frontWheelRef} />

      {/* Frame - main tube */}
      <mesh position={[0.1, 0.55, 0]} rotation={[0, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.025, 0.028, 1.1, 12]} />
        <meshPhysicalMaterial color="#222" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Frame - downtube */}
      <mesh position={[-0.15, 0.42, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.022, 0.025, 0.55, 10]} />
        <meshPhysicalMaterial color="#222" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Frame - subframe */}
      <mesh position={[-0.35, 0.58, 0]} rotation={[0, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.018, 0.02, 0.5, 10]} />
        <meshPhysicalMaterial color="#222" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Fuel tank - sculpted */}
      <mesh position={[0.12, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.1} clearcoat={1} clearcoatRoughness={0.02}
          envMapIntensity={3.5} sheen={0.4} sheenColor="#ffffff" sheenRoughness={0.4} />
      </mesh>
      <mesh position={[0.12, 0.71, 0]} castShadow>
        <boxGeometry args={[0.42, 0.2, 0.28]} />
        <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.1} clearcoat={1} clearcoatRoughness={0.02}
          envMapIntensity={3.5} sheen={0.4} sheenColor="#ffffff" sheenRoughness={0.4} />
      </mesh>
      {/* Tank ridge */}
      <mesh position={[0.12, 0.82, 0]}>
        <boxGeometry args={[0.35, 0.01, 0.04]} />
        <meshPhysicalMaterial color="#111" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Seat */}
      <mesh position={[-0.25, 0.7, 0]} castShadow>
        <boxGeometry args={[0.48, 0.06, 0.2]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.92} metalness={0} />
      </mesh>
      {/* Seat contour */}
      <mesh position={[-0.25, 0.72, 0]} castShadow>
        <boxGeometry args={[0.44, 0.015, 0.18]} />
        <meshPhysicalMaterial color="#222" roughness={0.85} />
      </mesh>

      {/* Engine block - V-twin style */}
      <mesh position={[-0.05, 0.38, 0]} castShadow>
        <boxGeometry args={[0.3, 0.22, 0.24]} />
        <meshPhysicalMaterial color="#2a2a2a" metalness={0.82} roughness={0.18} />
      </mesh>
      {/* Cylinder fins */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`fin-${i}`} position={[-0.05, 0.32 + i * 0.03, 0]} castShadow>
          <boxGeometry args={[0.32, 0.005, 0.28]} />
          <meshPhysicalMaterial color="#3a3a3a" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Cylinder head */}
      <mesh position={[0.05, 0.52, 0]} rotation={[0, 0, 0.4]} castShadow>
        <boxGeometry args={[0.12, 0.15, 0.2]} />
        <meshPhysicalMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Exhaust system */}
      <mesh position={[-0.15, 0.3, 0.18]} rotation={[0, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.35, 10]} />
        <meshPhysicalMaterial color="#8a8a8a" metalness={0.92} roughness={0.08} />
      </mesh>
      <mesh position={[-0.4, 0.24, 0.2]} rotation={[0, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.022, 0.032, 0.3, 10]} />
        <meshPhysicalMaterial color="#777" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Muffler */}
      <mesh position={[-0.6, 0.22, 0.2]} rotation={[0, 0, 0.05]} castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.2, 12]} />
        <meshPhysicalMaterial color="#555" metalness={0.88} roughness={0.12} />
      </mesh>
      <mesh position={[-0.71, 0.22, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.045, 0.01, 12]} />
        <meshPhysicalMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Front forks - USD (upside-down) */}
      {[-0.06, 0.06].map((z, i) => (
        <group key={`fork-${i}`}>
          {/* Upper tube (gold) */}
          <mesh position={[0.55, 0.62, z]} rotation={[0, 0, 0.32]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.55, 12]} />
            <meshPhysicalMaterial color="#c5a030" metalness={0.9} roughness={0.08} />
          </mesh>
          {/* Lower tube */}
          <mesh position={[0.68, 0.42, z]} rotation={[0, 0, 0.32]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.35, 12]} />
            <meshPhysicalMaterial color="#aaa" metalness={0.88} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Triple clamp */}
      <mesh position={[0.48, 0.82, 0]} castShadow>
        <boxGeometry args={[0.08, 0.025, 0.18]} />
        <meshPhysicalMaterial color="#333" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Handlebar - clip-on style */}
      {[-1, 1].map(s => (
        <mesh key={`hb-${s}`} position={[0.48, 0.84, s * 0.12]} rotation={[0, 0.3 * s, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
          <meshPhysicalMaterial color="#222" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {/* Grips */}
      {[-1, 1].map(s => (
        <mesh key={`grip-${s}`} position={[0.48, 0.84, s * 0.18]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
          <meshPhysicalMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}

      {/* Headlight assembly */}
      <mesh position={[0.78, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.065, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#222" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.81, 0.72, 0]}>
        <circleGeometry args={[0.055, 24]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={3} />
      </mesh>
      {/* DRL ring */}
      <mesh position={[0.805, 0.72, 0]}>
        <torusGeometry args={[0.052, 0.004, 8, 24]} />
        <meshStandardMaterial color="#fff" emissive="#e0f2fe" emissiveIntensity={2} />
      </mesh>

      {/* Tail section / cowl */}
      <mesh position={[-0.5, 0.65, 0]} castShadow>
        <boxGeometry args={[0.22, 0.1, 0.16]} />
        <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.1} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={3.2} />
      </mesh>

      {/* Tail light - LED strip */}
      <mesh position={[-0.62, 0.62, 0]}>
        <boxGeometry args={[0.01, 0.03, 0.12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
      </mesh>

      {/* Rear swingarm */}
      {[-0.065, 0.065].map((z, i) => (
        <mesh key={`sa-${i}`} position={[-0.35, 0.36, z]} rotation={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[0.55, 0.035, 0.03]} />
          <meshPhysicalMaterial color="#555" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* Rear shock */}
      <mesh position={[-0.28, 0.52, 0.08]} rotation={[0, 0, 0.25]} castShadow>
        <cylinderGeometry args={[0.015, 0.018, 0.28, 8]} />
        <meshPhysicalMaterial color="#c5a030" metalness={0.85} roughness={0.1} />
      </mesh>
      <mesh position={[-0.22, 0.58, 0.08]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />
        <meshPhysicalMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Chain / sprocket */}
      <mesh position={[-wb / 2, wheelR, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.008, 8, 20]} />
        <meshPhysicalMaterial color="#888" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[-0.05, 0.32, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.006, 8, 16]} />
        <meshPhysicalMaterial color="#888" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Foot pegs */}
      {[-1, 1].map(s => (
        <mesh key={`fp-${s}`} position={[-0.08, 0.28, s * 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.06, 6]} />
          <meshPhysicalMaterial color="#555" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* Instrument cluster */}
      <mesh position={[0.45, 0.88, 0]} rotation={[-0.6, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.015, 16]} />
        <meshPhysicalMaterial color="#111" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0.45, 0.885, 0]} rotation={[-0.6, 0, 0]}>
        <circleGeometry args={[0.035, 16]} />
        <meshStandardMaterial color="#0f172a" emissive="#22d3ee" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
