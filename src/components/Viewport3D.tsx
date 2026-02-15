import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Box, X, Maximize2, Minimize2 } from "lucide-react";
import { DesignParams } from "@/lib/parseDesignParams";
import { BeamStructure } from "@/components/3d/BeamStructure";
import { CarStructure } from "@/components/3d/CarStructure";
import { BridgeStructure } from "@/components/3d/BridgeStructure";
import { BuildingStructure } from "@/components/3d/BuildingStructure";
import { TrussStructure } from "@/components/3d/TrussStructure";

/* ──────────────────────── Scene ──────────────────────── */
function SceneContent({ params }: { params: DesignParams }) {
  const structureMap: Record<string, JSX.Element> = {
    car: <CarStructure params={params} />,
    bridge: <BridgeStructure params={params} />,
    building: <BuildingStructure params={params} />,
    truss: <TrussStructure params={params} />,
    beam: <BeamStructure params={params} />,
    generic: <BeamStructure params={params} />,
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={45} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.4} color="#22d3ee" />
      {structureMap[params.structureType] || <BeamStructure params={params} />}
      <Grid
        position={[0, -0.9, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1e3a5f"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#22d3ee"
        fadeDistance={12}
        fadeStrength={1}
        infiniteGrid
      />
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={2} maxDistance={15} maxPolarAngle={Math.PI / 2} />
    </>
  );
}

/* ──────────────────────── Panel ──────────────────────── */
interface Viewport3DProps {
  visible: boolean;
  onToggle: () => void;
  designParams?: DesignParams;
}

const DEFAULT_PARAMS: DesignParams = {
  structureType: "beam",
  beamLength: 4, beamHeight: 0.3, beamWidth: 0.6,
  columnHeight: 1.2, columnWidth: 0.25,
  materialColor: "#22d3ee", columnColor: "#0e7490", baseColor: "#164e63",
  label: "Beam Structure",
};

const TYPE_LABELS: Record<string, string> = {
  car: "Vehicle", bridge: "Bridge", building: "Building", truss: "Truss", beam: "Beam", generic: "Preview",
};

const Viewport3D = ({ visible, onToggle, designParams }: Viewport3DProps) => {
  const params = designParams || DEFAULT_PARAMS;
  const [expanded, setExpanded] = useState(false);

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
                <button onClick={() => setExpanded(!expanded)} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={onToggle} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <Canvas shadows>
                <Suspense fallback={null}>
                  <SceneContent params={params} />
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
