import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface ConveyorPreviewProps {
  beltSpeed?: number;     // m/s
  spindleRpm?: number;
  throughput?: number;    // u/hr
  efficiency?: number;    // %
  quality?: number;       // %
  showDimensions?: boolean;
}

export function ConveyorPreview({
  beltSpeed = 2,
  spindleRpm = 3000,
  throughput = 24,
  efficiency = 91,
  quality = 99.2,
  showDimensions = true,
}: ConveyorPreviewProps) {
  const beltRef = useRef<THREE.Mesh>(null);
  const boxRefs = useRef<(THREE.Group | null)[]>([]);
  const spindleRef = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Group>(null);
  const sparkRef = useRef<THREE.PointLight>(null);

  const beltLen = 4;
  const beltY = -0.05;
  const speed = beltSpeed * 0.3;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Boxes travel along belt
    boxRefs.current.forEach((g, i) => {
      if (g) {
        const offset = (t * speed + i * 1.0) % beltLen;
        g.position.x = -beltLen / 2 + offset;
        g.rotation.y = t * 0.5;
      }
    });
    if (beltRef.current) {
      const m = beltRef.current.material as THREE.MeshPhysicalMaterial;
      // Animate texture-like belt scroll via emissive flicker
      m.emissiveIntensity = 0.05 + Math.abs(Math.sin(t * 4)) * 0.02;
    }
    if (spindleRef.current) spindleRef.current.rotation.y = t * (spindleRpm / 60) * Math.PI * 2;
    if (armRef.current) {
      armRef.current.rotation.y = Math.sin(t * 0.8) * 0.6;
      armRef.current.position.y = 0.5 + Math.sin(t * 1.2) * 0.15;
    }
    if (sparkRef.current) {
      sparkRef.current.intensity = Math.random() > 0.7 ? 1.5 : 0;
    }
  });

  const beltMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#1e293b", metalness: 0.6, roughness: 0.5,
    emissive: "#22d3ee", emissiveIntensity: 0.05,
  }), []);
  const frame = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#475569", metalness: 0.85, roughness: 0.25,
  }), []);
  const safety = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#fbbf24", metalness: 0.4, roughness: 0.5,
  }), []);
  const cncBody = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#cbd5e1", metalness: 0.7, roughness: 0.3,
  }), []);
  const armMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0ea5e9", metalness: 0.6, roughness: 0.35,
  }), []);

  return (
    <group position={[0, -0.4, 0]} scale={0.8}>
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 5]} />
        <meshPhysicalMaterial color="#0f172a" metalness={0.3} roughness={0.85} />
      </mesh>
      {/* Floor markings */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-3 + i * 0.85, -0.49, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.08]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}

      {/* Conveyor belt */}
      <mesh ref={beltRef} castShadow receiveShadow position={[0, beltY, 0]} material={beltMat}>
        <boxGeometry args={[beltLen, 0.06, 0.85]} />
      </mesh>
      {/* Belt rollers (end pulleys) */}
      <mesh castShadow position={[-beltLen / 2, beltY - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={frame}>
        <cylinderGeometry args={[0.1, 0.1, 0.95, 16]} />
      </mesh>
      <mesh castShadow position={[beltLen / 2, beltY - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={frame}>
        <cylinderGeometry args={[0.1, 0.1, 0.95, 16]} />
      </mesh>

      {/* Side rails */}
      {[0.46, -0.46].map((z, i) => (
        <mesh key={i} castShadow position={[0, beltY + 0.08, z]} material={frame}>
          <boxGeometry args={[beltLen + 0.2, 0.1, 0.04]} />
        </mesh>
      ))}

      {/* Support legs */}
      {[-1.5, 0, 1.5].map((x) => (
        <group key={x}>
          <mesh castShadow position={[x, -0.3, 0.4]} material={frame}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
          </mesh>
          <mesh castShadow position={[x, -0.3, -0.4]} material={frame}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
          </mesh>
        </group>
      ))}

      {/* Cargo boxes traveling */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={i} ref={(el) => (boxRefs.current[i] = el)} position={[0, beltY + 0.18, 0]}>
          <mesh castShadow material={safety}>
            <boxGeometry args={[0.28, 0.28, 0.28]} />
          </mesh>
          {/* Box label */}
          <mesh position={[0, 0, 0.141]}>
            <planeGeometry args={[0.18, 0.1]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
        </group>
      ))}

      {/* CNC machine - back left */}
      <group position={[-1.5, 0, -1.2]}>
        {/* Base */}
        <mesh castShadow material={cncBody}>
          <boxGeometry args={[1.4, 0.2, 0.9]} />
        </mesh>
        {/* Column */}
        <mesh castShadow position={[-0.5, 0.55, 0]} material={cncBody}>
          <boxGeometry args={[0.3, 1.0, 0.6]} />
        </mesh>
        {/* Spindle housing */}
        <mesh castShadow position={[0, 0.85, 0]} material={frame}>
          <boxGeometry args={[0.4, 0.25, 0.25]} />
        </mesh>
        {/* Spinning spindle */}
        <mesh ref={spindleRef} castShadow position={[0.15, 0.55, 0]} material={frame}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
        </mesh>
        {/* Cutting tool */}
        <mesh castShadow position={[0.15, 0.32, 0]} material={frame}>
          <coneGeometry args={[0.025, 0.08, 12]} />
        </mesh>
        {/* Workpiece */}
        <mesh castShadow position={[0.15, 0.18, 0]} material={safety}>
          <boxGeometry args={[0.3, 0.08, 0.2]} />
        </mesh>
        {/* Sparks */}
        <pointLight ref={sparkRef} position={[0.15, 0.25, 0]} color="#fbbf24" intensity={0} distance={1.2} />
        {/* Window */}
        <mesh position={[0.7, 0.5, 0]}>
          <boxGeometry args={[0.01, 0.6, 0.5]} />
          <meshPhysicalMaterial color="#0f172a" transmission={0.4} thickness={0.2} roughness={0.1} />
        </mesh>
      </group>

      {/* Robot pick arm - back right */}
      <group position={[1.5, 0.1, -1.0]}>
        {/* Base */}
        <mesh castShadow material={cncBody}>
          <cylinderGeometry args={[0.25, 0.3, 0.2, 24]} />
        </mesh>
        <group ref={armRef} position={[0, 0.3, 0]}>
          {/* Vertical column */}
          <mesh castShadow material={armMat}>
            <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
          </mesh>
          {/* Horizontal arm */}
          <mesh castShadow position={[0.4, 0.1, 0]} material={armMat}>
            <boxGeometry args={[0.8, 0.08, 0.1]} />
          </mesh>
          {/* End effector */}
          <mesh castShadow position={[0.78, 0.05, 0]} material={frame}>
            <boxGeometry args={[0.1, 0.18, 0.12]} />
          </mesh>
          {/* Suction cup */}
          <mesh castShadow position={[0.78, -0.07, 0]} material={armMat}>
            <cylinderGeometry args={[0.05, 0.07, 0.06, 12]} />
          </mesh>
        </group>
      </group>

      {/* Status indicator panel */}
      <group position={[2.4, 0.3, 1.0]}>
        <mesh castShadow material={cncBody}>
          <boxGeometry args={[0.4, 0.5, 0.1]} />
        </mesh>
        <mesh position={[-0.1, 0.15, 0.06]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0.1, 0.15, 0.06]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        <pointLight position={[-0.1, 0.15, 0.1]} color="#22c55e" intensity={0.3} distance={0.5} />
      </group>

      {showDimensions && (
        <>
          <Html position={[0, 1.0, 0]} center distanceFactor={5}>
            <div style={{
              background: "rgba(15,23,42,0.92)", color: "#22d3ee", padding: "4px 10px",
              borderRadius: 6, fontSize: 11, fontFamily: "monospace", whiteSpace: "nowrap",
              border: "1px solid #22d3ee55", fontWeight: 600,
            }}>
              {throughput} u/hr • Belt {beltSpeed} m/s
            </div>
          </Html>
          <Html position={[2.0, 0.6, 1.0]} center distanceFactor={6}>
            <div style={{
              background: "rgba(15,23,42,0.85)", color: "#22c55e", padding: "2px 6px",
              borderRadius: 4, fontSize: 9, fontFamily: "monospace",
              border: "1px solid #22c55e55",
            }}>
              OEE {efficiency}% • Q {quality}%
            </div>
          </Html>
          <Html position={[-1.5, 1.4, -1.2]} center distanceFactor={6}>
            <div style={{
              background: "rgba(15,23,42,0.85)", color: "#fbbf24", padding: "2px 6px",
              borderRadius: 4, fontSize: 9, fontFamily: "monospace",
              border: "1px solid #fbbf2455",
            }}>
              CNC {spindleRpm} RPM
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
