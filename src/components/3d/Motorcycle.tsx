import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Motorcycle({ color = "#f97316", autoRotate = true }: { color?: string; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.15;
  });

  const wheelR = 0.35;
  const wheelW = 0.12;

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Rear wheel */}
      <group position={[-0.7, wheelR, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <torusGeometry args={[wheelR, 0.06, 16, 32]} />
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[wheelR - 0.08, wheelR - 0.08, wheelW, 24]} />
          <meshPhysicalMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Spokes */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * (wheelR * 0.5), wheelW * 0.1, Math.sin(a) * (wheelR * 0.5)]}
              rotation={[0, 0, a]}>
              <boxGeometry args={[0.02, wheelR * 0.8, 0.015]} />
              <meshPhysicalMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
            </mesh>
          );
        })}
      </group>

      {/* Front wheel */}
      <group position={[0.9, wheelR, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <torusGeometry args={[wheelR, 0.06, 16, 32]} />
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[wheelR - 0.08, wheelR - 0.08, wheelW, 24]} />
          <meshPhysicalMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Frame / body */}
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[1.6, 0.18, 0.3]} />
        <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.3} clearcoat={0.8} />
      </mesh>

      {/* Tank */}
      <mesh position={[0.1, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.2} clearcoat={1} />
      </mesh>

      {/* Seat */}
      <mesh position={[-0.35, 0.7, 0]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.22]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Fork */}
      <mesh position={[0.75, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
        <meshPhysicalMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Handlebar */}
      <mesh position={[0.8, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
        <meshPhysicalMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Engine block */}
      <mesh position={[-0.1, 0.38, 0]} castShadow>
        <boxGeometry args={[0.35, 0.25, 0.28]} />
        <meshPhysicalMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Exhaust */}
      <mesh position={[-0.5, 0.35, 0.2]} rotation={[0, 0, -0.1]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Headlight */}
      <mesh position={[0.95, 0.75, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
      </mesh>

      {/* Tail light */}
      <mesh position={[-0.85, 0.6, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>

      {/* Rear swingarm */}
      <mesh position={[-0.35, 0.4, 0.08]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.04]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.35, 0.4, -0.08]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.04]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
