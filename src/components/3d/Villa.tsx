import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function Villa({ color = "#f5f5dc", autoRotate = true }: { color?: string; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -0.8, 0]}>
      {/* Main building */}
      <RoundedBox args={[2.4, 1.0, 1.6]} radius={0.03} position={[0, 0.5, 0]} castShadow>
        <meshPhysicalMaterial color={color} metalness={0.05} roughness={0.7} />
      </RoundedBox>

      {/* Second floor extension */}
      <RoundedBox args={[1.6, 0.7, 1.4]} radius={0.03} position={[-0.3, 1.35, 0]} castShadow>
        <meshPhysicalMaterial color={color} metalness={0.05} roughness={0.7} />
      </RoundedBox>

      {/* Roof - flat modern */}
      <mesh position={[-0.3, 1.72, 0]} castShadow>
        <boxGeometry args={[1.7, 0.05, 1.5]} />
        <meshPhysicalMaterial color="#78716c" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[2.5, 0.05, 1.7]} />
        <meshPhysicalMaterial color="#78716c" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Large floor-to-ceiling windows */}
      {[[-0.6, 0.5, 0.81], [0.3, 0.5, 0.81], [0.9, 0.5, 0.81]].map((pos, i) => (
        <mesh key={`fw${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.02]} />
          <meshPhysicalMaterial color="#93c5fd" metalness={0.1} roughness={0.02}
            transmission={0.5} thickness={0.3} ior={1.5} />
        </mesh>
      ))}

      {/* Second floor windows */}
      {[[-0.7, 1.35, 0.71], [0, 1.35, 0.71]].map((pos, i) => (
        <mesh key={`sw${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.02]} />
          <meshPhysicalMaterial color="#93c5fd" metalness={0.1} roughness={0.02}
            transmission={0.5} thickness={0.3} ior={1.5} />
        </mesh>
      ))}

      {/* Entrance door */}
      <mesh position={[-0.1, 0.35, 0.82]}>
        <boxGeometry args={[0.35, 0.65, 0.02]} />
        <meshPhysicalMaterial color="#44403c" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Balcony */}
      <mesh position={[-0.3, 1.0, 0.85]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.4]} />
        <meshPhysicalMaterial color="#a8a29e" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Balcony railing */}
      <mesh position={[-0.3, 1.12, 1.04]}>
        <boxGeometry args={[1.2, 0.2, 0.02]} />
        <meshPhysicalMaterial color="#d4d4d8" metalness={0.6} roughness={0.3} opacity={0.6} transparent />
      </mesh>

      {/* Garage */}
      <RoundedBox args={[0.8, 0.7, 1.0]} radius={0.02} position={[1.4, 0.35, 0.3]} castShadow>
        <meshPhysicalMaterial color="#e7e5e4" metalness={0.05} roughness={0.7} />
      </RoundedBox>
      <mesh position={[1.4, 0.3, 0.81]}>
        <boxGeometry args={[0.65, 0.5, 0.02]} />
        <meshPhysicalMaterial color="#57534e" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Pool */}
      <mesh position={[0.5, 0.02, -1.2]} receiveShadow>
        <boxGeometry args={[1.8, 0.12, 0.8]} />
        <meshPhysicalMaterial color="#0ea5e9" metalness={0.05} roughness={0.1}
          transmission={0.3} thickness={0.5} />
      </mesh>

      {/* Lawn */}
      <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 5]} />
        <meshPhysicalMaterial color="#4ade80" metalness={0} roughness={0.95} />
      </mesh>

      {/* Driveway */}
      <mesh position={[1.4, 0.005, 1.5]} receiveShadow>
        <boxGeometry args={[1.0, 0.01, 1.5]} />
        <meshPhysicalMaterial color="#a8a29e" metalness={0.1} roughness={0.9} />
      </mesh>
    </group>
  );
}
