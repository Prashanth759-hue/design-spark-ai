import { useState, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Text, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Box, X, Maximize2, Minimize2 } from "lucide-react";
import * as THREE from "three";
import { DesignParams } from "@/lib/parseDesignParams";

/* ──────────────────────── Beam Structure ──────────────────────── */
function BeamStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
  });

  const colSpacing = params.beamLength * 0.375;
  const braceSpacing = params.beamLength * 0.1875;
  const colY = -(params.columnHeight / 2) + params.beamHeight / 2;
  const baseY = -params.columnHeight + params.beamHeight / 2 - 0.05;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[params.beamLength, params.beamHeight, params.beamWidth]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {[-colSpacing, colSpacing].map((x, i) => (
        <mesh key={i} position={[x, 0.5 + colY, 0]}>
          <boxGeometry args={[params.columnWidth, params.columnHeight, params.columnWidth]} />
          <meshStandardMaterial color={params.columnColor} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {[-braceSpacing, braceSpacing].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x, 0.5 + colY * 0.5, 0]} rotation={[0, 0, (Math.PI / 6) * (i === 0 ? 1 : -1)]}>
          <boxGeometry args={[0.08, params.columnHeight * 0.8, 0.08]} />
          <meshStandardMaterial color={params.materialColor} metalness={0.5} roughness={0.5} opacity={0.8} transparent />
        </mesh>
      ))}
      <mesh position={[0, 0.5 + baseY, 0]}>
        <boxGeometry args={[params.beamLength * 1.1, 0.1, params.beamWidth * 1.5]} />
        <meshStandardMaterial color={params.baseColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ──────────────────────── Car Structure ──────────────────────── */
function CarStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  const wb = params.wheelbase || 2.85;
  const tw = params.trackWidth || 1.58;
  const gc = params.groundClearance || 0.145;
  const bodyLen = wb * 1.6;   // total car length
  const bodyW = tw * 1.05;
  const bodyH = 0.35;
  const cabinH = 0.55;
  const wheelR = 0.33;
  const wheelW = 0.22;

  const wheelPositions: [number, number, number][] = [
    [-wb / 2, wheelR + gc * 0.3, tw / 2],
    [-wb / 2, wheelR + gc * 0.3, -tw / 2],
    [wb / 2, wheelR + gc * 0.3, tw / 2],
    [wb / 2, wheelR + gc * 0.3, -tw / 2],
  ];

  const bodyY = wheelR + gc * 0.3 + bodyH / 2 + 0.1;
  const cabinY = bodyY + bodyH / 2 + cabinH / 2 - 0.05;

  return (
    <group ref={groupRef}>
      {/* Underbody / Battery tray */}
      <mesh position={[0, bodyY - bodyH / 2 - 0.06, 0]}>
        <boxGeometry args={[wb * 1.1, 0.08, bodyW * 0.85]} />
        <meshStandardMaterial color={params.baseColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Main body */}
      <mesh position={[0, bodyY, 0]}>
        <boxGeometry args={[bodyLen, bodyH, bodyW]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Front hood slope */}
      <mesh position={[-bodyLen * 0.32, bodyY + bodyH * 0.15, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[bodyLen * 0.28, bodyH * 0.4, bodyW * 0.95]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Cabin (greenhouse) */}
      <mesh position={[0.15, cabinY, 0]}>
        <boxGeometry args={[wb * 0.62, cabinH, bodyW * 0.88]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.1} opacity={0.7} transparent />
      </mesh>

      {/* Windshield (angled) */}
      <mesh position={[-wb * 0.18, cabinY + 0.05, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[cabinH * 0.7, 0.03, bodyW * 0.82]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.1} roughness={0.05} opacity={0.5} transparent />
      </mesh>

      {/* Rear glass (angled) */}
      <mesh position={[wb * 0.32, cabinY + 0.02, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[cabinH * 0.55, 0.03, bodyW * 0.78]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.1} roughness={0.05} opacity={0.5} transparent />
      </mesh>

      {/* Rear spoiler/diffuser */}
      <mesh position={[bodyLen * 0.46, bodyY + bodyH * 0.25, 0]}>
        <boxGeometry args={[0.12, 0.08, bodyW * 0.7]} />
        <meshStandardMaterial color={params.columnColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Front light bar */}
      <mesh position={[-bodyLen * 0.49, bodyY + bodyH * 0.1, 0]}>
        <boxGeometry args={[0.04, 0.06, bodyW * 0.85]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>

      {/* Rear light bar */}
      <mesh position={[bodyLen * 0.49, bodyY + bodyH * 0.1, 0]}>
        <boxGeometry args={[0.04, 0.06, bodyW * 0.8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Tire */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[wheelR, wheelW * 0.45, 16, 32]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[wheelR * 0.6, wheelR * 0.6, wheelW * 0.5, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Side skirt accents */}
      {[-1, 1].map((side) => (
        <mesh key={`skirt-${side}`} position={[0, bodyY - bodyH * 0.4, side * bodyW * 0.5]}>
          <boxGeometry args={[bodyLen * 0.75, 0.05, 0.03]} />
          <meshStandardMaterial color={params.columnColor} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ──────────────────────── Scene ──────────────────────── */
function SceneContent({ params }: { params: DesignParams }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={45} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.4} color="#22d3ee" />

      {params.structureType === "car" ? (
        <CarStructure params={params} />
      ) : (
        <BeamStructure params={params} />
      )}

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
                  {params.structureType === "car" ? "Vehicle" : "Preview"}
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
