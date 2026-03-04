import { useState, Suspense, useCallback, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Palette, Settings2, Layers, ZapIcon, ChevronRight, ChevronLeft, Camera, Sun, Car, Building2, Cog, CircuitBoard, Wind, Activity, Zap as ZapLucide, Battery, Save } from "lucide-react";
import { BuildingStructure } from "@/components/3d/BuildingStructure";
import { DesignParams } from "@/lib/parseDesignParams";
import * as THREE from "three";
import { SportsCar } from "@/components/3d/SportsCar";
import { LuxurySedan } from "@/components/3d/LuxurySedan";
import { MuscleCar } from "@/components/3d/MuscleCar";
import { SUVCar } from "@/components/3d/SUVCar";
import { PickupTruck } from "@/components/3d/PickupTruck";
import { Convertible } from "@/components/3d/Convertible";
import { VanVehicle } from "@/components/3d/VanVehicle";
import { Motorcycle } from "@/components/3d/Motorcycle";
import { BusVehicle } from "@/components/3d/BusVehicle";
import { VehicleSpecsPanel } from "@/components/VehicleSpecsPanel";
import { useDesigns } from "@/hooks/useDesigns";

export interface CarConfig {
  bodyColor: string;
  accentColor: string;
  accentZone: "roof" | "hood" | "sides" | "none";
  rimColor: string;
  paintFinish: "gloss" | "matte" | "satin";
  windowTint: number;
  headlightColor: string;
  rimStyle: "spoke" | "mesh" | "turbine";
  bodyKit: "stock" | "aero" | "carbon";
}

export type CarModel = "sports" | "sedan" | "muscle" | "suv" | "pickup" | "convertible" | "van" | "motorcycle" | "bus";

export type EnvPreset = "studio" | "night" | "sunset" | "dawn" | "warehouse" | "city";

const DEFAULT_CONFIG: CarConfig = {
  bodyColor: "#c8102e",
  accentColor: "#111111",
  accentZone: "none",
  rimColor: "#d4d4d8",
  paintFinish: "gloss",
  windowTint: 0.3,
  headlightColor: "#fef08a",
  rimStyle: "spoke",
  bodyKit: "stock",
};

interface VehicleSpecs {
  hp: number;
  torque: string;
  zeroToSixty: string;
  weight: string;
  dimensions: string;
  engine: string;
  topSpeed: string;
}

const VEHICLE_SPECS: Record<CarModel, VehicleSpecs> = {
  sports: { hp: 640, torque: "600 Nm", zeroToSixty: "2.9s", weight: "1,422 kg", dimensions: "4.52 × 1.93 × 1.17 m", engine: "V10 5.2L", topSpeed: "325 km/h" },
  sedan: { hp: 523, torque: "750 Nm", zeroToSixty: "3.6s", weight: "1,950 kg", dimensions: "5.12 × 1.90 × 1.47 m", engine: "V8 4.4L Twin-Turbo", topSpeed: "290 km/h" },
  muscle: { hp: 480, torque: "569 Nm", zeroToSixty: "3.8s", weight: "1,735 kg", dimensions: "4.78 × 1.92 × 1.38 m", engine: "V8 5.0L", topSpeed: "265 km/h" },
  suv: { hp: 395, torque: "550 Nm", zeroToSixty: "4.5s", weight: "2,310 kg", dimensions: "4.93 × 2.00 × 1.74 m", engine: "V6 3.0L Twin-Turbo", topSpeed: "250 km/h" },
  pickup: { hp: 450, torque: "690 Nm", zeroToSixty: "5.1s", weight: "2,680 kg", dimensions: "5.89 × 2.03 × 1.92 m", engine: "V8 6.2L", topSpeed: "210 km/h" },
  convertible: { hp: 455, torque: "530 Nm", zeroToSixty: "3.4s", weight: "1,585 kg", dimensions: "4.38 × 1.86 × 1.26 m", engine: "V8 4.0L Twin-Turbo", topSpeed: "310 km/h" },
  van: { hp: 275, torque: "460 Nm", zeroToSixty: "7.8s", weight: "2,480 kg", dimensions: "5.14 × 1.93 × 1.98 m", engine: "V6 3.5L", topSpeed: "195 km/h" },
  motorcycle: { hp: 200, torque: "113 Nm", zeroToSixty: "2.6s", weight: "198 kg", dimensions: "2.10 × 0.74 × 1.15 m", engine: "L4 998cc", topSpeed: "299 km/h" },
  bus: { hp: 350, torque: "1400 Nm", zeroToSixty: "18s", weight: "12,000 kg", dimensions: "12.0 × 2.55 × 3.40 m", engine: "Diesel I6 7.7L", topSpeed: "120 km/h" },
};

const CAR_MODELS: { id: CarModel; label: string; desc: string }[] = [
  { id: "sports", label: "Sports Car", desc: "Lamborghini-style supercar" },
  { id: "sedan", label: "Luxury Sedan", desc: "BMW/Mercedes elegance" },
  { id: "muscle", label: "Muscle Car", desc: "Mustang/Camaro power" },
  { id: "suv", label: "SUV", desc: "Premium crossover" },
  { id: "pickup", label: "Pickup Truck", desc: "Heavy-duty hauler" },
  { id: "convertible", label: "Convertible", desc: "Open-top roadster" },
  { id: "van", label: "Van", desc: "Spacious people mover" },
  { id: "motorcycle", label: "Motorcycle", desc: "Sport bike racer" },
  { id: "bus", label: "Bus", desc: "City transit vehicle" },
];

const BODY_COLORS = [
  { hex: "#c8102e", name: "Race Red" },
  { hex: "#1e3a5f", name: "Midnight Blue" },
  { hex: "#111111", name: "Obsidian" },
  { hex: "#f8f8f8", name: "Arctic White" },
  { hex: "#f59e0b", name: "Satin Gold" },
  { hex: "#16a34a", name: "Viper Green" },
  { hex: "#7c3aed", name: "Ultra Violet" },
  { hex: "#b45309", name: "Burnt Orange" },
  { hex: "#64748b", name: "Slate Grey" },
  { hex: "#be185d", name: "Candy Pink" },
  { hex: "#0891b2", name: "Electric Cyan" },
  { hex: "#292524", name: "Gunmetal" },
];

const RIM_COLORS = [
  { hex: "#d4d4d8", name: "Chrome" },
  { hex: "#111111", name: "Gloss Black" },
  { hex: "#a16207", name: "Gold" },
  { hex: "#b45309", name: "Bronze" },
  { hex: "#c8102e", name: "Red" },
  { hex: "#1e3a5f", name: "Dark Blue" },
];

const HEADLIGHT_COLORS = [
  { hex: "#fef08a", name: "Warm White" },
  { hex: "#e0f2fe", name: "Cool White" },
  { hex: "#93c5fd", name: "Ice Blue" },
  { hex: "#f97316", name: "Amber" },
];

const ENV_PRESETS: { id: EnvPreset; label: string; desc: string; bgColor: string }[] = [
  { id: "studio", label: "Studio", desc: "Clean white showroom", bgColor: "#1a1a2e" },
  { id: "night", label: "Night City", desc: "Urban nightscape", bgColor: "#0a0a14" },
  { id: "sunset", label: "Desert Road", desc: "Golden hour desert", bgColor: "#2d1b0e" },
  { id: "dawn", label: "Race Track", desc: "Early morning circuit", bgColor: "#0e1a2d" },
  { id: "warehouse", label: "Showroom", desc: "Industrial gallery", bgColor: "#141418" },
  { id: "city", label: "City Street", desc: "Downtown backdrop", bgColor: "#121620" },
];

export type ConfigDomain = "vehicle" | "building" | "machine" | "circuit";

const DOMAIN_TABS: { id: ConfigDomain; icon: any; label: string }[] = [
  { id: "vehicle", icon: Car, label: "Vehicles" },
  { id: "building", icon: Building2, label: "Buildings" },
  { id: "machine", icon: Cog, label: "Machines" },
  { id: "circuit", icon: CircuitBoard, label: "Circuits" },
];

type PanelTab = "model" | "paint" | "wheels" | "style" | "env";

/* ─── Model transition animation ─── */
function ModelTransition({ model, config, autoRotate }: { model: CarModel; config: CarConfig; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [currentModel, setCurrentModel] = useState(model);
  const [transitioning, setTransitioning] = useState(false);
  const scaleRef = useRef(1);
  const targetScale = useRef(1);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale.current, 6 * delta);
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  if (model !== currentModel && !transitioning) {
    setTransitioning(true);
    targetScale.current = 0;
    setTimeout(() => {
      setCurrentModel(model);
      targetScale.current = 1;
      setTimeout(() => setTransitioning(false), 400);
    }, 250);
  }

  const CarComponent = {
    sports: SportsCar, sedan: LuxurySedan, muscle: MuscleCar,
    suv: SUVCar, pickup: PickupTruck, convertible: Convertible, van: VanVehicle,
    motorcycle: ({ config, autoRotate }: any) => <Motorcycle color={config.bodyColor} autoRotate={autoRotate} />,
    bus: ({ config, autoRotate }: any) => <BusVehicle color={config.bodyColor} autoRotate={autoRotate} />,
  }[currentModel] as any;

  return (
    <group ref={groupRef}>
      <CarComponent config={config} autoRotate={autoRotate} />
    </group>
  );
}

function Scene({ model, config, autoRotate, envPreset, bgColor }: {
  model: CarModel; config: CarConfig; autoRotate: boolean; envPreset: EnvPreset; bgColor: string;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 2.4, 6]} fov={36} />
      <color attach="background" args={[bgColor]} />

      <Environment preset={envPreset} background={false} />

      {/* Key light */}
      <directionalLight position={[8, 10, 6]} intensity={envPreset === "night" ? 0.8 : 2.2} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={30} shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0004}
        color={envPreset === "sunset" ? "#ffb366" : envPreset === "night" ? "#6688cc" : "#fff8f0"} />
      {/* Fill */}
      <directionalLight position={[-6, 5, -4]} intensity={envPreset === "night" ? 0.2 : 0.6}
        color={envPreset === "sunset" ? "#ff8844" : "#b0c8ff"} />
      {/* Rim */}
      <pointLight position={[-4, 3, -6]} intensity={envPreset === "night" ? 1.5 : 0.8}
        color={envPreset === "night" ? "#4466ff" : "#22d3ee"} distance={18} decay={2} />
      {/* Ground bounce */}
      <hemisphereLight args={[
        envPreset === "sunset" ? "#ff9955" : envPreset === "night" ? "#1a1a4e" : "#e0e8ff",
        envPreset === "sunset" ? "#3d1a0a" : "#2a1a0a",
        envPreset === "night" ? 0.2 : 0.4
      ]} />
      <ambientLight intensity={envPreset === "night" ? 0.06 : 0.12} color="#dde8ff" />

      {/* Car model with transition animation */}
      <ModelTransition model={model} config={config} autoRotate={autoRotate} />

      <ContactShadows position={[0, -1.1, 0]} opacity={0.75} scale={18} blur={3.5} far={9} color="#0a0a1a" />

      <Grid position={[0, -1.02, 0]} args={[20, 20]} cellSize={0.6} cellThickness={0.4}
        cellColor={envPreset === "night" ? "#1a1a4e" : "#1e3a5f"}
        sectionSize={3} sectionThickness={0.8}
        sectionColor={envPreset === "night" ? "#4466ff" : envPreset === "sunset" ? "#ff8844" : "#22d3ee"}
        fadeDistance={16} fadeStrength={1} infiniteGrid />

      <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={14}
        maxPolarAngle={Math.PI / 2.05} minPolarAngle={0.15} rotateSpeed={0.55} target={[0, 0.2, 0]} />
    </>
  );
}

/* ─── Building Preview Scene ─── */
function BuildingPreviewScene({ floors, envPreset, bgColor }: { floors: number; envPreset: EnvPreset; bgColor: string }) {
  const buildingParams: DesignParams = {
    structureType: "building", beamLength: 4, beamHeight: 0.3, beamWidth: 0.6,
    columnHeight: floors * 0.3, columnWidth: 0.25, materialColor: "#22d3ee",
    columnColor: "#0e7490", baseColor: "#164e63", label: "Building",
  };
  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 3, 6]} fov={36} />
      <color attach="background" args={[bgColor]} />
      <Environment preset={envPreset} background={false} />
      <directionalLight position={[8, 10, 6]} intensity={2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#87ceeb", "#2a1a0a", 0.3]} />
      <BuildingStructure params={buildingParams} />
      <ContactShadows position={[0, -1.1, 0]} opacity={0.5} scale={14} blur={3} />
      <Grid position={[0, -1.02, 0]} args={[20, 20]} cellSize={0.6} cellThickness={0.4}
        cellColor="#1e3a5f" sectionSize={3} sectionThickness={0.8} sectionColor="#22d3ee"
        fadeDistance={16} fadeStrength={1} infiniteGrid />
      <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={14} />
    </>
  );
}

/* ─── Machine Preview Scene ─── */
function RotatingGear({ position, radius, speed, color }: { position: [number, number, number]; radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * speed; });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow><cylinderGeometry args={[radius, radius, 0.2, 32]} /><meshPhysicalMaterial color={color} metalness={0.85} roughness={0.15} /></mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <mesh key={i} position={[Math.cos(a) * radius * 0.9, 0, Math.sin(a) * radius * 0.9]} castShadow>
          <boxGeometry args={[radius * 0.15, 0.22, radius * 0.2]} /><meshPhysicalMaterial color={color} metalness={0.85} roughness={0.15} />
        </mesh>;
      })}
    </group>
  );
}

function MachinePreviewScene({ rpm, envPreset, bgColor }: { rpm: number; envPreset: EnvPreset; bgColor: string }) {
  const speed = rpm / 300;
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 6]} fov={40} />
      <color attach="background" args={[bgColor]} />
      <Environment preset={envPreset} background={false} />
      <directionalLight position={[8, 10, 6]} intensity={2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <ambientLight intensity={0.12} />
      <RotatingGear position={[-1.2, 0, 0]} radius={0.6} speed={speed} color="#22d3ee" />
      <RotatingGear position={[1, 0, 0]} radius={1} speed={-speed * 0.6} color="#f59e0b" />
      <mesh position={[0, -0.3, 0]} receiveShadow><boxGeometry args={[5, 0.1, 2]} /><meshPhysicalMaterial color="#334155" metalness={0.5} roughness={0.5} /></mesh>
      <ContactShadows position={[0, -0.35, 0]} opacity={0.5} scale={10} blur={3} />
      <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={14} />
    </>
  );
}

/* ─── Circuit Preview Scene (3D PCB) ─── */
function CircuitPreviewScene({ envPreset, bgColor }: { envPreset: EnvPreset; bgColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (groupRef.current) groupRef.current.rotation.y += d * 0.15; });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 5]} fov={40} />
      <color attach="background" args={[bgColor]} />
      <Environment preset={envPreset} background={false} />
      <directionalLight position={[8, 10, 6]} intensity={2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <ambientLight intensity={0.15} />
      <group ref={groupRef}>
        {/* PCB Board */}
        <mesh receiveShadow castShadow><boxGeometry args={[4, 0.1, 3]} /><meshPhysicalMaterial color="#1a3a2a" roughness={0.7} /></mesh>
        {/* Components */}
        <mesh position={[-1, 0.2, -0.5]} castShadow><boxGeometry args={[0.4, 0.3, 0.2]} /><meshPhysicalMaterial color="#1e293b" metalness={0.3} roughness={0.5} /></mesh>
        <mesh position={[0.5, 0.15, 0.3]} castShadow><cylinderGeometry args={[0.15, 0.15, 0.2, 16]} /><meshPhysicalMaterial color="#64748b" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[-0.5, 0.15, 0.8]} castShadow><boxGeometry args={[0.6, 0.15, 0.3]} /><meshPhysicalMaterial color="#334155" metalness={0.5} roughness={0.3} /></mesh>
        {/* LED */}
        <mesh position={[1, 0.2, -0.8]} castShadow><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3} /></mesh>
        {/* Traces */}
        {[[-1.5, 0.06, 0], [0, 0.06, 0.6], [1, 0.06, -0.3]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}><boxGeometry args={[2.5, 0.02, 0.05]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1} /></mesh>
        ))}
      </group>
      <ContactShadows position={[0, -0.1, 0]} opacity={0.5} scale={10} blur={3} />
      <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={14} />
    </>
  );
}

interface CarConfiguratorProps {
  visible: boolean;
  onClose: () => void;
  initialModel?: CarModel;
}

export function CarConfigurator({ visible, onClose, initialModel = "sports" }: CarConfiguratorProps) {
  const [config, setConfig] = useState<CarConfig>(DEFAULT_CONFIG);
  const [selectedModel, setSelectedModel] = useState<CarModel>(initialModel);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeTab, setActiveTab] = useState<PanelTab>("model");
  const [panelOpen, setPanelOpen] = useState(true);
  const [envPreset, setEnvPreset] = useState<EnvPreset>("studio");
  const [envBgColor, setEnvBgColor] = useState("#1a1a2e");
  const [activeDomain, setActiveDomain] = useState<ConfigDomain>("vehicle");
  const [buildingFloors, setBuildingFloors] = useState(5);
  const [machineRPM, setMachineRPM] = useState(500);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { saveDesign } = useDesigns();

  const update = useCallback((patch: Partial<CarConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${selectedModel}-config-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [selectedModel]);

  const handleEnvChange = useCallback((preset: EnvPreset) => {
    setEnvPreset(preset);
    const env = ENV_PRESETS.find(e => e.id === preset);
    if (env) setEnvBgColor(env.bgColor);
  }, []);

  const tabs: { id: PanelTab; icon: React.ReactNode; label: string }[] = [
    { id: "model", icon: <Layers className="w-4 h-4" />, label: "Model" },
    { id: "paint", icon: <Palette className="w-4 h-4" />, label: "Paint" },
    { id: "wheels", icon: <Settings2 className="w-4 h-4" />, label: "Wheels" },
    { id: "style", icon: <ZapIcon className="w-4 h-4" />, label: "Style" },
    { id: "env", icon: <Sun className="w-4 h-4" />, label: "Scene" },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background flex"
        >
          {/* 3D Canvas */}
          <div className="flex-1 relative">
            <Canvas shadows gl={{ antialias: true, toneMapping: 4, toneMappingExposure: 1.15, preserveDrawingBuffer: true }}>
              <Suspense fallback={null}>
                {activeDomain === "vehicle" ? (
                  <Scene model={selectedModel} config={config} autoRotate={autoRotate} envPreset={envPreset} bgColor={envBgColor} />
                ) : activeDomain === "building" ? (
                  <BuildingPreviewScene floors={buildingFloors} envPreset={envPreset} bgColor={envBgColor} />
                ) : activeDomain === "machine" ? (
                  <MachinePreviewScene rpm={machineRPM} envPreset={envPreset} bgColor={envBgColor} />
                ) : (
                  <CircuitPreviewScene envPreset={envPreset} bgColor={envBgColor} />
                )}
              </Suspense>
            </Canvas>

            {/* Domain selector */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-card/80 backdrop-blur-sm rounded-xl border border-border p-1">
              {DOMAIN_TABS.map((d) => {
                const Icon = d.icon;
                return (
                  <button key={d.id} onClick={() => setActiveDomain(d.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      activeDomain === d.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    <Icon className="w-3 h-3" />{d.label}
                  </button>
                );
              })}
            </div>

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-background/90 to-transparent">
              <div className="flex items-center gap-3">
                <button onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-card/80 border border-border text-xs font-medium text-foreground hover:bg-card transition-colors backdrop-blur-sm">
                  ← Back
                </button>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {activeDomain === "vehicle" ? CAR_MODELS.find(m => m.id === selectedModel)?.label : DOMAIN_TABS.find(d => d.id === activeDomain)?.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">3D Configurator</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const domain = activeDomain;
                    const title = domain === "vehicle" ? CAR_MODELS.find(m => m.id === selectedModel)?.label || selectedModel
                      : domain === "building" ? `${buildingFloors}-Floor Building`
                      : domain === "machine" ? `Machine ${machineRPM}RPM`
                      : "Circuit Design";
                    saveDesign(domain, title, domain === "vehicle" ? { model: selectedModel, ...config } : domain === "building" ? { floors: buildingFloors } : { rpm: machineRPM });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-primary/20 border-primary/40 text-primary hover:bg-primary/30 transition-colors backdrop-blur-sm">
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={handleScreenshot}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-card/80 border-border text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm">
                  <Camera className="w-3.5 h-3.5" />
                  Export PNG
                </button>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors backdrop-blur-sm ${autoRotate ? "bg-primary/20 border-primary/40 text-primary" : "bg-card/80 border-border text-muted-foreground hover:text-foreground"}`}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Auto Rotate
                </button>
              </div>
            </div>

            {/* Specs panel - only for vehicles */}
            {activeDomain === "vehicle" && <VehicleSpecsPanel model={selectedModel} />}

            {/* Bottom hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-mono bg-card/60 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
              Drag to orbit · Scroll to zoom · Right-drag to pan
            </div>

            {/* Panel toggle */}
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-6 h-16 flex items-center justify-center bg-card/80 border-l border-y border-border rounded-l-lg text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm"
              style={{ right: panelOpen ? 320 : 0 }}>
              {panelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Config panel */}
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full bg-card border-l border-border flex flex-col overflow-hidden shrink-0"
              >
                {/* Tabs - show vehicle tabs only for vehicle domain */}
                {activeDomain === "vehicle" ? (
                  <div className="flex border-b border-border shrink-0">
                    {tabs.map((tab) => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${activeTab === tab.id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{DOMAIN_TABS.find(d => d.id === activeDomain)?.label} Controls</p>
                    <p className="text-[10px] text-muted-foreground">Adjust parameters</p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
                  {/* DOMAIN-SPECIFIC CONTROLS */}
                  {activeDomain === "building" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-foreground">Floors</span>
                          <span className="text-[11px] font-mono font-semibold text-foreground">{buildingFloors}</span>
                        </div>
                        <input type="range" min={2} max={15} step={1} value={buildingFloors}
                          onChange={(e) => setBuildingFloors(parseInt(e.target.value))}
                          className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
                      </div>
                      <div className="border-t border-border pt-3 space-y-1.5">
                        {[
                          { label: "Height", value: `${(buildingFloors * 3.2).toFixed(1)}m` },
                          { label: "Structure", value: "Reinforced Concrete" },
                          { label: "Safety Factor", value: "2.0x ✓" },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{item.label}</span>
                            <span className="text-[10px] font-mono font-semibold text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">💡 Open the <strong>Building Simulator</strong> from the main page for full physics simulation with wind, earthquake, and collapse.</p>
                    </div>
                  )}

                  {activeDomain === "machine" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-foreground">Motor RPM</span>
                          <span className="text-[11px] font-mono font-semibold text-foreground">{machineRPM}</span>
                        </div>
                        <input type="range" min={100} max={3000} step={50} value={machineRPM}
                          onChange={(e) => setMachineRPM(parseInt(e.target.value))}
                          className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
                      </div>
                      <div className="border-t border-border pt-3 space-y-1.5">
                        {[
                          { label: "Output RPM", value: `${Math.round(machineRPM * 0.6)}` },
                          { label: "Gear Ratio", value: "2:1" },
                          { label: "Torque", value: `${(machineRPM * 0.2).toFixed(1)} Nm` },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{item.label}</span>
                            <span className="text-[10px] font-mono font-semibold text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">💡 Open the <strong>Machine Simulator</strong> for full gear ratio, torque, and efficiency controls.</p>
                    </div>
                  )}

                  {activeDomain === "circuit" && (
                    <div className="space-y-4">
                      <div className="border-t border-border pt-3 space-y-1.5">
                        {[
                          { label: "Components", value: "Resistor, LED, Battery" },
                          { label: "Voltage", value: "9V" },
                          { label: "Resistance", value: "320Ω" },
                          { label: "Current", value: "28.1 mA" },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{item.label}</span>
                            <span className="text-[10px] font-mono font-semibold text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">💡 Open the <strong>Circuit Simulator</strong> for interactive Ohm's law, current flow, and overload detection.</p>
                    </div>
                  )}

                  {/* VEHICLE TABS */}
                  {activeDomain === "vehicle" && activeTab === "model" && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Select Vehicle</p>
                      {CAR_MODELS.map((m) => (
                        <button key={m.id} onClick={() => setSelectedModel(m.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${selectedModel === m.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:border-primary/40 text-foreground"}`}>
                          <div className={`w-2 h-2 rounded-full ${selectedModel === m.id ? "bg-primary" : "bg-muted"}`} />
                          <div>
                            <p className="text-sm font-semibold">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* PAINT TAB */}
                  {activeDomain === "vehicle" && activeTab === "paint" && (
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Body Color</p>
                        <div className="grid grid-cols-6 gap-2">
                          {BODY_COLORS.map((c) => (
                            <button key={c.hex} onClick={() => update({ bodyColor: c.hex })}
                              title={c.name}
                              className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${config.bodyColor === c.hex ? "border-primary scale-110 ring-2 ring-primary/40" : "border-border"}`}
                              style={{ backgroundColor: c.hex }} />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <input type="color" value={config.bodyColor}
                            onChange={(e) => update({ bodyColor: e.target.value })}
                            className="w-9 h-9 rounded-full cursor-pointer border-2 border-border bg-transparent" />
                          <span className="text-xs text-muted-foreground">Custom color</span>
                          <span className="text-xs font-mono text-foreground ml-auto">{config.bodyColor}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Paint Finish</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(["gloss", "satin", "matte"] as const).map((finish) => (
                            <button key={finish} onClick={() => update({ paintFinish: finish })}
                              className={`py-2 rounded-lg text-xs font-medium border transition-all capitalize ${config.paintFinish === finish ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:border-primary/40"}`}>
                              {finish}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Two-Tone / Accent */}
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Two-Tone Accent</p>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {(["none", "roof", "hood", "sides"] as const).map((zone) => (
                            <button key={zone} onClick={() => update({ accentZone: zone })}
                              className={`py-1.5 rounded-lg text-[10px] font-medium border transition-all capitalize ${config.accentZone === zone ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:border-primary/40"}`}>
                              {zone === "none" ? "Off" : zone}
                            </button>
                          ))}
                        </div>
                        {config.accentZone !== "none" && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-2">Accent Color</p>
                            <div className="grid grid-cols-6 gap-2">
                              {BODY_COLORS.slice(0, 6).map((c) => (
                                <button key={c.hex} onClick={() => update({ accentColor: c.hex })}
                                  title={c.name}
                                  className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${config.accentColor === c.hex ? "border-primary scale-110 ring-2 ring-primary/40" : "border-border"}`}
                                  style={{ backgroundColor: c.hex }} />
                              ))}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <input type="color" value={config.accentColor}
                                onChange={(e) => update({ accentColor: e.target.value })}
                                className="w-8 h-8 rounded-full cursor-pointer border-2 border-border bg-transparent" />
                              <span className="text-[10px] text-muted-foreground">Custom</span>
                              <span className="text-[10px] font-mono text-foreground ml-auto">{config.accentColor}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* WHEELS TAB */}
                  {activeDomain === "vehicle" && activeTab === "wheels" && (
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Rim Color</p>
                        <div className="grid grid-cols-6 gap-2">
                          {RIM_COLORS.map((c) => (
                            <button key={c.hex} onClick={() => update({ rimColor: c.hex })}
                              title={c.name}
                              className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${config.rimColor === c.hex ? "border-primary scale-110 ring-2 ring-primary/40" : "border-border"}`}
                              style={{ backgroundColor: c.hex }} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Rim Style</p>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { id: "spoke", label: "Spoke" },
                            { id: "mesh", label: "Mesh" },
                            { id: "turbine", label: "Turbine" },
                          ] as const).map(({ id, label }) => (
                            <button key={id} onClick={() => update({ rimStyle: id })}
                              className={`py-2 rounded-lg text-xs font-medium border transition-all ${config.rimStyle === id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:border-primary/40"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STYLE TAB */}
                  {activeDomain === "vehicle" && activeTab === "style" && (
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Window Tint</p>
                        <div className="space-y-2">
                          <input type="range" min={0} max={1} step={0.05} value={config.windowTint}
                            onChange={(e) => update({ windowTint: parseFloat(e.target.value) })}
                            className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Clear</span>
                            <span className="font-mono">{Math.round(config.windowTint * 100)}%</span>
                            <span>Limo</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Headlight Color</p>
                        <div className="grid grid-cols-4 gap-2">
                          {HEADLIGHT_COLORS.map((c) => (
                            <button key={c.hex} onClick={() => update({ headlightColor: c.hex })}
                              title={c.name}
                              className={`w-full h-9 rounded-lg border-2 transition-all hover:scale-105 ${config.headlightColor === c.hex ? "border-primary scale-105 ring-2 ring-primary/40" : "border-border"}`}
                              style={{ backgroundColor: c.hex }} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {HEADLIGHT_COLORS.map((c) => (
                            <span key={c.hex} className="text-[9px] text-center text-muted-foreground">{c.name}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Body Kit</p>
                        <div className="space-y-2">
                          {([
                            { id: "stock", label: "Stock", desc: "Factory standard" },
                            { id: "aero", label: "Aero Kit", desc: "Spoiler + splitter" },
                            { id: "carbon", label: "Carbon Kit", desc: "Full carbon fibre" },
                          ] as const).map(({ id, label, desc }) => (
                            <button key={id} onClick={() => update({ bodyKit: id })}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${config.bodyKit === id ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}>
                              <div>
                                <p className={`text-xs font-semibold ${config.bodyKit === id ? "text-primary" : "text-foreground"}`}>{label}</p>
                                <p className="text-[10px] text-muted-foreground">{desc}</p>
                              </div>
                              {config.bodyKit === id && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ENVIRONMENT TAB */}
                  {activeDomain === "vehicle" && activeTab === "env" && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Environment</p>
                      {ENV_PRESETS.map((env) => (
                        <button key={env.id} onClick={() => handleEnvChange(env.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${envPreset === env.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:border-primary/40 text-foreground"}`}>
                          <div className="w-6 h-6 rounded-full border border-border shrink-0" style={{ backgroundColor: env.bgColor }} />
                          <div>
                            <p className="text-sm font-semibold">{env.label}</p>
                            <p className="text-[10px] text-muted-foreground">{env.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset button */}
                <div className="p-4 border-t border-border shrink-0">
                  <button onClick={() => { setConfig(DEFAULT_CONFIG); handleEnvChange("studio"); }}
                    className="w-full py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                    Reset to Default
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
