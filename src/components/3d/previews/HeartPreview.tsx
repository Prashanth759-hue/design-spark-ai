import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function HeartPreview() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      const beat = Math.pow(Math.sin(t * 1.2 * Math.PI), 2);
      const s = 1 + beat * 0.06;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={ref} scale={0.9}>
      <mesh position={[-0.2, 0, 0]} castShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.1} roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0, 0]} castShadow>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshPhysicalMaterial color="#b91c1c" metalness={0.1} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.5, 12]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-0.2, 0.55, 0.08]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.35, 10]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0.2, 0.5, 0.08]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.3, 10]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  );
}
