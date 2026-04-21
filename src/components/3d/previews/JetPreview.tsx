import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface JetPreviewProps {
  wingspan?: number;      // mm
  fuselageLength?: number;// mm
  altitude?: number;      // ft
  airspeed?: number;      // kts
  engines?: number;
  showDimensions?: boolean;
}

export function JetPreview({
  wingspan = 35000,
  fuselageLength = 38000,
  altitude = 35000,
  airspeed = 480,
  engines = 2,
  showDimensions = true,
}: JetPreviewProps) {
  const groupRef = useRef<THREE.Group>(null);
  const fanL = useRef<THREE.Mesh>(null);
  const fanR = useRef<THREE.Mesh>(null);

  // Scale: wingspan 35m -> ~3.5 scene units span
  const span = wingspan / 10000;
  const len = fuselageLength / 10000;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.05;
      groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.04;
    }
    if (fanL.current) fanL.current.rotation.x = t * 8;
    if (fanR.current) fanR.current.rotation.x = t * 8;
  });

  const fuselage = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f8fafc", metalness: 0.7, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 2.5,
  }), []);
  const accent = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#1e40af", metalness: 0.5, roughness: 0.28, clearcoat: 0.8, envMapIntensity: 2,
  }), []);
  const engine = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#94a3b8", metalness: 1, roughness: 0.14, envMapIntensity: 3,
  }), []);
  const window = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0a0f1c", metalness: 0.3, roughness: 0.05, transmission: 0.35, thickness: 0.1, ior: 1.5, envMapIntensity: 3,
  }), []);

  return (
    <group ref={groupRef} position={[0, 0.2, 0]} scale={0.7}>
      {/* Fuselage - tapered cylinder + nose cone + tail cone */}
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow material={fuselage}>
          <cylinderGeometry args={[0.32, 0.34, len * 0.78, 28]} />
        </mesh>
        {/* Nose cone */}
        <mesh castShadow position={[len * 0.46, 0, 0]} material={fuselage}>
          <coneGeometry args={[0.32, len * 0.22, 28]} />
        </mesh>
        {/* Tail cone */}
        <mesh castShadow position={[-len * 0.46, 0, 0]} rotation={[0, 0, Math.PI]} material={fuselage}>
          <coneGeometry args={[0.34, len * 0.18, 28]} />
        </mesh>
      </group>

      {/* Cockpit windows (dark band near nose) */}
      <mesh position={[len * 0.38, 0.18, 0]} rotation={[0, 0, -0.1]} material={window}>
        <boxGeometry args={[0.4, 0.08, 0.5]} />
      </mesh>

      {/* Cabin window strip */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[len * 0.32 - i * len * 0.04, 0.05, 0.32]} material={window}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
        </mesh>
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={`r${i}`} position={[len * 0.32 - i * len * 0.04, 0.05, -0.32]} material={window}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
        </mesh>
      ))}

      {/* Belly stripe */}
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]} material={accent}>
        <cylinderGeometry args={[0.345, 0.345, len * 0.7, 28, 1, true]} />
      </mesh>

      {/* Wings - swept */}
      <mesh castShadow position={[-0.1, -0.1, 0]} rotation={[0, 0, 0]} material={fuselage}>
        <boxGeometry args={[0.55, 0.04, span]} />
      </mesh>
      {/* Wing tips */}
      <mesh castShadow position={[-0.1, -0.05, span / 2]} rotation={[0, 0, 0]} material={accent}>
        <boxGeometry args={[0.18, 0.12, 0.15]} />
      </mesh>
      <mesh castShadow position={[-0.1, -0.05, -span / 2]} rotation={[0, 0, 0]} material={accent}>
        <boxGeometry args={[0.18, 0.12, 0.15]} />
      </mesh>

      {/* Navigation lights — green starboard, red port */}
      <mesh position={[-0.1, -0.05, span / 2 + 0.08]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <pointLight position={[-0.1, -0.05, span / 2 + 0.08]} intensity={0.6} color="#22c55e" distance={2} />
      <mesh position={[-0.1, -0.05, -span / 2 - 0.08]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <pointLight position={[-0.1, -0.05, -span / 2 - 0.08]} intensity={0.6} color="#ef4444" distance={2} />

      {/* White strobe on tail */}
      <mesh position={[-len * 0.55, 0.6, 0]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} toneMapped={false} />
      </mesh>

      {/* Livery cheatline along fuselage */}
      <mesh position={[0, 0.02, 0.33]} rotation={[0, 0, Math.PI / 2]} material={accent}>
        <cylinderGeometry args={[0.012, 0.012, len * 0.7, 8]} />
      </mesh>
      <mesh position={[0, 0.02, -0.33]} rotation={[0, 0, Math.PI / 2]} material={accent}>
        <cylinderGeometry args={[0.012, 0.012, len * 0.7, 8]} />
      </mesh>

      {/* Horizontal stabilizer */}
      <mesh castShadow position={[-len * 0.5, 0.05, 0]} material={fuselage}>
        <boxGeometry args={[0.4, 0.03, span * 0.42]} />
      </mesh>

      {/* Vertical stabilizer */}
      <mesh castShadow position={[-len * 0.52, 0.42, 0]} material={fuselage}>
        <boxGeometry args={[0.45, 0.55, 0.04]} />
      </mesh>
      <mesh position={[-len * 0.55, 0.6, 0]} material={accent}>
        <boxGeometry args={[0.3, 0.18, 0.05]} />
      </mesh>

      {/* Engine nacelles + spinning fans */}
      {Array.from({ length: engines }).map((_, i) => {
        const z = engines === 2 ? (i === 0 ? span * 0.27 : -span * 0.27) : (i - (engines - 1) / 2) * span * 0.22;
        return (
          <group key={i} position={[0.05, -0.22, z]}>
            {/* Nacelle */}
            <mesh castShadow rotation={[0, 0, Math.PI / 2]} material={engine}>
              <cylinderGeometry args={[0.14, 0.16, 0.55, 24]} />
            </mesh>
            {/* Intake ring */}
            <mesh position={[0.27, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={engine}>
              <torusGeometry args={[0.14, 0.018, 8, 24]} />
            </mesh>
            {/* Fan blades (visible disk) */}
            <mesh ref={i === 0 ? fanL : fanR} position={[0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
              <meshPhysicalMaterial color="#1e293b" metalness={0.95} roughness={0.2} />
            </mesh>
            {/* Pylon */}
            <mesh position={[-0.05, 0.18, 0]} material={engine}>
              <boxGeometry args={[0.18, 0.32, 0.06]} />
            </mesh>
          </group>
        );
      })}

      {showDimensions && (
        <>
          <Html position={[0, 0.95, 0]} center distanceFactor={6}>
            <div style={{
              background: "rgba(15,23,42,0.92)", color: "#22d3ee", padding: "4px 10px",
              borderRadius: 6, fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap",
              border: "1px solid #22d3ee55", fontWeight: 600,
            }}>
              SPAN {(wingspan / 1000).toFixed(1)}m • L {(fuselageLength / 1000).toFixed(1)}m
            </div>
          </Html>
          <Html position={[len * 0.5, -0.5, 0]} center distanceFactor={7}>
            <div style={{
              background: "rgba(15,23,42,0.85)", color: "#f59e0b", padding: "2px 6px",
              borderRadius: 4, fontSize: 9, fontFamily: "monospace",
              border: "1px solid #f59e0b55",
            }}>
              FL{Math.round(altitude / 100)} • {airspeed}kts
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
