import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface HeartPreviewProps {
  bpm?: number;
  strokeVolume?: number;  // mL
  systolic?: number;
  diastolic?: number;
  showDimensions?: boolean;
}

export function HeartPreview({
  bpm = 72,
  strokeVolume = 70,
  systolic = 120,
  diastolic = 80,
  showDimensions = true,
}: HeartPreviewProps) {
  const ref = useRef<THREE.Group>(null);
  const aortaPulse = useRef<THREE.Mesh>(null);

  // beats per second
  const bps = bpm / 60;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Realistic beat: sharp systolic peak, longer diastolic
    const phase = (t * bps) % 1;
    const systBeat = phase < 0.15 ? Math.sin(phase / 0.15 * Math.PI) : 0;
    const diaBeat = phase >= 0.25 && phase < 0.4 ? Math.sin((phase - 0.25) / 0.15 * Math.PI) * 0.4 : 0;
    const beat = Math.max(systBeat, diaBeat);
    const s = 1 + beat * 0.09;
    if (ref.current) {
      ref.current.scale.set(s, s, s);
      ref.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    }
    if (aortaPulse.current) {
      const m = aortaPulse.current.material as THREE.MeshPhysicalMaterial;
      m.emissiveIntensity = 0.2 + beat * 0.6;
    }
  });

  const myocardium = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#9f1239", metalness: 0.05, roughness: 0.55,
    clearcoat: 0.6, clearcoatRoughness: 0.3,
    sheen: 0.5, sheenColor: "#fecdd3", sheenRoughness: 0.4,
  }), []);
  const ventricle = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#7f1d1d", metalness: 0.05, roughness: 0.6,
    clearcoat: 0.5, clearcoatRoughness: 0.3,
  }), []);
  const aorta = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#fca5a5", metalness: 0.2, roughness: 0.4,
    emissive: "#dc2626", emissiveIntensity: 0.2,
  }), []);
  const veinBlue = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#1e3a8a", metalness: 0.2, roughness: 0.4,
  }), []);
  const veinPulm = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#7c3aed", metalness: 0.2, roughness: 0.4,
  }), []);

  return (
    <group position={[0, -0.1, 0]} scale={1.4}>
      <group ref={ref}>
        {/* Left ventricle (bigger, lower-left) - tapered */}
        <mesh castShadow position={[-0.18, -0.1, 0]} rotation={[0, 0, -0.3]} material={myocardium}>
          <sphereGeometry args={[0.55, 32, 32]} />
        </mesh>
        {/* Right ventricle (smaller, lower-right) */}
        <mesh castShadow position={[0.22, -0.05, 0.05]} rotation={[0, 0, 0.2]} material={ventricle}>
          <sphereGeometry args={[0.45, 28, 28]} />
        </mesh>
        {/* Apex (tapered bottom) */}
        <mesh castShadow position={[-0.05, -0.55, 0]} rotation={[0, 0, -0.1]} material={myocardium}>
          <coneGeometry args={[0.32, 0.4, 24]} />
        </mesh>

        {/* Atria (top) */}
        <mesh castShadow position={[-0.2, 0.4, 0.05]} material={ventricle}>
          <sphereGeometry args={[0.28, 24, 24]} />
        </mesh>
        <mesh castShadow position={[0.22, 0.42, 0.08]} material={ventricle}>
          <sphereGeometry args={[0.25, 24, 24]} />
        </mesh>

        {/* Aorta (arch) */}
        <mesh ref={aortaPulse} castShadow position={[-0.05, 0.7, 0]} rotation={[0, 0, 0.2]} material={aorta}>
          <torusGeometry args={[0.22, 0.08, 12, 20, Math.PI]} />
        </mesh>
        {/* Aorta trunk */}
        <mesh castShadow position={[-0.05, 0.55, 0]} material={aorta}>
          <cylinderGeometry args={[0.09, 0.1, 0.3, 16]} />
        </mesh>

        {/* Pulmonary trunk */}
        <mesh castShadow position={[0.18, 0.65, 0.05]} rotation={[0, 0, -0.2]} material={veinPulm}>
          <cylinderGeometry args={[0.07, 0.08, 0.35, 16]} />
        </mesh>

        {/* Superior vena cava */}
        <mesh castShadow position={[0.32, 0.62, 0.1]} material={veinBlue}>
          <cylinderGeometry args={[0.07, 0.08, 0.32, 16]} />
        </mesh>

        {/* Inferior vena cava */}
        <mesh castShadow position={[0.3, -0.1, 0.1]} rotation={[0, 0, 0.3]} material={veinBlue}>
          <cylinderGeometry args={[0.06, 0.07, 0.3, 16]} />
        </mesh>

        {/* Coronary arteries (surface detail) */}
        <mesh position={[-0.05, 0.1, 0.4]} rotation={[0.3, 0, 0.2]} material={aorta}>
          <torusGeometry args={[0.35, 0.018, 8, 24, Math.PI * 0.6]} />
        </mesh>
        <mesh position={[0.1, -0.05, 0.42]} rotation={[0.4, 0, -0.3]} material={aorta}>
          <torusGeometry args={[0.3, 0.015, 8, 24, Math.PI * 0.4]} />
        </mesh>
      </group>

      {/* Pulse glow point */}
      <pointLight position={[0, 0.1, 0.6]} color="#dc2626" intensity={0.5} distance={2} />

      {showDimensions && (
        <>
          <Html position={[0, 1.3, 0]} center distanceFactor={5}>
            <div style={{
              background: "rgba(15,23,42,0.92)", color: "#dc2626", padding: "4px 10px",
              borderRadius: 6, fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap",
              border: "1px solid #dc262655", fontWeight: 600,
            }}>
              ♥ {bpm} BPM • SV {strokeVolume}mL
            </div>
          </Html>
          <Html position={[0.85, 0, 0]} center distanceFactor={6}>
            <div style={{
              background: "rgba(15,23,42,0.85)", color: "#22d3ee", padding: "2px 6px",
              borderRadius: 4, fontSize: 9, fontFamily: "monospace",
              border: "1px solid #22d3ee55",
            }}>
              BP {systolic}/{diastolic}
            </div>
          </Html>
          <Html position={[-0.85, -0.3, 0]} center distanceFactor={6}>
            <div style={{
              background: "rgba(15,23,42,0.85)", color: "#4ade80", padding: "2px 6px",
              borderRadius: 4, fontSize: 9, fontFamily: "monospace",
              border: "1px solid #4ade8055",
            }}>
              CO {((bpm * strokeVolume) / 1000).toFixed(1)} L/min
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
