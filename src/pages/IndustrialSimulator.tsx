import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { ArrowLeft, Factory, Play, Pause, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

/* ─── Conveyor Belt ─── */
function ConveyorBelt({ speed }: { speed: number }) {
  const rollersRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rollersRef.current) {
      rollersRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh) child.rotation.z += delta * speed * 2;
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Frame */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[4, 0.05, 0.8]} />
        <meshPhysicalMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Side rails */}
      <mesh position={[0, 0, 0.42]} castShadow>
        <boxGeometry args={[4, 0.15, 0.04]} />
        <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[4, 0.15, 0.04]} />
        <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Belt surface */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[4, 0.03, 0.7]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Rollers */}
      <group ref={rollersRef}>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-1.8 + i * 0.45, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.75, 12]} />
            <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ─── CNC Machine ─── */
function CNCMachine({ running }: { running: boolean }) {
  const spindleRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (spindleRef.current && running) spindleRef.current.rotation.y += delta * 30;
  });

  return (
    <group position={[0, 0, -2]}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 1.2]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Column */}
      <mesh position={[-0.5, 0.8, 0]} castShadow>
        <boxGeometry args={[0.25, 1, 0.5]} />
        <meshPhysicalMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Spindle head */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.4]} />
        <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Spindle */}
      <mesh ref={spindleRef} position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.4, 12]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Workpiece */}
      <mesh position={[0.2, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.3]} />
        <meshPhysicalMaterial color="#f59e0b" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Control panel */}
      <mesh position={[0.6, 0.7, 0.35]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.6, 0.73, 0.38]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.22, 0.15, 0.01]} />
        <meshPhysicalMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={running ? 0.5 : 0.1} />
      </mesh>
    </group>
  );
}

/* ─── Product Box ─── */
function ProductBox({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.25, 0.2, 0.25]} />
      <meshPhysicalMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

/* ─── Floor ─── */
function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <gridHelper args={[12, 24, "#cbd5e1", "#e2e8f0"]} position={[0, -0.19, 0]} />
    </group>
  );
}

const IndustrialSimulator = () => {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [beltSpeed, setBeltSpeed] = useState(2);
  const [spindleRPM, setSpindleRPM] = useState(3000);

  const toggleRun = () => setRunning(!running);

  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <Factory className="w-5 h-5 text-stone-500" />
          <span className="text-sm font-semibold text-foreground">Industrial Simulator</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-500/10 text-stone-600">Manufacturing</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleRun} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-600 text-white text-xs font-medium hover:bg-stone-700 transition-colors">
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {running ? "Stop" : "Start"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <Canvas shadows gl={{ antialias: true, toneMapping: 3 }}>
            <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={42} />
            <Environment preset="warehouse" background={false} />
            <color attach="background" args={["#fafaf9"]} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <ambientLight intensity={0.3} />
            <Suspense fallback={null}>
              <ConveyorBelt speed={running ? beltSpeed : 0} />
              <CNCMachine running={running} />
              {/* Product boxes on conveyor */}
              <ProductBox position={[-1.2, 0.05, 0]} color="#f59e0b" />
              <ProductBox position={[-0.3, 0.05, 0]} color="#3b82f6" />
              <ProductBox position={[0.6, 0.05, 0]} color="#10b981" />
              <Floor />
            </Suspense>
            <ContactShadows position={[0, -0.2, 0]} opacity={0.3} scale={12} blur={2} />
            <OrbitControls enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>
        </div>

        <div className="w-72 border-l border-border bg-card flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3">Machine Controls</h3>
            {[
              { label: "Belt Speed", value: beltSpeed, set: setBeltSpeed, min: 0.5, max: 5, step: 0.1, unit: "m/s" },
              { label: "Spindle RPM", value: spindleRPM, set: setSpindleRPM, min: 500, max: 8000, step: 100, unit: "RPM" },
            ].map(c => (
              <div key={c.label} className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{c.label}</span>
                  <span className="font-mono">{c.value} {c.unit}</span>
                </div>
                <input type="range" min={c.min} max={c.max} step={c.step} value={c.value}
                  onChange={e => c.set(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-stone-500" />
              </div>
            ))}
          </div>

          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground mb-2">Production Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Throughput", value: `${Math.round(beltSpeed * 12)}/hr` },
                { label: "Efficiency", value: `${Math.min(98, 85 + beltSpeed * 3).toFixed(1)}%` },
                { label: "Status", value: running ? "Running" : "Idle" },
                { label: "Quality", value: "99.2%" },
              ].map(s => (
                <div key={s.label} className="bg-secondary/50 rounded-lg p-2">
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-bold font-mono text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-xs font-semibold text-foreground mb-2">Throughput (units/hr)</h3>
            <div className="h-32">
              <PerformanceChart title="Output" unit="u/hr" value={Math.round(beltSpeed * 12)} maxValue={80} color="#78716c" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustrialSimulator;
