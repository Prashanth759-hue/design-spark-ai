import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowLeft, Gauge, Zap, Settings2, BarChart3, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { useDesigns } from "@/hooks/useDesigns";

/* ─── Gear Tooth Profile ─── */
function Gear({ radius, teeth, thickness, position, rotationSpeed, color, direction = 1 }: {
  radius: number; teeth: number; thickness: number; position: [number, number, number];
  rotationSpeed: number; color: string; direction?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * rotationSpeed * direction;
  });

  return (
    <group ref={ref} position={position}>
      {/* Gear body */}
      <mesh castShadow>
        <cylinderGeometry args={[radius * 0.85, radius * 0.85, thickness, 32]} />
        <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.15} envMapIntensity={1.5} />
      </mesh>
      {/* Hub */}
      <mesh castShadow>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, thickness * 1.3, 16]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Teeth */}
      {Array.from({ length: teeth }).map((_, i) => {
        const angle = (i / teeth) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius * 0.9, 0, Math.sin(angle) * radius * 0.9]}
            rotation={[Math.PI / 2, angle, 0]} castShadow>
            <boxGeometry args={[radius * 0.15, thickness, radius * 0.2]} />
            <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.15} />
          </mesh>
        );
      })}
      {/* Spokes */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={`spoke-${i}`} position={[Math.cos(angle) * radius * 0.45, 0, Math.sin(angle) * radius * 0.45]}
            rotation={[Math.PI / 2, angle, 0]}>
            <boxGeometry args={[radius * 0.08, thickness * 0.8, radius * 0.5]} />
            <meshPhysicalMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─── Shaft ─── */
function Shaft({ from, to, radius = 0.08 }: { from: [number, number, number]; to: [number, number, number]; radius?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const length = Math.sqrt((to[0] - from[0]) ** 2 + (to[1] - from[1]) ** 2 + (to[2] - from[2]) ** 2);
  const midpoint: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 3;
  });

  return (
    <mesh ref={ref} position={midpoint} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[radius, radius, length, 16]} />
      <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} envMapIntensity={2} />
    </mesh>
  );
}

/* ─── Machine Assembly ─── */
function MachineAssembly({ motorRPM, loadResistance, gearRatio }: {
  motorRPM: number; loadResistance: number; gearRatio: number;
}) {
  const baseSpeed = (motorRPM / 1000) * (1 - loadResistance / 200);
  const outputSpeed = baseSpeed / gearRatio;

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Motor housing */}
      <mesh position={[-3, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 0.8]} />
        <meshPhysicalMaterial color="#1e3a5f" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Motor label */}
      <mesh position={[-3, 0, 0.42]}>
        <planeGeometry args={[0.6, 0.3]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
      </mesh>

      {/* Input shaft */}
      <Shaft from={[-2.4, 0, 0]} to={[-1, 0, 0]} />

      {/* Drive gear (small) */}
      <Gear radius={0.5} teeth={12} thickness={0.25} position={[-1, 0, 0]}
        rotationSpeed={baseSpeed} color="#22d3ee" direction={1} />

      {/* Driven gear (large) */}
      <Gear radius={0.5 * gearRatio} teeth={Math.round(12 * gearRatio)} thickness={0.25}
        position={[0.5 * gearRatio - 0.5, 0, 0]} rotationSpeed={outputSpeed} color="#f59e0b" direction={-1} />

      {/* Output shaft */}
      <Shaft from={[0.5 * gearRatio, 0, 0]} to={[0.5 * gearRatio + 1.5, 0, 0]} />

      {/* Load (flywheel) */}
      <mesh position={[0.5 * gearRatio + 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.3, 32]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Base plate */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 2]} />
        <meshPhysicalMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── RPM Gauge ─── */
function RPMGauge({ rpm, maxRPM }: { rpm: number; maxRPM: number }) {
  const pct = Math.min(rpm / maxRPM, 1);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 z-10 w-52 bg-card/85 backdrop-blur-md border border-border rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <Gauge className="w-4 h-4 text-primary" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">RPM</span>
      </div>
      <div className="text-center mb-2">
        <span className="text-3xl font-mono font-bold text-foreground">{Math.round(rpm)}</span>
        <span className="text-xs text-muted-foreground ml-1">RPM</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${pct * 100}%`,
            backgroundColor: pct > 0.8 ? "hsl(var(--destructive))" : pct > 0.5 ? "hsl(45 93% 47%)" : "hsl(var(--primary))"
          }} />
      </div>
    </motion.div>
  );
}

const MachineSimulator = () => {
  const navigate = useNavigate();
  const [motorRPM, setMotorRPM] = useState(500);
  const [loadResistance, setLoadResistance] = useState(20);
  const [gearRatio, setGearRatio] = useState(2);
  const { saveDesign } = useDesigns();

  const outputRPM = motorRPM / gearRatio * (1 - loadResistance / 200);
  const torque = motorRPM * gearRatio * 0.1 * (1 + loadResistance / 100);
  const power = (torque * outputRPM * 2 * Math.PI) / 60000;
  const efficiency = Math.max(0, 100 - loadResistance * 0.5 - (gearRatio - 1) * 5);

  const handleSave = () => {
    saveDesign("machine", `Gear System ${gearRatio}:1`, { motorRPM, loadResistance, gearRatio });
  };

  return (
    <div className="w-screen h-screen bg-background relative overflow-hidden flex">
      <div className="flex-1 relative">
        <Canvas shadows gl={{ antialias: true, toneMapping: 3 }}>
          <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={40} />
          <Environment preset="studio" background={false} />
          <color attach="background" args={["#0f172a"]} />
          <directionalLight position={[8, 12, 6]} intensity={2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <ambientLight intensity={0.15} />
          <Suspense fallback={null}>
            <MachineAssembly motorRPM={motorRPM} loadResistance={loadResistance} gearRatio={gearRatio} />
          </Suspense>
          <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={14} blur={3} />
          <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={18} />
        </Canvas>

        <div className="absolute top-0 left-0 right-0 flex items-center px-4 py-3 bg-gradient-to-b from-background/90 to-transparent">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")}
              className="px-3 py-1.5 rounded-lg bg-card/80 border border-border text-xs font-medium text-foreground hover:bg-card transition-colors backdrop-blur-sm">
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">⚙️ Machine Dynamic System</h1>
              <p className="text-[10px] text-muted-foreground font-mono">Gear • Torque • RPM Simulation</p>
            </div>
          </div>
        </div>

        <RPMGauge rpm={outputRPM} maxRPM={3000} />
      </div>

      {/* Control Panel */}
      <motion.div initial={{ x: 320 }} animate={{ x: 0 }}
        className="w-80 bg-card border-l border-border flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Machine Controls</p>
          <p className="text-[10px] text-muted-foreground">Adjust mechanical parameters</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-foreground">Motor RPM</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-foreground">{motorRPM}</span>
            </div>
            <input type="range" min={100} max={3000} step={50} value={motorRPM}
              onChange={(e) => setMotorRPM(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-foreground">Gear Ratio</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-foreground">{gearRatio}:1</span>
            </div>
            <input type="range" min={1} max={5} step={0.5} value={gearRatio}
              onChange={(e) => setGearRatio(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BarChart3 className={`w-3.5 h-3.5 ${loadResistance > 70 ? "text-destructive" : "text-primary"}`} />
                <span className="text-[11px] font-medium text-foreground">Load Resistance</span>
              </div>
              <span className={`text-[11px] font-mono font-semibold ${loadResistance > 70 ? "text-destructive" : "text-foreground"}`}>{loadResistance}%</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={loadResistance}
              onChange={(e) => setLoadResistance(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Performance Data</p>
            <div className="space-y-2">
              {[
                { label: "Input RPM", value: `${motorRPM} RPM` },
                { label: "Output RPM", value: `${Math.round(outputRPM)} RPM` },
                { label: "Torque", value: `${torque.toFixed(1)} Nm` },
                { label: "Power", value: `${power.toFixed(2)} kW` },
                { label: "Efficiency", value: `${efficiency.toFixed(1)}%` },
                { label: "Gear Ratio", value: `${gearRatio}:1` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  <span className="text-[10px] font-mono font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency bar */}
          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">System Efficiency</p>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${efficiency}%`,
                  backgroundColor: efficiency > 80 ? "hsl(var(--primary))" : efficiency > 50 ? "hsl(45 93% 47%)" : "hsl(var(--destructive))"
                }} />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1 font-mono">
              <span>0%</span><span>100%</span>
            </div>
          </div>

          {/* Real-time Charts */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Live Performance</p>
            <PerformanceChart title="Output RPM" unit="RPM" value={outputRPM} maxValue={3000} color="hsl(var(--primary))" />
            <PerformanceChart title="Torque" unit="Nm" value={torque} maxValue={1000} color="hsl(25 95% 53%)" />
            <PerformanceChart title="Power" unit="kW" value={power} maxValue={50} color="hsl(45 93% 47%)" />
          </div>

          {/* Save button */}
          <button onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors mt-4">
            <Save className="w-3.5 h-3.5" /> Save Design
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MachineSimulator;
