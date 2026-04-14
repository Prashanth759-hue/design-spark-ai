import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function RobotArmPreview() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <group ref={ref} scale={0.8}>
      {/* Base */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 24]} />
        <meshPhysicalMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Lower arm */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[0.16, 1, 0.16]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Joint */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Upper arm */}
      <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Gripper */}
      <mesh position={[0.55, 0.65, 0.06]} castShadow>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
        <meshPhysicalMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.55, 0.65, -0.06]} castShadow>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
        <meshPhysicalMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}
