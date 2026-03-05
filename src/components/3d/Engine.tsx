import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function Engine({ rpm = 500, autoRotate = true }: { rpm?: number; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const crankRef = useRef<THREE.Group>(null);
  const camRef = useRef<THREE.Mesh>(null);
  const fanRef = useRef<THREE.Group>(null);

  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.08;
    const speed = d * (rpm / 250);
    if (crankRef.current) crankRef.current.rotation.z += speed;
    if (camRef.current) camRef.current.rotation.z += speed * 0.5;
    if (fanRef.current) fanRef.current.rotation.z += speed * 1.5;
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* ── Engine block ── */}
      <RoundedBox args={[1.5, 0.95, 0.85]} radius={0.03} position={[0, 0.48, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#2d3748" metalness={0.72} roughness={0.28} />
      </RoundedBox>

      {/* Block ribbing */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`rib-${i}`} position={[-0.55 + i * 0.22, 0.48, 0.435]} castShadow>
          <boxGeometry args={[0.015, 0.85, 0.02]} />
          <meshPhysicalMaterial color="#374151" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* ── Cylinder head ── */}
      <RoundedBox args={[1.4, 0.25, 0.8]} radius={0.025} position={[0, 1.0, 0]} castShadow>
        <meshPhysicalMaterial color="#4b5563" metalness={0.7} roughness={0.22} />
      </RoundedBox>

      {/* Head bolts */}
      {[[-0.55, -0.3], [-0.25, -0.3], [0.05, -0.3], [0.35, -0.3], [0.55, -0.3],
        [-0.55, 0.3], [-0.25, 0.3], [0.05, 0.3], [0.35, 0.3], [0.55, 0.3]].map(([x, z], i) => (
        <mesh key={`hb-${i}`} position={[x, 1.13, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 6]} />
          <meshPhysicalMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* ── Valve cover ── */}
      <RoundedBox args={[1.3, 0.14, 0.7]} radius={0.03} position={[0, 1.18, 0]} castShadow>
        <meshPhysicalMaterial color="#1e40af" metalness={0.6} roughness={0.28} />
      </RoundedBox>
      {/* Valve cover filler cap */}
      <mesh position={[0.3, 1.26, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
        <meshPhysicalMaterial color="#1e3a8a" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* ── Camshaft ── */}
      <mesh ref={camRef} position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 12]} />
        <meshPhysicalMaterial color="#6b7280" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Intake manifold ── */}
      {[-0.4, -0.13, 0.14, 0.41].map((x, i) => (
        <group key={`im-${i}`}>
          <mesh position={[x, 1.12, -0.48]} rotation={[0.45, 0, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.065, 0.35, 12]} />
            <meshPhysicalMaterial color="#94a3b8" metalness={0.82} roughness={0.12} />
          </mesh>
          {/* Fuel injector */}
          <mesh position={[x, 1.18, -0.35]}>
            <cylinderGeometry args={[0.015, 0.012, 0.08, 8]} />
            <meshPhysicalMaterial color="#111" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Intake plenum */}
      <RoundedBox args={[1.1, 0.18, 0.2]} radius={0.04} position={[0, 1.2, -0.6]} castShadow>
        <meshPhysicalMaterial color="#94a3b8" metalness={0.78} roughness={0.15} />
      </RoundedBox>
      {/* Throttle body */}
      <mesh position={[0.4, 1.2, -0.72]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
        <meshPhysicalMaterial color="#6b7280" metalness={0.85} roughness={0.12} />
      </mesh>

      {/* ── Exhaust manifold ── */}
      {[-0.4, -0.13, 0.14, 0.41].map((x, i) => (
        <group key={`em-${i}`}>
          <mesh position={[x, 0.7, 0.5]} rotation={[-0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 10]} />
            <meshPhysicalMaterial color="#78716c" metalness={0.88} roughness={0.12} />
          </mesh>
        </group>
      ))}
      {/* Exhaust collector */}
      <mesh position={[0, 0.55, 0.62]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.9, 12]} />
        <meshPhysicalMaterial color="#6b6860" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* ── Oil pan ── */}
      <mesh position={[0, -0.04, 0]} castShadow>
        <boxGeometry args={[1.3, 0.14, 0.75]} />
        <meshPhysicalMaterial color="#1c1917" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Oil drain plug */}
      <mesh position={[0.2, -0.11, 0.3]}>
        <cylinderGeometry args={[0.018, 0.018, 0.02, 6]} />
        <meshPhysicalMaterial color="#a8a29e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Crankshaft pulley ── */}
      <group ref={crankRef} position={[0.82, 0.3, 0]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 24]} />
          <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.08} />
        </mesh>
        {/* Belt grooves */}
        {[0.14, 0.17, 0.2].map((r, i) => (
          <mesh key={i}>
            <torusGeometry args={[r, 0.008, 8, 24]} />
            <meshPhysicalMaterial color="#0a0a0a" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* ── Alternator ── */}
      <mesh position={[0.78, 0.7, 0.38]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 20]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.82} roughness={0.18} />
      </mesh>
      <mesh position={[0.78, 0.7, 0.45]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Water pump ── */}
      <mesh position={[0.82, 0.5, 0.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshPhysicalMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── Fan ── */}
      <group ref={fanRef} position={[0.9, 0.5, 0]}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[0, Math.sin(a) * 0.15, Math.cos(a) * 0.15]}
              rotation={[a, 0, 0.2]}>
              <boxGeometry args={[0.008, 0.12, 0.04]} />
              <meshPhysicalMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
            </mesh>
          );
        })}
      </group>

      {/* ── Spark plugs ── */}
      {[-0.4, -0.13, 0.14, 0.41].map((x, i) => (
        <group key={`sp-${i}`}>
          <mesh position={[x, 1.28, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.12, 6]} />
            <meshPhysicalMaterial color="#f5f5f4" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Spark plug wire */}
          <mesh position={[x, 1.35, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
            <meshPhysicalMaterial color="#ef4444" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* ── Starter motor ── */}
      <mesh position={[-0.75, 0.15, 0.2]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.15, 12]} />
        <meshPhysicalMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── Flywheel ── */}
      <mesh position={[-0.82, 0.4, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 28]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.08} />
      </mesh>
      {/* Ring gear on flywheel */}
      <mesh position={[-0.82, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.27, 0.012, 8, 48]} />
        <meshPhysicalMaterial color="#333" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ── Coolant hoses ── */}
      <mesh position={[0.4, 0.9, -0.44]} rotation={[-0.5, 0.2, 0]} castShadow>
        <torusGeometry args={[0.08, 0.018, 8, 12, Math.PI]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* ── Mounting brackets ── */}
      {[[-0.65, 0, -0.38], [0.65, 0, -0.38], [-0.65, 0, 0.38], [0.65, 0, 0.38]].map((pos, i) => (
        <group key={`mount-${i}`}>
          <mesh position={pos as [number, number, number]}>
            <boxGeometry args={[0.06, 0.08, 0.06]} />
            <meshPhysicalMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[pos[0], pos[1] - 0.03, pos[2]]}>
            <cylinderGeometry args={[0.022, 0.022, 0.04, 8]} />
            <meshPhysicalMaterial color="#d4d4d8" metalness={0.9} roughness={0.08} />
          </mesh>
        </group>
      ))}

      {/* ── Dipstick ── */}
      <mesh position={[0.55, 0.6, 0.4]} rotation={[0.2, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.5, 6]} />
        <meshPhysicalMaterial color="#fbbf24" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.57, 0.84, 0.45]}>
        <cylinderGeometry args={[0.012, 0.012, 0.03, 8]} />
        <meshPhysicalMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}
