import { useState, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Text, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Box, X, Maximize2, Minimize2 } from "lucide-react";
import * as THREE from "three";

function BeamStructure() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main beam */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 0.3, 0.6]} />
        <meshStandardMaterial color="#22d3ee" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Support columns */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, -0.2, 0]}>
          <boxGeometry args={[0.25, 1.2, 0.25]} />
          <meshStandardMaterial color="#0e7490" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Cross braces */}
      {[-0.75, 0.75].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x, 0.1, 0]} rotation={[0, 0, Math.PI / 6 * (i === 0 ? 1 : -1)]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial color="#06b6d4" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* Base plate */}
      <mesh position={[0, -0.85, 0]}>
        <boxGeometry args={[4.5, 0.1, 1]} />
        <meshStandardMaterial color="#164e63" metalness={0.8} roughness={0.2} />
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

function SceneContent() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={45} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.4} color="#22d3ee" />
      <BeamStructure />
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
}

const Viewport3D = ({ visible, onToggle }: Viewport3DProps) => {
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
                  <SceneContent />
                </Suspense>
              </Canvas>
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-card text-[10px] text-muted-foreground font-mono">
              <span>Beam Structure — Steel A992</span>
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Viewport3D;
