import { useState, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowLeft, Wind, Activity, Layers, AlertTriangle, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { useDesigns } from "@/hooks/useDesigns";

/* ─── Building 3D with stress heatmap ─── */
function BuildingFrame({
  floors, windForce, earthquakeIntensity, load, collapsed
}: {
  floors: number; windForce: number; earthquakeIntensity: number; load: number; collapsed: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    // Wind sway
    const windSway = Math.sin(timeRef.current * 1.5) * windForce * 0.003;
    // Earthquake oscillation
    const quakeX = Math.sin(timeRef.current * 8) * earthquakeIntensity * 0.002;
    const quakeZ = Math.cos(timeRef.current * 6) * earthquakeIntensity * 0.001;

    if (collapsed) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.8, delta * 2);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -2, delta * 2);
    } else {
      groupRef.current.rotation.z = windSway;
      groupRef.current.rotation.x = quakeZ;
      groupRef.current.position.x = quakeX;
      groupRef.current.position.y = 0;
    }
  });

  const floorH = 0.8;
  const width = 2.5;
  const depth = 2;
  const totalH = floors * floorH;
  const baseY = -totalH / 2;

  const getStressColor = (floor: number) => {
    const stress = (load / 100) * ((floors - floor) / floors);
    if (stress > 0.8) return "#ef4444";
    if (stress > 0.6) return "#f97316";
    if (stress > 0.4) return "#eab308";
    if (stress > 0.2) return "#22c55e";
    return "#3b82f6";
  };

  return (
    <group ref={groupRef}>
      {/* Foundation */}
      <mesh position={[0, baseY - 0.1, 0]} receiveShadow>
        <boxGeometry args={[width * 1.3, 0.2, depth * 1.3]} />
        <meshPhysicalMaterial color="#57534e" metalness={0.2} roughness={0.8} />
      </mesh>

      {Array.from({ length: floors }).map((_, f) => {
        const y = baseY + f * floorH;
        const stressColor = getStressColor(f);
        return (
          <group key={f}>
            {/* Floor slab */}
            <mesh position={[0, y + floorH, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 0.06, depth]} />
              <meshPhysicalMaterial color={stressColor} metalness={0.1} roughness={0.6} />
            </mesh>

            {/* Columns */}
            {[
              [-width * 0.42, -depth * 0.42],
              [width * 0.42, -depth * 0.42],
              [-width * 0.42, depth * 0.42],
              [width * 0.42, depth * 0.42],
            ].map(([cx, cz], ci) => (
              <mesh key={ci} position={[cx, y + floorH / 2 + 0.03, cz]} castShadow>
                <boxGeometry args={[0.12, floorH - 0.06, 0.12]} />
                <meshPhysicalMaterial color={stressColor} metalness={0.15} roughness={0.6} opacity={collapsed ? 0.5 : 1} transparent />
              </mesh>
            ))}

            {/* Cross bracing */}
            <mesh position={[0, y + floorH / 2, -depth * 0.5]} castShadow>
              <boxGeometry args={[width * 0.8, floorH * 0.5, 0.02]} />
              <meshPhysicalMaterial
                color="#bfdbfe"
                metalness={0.1}
                roughness={0.05}
                transmission={0.4}
                thickness={0.3}
                opacity={0.7}
                transparent
              />
            </mesh>
          </group>
        );
      })}

      {/* Ground */}
      <mesh position={[0, baseY - 0.21, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ─── Control Slider ─── */
function Slider({ label, value, onChange, min, max, step, icon: Icon, unit, warning }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number;
  icon: any; unit: string; warning?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${warning ? "text-destructive" : "text-primary"}`} />
          <span className="text-[11px] font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-[11px] font-mono font-semibold ${warning ? "text-destructive" : "text-foreground"}`}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
      />
    </div>
  );
}

const BuildingSimulator = () => {
  const navigate = useNavigate();
  const [floors, setFloors] = useState(5);
  const [windForce, setWindForce] = useState(0);
  const [earthquakeIntensity, setEarthquakeIntensity] = useState(0);
  const [load, setLoad] = useState(30);
  const { saveDesign } = useDesigns();

  const collapsed = load > 90 || (windForce > 80 && load > 60) || (earthquakeIntensity > 70 && load > 50);
  const stressLevel = Math.min(100, load + windForce * 0.3 + earthquakeIntensity * 0.4);

  const handleSave = () => {
    saveDesign("building", `${floors}-Floor Building`, { floors, windForce, earthquakeIntensity, load });
  };

  return (
    <div className="w-screen h-screen bg-background relative overflow-hidden flex">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows gl={{ antialias: true, toneMapping: 3 }}>
          <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={40} />
          <Environment preset="studio" background={false} />
          <color attach="background" args={["#0f172a"]} />
          <directionalLight position={[8, 12, 6]} intensity={2} castShadow
            shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <ambientLight intensity={0.15} />
          <hemisphereLight args={["#87ceeb", "#1e293b", 0.3]} />
          <Suspense fallback={null}>
            <BuildingFrame floors={floors} windForce={windForce} earthquakeIntensity={earthquakeIntensity} load={load} collapsed={collapsed} />
          </Suspense>
          <ContactShadows position={[0, -floors * 0.4 - 0.3, 0]} opacity={0.5} scale={14} blur={3} />
          <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={18} />
        </Canvas>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-background/90 to-transparent">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")}
              className="px-3 py-1.5 rounded-lg bg-card/80 border border-border text-xs font-medium text-foreground hover:bg-card transition-colors backdrop-blur-sm">
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">🏢 Building Structural Physics</h1>
              <p className="text-[10px] text-muted-foreground font-mono">Wind • Earthquake • Load Simulation</p>
            </div>
          </div>
        </div>

        {/* Collapse warning */}
        {collapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-6 py-4 rounded-2xl flex items-center gap-3 z-10"
          >
            <AlertTriangle className="w-6 h-6" />
            <div>
              <p className="font-bold text-sm">STRUCTURAL FAILURE</p>
              <p className="text-xs opacity-80">Load exceeded capacity — collapse detected</p>
            </div>
          </motion.div>
        )}

        {/* Stress indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 z-10 w-56 bg-card/85 backdrop-blur-md border border-border rounded-xl p-3"
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Overall Stress</p>
          <div className="text-center mb-2">
            <span className="text-3xl font-mono font-bold text-foreground">{Math.round(stressLevel)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${stressLevel}%`,
                backgroundColor: stressLevel > 80 ? "hsl(var(--destructive))" : stressLevel > 50 ? "hsl(45 93% 47%)" : "hsl(var(--primary))"
              }}
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-center">
            <div><p className="text-[9px] text-muted-foreground">Wind</p><p className="text-[10px] font-mono font-semibold text-foreground">{windForce}%</p></div>
            <div><p className="text-[9px] text-muted-foreground">Quake</p><p className="text-[10px] font-mono font-semibold text-foreground">{earthquakeIntensity}%</p></div>
            <div><p className="text-[9px] text-muted-foreground">Load</p><p className="text-[10px] font-mono font-semibold text-foreground">{load}%</p></div>
          </div>
        </motion.div>
      </div>

      {/* Control Panel */}
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        className="w-80 bg-card border-l border-border flex flex-col overflow-hidden shrink-0"
      >
        <div className="p-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Building Controls</p>
          <p className="text-[10px] text-muted-foreground">Adjust structural parameters</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
          <Slider label="Floors" value={floors} onChange={setFloors} min={2} max={15} step={1} icon={Layers} unit="" />
          <Slider label="Wind Force" value={windForce} onChange={setWindForce} min={0} max={100} step={1} icon={Wind} unit="%" warning={windForce > 70} />
          <Slider label="Earthquake" value={earthquakeIntensity} onChange={setEarthquakeIntensity} min={0} max={100} step={1} icon={Activity} unit="%" warning={earthquakeIntensity > 60} />
          <Slider label="Structural Load" value={load} onChange={setLoad} min={0} max={100} step={1} icon={Layers} unit="%" warning={load > 80} />

          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Stress Heatmap Legend</p>
            <div className="space-y-1.5">
              {[
                { color: "#3b82f6", label: "Safe (0-20%)" },
                { color: "#22c55e", label: "Normal (20-40%)" },
                { color: "#eab308", label: "Moderate (40-60%)" },
                { color: "#f97316", label: "High (60-80%)" },
                { color: "#ef4444", label: "Critical (80-100%)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Structural Data</p>
            <div className="space-y-1">
              {[
                { label: "Total Height", value: `${(floors * 3.2).toFixed(1)}m` },
                { label: "Weight", value: `${(floors * 450).toLocaleString()} tons` },
                { label: "Material", value: "Reinforced Concrete" },
                { label: "Max Wind Load", value: `${Math.round(200 - windForce * 1.5)} km/h` },
                { label: "Safety Factor", value: stressLevel > 80 ? "0.8x ⚠️" : stressLevel > 50 ? "1.2x" : "2.0x ✓" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  <span className="text-[10px] font-mono font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Charts */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Live Performance</p>
            <PerformanceChart title="Stress Level" unit="%" value={stressLevel} maxValue={100} color="hsl(0 84% 60%)" />
            <PerformanceChart title="Wind Sway" unit="mm" value={windForce * 0.8} maxValue={80} color="hsl(199 89% 48%)" />
            <PerformanceChart title="Seismic Accel." unit="g" value={earthquakeIntensity * 0.01} maxValue={1} color="hsl(45 93% 47%)" />
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

export default BuildingSimulator;
