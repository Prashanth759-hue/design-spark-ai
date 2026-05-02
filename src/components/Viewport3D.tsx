import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera, Environment, ContactShadows, AccumulativeShadows, RandomizedLight, BakeShadows } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Box, X, Maximize2, Minimize2, Sun, Plane } from "lucide-react";
import { EffectComposer, Bloom, SSAO, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { DesignParams } from "@/lib/parseDesignParams";
import { BeamStructure } from "@/components/3d/BeamStructure";
import { BridgeStructure } from "@/components/3d/BridgeStructure";
import { BuildingStructure } from "@/components/3d/BuildingStructure";
import { TrussStructure } from "@/components/3d/TrussStructure";
import { StructureDimensions, CarDimensions } from "@/components/3d/DimensionLabel";
import { SportsCar } from "@/components/3d/SportsCar";
import { CarConfig } from "@/components/CarConfigurator";
import { RobotArmPreview } from "@/components/3d/previews/RobotArmPreview";
import { JetPreview } from "@/components/3d/previews/JetPreview";
import { AirlinerPreview } from "@/components/3d/previews/AirlinerPreview";
import { Helicopter } from "@/components/3d/Helicopter";
import { Rocket } from "@/components/3d/Rocket";
import { VesselPreview } from "@/components/3d/previews/VesselPreview";
import { HeartPreview } from "@/components/3d/previews/HeartPreview";
import { ConveyorPreview } from "@/components/3d/previews/ConveyorPreview";

const DEFAULT_CAR_CONFIG: CarConfig = {
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

type EnvPreset = "city" | "sunset" | "studio" | "warehouse";
export type AeroVariant = "airliner" | "jet" | "helicopter" | "rocket";

/* ──────────────────────── Scene ──────────────────────── */
function SceneContent({ params, envPreset, aeroVariant }: { params: DesignParams; envPreset: EnvPreset; aeroVariant: AeroVariant }) {
  const carConfig: CarConfig = {
    ...DEFAULT_CAR_CONFIG,
    bodyColor: params.materialColor || DEFAULT_CAR_CONFIG.bodyColor,
  };

  // Pull domain-specific params from designParams (forwarded by Index via designBlockTo3DParams)
  const p = (params as any).rawParams || {};

  const aerospaceModel = (() => {
    switch (aeroVariant) {
      case "helicopter": return <Helicopter />;
      case "rocket": return <Rocket />;
      case "jet": return <JetPreview wingspan={p.wingspan} fuselageLength={p.fuselageLength} altitude={p.altitude} airspeed={p.airspeed} engines={p.engines} />;
      case "airliner":
      default: return <AirlinerPreview wingspan={p.wingspan} fuselageLength={p.fuselageLength} altitude={p.altitude} airspeed={p.airspeed} engines={p.engines} />;
    }
  })();

  const structureMap: Record<string, JSX.Element> = {
    car: <SportsCar config={carConfig} autoRotate={false} />,
    bridge: <BridgeStructure params={params} />,
    building: <BuildingStructure params={params} />,
    truss: <TrussStructure params={params} />,
    beam: <BeamStructure params={params} />,
    robotics: <RobotArmPreview reach={p.reach} payload={p.payload} joints={p.joints} speed={p.speed} />,
    aerospace: aerospaceModel,
    marine: <VesselPreview length={p.length} beam={p.beam} displacement={p.displacement} speed={p.speed} hullDrag={p.hullDrag} />,
    biomedical: <HeartPreview bpm={p.bpm} strokeVolume={p.strokeVolume} systolic={p.systolic} diastolic={p.diastolic} />,
    industrial: <ConveyorPreview beltSpeed={p.beltSpeed} spindleRpm={p.spindleRpm} throughput={p.throughput} efficiency={p.efficiency} quality={p.quality} />,
    generic: <BeamStructure params={params} />,
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 3.5, 5]} fov={40} />
      {/* High-quality HDRI — user-selectable mood */}
      <Environment preset={envPreset} background={false}
        environmentIntensity={envPreset === "sunset" ? 1.4 : envPreset === "studio" ? 1.0 : 1.15} />

      {/* Key sun light — color shifts with environment */}
      <directionalLight position={[8, 12, 6]} intensity={envPreset === "sunset" ? 2.8 : 2.4} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={30} shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0005}
        color={envPreset === "sunset" ? "#ffb070" : envPreset === "studio" ? "#ffffff" : "#fff1d6"} />
      {/* Cool fill from sky */}
      <directionalLight position={[-6, 7, -5]} intensity={0.55}
        color={envPreset === "sunset" ? "#7da8d8" : "#a8c8ff"} />
      {/* Rim light for silhouette pop */}
      <directionalLight position={[3, 4, -8]} intensity={0.7}
        color={envPreset === "sunset" ? "#ff9050" : "#fef3c7"} />
      <ambientLight intensity={0.08} color="#e0e7ff" />
      <hemisphereLight args={["#bfdbfe", "#3d2b1f", 0.25]} />

      {structureMap[params.structureType] || <BeamStructure params={params} />}

      {params.structureType === "car" ? (
        <CarDimensions
          wheelbase={params.wheelbase || 2.85}
          trackWidth={params.trackWidth || 1.58}
          bodyLength={(params.wheelbase || 2.85) * 1.6}
          bodyHeight={1.2}
          originY={0.1}
        />
      ) : (
        <StructureDimensions
          length={params.beamLength}
          height={params.columnHeight}
          width={params.beamWidth}
        />
      )}

      {/* Soft realistic ground shadow */}
      <ContactShadows position={[0, -0.9, 0]} opacity={0.65} scale={16} blur={2.2} far={8} color="#000000" resolution={1024} />
      {/* Subtle glossy floor reflection — only the dark plane, no shine on grid */}
      <mesh position={[0, -0.901, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshPhysicalMaterial color="#0a0e1a" metalness={0.1} roughness={0.55} clearcoat={0.3} envMapIntensity={0.6} />
      </mesh>

      <Grid position={[0, -0.9, 0]} args={[10, 10]} cellSize={0.5} cellThickness={0.5}
        cellColor="#1e3a5f" sectionSize={2} sectionThickness={1} sectionColor="#22d3ee"
        fadeDistance={12} fadeStrength={1} infiniteGrid />

      <OrbitControls enableDamping dampingFactor={0.08} minDistance={2} maxDistance={15}
        maxPolarAngle={Math.PI / 2.1} rotateSpeed={0.5} />

      {/* Cinematic post-processing: bloom on emissives + SSAO + vignette */}
      <EffectComposer multisampling={0} enableNormalPass>
        <SSAO blendFunction={BlendFunction.MULTIPLY} samples={16} radius={0.12} intensity={28}
          luminanceInfluence={0.6} bias={0.025} worldDistanceThreshold={1} worldDistanceFalloff={0.5}
          worldProximityThreshold={0.4} worldProximityFalloff={0.2} />
        <Bloom intensity={0.55} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette offset={0.32} darkness={0.55} eskil={false} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
}

/* ──────────────────────── Panel ──────────────────────── */
interface Viewport3DProps {
  visible: boolean;
  onToggle: () => void;
  designParams?: DesignParams;
  onOpenConfigurator?: () => void;
}

const DEFAULT_PARAMS: DesignParams = {
  structureType: "beam",
  beamLength: 4, beamHeight: 0.3, beamWidth: 0.6,
  columnHeight: 1.2, columnWidth: 0.25,
  materialColor: "#22d3ee", columnColor: "#0e7490", baseColor: "#164e63",
  label: "Beam Structure",
};

const TYPE_LABELS: Record<string, string> = {
  car: "Vehicle", bridge: "Bridge", building: "Building", truss: "Truss", beam: "Beam", robotics: "Robotics", aerospace: "Aerospace", marine: "Marine", biomedical: "Biomedical", industrial: "Industrial", generic: "Preview",
};

const Viewport3D = ({ visible, onToggle, designParams, onOpenConfigurator }: Viewport3DProps) => {
  const params = designParams || DEFAULT_PARAMS;
  const [expanded, setExpanded] = useState(false);
  const [envPreset, setEnvPreset] = useState<EnvPreset>("city");
  const [showEnvMenu, setShowEnvMenu] = useState(false);
  const [userAeroVariant, setUserAeroVariant] = useState<AeroVariant | null>(null);
  const [showAeroMenu, setShowAeroMenu] = useState(false);

  // Auto-detect aerospace variant from the label / raw params unless user picked one
  const detectAero = (): AeroVariant => {
    const txt = `${params.label || ""} ${(params as any).rawParams?.type || ""} ${(params as any).rawParams?.kind || ""}`.toLowerCase();
    if (/helicopter|chopper|rotorcraft/.test(txt)) return "helicopter";
    if (/rocket|falcon|launch|spacecraft/.test(txt)) return "rocket";
    if (/fighter|jet\b/.test(txt) && !/airliner/.test(txt)) return "jet";
    return "airliner";
  };
  const aeroVariant: AeroVariant = userAeroVariant ?? detectAero();
  const setAeroVariant = (v: AeroVariant) => setUserAeroVariant(v);

  const dimensionLabel =
    params.structureType === "car"
      ? `WB ${((params.wheelbase || 2.85) * 1000).toFixed(0)}mm • TW ${((params.trackWidth || 1.58) * 1000).toFixed(0)}mm`
      : `${params.beamLength.toFixed(1)}m × ${params.beamHeight.toFixed(1)}m × ${params.beamWidth.toFixed(1)}m`;

  return (
    <>
      {!visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onToggle}
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Box className="w-4 h-4" />
          3D View
        </motion.button>
      )}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: expanded ? "50%" : "380px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative border-l border-border bg-background h-full flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between h-10 px-3 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2">
                <Box className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">3D Viewport</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {TYPE_LABELS[params.structureType] || "Preview"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Aerospace model selector — only when aerospace */}
                {params.structureType === "aerospace" && (
                  <div className="relative">
                    <button
                      onClick={() => setShowAeroMenu((v) => !v)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-colors mr-1 capitalize"
                      title="Aerospace model"
                    >
                      <Plane className="w-3 h-3" />
                      {aeroVariant}
                    </button>
                    {showAeroMenu && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-md shadow-lg py-1 min-w-[120px]">
                        {(["airliner", "jet", "helicopter", "rocket"] as AeroVariant[]).map((v) => (
                          <button
                            key={v}
                            onClick={() => { setAeroVariant(v); setShowAeroMenu(false); }}
                            className={`w-full text-left px-3 py-1 text-[11px] capitalize hover:bg-sky-500/10 transition-colors ${aeroVariant === v ? "text-sky-600 font-semibold" : "text-foreground"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* HDRI mood toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowEnvMenu((v) => !v)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-colors mr-1 capitalize"
                    title="Lighting mood"
                  >
                    <Sun className="w-3 h-3" />
                    {envPreset}
                  </button>
                  {showEnvMenu && (
                    <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-md shadow-lg py-1 min-w-[110px]">
                      {(["city", "sunset", "studio", "warehouse"] as EnvPreset[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => { setEnvPreset(p); setShowEnvMenu(false); }}
                          className={`w-full text-left px-3 py-1 text-[11px] capitalize hover:bg-primary/10 transition-colors ${envPreset === p ? "text-primary font-semibold" : "text-foreground"}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {params.structureType === "car" && onOpenConfigurator && (
                  <button
                    onClick={onOpenConfigurator}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors mr-1"
                  >
                    Configurator →
                  </button>
                )}
                <button onClick={() => setExpanded(!expanded)} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={onToggle} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <Canvas shadows dpr={[1, 2]}
                gl={{
                  antialias: true,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.25,
                  outputColorSpace: THREE.SRGBColorSpace,
                }}>
                <Suspense fallback={null}>
                  <SceneContent params={params} envPreset={envPreset} aeroVariant={aeroVariant} />
                </Suspense>
              </Canvas>
            </div>

            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-card text-[10px] text-muted-foreground font-mono">
              <span>{params.label} — {dimensionLabel}</span>
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Viewport3D;
