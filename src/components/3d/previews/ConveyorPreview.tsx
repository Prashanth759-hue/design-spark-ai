import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function ConveyorPreview() {
  const boxRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (boxRef.current) {
      const t = clock.getElapsedTime();
      boxRef.current.position.x = Math.sin(t * 0.8) * 1.2;
    }
  });

  return (
    <group scale={0.6}>
      {/* Belt */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[3.5, 0.05, 0.7]} />
        <meshPhysicalMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Side rails */}
      <mesh position={[0, 0, 0.38]} castShadow>
        <boxGeometry args={[3.5, 0.12, 0.03]} />
        <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, -0.38]} castShadow>
        <boxGeometry args={[3.5, 0.12, 0.03]} />
        <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Moving box */}
      <mesh ref={boxRef} position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshPhysicalMaterial color="#f59e0b" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* CNC machine */}
      <group position={[0, 0.3, -1]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.6, 0.8]} />
          <meshPhysicalMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
