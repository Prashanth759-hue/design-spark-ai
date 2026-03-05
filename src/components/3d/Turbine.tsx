import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Turbine({ rpm = 500, color = "#22d3ee", autoRotate = true }: {
  rpm?: number; color?: string; autoRotate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);

  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.06;
    if (rotorRef.current) rotorRef.current.rotation.z += d * (rpm / 150);
  });

  const bladeCount = 16;
  const statorCount = 20;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── Outer casing ── */}
      <mesh castShadow>
        <torusGeometry args={[1.3, 0.12, 20, 48]} />
        <meshPhysicalMaterial color="#374151" metalness={0.82} roughness={0.18} />
      </mesh>
      {/* Casing lip - front */}
      <mesh position={[0, 0, 0.08]}>
        <torusGeometry args={[1.3, 0.04, 12, 48]} />
        <meshPhysicalMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Casing lip - rear */}
      <mesh position={[0, 0, -0.08]}>
        <torusGeometry args={[1.3, 0.04, 12, 48]} />
        <meshPhysicalMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── Inner shroud ── */}
      <mesh>
        <torusGeometry args={[0.95, 0.04, 12, 36]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.88} roughness={0.1} />
      </mesh>

      {/* ── Stator vanes (fixed) ── */}
      {Array.from({ length: statorCount }).map((_, i) => {
        const angle = (i / statorCount) * Math.PI * 2;
        const r = 1.1;
        return (
          <mesh key={`stator-${i}`}
            position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}
            rotation={[0, 0, angle + 0.15]}
            castShadow>
            <boxGeometry args={[0.06, 0.28, 0.06]} />
            <meshPhysicalMaterial color="#9ca3af" metalness={0.85} roughness={0.12} />
          </mesh>
        );
      })}

      {/* ── Rotor (spinning) ── */}
      <group ref={rotorRef}>
        {/* Rotor blades */}
        {Array.from({ length: bladeCount }).map((_, i) => {
          const angle = (i / bladeCount) * Math.PI * 2;
          const r = 0.72;
          return (
            <mesh key={`blade-${i}`}
              position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}
              rotation={[0, 0, angle + 0.25]}
              castShadow>
              <boxGeometry args={[0.05, 0.42, 0.035]} />
              <meshPhysicalMaterial
                color={color}
                metalness={0.75}
                roughness={0.15}
                emissive={color}
                emissiveIntensity={rpm > 1200 ? 0.3 : rpm > 600 ? 0.1 : 0.02}
              />
            </mesh>
          );
        })}

        {/* Rotor disc */}
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.06, 32]} />
          <meshPhysicalMaterial color="#475569" metalness={0.9} roughness={0.08} />
        </mesh>

        {/* Hub cone */}
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.15, 20]} />
          <meshPhysicalMaterial color="#1e293b" metalness={0.92} roughness={0.06} />
        </mesh>

        {/* Hub cap */}
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#334155" metalness={0.9} roughness={0.08} />
        </mesh>
      </group>

      {/* ── Shaft ── */}
      <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.9, 20]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.92} roughness={0.06} />
      </mesh>

      {/* ── Bearing housings ── */}
      {[-0.3, -0.8].map((z, i) => (
        <group key={`bearing-${i}`}>
          <mesh position={[0, 0, z]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.15, 24]} />
            <meshPhysicalMaterial color="#334155" metalness={0.75} roughness={0.25} />
          </mesh>
          {/* Bearing cap bolts */}
          {Array.from({ length: 6 }).map((_, bi) => {
            const ba = (bi / 6) * Math.PI * 2;
            return (
              <mesh key={`bb-${bi}`} position={[Math.cos(ba) * 0.16, Math.sin(ba) * 0.16, z]}>
                <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
                <meshPhysicalMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* ── Oil supply lines ── */}
      <mesh position={[0.15, -0.2, -0.5]} rotation={[0.8, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshPhysicalMaterial color="#6b7280" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* ── Mounting flanges with bolt holes ── */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, i) => (
        <group key={`flange-${i}`}>
          <mesh position={[Math.cos(a) * 1.42, Math.sin(a) * 1.42, 0]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.12]} />
            <meshPhysicalMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Bolt holes */}
          <mesh position={[Math.cos(a) * 1.42, Math.sin(a) * 1.42, 0.07]}>
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshPhysicalMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── Exhaust nozzle / diffuser ── */}
      <mesh position={[0, 0, -1.0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 0.25, 24]} />
        <meshPhysicalMaterial color="#44403c" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Base plate ── */}
      <mesh position={[0, -1.5, -0.3]} receiveShadow>
        <boxGeometry args={[3.2, 0.07, 2.2]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Support legs */}
      {[[-1.2, -0.8], [1.2, -0.8], [-1.2, 0.2], [1.2, 0.2]].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, -1.2, z]} castShadow>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshPhysicalMaterial color="#374151" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}

      {/* ── Data plate ── */}
      <mesh position={[0, -1.2, 0.85]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.005]} />
        <meshPhysicalMaterial color="#f5f5f4" metalness={0.1} roughness={0.5} />
      </mesh>
    </group>
  );
}
