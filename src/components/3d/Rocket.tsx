import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * Falcon-9 / Saturn-V inspired heavy-lift launch vehicle.
 * Two-stage stack with grid fins, interstage, fairing, engines, exhaust plume.
 */
export function Rocket({ thrusting = true, autoRotate = true }: { thrusting?: boolean; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const plumeRef = useRef<THREE.Mesh>(null);
  const flickerRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += 0.005;
    if (thrusting && plumeRef.current) {
      const s = 1 + Math.sin(t * 30) * 0.08 + Math.sin(t * 47) * 0.04;
      plumeRef.current.scale.set(s, 1 + Math.sin(t * 18) * 0.1, s);
    }
    if (thrusting && flickerRef.current) {
      flickerRef.current.intensity = 4 + Math.random() * 2;
    }
  });

  const white = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f8fafc", metalness: 0.4, roughness: 0.45, clearcoat: 0.6, envMapIntensity: 1.8,
  }), []);
  const black = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0a0a0a", metalness: 0.5, roughness: 0.4, envMapIntensity: 1.5,
  }), []);
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#9ca3af", metalness: 1, roughness: 0.2, envMapIntensity: 3,
  }), []);
  const heat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#3a3a3a", metalness: 0.9, roughness: 0.4, emissive: "#ff4500", emissiveIntensity: thrusting ? 1.2 : 0,
  }), [thrusting]);

  return (
    <group ref={groupRef} position={[0, -1.5, 0]} scale={0.55}>
      {/* ───── First stage (booster) ───── */}
      <mesh castShadow position={[0, 1.8, 0]} material={white}>
        <cylinderGeometry args={[0.5, 0.5, 3.6, 32]} />
      </mesh>
      {/* Booster paint stripes (USA-style) */}
      <mesh position={[0, 0.5, 0]} material={black}>
        <cylinderGeometry args={[0.502, 0.502, 0.25, 32]} />
      </mesh>
      <mesh position={[0, 1.1, 0]} material={black}>
        <cylinderGeometry args={[0.502, 0.502, 0.08, 32]} />
      </mesh>
      {/* Booster panel lines (vertical seams) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 4) * 0.501, 1.8, Math.sin((i * Math.PI) / 4) * 0.501]}>
          <boxGeometry args={[0.005, 3.6, 0.005]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      ))}
      {/* Logo placard (red square) */}
      <mesh position={[0, 2.5, 0.503]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.005]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Grid fins (4) — Falcon-9 style at top of booster */}
      {[0, 1, 2, 3].map((i) => {
        const ang = (i * Math.PI) / 2;
        return (
          <group key={i} position={[Math.cos(ang) * 0.55, 3.4, Math.sin(ang) * 0.55]} rotation={[0, ang, 0]}>
            <mesh castShadow material={metal}>
              <boxGeometry args={[0.04, 0.28, 0.32]} />
            </mesh>
            {/* Grid pattern using thin bars */}
            {[-0.1, 0, 0.1].map((y) => (
              <mesh key={y} position={[0.022, y, 0]} material={metal}>
                <boxGeometry args={[0.005, 0.02, 0.3]} />
              </mesh>
            ))}
            {[-0.13, 0, 0.13].map((z) => (
              <mesh key={z} position={[0.022, 0, z]} material={metal}>
                <boxGeometry args={[0.005, 0.26, 0.02]} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Landing legs (folded) */}
      {[0, 1, 2, 3].map((i) => {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        return (
          <mesh key={i} castShadow
            position={[Math.cos(ang) * 0.5, 0.4, Math.sin(ang) * 0.5]}
            rotation={[0, ang, 0.15]} material={black}>
            <boxGeometry args={[0.05, 0.6, 0.08]} />
          </mesh>
        );
      })}

      {/* ───── Interstage ───── */}
      <mesh castShadow position={[0, 3.7, 0]} material={black}>
        <cylinderGeometry args={[0.5, 0.5, 0.18, 32]} />
      </mesh>

      {/* ───── Second stage ───── */}
      <mesh castShadow position={[0, 4.4, 0]} material={white}>
        <cylinderGeometry args={[0.45, 0.5, 1.2, 32]} />
      </mesh>
      <mesh position={[0, 4.4, 0]} material={black}>
        <cylinderGeometry args={[0.453, 0.453, 0.06, 32]} />
      </mesh>

      {/* ───── Payload fairing (nose cone) ───── */}
      <mesh castShadow position={[0, 5.3, 0]} material={white}>
        <cylinderGeometry args={[0.42, 0.45, 0.6, 32]} />
      </mesh>
      <mesh castShadow position={[0, 5.95, 0]} material={white}>
        <coneGeometry args={[0.42, 0.9, 32]} />
      </mesh>
      {/* Fairing seam */}
      <mesh position={[0.42, 5.3, 0]}>
        <boxGeometry args={[0.005, 0.6, 0.002]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[-0.42, 5.3, 0]}>
        <boxGeometry args={[0.005, 0.6, 0.002]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* ───── Engine bell cluster (9 Merlins) ───── */}
      <mesh position={[0, -0.05, 0]} material={black}>
        <cylinderGeometry args={[0.5, 0.42, 0.18, 32]} />
      </mesh>
      {/* Center engine */}
      <mesh castShadow position={[0, -0.22, 0]} material={heat}>
        <coneGeometry args={[0.12, 0.32, 24]} />
      </mesh>
      {/* 8 outer engines */}
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i * Math.PI) / 4;
        return (
          <mesh key={i} castShadow position={[Math.cos(ang) * 0.28, -0.2, Math.sin(ang) * 0.28]} material={heat}>
            <coneGeometry args={[0.09, 0.28, 16]} />
          </mesh>
        );
      })}

      {/* ───── Exhaust plume (when thrusting) ───── */}
      {thrusting && (
        <>
          <mesh ref={plumeRef} position={[0, -0.9, 0]}>
            <coneGeometry args={[0.55, 1.6, 32, 1, true]} />
            <meshStandardMaterial color="#fff8e1" emissive="#ff7f00" emissiveIntensity={3} transparent opacity={0.85} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          {/* Inner blue Mach diamonds */}
          <mesh position={[0, -0.55, 0]}>
            <coneGeometry args={[0.18, 0.6, 24, 1, true]} />
            <meshStandardMaterial color="#dbeafe" emissive="#3b82f6" emissiveIntensity={4} transparent opacity={0.9} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <pointLight ref={flickerRef} position={[0, -0.4, 0]} color="#ff7f00" intensity={5} distance={6} />
          {/* Smoke ring */}
          <mesh position={[0, -1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 1.2, 32]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  );
}