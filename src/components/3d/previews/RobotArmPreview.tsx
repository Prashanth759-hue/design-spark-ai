import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface RobotArmPreviewProps {
  reach?: number;       // mm
  payload?: number;     // kg
  joints?: number;
  speed?: number;       // m/s
  showDimensions?: boolean;
}

/**
 * Realistic 6-DOF articulated robot arm. Geometry scales with `reach` (mm).
 * Animated joints, brushed-metal links, painted base, gripper TCP.
 */
export function RobotArmPreview({
  reach = 850,
  payload = 5,
  joints = 6,
  speed = 1.5,
  showDimensions = true,
}: RobotArmPreviewProps) {
  const baseRef = useRef<THREE.Group>(null);
  const j1Ref = useRef<THREE.Group>(null);
  const j2Ref = useRef<THREE.Group>(null);
  const j3Ref = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const gripL = useRef<THREE.Mesh>(null);
  const gripR = useRef<THREE.Mesh>(null);

  // Scale geometry to reach (default 850mm = 1.7 scene units)
  const s = reach / 500; // ~1.7 for 850mm
  const linkR = 0.06 * Math.max(0.7, payload / 5);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (baseRef.current) baseRef.current.rotation.y = Math.sin(t * 0.4) * 0.6;
    if (j1Ref.current) j1Ref.current.rotation.z = -0.35 + Math.sin(t * 0.5) * 0.25;
    if (j2Ref.current) j2Ref.current.rotation.z = 0.6 + Math.sin(t * 0.7) * 0.35;
    if (j3Ref.current) j3Ref.current.rotation.z = -0.15 + Math.sin(t * 0.9) * 0.3;
    if (wristRef.current) wristRef.current.rotation.x = Math.sin(t * 1.3) * 0.5;
    const g = 0.04 + Math.abs(Math.sin(t * 1.6)) * 0.06;
    if (gripL.current) gripL.current.position.z = g;
    if (gripR.current) gripR.current.position.z = -g;
  });

  // Materials
  const orange = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f59e0b", metalness: 0.55, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2,
  }), []);
  const dark = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#1f2937", metalness: 0.85, roughness: 0.25,
  }), []);
  const steel = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#cbd5e1", metalness: 0.95, roughness: 0.18,
  }), []);
  const accent = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#22d3ee", metalness: 0.4, roughness: 0.4, emissive: "#0891b2", emissiveIntensity: 0.15,
  }), []);

  return (
    <group position={[0, -1, 0]} scale={1.1}>
      {/* Floor pad */}
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.04, 40]} />
        <meshPhysicalMaterial color="#0f172a" metalness={0.3} roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[0, 0.045, 0]}>
        <ringGeometry args={[1.0, 1.18, 40]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
      </mesh>

      {/* Base column (rotates around Y) */}
      <group ref={baseRef}>
        {/* lower bell */}
        <mesh castShadow position={[0, 0.2, 0]} material={orange}>
          <cylinderGeometry args={[0.45, 0.55, 0.32, 32]} />
        </mesh>
        {/* mid black ring */}
        <mesh castShadow position={[0, 0.42, 0]} material={dark}>
          <cylinderGeometry args={[0.42, 0.42, 0.12, 32]} />
        </mesh>
        {/* shoulder housing */}
        <mesh castShadow position={[0, 0.6, 0]} material={orange}>
          <cylinderGeometry args={[0.32, 0.32, 0.28, 32]} />
        </mesh>

        {/* Joint 1 - shoulder */}
        <group ref={j1Ref} position={[0, 0.74, 0]}>
          <mesh castShadow material={steel} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.36, 24]} />
          </mesh>
          {/* Upper link */}
          <group rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow position={[0.45 * s, 0, 0]} material={orange}>
              <boxGeometry args={[0.9 * s, 0.18, 0.22]} />
            </mesh>
            {/* link rib */}
            <mesh position={[0.45 * s, 0.11, 0]} material={dark}>
              <boxGeometry args={[0.85 * s, 0.02, 0.24]} />
            </mesh>

            {/* Joint 2 - elbow */}
            <group ref={j2Ref} position={[0.9 * s, 0, 0]}>
              <mesh castShadow material={steel} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.13, 0.13, 0.3, 24]} />
              </mesh>
              {/* Forearm */}
              <mesh castShadow position={[0.4 * s, 0, 0]} material={orange}>
                <boxGeometry args={[0.8 * s, 0.14, 0.18]} />
              </mesh>
              <mesh position={[0.4 * s, 0.085, 0]} material={dark}>
                <boxGeometry args={[0.75 * s, 0.02, 0.2]} />
              </mesh>

              {/* Joint 3 - wrist roll */}
              <group ref={j3Ref} position={[0.8 * s, 0, 0]}>
                <mesh castShadow material={steel} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.1, 0.1, 0.22, 20]} />
                </mesh>
                {/* Wrist */}
                <group ref={wristRef} position={[0.18, 0, 0]}>
                  <mesh castShadow material={accent}>
                    <boxGeometry args={[0.18, 0.14, 0.14]} />
                  </mesh>
                  {/* Tool flange */}
                  <mesh castShadow position={[0.13, 0, 0]} material={dark} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
                  </mesh>
                  {/* Gripper jaws */}
                  <mesh ref={gripL} castShadow position={[0.22, 0, 0.06]} material={steel}>
                    <boxGeometry args={[0.12, 0.04, 0.04]} />
                  </mesh>
                  <mesh ref={gripR} castShadow position={[0.22, 0, -0.06]} material={steel}>
                    <boxGeometry args={[0.12, 0.04, 0.04]} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Status LED on base */}
      <mesh position={[0.3, 0.55, 0.32]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <pointLight position={[0.3, 0.55, 0.32]} color="#22c55e" intensity={0.4} distance={0.6} />

      {/* Dimension billboards */}
      {showDimensions && (
        <>
          <Html position={[0, 2.2, 0]} center distanceFactor={6}>
            <div style={{
              background: "rgba(15,23,42,0.92)", color: "#22d3ee", padding: "4px 10px",
              borderRadius: 6, fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap",
              border: "1px solid #22d3ee55", fontWeight: 600,
            }}>
              {joints}-DOF • REACH {reach}mm • PAYLOAD {payload}kg
            </div>
          </Html>
          <Html position={[1.5 * s, 0.9, 0]} center distanceFactor={8}>
            <div style={{
              background: "rgba(15,23,42,0.85)", color: "#f59e0b", padding: "2px 6px",
              borderRadius: 4, fontSize: 9, fontFamily: "monospace",
              border: "1px solid #f59e0b55",
            }}>
              ↻ {speed} m/s
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
