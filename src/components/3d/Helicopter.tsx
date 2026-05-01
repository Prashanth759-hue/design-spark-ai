import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * Bell/Eurocopter-inspired utility helicopter.
 * Streamlined fuselage, blade disc with motion blur, tail boom + rotor,
 * landing skids, navigation lights, panel lines.
 */
export function Helicopter({ rotorRpm = 320, autoRotate = true }: { rotorRpm?: number; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const mainRotor = useRef<THREE.Group>(null);
  const tailRotor = useRef<THREE.Group>(null);
  const blurDisc = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.18;
    const omega = (rotorRpm / 60) * Math.PI * 2;
    if (mainRotor.current) mainRotor.current.rotation.y += delta * omega;
    if (tailRotor.current) tailRotor.current.rotation.x += delta * omega * 4;
    if (blurDisc.current) {
      const m = blurDisc.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.18 + Math.abs(Math.sin(performance.now() * 0.01)) * 0.05;
    }
  });

  // Materials
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#1f2937", metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 2.5,
  }), []);
  const accent = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#dc2626", metalness: 0.5, roughness: 0.3, clearcoat: 0.85, envMapIntensity: 2.2,
  }), []);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0a0f1c", metalness: 0.2, roughness: 0.04, transmission: 0.6, thickness: 0.4, ior: 1.52, envMapIntensity: 3,
  }), []);
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#9ca3af", metalness: 1, roughness: 0.18, envMapIntensity: 3,
  }), []);
  const dark = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0a0a0a", metalness: 0.4, roughness: 0.6,
  }), []);

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={0.8}>
      {/* Main fuselage — teardrop shape via stacked spheres */}
      <mesh castShadow position={[0, 0.55, 0]} material={paint} scale={[2.2, 1, 1.2]}>
        <sphereGeometry args={[0.5, 32, 24]} />
      </mesh>
      {/* Belly */}
      <mesh castShadow position={[0, 0.35, 0]} material={paint} scale={[2, 0.55, 1.05]}>
        <sphereGeometry args={[0.5, 32, 24]} />
      </mesh>
      {/* Red livery stripe */}
      <mesh position={[0, 0.43, 0]} material={accent} scale={[2.05, 0.18, 1.07]}>
        <sphereGeometry args={[0.5, 32, 16]} />
      </mesh>

      {/* Bubble cockpit canopy */}
      <mesh castShadow position={[0.7, 0.62, 0]} material={glass} scale={[0.85, 0.7, 1.05]}>
        <sphereGeometry args={[0.5, 32, 24]} />
      </mesh>
      {/* Canopy frame ribs */}
      {[0, Math.PI / 3, -Math.PI / 3].map((r, i) => (
        <mesh key={i} position={[0.7, 0.62, 0]} rotation={[0, 0, r]}>
          <torusGeometry args={[0.42, 0.012, 6, 24, Math.PI]} />
          <meshPhysicalMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Engine cowling on top */}
      <mesh castShadow position={[0, 0.95, 0]} material={paint}>
        <boxGeometry args={[1.0, 0.18, 0.5]} />
      </mesh>
      {/* Exhaust ports */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-0.45, 0.95, s * 0.3]} rotation={[0, 0, Math.PI / 2]} material={metal}>
          <cylinderGeometry args={[0.07, 0.09, 0.12, 16]} />
        </mesh>
      ))}

      {/* Main rotor mast */}
      <mesh position={[0, 1.1, 0]} material={metal}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
      </mesh>
      {/* Swashplate */}
      <mesh position={[0, 1.18, 0]} material={dark}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 24]} />
      </mesh>

      {/* Main rotor — 4 blades + motion-blur disc */}
      <group ref={mainRotor} position={[0, 1.22, 0]}>
        {/* Hub */}
        <mesh material={metal}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
        </mesh>
        {/* 4 blades */}
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <mesh castShadow position={[1.6, 0, 0]} material={dark}>
              <boxGeometry args={[3.2, 0.025, 0.18]} />
            </mesh>
            {/* Blade tip strobe (red) */}
            <mesh position={[3.15, 0, 0]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4} toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* Motion-blur transparent disc */}
        <mesh ref={blurDisc} position={[0, -0.005, 0]}>
          <cylinderGeometry args={[3.2, 3.2, 0.005, 64]} />
          <meshStandardMaterial color="#1f2937" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* Tail boom */}
      <mesh castShadow position={[-1.6, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} material={paint}>
        <cylinderGeometry args={[0.08, 0.14, 1.6, 20]} />
      </mesh>
      {/* Tail boom red stripe */}
      <mesh position={[-1.6, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} material={accent}>
        <cylinderGeometry args={[0.085, 0.142, 0.08, 20]} />
      </mesh>

      {/* Tail vertical fin */}
      <mesh castShadow position={[-2.35, 0.85, 0]} material={paint}>
        <boxGeometry args={[0.3, 0.55, 0.04]} />
      </mesh>
      {/* Tail horizontal stabilizer */}
      <mesh castShadow position={[-2.2, 0.62, 0]} material={paint}>
        <boxGeometry args={[0.25, 0.03, 0.7]} />
      </mesh>
      {/* Tail stab tips */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[-2.2, 0.65, s * 0.36]} rotation={[0, 0, 0.3]} material={accent}>
          <boxGeometry args={[0.18, 0.12, 0.04]} />
        </mesh>
      ))}

      {/* Tail rotor */}
      <group ref={tailRotor} position={[-2.45, 0.62, 0.08]}>
        <mesh material={metal} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 12]} />
        </mesh>
        {[0, 1].map((i) => (
          <mesh key={i} castShadow rotation={[0, 0, i * Math.PI / 2]} material={dark}>
            <boxGeometry args={[0.7, 0.06, 0.012]} />
          </mesh>
        ))}
      </group>

      {/* Landing skids */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh castShadow position={[0, 0.05, s * 0.55]} rotation={[0, 0, Math.PI / 2]} material={metal}>
            <cylinderGeometry args={[0.025, 0.025, 1.8, 12]} />
          </mesh>
          {/* Skid struts */}
          <mesh castShadow position={[0.4, 0.18, s * 0.55]} rotation={[0, 0, 0.3]} material={metal}>
            <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
          </mesh>
          <mesh castShadow position={[-0.4, 0.18, s * 0.55]} rotation={[0, 0, -0.3]} material={metal}>
            <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
          </mesh>
        </group>
      ))}

      {/* Navigation lights — green starboard, red port */}
      <mesh position={[0.3, 0.55, 0.62]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <pointLight position={[0.3, 0.55, 0.62]} color="#22c55e" intensity={0.5} distance={1.5} />
      <mesh position={[0.3, 0.55, -0.62]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <pointLight position={[0.3, 0.55, -0.62]} color="#ef4444" intensity={0.5} distance={1.5} />
      {/* White anti-collision strobe on top */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} toneMapped={false} />
      </mesh>

      {/* Door windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.1, 0.6, s * 0.51]} material={glass}>
          <boxGeometry args={[0.55, 0.32, 0.01]} />
        </mesh>
      ))}
      {/* Door handles */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.4, 0.45, s * 0.52]} material={metal}>
          <boxGeometry args={[0.06, 0.02, 0.01]} />
        </mesh>
      ))}
    </group>
  );
}