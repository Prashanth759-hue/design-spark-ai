import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowLeft, Plane, Wind, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

/* ─── Wing Airfoil ─── */
function Wing({ position, scale = [1, 1, 1], mirror = false }: { position: [number, number, number]; scale?: [number, number, number]; mirror?: boolean }) {
  const s = mirror ? [-scale[0], scale[1], scale[2]] : scale;
  return (
    <group position={position} scale={s as any}>
      <mesh castShadow>
        <boxGeometry args={[3, 0.06, 0.8]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} clearcoat={0.8} />
      </mesh>
      {/* Winglet */}
      <mesh position={[1.5, 0.15, -0.1]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.15]} />
        <meshPhysicalMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Engine nacelle */}
      <group position={[0.8, -0.15, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.6, 16]} />
          <meshPhysicalMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.35]}>
          <cylinderGeometry args={[0.15, 0.18, 0.1, 16]} />
          <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Fuselage ─── */
function Fuselage() {
  return (
    <group>
      {/* Main body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.35, 4, 16, 32]} />
        <meshPhysicalMaterial color="#f8fafc" metalness={0.4} roughness={0.3} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {/* Cockpit windows */}
      <mesh position={[0, 0.2, 2.1]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.4]} />
        <meshPhysicalMaterial color="#0ea5e9" metalness={0.1} roughness={0} transmission={0.6} ior={1.5} />
      </mesh>
      {/* Passenger windows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[0.34, 0.05, 1.5 - i * 0.25]} castShadow>
          <boxGeometry args={[0.02, 0.08, 0.1]} />
          <meshPhysicalMaterial color="#bae6fd" metalness={0} roughness={0} transmission={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Tail ─── */
function Tail() {
  return (
    <group position={[0, 0.3, -2.2]}>
      {/* Vertical stabilizer */}
      <mesh castShadow>
        <boxGeometry args={[0.05, 1, 0.6]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Horizontal stabilizers */}
      <mesh position={[0.6, -0.1, 0]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.35]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-0.6, -0.1, 0]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.35]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Rudder accent */}
      <mesh position={[0, 0.25, -0.15]} castShadow>
        <boxGeometry args={[0.06, 0.5, 0.3]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Full Aircraft ─── */
function Aircraft({ pitch, roll }: { pitch: number; roll: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pitch, 0.03);
      ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, roll, 0.03);
    }
  });

  return (
    <group ref={ref} rotation={[0, 0, 0]}>
      <Fuselage />
      <Wing position={[0, -0.1, 0.3]} />
      <Wing position={[0, -0.1, 0.3]} mirror />
      <Tail />
    </group>
  );
}

const AerospaceSimulator = () => {
  const navigate = useNavigate();
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [altitude, setAltitude] = useState(35000);
  const [speed, setSpeed] = useState(480);
  const [liftData, setLiftData] = useState<{ time: number; value: number }[]>([]);

  // Simple lift calculation
  const liftCoeff = 0.5 + Math.cos(pitch) * 0.3;
  const lift = (0.5 * 1.225 * (speed * 0.514) ** 2 * 120 * liftCoeff) / 1000;

  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <Plane className="w-5 h-5 text-sky-500" />
          <span className="text-sm font-semibold text-foreground">Aerospace Simulator</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600">Commercial Jet</span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <Canvas shadows gl={{ antialias: true, toneMapping: 3 }}>
            <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={40} />
            <Environment preset="sunset" background={false} />
            <color attach="background" args={["#f0f9ff"]} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <ambientLight intensity={0.3} />
            <Suspense fallback={null}>
              <Aircraft pitch={pitch} roll={roll} />
            </Suspense>
            <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={12} blur={3} />
            <OrbitControls enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>

          {/* HUD overlay */}
          <div className="absolute top-4 left-4 flex gap-3">
            {[
              { label: "ALT", value: `${(altitude / 1000).toFixed(1)}k ft`, color: "text-sky-600" },
              { label: "SPD", value: `${speed} kts`, color: "text-emerald-600" },
              { label: "LIFT", value: `${lift.toFixed(0)} kN`, color: "text-amber-600" },
            ].map(s => (
              <div key={s.label} className="bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2">
                <p className="text-[9px] text-muted-foreground font-mono">{s.label}</p>
                <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="w-72 border-l border-border bg-card flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3">Flight Controls</h3>
            {[
              { label: "Pitch", value: pitch, set: setPitch, min: -0.5, max: 0.5, unit: "°", mult: 57.3 },
              { label: "Roll", value: roll, set: setRoll, min: -0.8, max: 0.8, unit: "°", mult: 57.3 },
            ].map(c => (
              <div key={c.label} className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{c.label}</span>
                  <span className="font-mono">{(c.value * c.mult).toFixed(1)}{c.unit}</span>
                </div>
                <input type="range" min={c.min} max={c.max} step={0.01} value={c.value}
                  onChange={e => c.set(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-sky-500" />
              </div>
            ))}
          </div>

          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3">Flight Parameters</h3>
            {[
              { label: "Altitude (ft)", value: altitude, set: setAltitude, min: 0, max: 45000, step: 500 },
              { label: "Airspeed (kts)", value: speed, set: setSpeed, min: 100, max: 600, step: 10 },
            ].map(c => (
              <div key={c.label} className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{c.label}</span>
                  <span className="font-mono">{c.value}</span>
                </div>
                <input type="range" min={c.min} max={c.max} step={c.step} value={c.value}
                  onChange={e => c.set(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-sky-500" />
              </div>
            ))}
          </div>

          <div className="p-4">
            <h3 className="text-xs font-semibold text-foreground mb-2">Lift Force (kN)</h3>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold font-mono text-sky-600">{lift.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">kN generated lift</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AerospaceSimulator;
