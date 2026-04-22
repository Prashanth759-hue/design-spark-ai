import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function BusVehicle({ color = "#1e40af", autoRotate = true }: { color?: string; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.12;
  });

  const bodyL = 3.2;
  const bodyW = 0.9;
  const bodyH = 1.0;
  const wheelR = 0.22;

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Main body */}
      <RoundedBox args={[bodyL, bodyH, bodyW]} radius={0.06} position={[0, bodyH / 2 + wheelR, 0]} castShadow>
        <meshPhysicalMaterial color={color} metalness={0.55} roughness={0.18} clearcoat={1} clearcoatRoughness={0.05}
          envMapIntensity={3.2} sheen={0.4} sheenColor="#ffffff" sheenRoughness={0.5} />
      </RoundedBox>

      {/* Roof */}
      <RoundedBox args={[bodyL * 0.95, 0.06, bodyW * 0.85]} radius={0.02}
        position={[0, bodyH + wheelR + 0.03, 0]} castShadow>
        <meshPhysicalMaterial color="#e5e7eb" metalness={0.2} roughness={0.5} />
      </RoundedBox>

      {/* Windows */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = -bodyL * 0.4 + i * (bodyL * 0.1);
        return (
          <group key={i}>
            <mesh position={[x, bodyH * 0.6 + wheelR, bodyW / 2 + 0.01]} castShadow>
              <boxGeometry args={[bodyL * 0.07, bodyH * 0.35, 0.02]} />
              <meshPhysicalMaterial color="#93c5fd" metalness={0.1} roughness={0.02}
                transmission={0.5} thickness={0.3} />
            </mesh>
            <mesh position={[x, bodyH * 0.6 + wheelR, -bodyW / 2 - 0.01]} castShadow>
              <boxGeometry args={[bodyL * 0.07, bodyH * 0.35, 0.02]} />
              <meshPhysicalMaterial color="#93c5fd" metalness={0.1} roughness={0.02}
                transmission={0.5} thickness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Front windshield */}
      <mesh position={[bodyL / 2 + 0.01, bodyH * 0.6 + wheelR, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[bodyW * 0.8, bodyH * 0.5, 0.02]} />
        <meshPhysicalMaterial color="#bfdbfe" metalness={0.1} roughness={0.02}
          transmission={0.6} thickness={0.3} />
      </mesh>

      {/* Wheels */}
      {[
        [-bodyL * 0.35, wheelR, bodyW / 2 + 0.05],
        [-bodyL * 0.35, wheelR, -bodyW / 2 - 0.05],
        [bodyL * 0.35, wheelR, bodyW / 2 + 0.05],
        [bodyL * 0.35, wheelR, -bodyW / 2 - 0.05],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[wheelR, wheelR, 0.12, 20]} />
            <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[wheelR * 0.6, wheelR * 0.6, 0.13, 16]} />
            <meshPhysicalMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      {[0.25, -0.25].map((z, i) => (
        <mesh key={i} position={[bodyL / 2 + 0.02, wheelR + bodyH * 0.3, z]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} />
        </mesh>
      ))}

      {/* Tail lights */}
      {[0.3, -0.3].map((z, i) => (
        <mesh key={i} position={[-bodyL / 2 - 0.02, wheelR + bodyH * 0.3, z]}>
          <boxGeometry args={[0.03, 0.08, 0.1]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
      ))}

      {/* Door */}
      <mesh position={[bodyL * 0.15, wheelR + bodyH * 0.25, bodyW / 2 + 0.015]}>
        <boxGeometry args={[0.35, bodyH * 0.55, 0.01]} />
        <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* License plates */}
      <mesh position={[bodyL / 2 + 0.025, wheelR + bodyH * 0.15, 0]}>
        <boxGeometry args={[0.005, 0.07, 0.28]} />
        <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-bodyL / 2 - 0.025, wheelR + bodyH * 0.15, 0]}>
        <boxGeometry args={[0.005, 0.07, 0.28]} />
        <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}
