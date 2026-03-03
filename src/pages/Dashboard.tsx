import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Car, Building2, Cog, CircuitBoard, ArrowRight, LayoutDashboard, ArrowLeft, Zap, Activity, Layers } from "lucide-react";
import { SportsCar } from "@/components/3d/SportsCar";
import { Motorcycle } from "@/components/3d/Motorcycle";
import { BusVehicle } from "@/components/3d/BusVehicle";
import { BuildingStructure } from "@/components/3d/BuildingStructure";
import { Skyscraper } from "@/components/3d/Skyscraper";
import { Villa } from "@/components/3d/Villa";
import { Turbine } from "@/components/3d/Turbine";
import { Engine } from "@/components/3d/Engine";
import { DesignParams } from "@/lib/parseDesignParams";

const DEFAULT_CAR_CONFIG = {
  bodyColor: "#c8102e", accentColor: "#111111", accentZone: "none" as const,
  rimColor: "#d4d4d8", paintFinish: "gloss" as const, windowTint: 0.3,
  headlightColor: "#fef08a", rimStyle: "spoke" as const, bodyKit: "stock" as const,
};

function MiniPreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-44 rounded-lg overflow-hidden bg-[#0f172a]">
      <Canvas shadows gl={{ antialias: true, toneMapping: 3 }}>
        <PerspectiveCamera makeDefault position={[4, 2.5, 4]} fov={38} />
        <Environment preset="studio" background={false} />
        <color attach="background" args={["#0f172a"]} />
        <directionalLight position={[5, 8, 4]} intensity={1.8} castShadow />
        <ambientLight intensity={0.15} />
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={8} blur={2} />
        <OrbitControls enableDamping dampingFactor={0.08} enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}

const DOMAINS = [
  {
    id: "vehicles",
    label: "Vehicles",
    icon: Car,
    color: "hsl(var(--primary))",
    route: "/drive",
    stats: [
      { label: "Models", value: "9" },
      { label: "Types", value: "Car, Bike, Bus" },
      { label: "Physics", value: "Active" },
    ],
    previews: [
      { label: "Sports Car", scene: <SportsCar config={DEFAULT_CAR_CONFIG} autoRotate={false} /> },
      { label: "Motorcycle", scene: <Motorcycle autoRotate={false} /> },
      { label: "Bus", scene: <BusVehicle autoRotate={false} /> },
    ],
  },
  {
    id: "buildings",
    label: "Buildings",
    icon: Building2,
    color: "hsl(45 93% 47%)",
    route: "/building",
    stats: [
      { label: "Types", value: "Office, Villa, Tower" },
      { label: "Simulation", value: "FEA Stress" },
      { label: "Physics", value: "Wind/Quake" },
    ],
    previews: [
      { label: "Office", scene: <BuildingStructure params={{ structureType: "building", beamLength: 4, beamHeight: 0.3, beamWidth: 0.6, columnHeight: 1.5, columnWidth: 0.25, materialColor: "#22d3ee", columnColor: "#0e7490", baseColor: "#164e63", label: "Office" } as DesignParams} /> },
      { label: "Skyscraper", scene: <Skyscraper floors={15} autoRotate={false} /> },
      { label: "Villa", scene: <Villa autoRotate={false} /> },
    ],
  },
  {
    id: "machines",
    label: "Machines",
    icon: Cog,
    color: "hsl(25 95% 53%)",
    route: "/machine",
    stats: [
      { label: "Types", value: "Gear, Turbine, Engine" },
      { label: "Analytics", value: "RPM/Torque" },
      { label: "Efficiency", value: "Real-time" },
    ],
    previews: [
      { label: "Turbine", scene: <Turbine rpm={300} autoRotate={false} /> },
      { label: "Engine", scene: <Engine rpm={300} autoRotate={false} /> },
    ],
  },
  {
    id: "circuits",
    label: "Circuits",
    icon: CircuitBoard,
    color: "hsl(142 71% 45%)",
    route: "/circuit",
    stats: [
      { label: "Components", value: "R, LED, Battery" },
      { label: "Laws", value: "Ohm's Law" },
      { label: "Detection", value: "Overload" },
    ],
    previews: [],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeDomain, setActiveDomain] = useState(0);

  return (
    <div className="w-screen h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")}
            className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> AI Chat
          </button>
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Engineering Dashboard</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">4 Domains</span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar domain selector */}
        <div className="w-56 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Domains</p>
          </div>
          <div className="flex-1 px-2 space-y-1">
            {DOMAINS.map((d, i) => {
              const Icon = d.icon;
              return (
                <button key={d.id} onClick={() => setActiveDomain(i)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                    activeDomain === i ? "bg-primary/10 text-foreground border border-primary/30" : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                  }`}>
                  <Icon className="w-4 h-4" style={{ color: activeDomain === i ? d.color : undefined }} />
                  <div>
                    <p className="text-xs font-semibold">{d.label}</p>
                    <p className="text-[10px] text-muted-foreground">{d.stats[0]?.value}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <motion.div key={activeDomain} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {/* Domain header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {(() => { const Icon = DOMAINS[activeDomain].icon; return <Icon className="w-6 h-6" style={{ color: DOMAINS[activeDomain].color }} />; })()}
                <div>
                  <h1 className="text-lg font-bold text-foreground">{DOMAINS[activeDomain].label}</h1>
                  <p className="text-xs text-muted-foreground">Live 3D previews and quick stats</p>
                </div>
              </div>
              <button onClick={() => navigate(DOMAINS[activeDomain].route)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                Open Simulator <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {DOMAINS[activeDomain].stats.map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">{s.label}</p>
                  <p className="text-sm font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {/* 3D Preview grid */}
            {DOMAINS[activeDomain].previews.length > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">Live 3D Previews</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {DOMAINS[activeDomain].previews.map((p, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                      <MiniPreview>{p.scene}</MiniPreview>
                      <div className="px-3 py-2 border-t border-border">
                        <p className="text-xs font-semibold text-foreground">{p.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <CircuitBoard className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Circuit simulator uses SVG-based rendering</p>
                <button onClick={() => navigate("/circuit")}
                  className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
                  Open Circuit Simulator →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
