import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface VesselPreviewProps {
  length?: number;        // mm (LOA)
  beam?: number;          // mm
  displacement?: number;  // tonnes
  speed?: number;         // kts
  hullDrag?: number;      // kN
  showDimensions?: boolean;
}

export function VesselPreview({
  length = 120000,
  beam = 18000,
  displacement = 5000,
  speed = 15,
  hullDrag = 109.7,
  showDimensions = true,
}: VesselPreviewProps) {
  const ref = useRef<THREE.Group>(null);
  const propRef = useRef<THREE.Mesh>(null);

  // Scale: 120m LOA -> 4 scene units
  const L = length / 30000;
  const B = beam / 30000;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = Math.sin(t * 0.5) * 0.04;
      ref.current.rotation.z = Math.sin(t * 0.3) * 0.025;
      ref.current.rotation.x = Math.sin(t * 0.4) * 0.015;
    }
    if (propRef.current) propRef.current.rotation.x = t * 6 * (speed / 15);
  });

  // Hull cross-section shape — extruded along length
  const hullShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-B / 2, 0);
    s.lineTo(B / 2, 0);
    s.lineTo(B * 0.4, -B * 0.45);
    s.lineTo(-B * 0.4, -B * 0.45);
    s.closePath();
    return s;
  }, [B]);

  const hullMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#1e3a5f", metalness: 0.55, roughness: 0.45, clearcoat: 0.4,
  }), []);
  const redBelly = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#991b1b", metalness: 0.4, roughness: 0.6,
  }), []);
  const superstructure = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f8fafc", metalness: 0.3, roughness: 0.55,
  }), []);
  const accent = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#dc2626", metalness: 0.4, roughness: 0.4,
  }), []);
  const water = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0c4a6e", metalness: 0.1, roughness: 0.15,
    transmission: 0.6, thickness: 0.5, opacity: 0.85, transparent: true,
  }), []);

  return (
    <group position={[0, -0.3, 0]} scale={0.85}>
      {/* Water surface */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={water}>
        <planeGeometry args={[L * 1.8, B * 4]} />
      </mesh>
      {/* Wake ring */}
      <mesh position={[L * 0.55, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.6, 32]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.3} />
      </mesh>

      <group ref={ref}>
        {/* Hull (above water - dark blue) */}
        <mesh castShadow position={[0, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} material={hullMat}>
          <extrudeGeometry args={[hullShape, {
            steps: 2, depth: L,
            bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.08, bevelSegments: 4,
            curveSegments: 8,
          }]} />
        </mesh>
        {/* Bow — tapered nose at +Z end */}
        <mesh castShadow position={[L * 0.5, 0.05, 0]} material={hullMat}>
          <coneGeometry args={[B * 0.4, B * 0.5, 4]} />
        </mesh>

        {/* Red anti-fouling stripe at waterline */}
        <mesh position={[0, -0.04, 0]} rotation={[0, Math.PI / 2, 0]} material={redBelly}>
          <boxGeometry args={[B * 0.85, 0.06, L * 0.95]} />
        </mesh>

        {/* Deck */}
        <mesh receiveShadow position={[0, B * 0.18, 0]} material={superstructure}>
          <boxGeometry args={[L * 0.95, 0.03, B * 0.85]} />
        </mesh>

        {/* Cargo hatches (cargo vessel) */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} castShadow
            position={[L * 0.25 - i * L * 0.18, B * 0.22, 0]}
            material={accent}>
            <boxGeometry args={[L * 0.12, 0.08, B * 0.55]} />
          </mesh>
        ))}

        {/* Superstructure (aft) */}
        <group position={[-L * 0.38, B * 0.22, 0]}>
          <mesh castShadow material={superstructure}>
            <boxGeometry args={[L * 0.14, B * 0.4, B * 0.6]} />
          </mesh>
          {/* Bridge */}
          <mesh castShadow position={[0, B * 0.32, 0]} material={superstructure}>
            <boxGeometry args={[L * 0.1, B * 0.18, B * 0.5]} />
          </mesh>
          {/* Bridge windows */}
          <mesh position={[L * 0.05, B * 0.34, 0]}>
            <boxGeometry args={[0.01, B * 0.09, B * 0.45]} />
            <meshPhysicalMaterial color="#0f172a" metalness={0.3} roughness={0.1} />
          </mesh>
          {/* Funnel */}
          <mesh castShadow position={[-L * 0.05, B * 0.5, 0]} material={accent}>
            <cylinderGeometry args={[B * 0.1, B * 0.12, B * 0.3, 16]} />
          </mesh>
          {/* Black band on funnel */}
          <mesh position={[-L * 0.05, B * 0.6, 0]} material={hullMat}>
            <cylinderGeometry args={[B * 0.105, B * 0.105, B * 0.08, 16]} />
          </mesh>
          {/* Mast */}
          <mesh castShadow position={[L * 0.04, B * 0.85, 0]}>
            <cylinderGeometry args={[0.02, 0.025, B * 0.5, 8]} />
            <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* Bridge wing rail */}
        <mesh position={[-L * 0.42, B * 0.23, 0]}>
          <boxGeometry args={[L * 0.005, 0.03, B * 0.7]} />
          <meshPhysicalMaterial color="#dc2626" metalness={0.4} roughness={0.4} />
        </mesh>

        {/* Propeller (stern) */}
        <group position={[-L * 0.5 - 0.05, -B * 0.2, 0]}>
          <mesh ref={propRef}>
            <cylinderGeometry args={[B * 0.15, B * 0.15, 0.02, 8]} />
            <meshPhysicalMaterial color="#fbbf24" metalness={0.95} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {showDimensions && (
        <>
          <Html position={[0, B * 0.85 + 0.4, 0]} center distanceFactor={6}>
            <div style={{
              background: "rgba(15,23,42,0.92)", color: "#22d3ee", padding: "4px 10px",
              borderRadius: 6, fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap",
              border: "1px solid #22d3ee55", fontWeight: 600,
            }}>
              LOA {(length / 1000).toFixed(1)}m • B {(beam / 1000).toFixed(1)}m
            </div>
          </Html>
          <Html position={[L * 0.5, 0.1, 0]} center distanceFactor={7}>
            <div style={{
              background: "rgba(15,23,42,0.85)", color: "#f59e0b", padding: "2px 6px",
              borderRadius: 4, fontSize: 9, fontFamily: "monospace",
              border: "1px solid #f59e0b55",
            }}>
              {speed}kts • {displacement.toLocaleString()}t • Drag {hullDrag.toFixed(0)}kN
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
