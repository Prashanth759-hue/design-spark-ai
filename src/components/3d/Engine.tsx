import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function Engine({ rpm = 500, autoRotate = true }: { rpm?: number; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const crankRef = useRef<THREE.Group>(null);

  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.1;
    if (crankRef.current) crankRef.current.rotation.z += d * (rpm / 300);
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Engine block */}
      <RoundedBox args={[1.4, 0.9, 0.8]} radius={0.04} position={[0, 0.45, 0]} castShadow>
        <meshPhysicalMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </RoundedBox>

      {/* Cylinder head */}
      <RoundedBox args={[1.3, 0.25, 0.75]} radius={0.03} position={[0, 0.95, 0]} castShadow>
        <meshPhysicalMaterial color="#4b5563" metalness={0.7} roughness={0.25} />
      </RoundedBox>

      {/* Valve cover */}
      <RoundedBox args={[1.2, 0.12, 0.65]} radius={0.03} position={[0, 1.12, 0]} castShadow>
        <meshPhysicalMaterial color="#1e40af" metalness={0.6} roughness={0.3} />
      </RoundedBox>

      {/* Intake manifold tubes */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 1.05, -0.45]} rotation={[0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.4, 12]} />
          <meshPhysicalMaterial color="#94a3b8" metalness={0.8} roughness={0.15} />
        </mesh>
      ))}

      {/* Exhaust manifold */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0.48]} rotation={[-0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.35, 10]} />
          <meshPhysicalMaterial color="#78716c" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* Oil pan */}
      <mesh position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[1.2, 0.12, 0.7]} />
        <meshPhysicalMaterial color="#292524" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Crankshaft pulley */}
      <group ref={crankRef} position={[0.75, 0.25, 0]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 20]} />
          <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Belt grooves */}
        <mesh>
          <torusGeometry args={[0.18, 0.015, 8, 20]} />
          <meshPhysicalMaterial color="#111" roughness={0.9} />
        </mesh>
      </group>

      {/* Alternator */}
      <mesh position={[0.72, 0.6, 0.35]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Spark plug wires */}
      {[-0.35, -0.1, 0.15, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} />
          <meshPhysicalMaterial color="#ef4444" roughness={0.5} />
        </mesh>
      ))}

      {/* Flywheel */}
      <mesh position={[-0.75, 0.35, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.06, 24]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Mounting bolts */}
      {[[-0.6, 0, -0.35], [0.6, 0, -0.35], [-0.6, 0, 0.35], [0.6, 0, 0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
          <meshPhysicalMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
