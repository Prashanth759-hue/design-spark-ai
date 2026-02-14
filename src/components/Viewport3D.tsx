import { useState, Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Text, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Box, X, Maximize2, Minimize2 } from "lucide-react";
import * as THREE from "three";
import { DesignParams } from "@/lib/parseDesignParams";

function BeamStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  const colSpacing = params.beamLength * 0.375;
  const braceSpacing = params.beamLength * 0.1875;
  const colY = -(params.columnHeight / 2) + params.beamHeight / 2;
  const baseY = -(params.columnHeight) + params.beamHeight / 2 - 0.05;

  return (
    <group ref={groupRef}>
      {/* Main beam */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[params.beamLength, params.beamHeight, params.beamWidth]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Support columns */}
      {[-colSpacing, colSpacing].map((x, i) => (
        <mesh key={i} position={[x, 0.5 + colY, 0]}>
          <boxGeometry args={[params.columnWidth, params.columnHeight, params.columnWidth]} />
          <meshStandardMaterial color={params.columnColor} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Cross braces */}
      {[-braceSpacing, braceSpacing].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x, 0.5 + colY * 0.5, 0]} rotation={[0, 0, Math.PI / 6 * (i === 0 ? 1 : -1)]}>
          <boxGeometry args={[0.08, params.columnHeight * 0.8, 0.08]} />
          <meshStandardMaterial color={params.materialColor} metalness={0.5} roughness={0.5} opacity={0.8} transparent />
        </mesh>
      ))}
      {/* Base plate */}
      <mesh position={[0, 0.5 + baseY, 0]}>
        <boxGeometry args={[params.beamLength * 1.1, 0.1, params.beamWidth * 1.5]} />
        <meshStandardMaterial color={params.baseColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function StressHeatmap() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const t = Math.sin(clock.elapsedTime * 0.5) * 0.5 + 0.5;
      mat.color.setHSL(0.5 - t * 0.4, 0.8, 0.5);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <boxGeometry args={[4, 0.3, 0.6]} />
      <meshStandardMaterial metalness={0.5} roughness={0.4} />
    </mesh>
  );
}

function SceneContent({ params }: { params: DesignParams }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={45} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.4} color="#22d3ee" />
      <BeamStructure params={params} />
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
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

interface Viewport3DProps {
  visible: boolean;
  onToggle: () => void;
  designParams?: DesignParams;
}

const DEFAULT_PARAMS: DesignParams = {
  beamLength: 4, beamHeight: 0.3, beamWidth: 0.6,
  columnHeight: 1.2, columnWidth: 0.25,
  materialColor: "#22d3ee", columnColor: "#0e7490", baseColor: "#164e63",
  label: "Beam Structure",
};

const Viewport3D = ({ visible, onToggle, designParams }: Viewport3DProps) => {
  const params = designParams || DEFAULT_PARAMS;
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Toggle button when hidden */}
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
            {/* Header */}
            <div className="flex items-center justify-between h-10 px-3 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2">
                <Box className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">3D Viewport</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  Preview
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onToggle}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1">
              <Canvas shadows>
                <Suspense fallback={null}>
                  <SceneContent params={params} />
                </Suspense>
              </Canvas>
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-card text-[10px] text-muted-foreground font-mono">
              <span>{params.label} — {params.beamLength.toFixed(1)}m × {params.beamHeight.toFixed(1)}m × {params.beamWidth.toFixed(1)}m</span>
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Viewport3D;
