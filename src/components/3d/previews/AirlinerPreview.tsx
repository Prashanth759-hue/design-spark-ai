import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  wingspan?: number;
  fuselageLength?: number;
  altitude?: number;
  airspeed?: number;
  engines?: number;
  showDimensions?: boolean;
}

/**
 * Boeing 737-800 inspired airliner. Realistic proportions:
 * - 35.79m wingspan, 39.5m length, swept wings 25°, blended winglets,
 * - dual CFM-56-style nacelles under wings, T-strut pylons,
 * - cockpit window cluster, livery cheatline, empennage with rudder.
 */
export function AirlinerPreview({
  wingspan = 35790,
  fuselageLength = 39500,
  altitude = 35000,
  airspeed = 480,
  engines = 2,
  showDimensions = true,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const fanL = useRef<THREE.Mesh>(null);
  const fanR = useRef<THREE.Mesh>(null);
  const strobeRef = useRef<THREE.PointLight>(null);

  // Scale: 35.79m wingspan -> ~3.6 scene units
  const SP = wingspan / 10000;
  const LN = fuselageLength / 10000;

  // Helpful aliases — fuselage runs along world +X, wings span world ±Z
  const FUSE_R = 0.32;        // fuselage radius
  const NOSE_X = LN * 0.5;    // nose tip x
  const TAIL_X = -LN * 0.5;   // tail tip x

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.05;
      groupRef.current.rotation.z = Math.sin(t * 0.25) * 0.03;
    }
    if (fanL.current) fanL.current.rotation.x = t * 12;
    if (fanR.current) fanR.current.rotation.x = t * 12;
    if (strobeRef.current) strobeRef.current.intensity = (Math.sin(t * 4) > 0.95 ? 3 : 0);
  });

  // Materials — airline-grade white paint, blue accent, brushed nacelle
  const fuselage = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#fafafa", metalness: 0.45, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 2.6,
  }), []);
  const accent = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0c4a6e", metalness: 0.6, roughness: 0.22, clearcoat: 0.9, envMapIntensity: 2.4,
  }), []);
  const accentLight = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0ea5e9", metalness: 0.5, roughness: 0.3, envMapIntensity: 2,
  }), []);
  const nacelle = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#cbd5e1", metalness: 1, roughness: 0.12, envMapIntensity: 3.2,
  }), []);
  const nacelleDark = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#1e293b", metalness: 0.9, roughness: 0.25,
  }), []);
  const window = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0a0f1c", metalness: 0.3, roughness: 0.04, transmission: 0.4, thickness: 0.1, ior: 1.52, envMapIntensity: 3,
  }), []);
  const cockpit = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0a0f1c", metalness: 0.4, roughness: 0.02, transmission: 0.55, thickness: 0.2, ior: 1.52, envMapIntensity: 3,
  }), []);
  const fanBlades = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#1e293b", metalness: 0.95, roughness: 0.18, envMapIntensity: 2,
  }), []);

  // Wing sweep (25° quarter-chord)
  const wingSweep = 0.44; // radians

  return (
    <group ref={groupRef} position={[0, 0.3, 0]} scale={0.65}>
      {/* ────────── Fuselage (along world +X) ────────── */}
      {/* Main tube */}
      <mesh castShadow material={fuselage} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[FUSE_R, FUSE_R, LN * 0.82, 36]} />
      </mesh>
      {/* Nose radome */}
      <mesh castShadow position={[LN * 0.41, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={fuselage}>
        <sphereGeometry args={[FUSE_R, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Tail cone */}
      <mesh castShadow position={[-LN * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={fuselage}>
        <coneGeometry args={[FUSE_R, LN * 0.2, 24]} />
      </mesh>

      {/* Belly fairing (wing-fuselage junction) */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} material={fuselage}>
        <cylinderGeometry args={[0.2, 0.24, LN * 0.35, 24]} />
      </mesh>

      {/* ────────── Cockpit windows (6-pane cluster) ────────── */}
      {[-0.18, -0.06, 0.06, 0.18].map((dz, i) => (
        <mesh key={`cwL-${i}`} position={[LN * 0.36 - i * 0.04, 0.12, 0.2 + dz * 0.3]} rotation={[0, 0, -0.15]} material={cockpit}>
          <boxGeometry args={[0.18, 0.1, 0.06]} />
        </mesh>
      ))}
      {[-0.18, -0.06, 0.06, 0.18].map((dz, i) => (
        <mesh key={`cwR-${i}`} position={[LN * 0.36 - i * 0.04, 0.12, -0.2 - dz * 0.3]} rotation={[0, 0, -0.15]} material={cockpit}>
          <boxGeometry args={[0.18, 0.1, 0.06]} />
        </mesh>
      ))}
      {/* Cockpit dark band/livery */}
      <mesh position={[LN * 0.34, 0.16, 0]} rotation={[0, 0, -0.15]} material={accent}>
        <boxGeometry args={[0.5, 0.06, 0.66]} />
      </mesh>

      {/* ────────── Cabin windows (28 each side) ────────── */}
      {Array.from({ length: 28 }).map((_, i) => (
        <mesh key={`wL-${i}`} position={[LN * 0.28 - i * LN * 0.022, 0.05, 0.32]} material={window}>
          <boxGeometry args={[0.025, 0.04, 0.012]} />
        </mesh>
      ))}
      {Array.from({ length: 28 }).map((_, i) => (
        <mesh key={`wR-${i}`} position={[LN * 0.28 - i * LN * 0.022, 0.05, -0.32]} material={window}>
          <boxGeometry args={[0.025, 0.04, 0.012]} />
        </mesh>
      ))}

      {/* ────────── Livery cheatline (dark blue stripe) ────────── */}
      <mesh position={[0, -0.05, 0.323]} rotation={[0, 0, Math.PI / 2]} material={accent}>
        <cylinderGeometry args={[0.012, 0.012, LN * 0.78, 8]} />
      </mesh>
      <mesh position={[0, -0.05, -0.323]} rotation={[0, 0, Math.PI / 2]} material={accent}>
        <cylinderGeometry args={[0.012, 0.012, LN * 0.78, 8]} />
      </mesh>
      {/* Light blue accent line */}
      <mesh position={[0, -0.085, 0.323]} rotation={[0, 0, Math.PI / 2]} material={accentLight}>
        <cylinderGeometry args={[0.006, 0.006, LN * 0.78, 8]} />
      </mesh>
      <mesh position={[0, -0.085, -0.323]} rotation={[0, 0, Math.PI / 2]} material={accentLight}>
        <cylinderGeometry args={[0.006, 0.006, LN * 0.78, 8]} />
      </mesh>

      {/* ────────── Swept wings ────────── */}
      {[1, -1].map((side) => {
        // Build a swept wing using a tapered trapezoid via Shape extrude approximation: use box with rotation
        return (
          <group key={side} position={[0, -0.1, 0]} rotation={[0, side > 0 ? wingSweep : -wingSweep, 0]}>
            <mesh castShadow position={[-0.1, 0, side * SP * 0.28]} material={fuselage}>
              <boxGeometry args={[0.7, 0.05, SP * 0.55]} />
            </mesh>
            {/* Wing leading edge slat (subtle accent) */}
            <mesh position={[-0.45, 0.005, side * SP * 0.28]} material={fuselage}>
              <boxGeometry args={[0.04, 0.06, SP * 0.55]} />
            </mesh>
            {/* Trailing edge flaps (dark band) */}
            <mesh position={[0.22, -0.01, side * SP * 0.28]} material={accent}>
              <boxGeometry args={[0.06, 0.04, SP * 0.5]} />
            </mesh>

            {/* ───── Blended winglet ───── */}
            <mesh castShadow position={[-0.05, 0.18, side * SP * 0.55]} rotation={[0, 0, side * 0.3]} material={fuselage}>
              <boxGeometry args={[0.32, 0.42, 0.04]} />
            </mesh>
            {/* Winglet tip livery */}
            <mesh position={[-0.05, 0.36, side * SP * 0.55]} material={accent}>
              <boxGeometry args={[0.22, 0.08, 0.045]} />
            </mesh>

            {/* ───── Engine pylon + nacelle ───── */}
            {engines >= 2 && (
              <group position={[-0.18, -0.18, side * SP * 0.32]}>
                {/* Pylon */}
                <mesh castShadow material={fuselage}>
                  <boxGeometry args={[0.18, 0.22, 0.08]} />
                </mesh>
                {/* Nacelle outer */}
                <mesh castShadow position={[0, -0.18, 0]} rotation={[0, 0, Math.PI / 2]} material={nacelle}>
                  <cylinderGeometry args={[0.18, 0.2, 0.65, 24]} />
                </mesh>
                {/* Intake lip */}
                <mesh position={[0.34, -0.18, 0]} rotation={[0, 0, Math.PI / 2]} material={nacelle}>
                  <torusGeometry args={[0.18, 0.022, 8, 24]} />
                </mesh>
                {/* Spinner cone */}
                <mesh position={[0.36, -0.18, 0]} rotation={[0, 0, -Math.PI / 2]} material={nacelleDark}>
                  <coneGeometry args={[0.06, 0.1, 16]} />
                </mesh>
                {/* Spinning fan disc */}
                <mesh ref={side > 0 ? fanL : fanR} position={[0.32, -0.18, 0]} rotation={[0, 0, Math.PI / 2]} material={fanBlades}>
                  <cylinderGeometry args={[0.16, 0.16, 0.025, 32]} />
                </mesh>
                {/* Nacelle dark exhaust */}
                <mesh position={[-0.34, -0.18, 0]} rotation={[0, 0, Math.PI / 2]} material={nacelleDark}>
                  <cylinderGeometry args={[0.13, 0.16, 0.18, 24]} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* ────────── Empennage ────────── */}
      {/* Vertical stabilizer */}
      <mesh castShadow position={[-LN * 0.42, 0.45, 0]} rotation={[0, 0, 0.08]} material={fuselage}>
        <boxGeometry args={[0.6, 0.85, 0.05]} />
      </mesh>
      {/* Tail accent (livery on fin) */}
      <mesh position={[-LN * 0.42, 0.7, 0]} rotation={[0, 0, 0.08]} material={accent}>
        <boxGeometry args={[0.45, 0.4, 0.055]} />
      </mesh>
      {/* Light blue fin tip stripe */}
      <mesh position={[-LN * 0.5, 0.85, 0]} rotation={[0, 0, 0.08]} material={accentLight}>
        <boxGeometry args={[0.28, 0.08, 0.058]} />
      </mesh>
      {/* Rudder hinge line */}
      <mesh position={[-LN * 0.5, 0.55, 0]} material={accent}>
        <boxGeometry args={[0.02, 0.6, 0.06]} />
      </mesh>
      {/* Horizontal stabilizers (swept) */}
      {[1, -1].map((side) => (
        <mesh key={side} castShadow position={[-LN * 0.42, 0.18, side * 0.35]} rotation={[0, side > 0 ? 0.35 : -0.35, 0]} material={fuselage}>
          <boxGeometry args={[0.45, 0.04, 0.7]} />
        </mesh>
      ))}

      {/* ────────── Landing lights / nav lights ────────── */}
      {/* Green starboard wingtip */}
      <mesh position={[-0.05, 0.05, SP * 0.6]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <pointLight position={[-0.05, 0.05, SP * 0.6]} color="#22c55e" intensity={0.6} distance={2} />
      {/* Red port wingtip */}
      <mesh position={[-0.05, 0.05, -SP * 0.6]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <pointLight position={[-0.05, 0.05, -SP * 0.6]} color="#ef4444" intensity={0.6} distance={2} />
      {/* White strobe on tail */}
      <mesh position={[-LN * 0.55, 0.95, 0]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} toneMapped={false} />
      </mesh>
      <pointLight ref={strobeRef} position={[-LN * 0.55, 0.95, 0]} color="#ffffff" intensity={0} distance={3} />
      {/* Belly anti-collision strobe */}
      <mesh position={[0, -0.32, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4} toneMapped={false} />
      </mesh>

      {showDimensions && (
        <>
          <Html position={[0, 1.4, 0]} center distanceFactor={6}>
            <div style={{
              background: "rgba(15,23,42,0.92)", color: "#22d3ee", padding: "4px 10px",
              borderRadius: 6, fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap",
              border: "1px solid #22d3ee55", fontWeight: 600,
            }}>
              SPAN {(wingspan / 1000).toFixed(2)}m • L {(fuselageLength / 1000).toFixed(2)}m
            </div>
          </Html>
          <Html position={[LN * 0.5, -0.6, 0]} center distanceFactor={7}>
            <div style={{
              background: "rgba(15,23,42,0.85)", color: "#f59e0b", padding: "2px 6px",
              borderRadius: 4, fontSize: 9, fontFamily: "monospace",
              border: "1px solid #f59e0b55",
            }}>
              FL{Math.round(altitude / 100)} • {airspeed}kts • {engines} ENG
            </div>
          </Html>
        </>
      )}
    </group>
  );
}