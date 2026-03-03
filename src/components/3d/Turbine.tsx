import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Turbine({ rpm = 500, color = "#22d3ee", autoRotate = true }: {
  rpm?: number; color?: string; autoRotate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.08;
    if (bladesRef.current) bladesRef.current.rotation.z += d * (rpm / 200);
  });

  const bladeCount = 12;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Housing - outer casing */}
      <mesh castShadow>
        <torusGeometry args={[1.2, 0.15, 16, 32]} />
        <meshPhysicalMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Inner ring */}
      <mesh>
        <torusGeometry args={[0.85, 0.06, 12, 24]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Blades */}
      <group ref={bladesRef}>
        {Array.from({ length: bladeCount }).map((_, i) => {
          const angle = (i / bladeCount) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, 0]}
              rotation={[0, 0, angle + 0.3]} castShadow>
              <boxGeometry args={[0.08, 0.55, 0.04]} />
              <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.2}
                emissive={color} emissiveIntensity={rpm > 1000 ? 0.3 : 0.05} />
            </mesh>
          );
        })}
        {/* Hub */}
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.2, 24]} />
          <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Shaft */}
      <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Bearing housing */}
      <mesh position={[0, 0, -0.9]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.3, 24]} />
        <meshPhysicalMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Mounting flanges */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, 0.15]} />
          <meshPhysicalMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Base plate */}
      <mesh position={[0, -1.5, -0.3]} receiveShadow>
        <boxGeometry args={[3, 0.08, 2]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}
