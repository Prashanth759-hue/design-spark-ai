import { useState, Suspense, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Palette, Settings2, Layers, ZapIcon, ChevronRight, ChevronLeft, Camera, Sun } from "lucide-react";
import { SportsCar } from "@/components/3d/SportsCar";
import { LuxurySedan } from "@/components/3d/LuxurySedan";
import { MuscleCar } from "@/components/3d/MuscleCar";
import { SUVCar } from "@/components/3d/SUVCar";
import { PickupTruck } from "@/components/3d/PickupTruck";
import { Convertible } from "@/components/3d/Convertible";
import { VanVehicle } from "@/components/3d/VanVehicle";

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

export type CarModel = "sports" | "sedan" | "muscle" | "suv" | "pickup" | "convertible" | "van";

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

const CAR_MODELS: { id: CarModel; label: string; desc: string }[] = [
  { id: "sports", label: "Sports Car", desc: "Lamborghini-style supercar" },
  { id: "sedan", label: "Luxury Sedan", desc: "BMW/Mercedes elegance" },
  { id: "muscle", label: "Muscle Car", desc: "Mustang/Camaro power" },
  { id: "suv", label: "SUV", desc: "Premium crossover" },
  { id: "pickup", label: "Pickup Truck", desc: "Heavy-duty hauler" },
  { id: "convertible", label: "Convertible", desc: "Open-top roadster" },
  { id: "van", label: "Van", desc: "Spacious people mover" },
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

type PanelTab = "model" | "paint" | "wheels" | "style" | "env";

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

      {/* Car model */}
      {model === "sports" && <SportsCar config={config} autoRotate={autoRotate} />}
      {model === "sedan" && <LuxurySedan config={config} autoRotate={autoRotate} />}
      {model === "muscle" && <MuscleCar config={config} autoRotate={autoRotate} />}
      {model === "suv" && <SUVCar config={config} autoRotate={autoRotate} />}
      {model === "pickup" && <PickupTruck config={config} autoRotate={autoRotate} />}
      {model === "convertible" && <Convertible config={config} autoRotate={autoRotate} />}
      {model === "van" && <VanVehicle config={config} autoRotate={autoRotate} />}

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
                <Scene model={selectedModel} config={config} autoRotate={autoRotate} envPreset={envPreset} bgColor={envBgColor} />
              </Suspense>
            </Canvas>

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-background/90 to-transparent">
              <div className="flex items-center gap-3">
                <button onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-card/80 border border-border text-xs font-medium text-foreground hover:bg-card transition-colors backdrop-blur-sm">
                  ← Back
                </button>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {CAR_MODELS.find(m => m.id === selectedModel)?.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">3D Configurator</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                {/* Tabs */}
                <div className="flex border-b border-border shrink-0">
                  {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${activeTab === tab.id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
                  {/* MODEL TAB */}
                  {activeTab === "model" && (
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
                  {activeTab === "paint" && (
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
                  {activeTab === "wheels" && (
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
                  {activeTab === "style" && (
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
                  {activeTab === "env" && (
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
