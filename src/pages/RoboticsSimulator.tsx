import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowLeft, BotMessageSquare, Play, Pause, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

/* ─── Robot Joint ─── */
function Joint({ position, radius = 0.15, color = "#64748b" }: { position: [number, number, number]; radius?: number; color?: string }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

/* ─── Robot Arm Segment ─── */
function ArmSegment({ from, to, thickness = 0.08, color = "#334155" }: { from: [number, number, number]; to: [number, number, number]; thickness?: number; color?: string }) {
  const mid = new THREE.Vector3(...from).add(new THREE.Vector3(...to)).multiplyScalar(0.5);
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const len = dir.length();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

  return (
    <mesh position={mid} quaternion={quat} castShadow>
      <boxGeometry args={[thickness * 2, len, thickness * 2]} />
      <meshPhysicalMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

/* ─── Gripper ─── */
function Gripper({ position, open }: { position: [number, number, number]; open: boolean }) {
  const gap = open ? 0.12 : 0.03;
  return (
    <group position={position}>
      <mesh position={[gap, -0.1, 0]} castShadow>
        <boxGeometry args={[0.04, 0.2, 0.06]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-gap, -0.1, 0]} castShadow>
        <boxGeometry args={[0.04, 0.2, 0.06]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── 6-DOF Robot Arm ─── */
function RobotArm({ angles, gripperOpen }: { angles: number[]; gripperOpen: boolean }) {
  const baseRef = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);

  useFrame(() => {
    if (baseRef.current) baseRef.current.rotation.y = THREE.MathUtils.lerp(baseRef.current.rotation.y, angles[0], 0.05);
    if (shoulder.current) shoulder.current.rotation.z = THREE.MathUtils.lerp(shoulder.current.rotation.z, angles[1], 0.05);
    if (elbow.current) elbow.current.rotation.z = THREE.MathUtils.lerp(elbow.current.rotation.z, angles[2], 0.05);
    if (wrist.current) wrist.current.rotation.x = THREE.MathUtils.lerp(wrist.current.rotation.x, angles[3], 0.05);
  });

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.1, 32]} />
        <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.1, 32]} />
        <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.15} />
      </mesh>

      <group ref={baseRef}>
        <Joint position={[0, 0.25, 0]} radius={0.18} color="#475569" />
        <group ref={shoulder} position={[0, 0.25, 0]}>
          <ArmSegment from={[0, 0, 0]} to={[0, 1, 0]} thickness={0.1} color="#3b82f6" />
          <Joint position={[0, 1, 0]} radius={0.14} />
          <group ref={elbow} position={[0, 1, 0]}>
            <ArmSegment from={[0, 0, 0]} to={[0, 0.8, 0]} thickness={0.07} color="#6366f1" />
            <Joint position={[0, 0.8, 0]} radius={0.1} />
            <group ref={wrist} position={[0, 0.8, 0]}>
              <ArmSegment from={[0, 0, 0]} to={[0, 0.4, 0]} thickness={0.05} color="#8b5cf6" />
              <Gripper position={[0, 0.4, 0]} open={gripperOpen} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ─── Floor Grid ─── */
function FloorGrid() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <gridHelper args={[10, 20, "#cbd5e1", "#e2e8f0"]} position={[0, 0.001, 0]} />
    </group>
  );
}

const RoboticsSimulator = () => {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [gripperOpen, setGripperOpen] = useState(true);
  const [angles, setAngles] = useState([0, -0.3, -0.5, 0]);
  const [torqueData, setTorqueData] = useState<{ time: number; value: number }[]>([]);
  const timeRef = useRef(0);

  const updateAngles = (idx: number, val: number) => {
    setAngles(prev => { const n = [...prev]; n[idx] = val; return n; });
  };

  // Simple auto-play animation
  const frameRef = useRef<number>();
  const animate = () => {
    timeRef.current += 0.02;
    const t = timeRef.current;
    setAngles([
      Math.sin(t * 0.5) * 1.2,
      -0.3 + Math.sin(t * 0.7) * 0.4,
      -0.5 + Math.sin(t * 1.1) * 0.3,
      Math.sin(t * 1.5) * 0.5,
    ]);
    setTorqueData(prev => [...prev.slice(-60), { time: Math.round(t * 10) / 10, value: Math.abs(Math.sin(t * 0.7) * 45 + 15) }]);
    if (playing) frameRef.current = requestAnimationFrame(animate);
  };

  useState(() => {
    if (playing) frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  });

  // Handle play/pause
  const togglePlay = () => {
    if (!playing) {
      setPlaying(true);
      const run = () => {
        timeRef.current += 0.02;
        const t = timeRef.current;
        setAngles([
          Math.sin(t * 0.5) * 1.2,
          -0.3 + Math.sin(t * 0.7) * 0.4,
          -0.5 + Math.sin(t * 1.1) * 0.3,
          Math.sin(t * 1.5) * 0.5,
        ]);
        setTorqueData(prev => [...prev.slice(-60), { time: Math.round(t * 10) / 10, value: Math.abs(Math.sin(t * 0.7) * 45 + 15) }]);
        frameRef.current = requestAnimationFrame(run);
      };
      frameRef.current = requestAnimationFrame(run);
    } else {
      setPlaying(false);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    }
  };

  const reset = () => {
    setPlaying(false);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setAngles([0, -0.3, -0.5, 0]);
    setTorqueData([]);
    timeRef.current = 0;
  };

  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <BotMessageSquare className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-semibold text-foreground">Robotics Simulator</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600">6-DOF Arm</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={togglePlay} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 transition-colors">
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={reset} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <Canvas shadows gl={{ antialias: true, toneMapping: 3 }}>
            <PerspectiveCamera makeDefault position={[3, 2.5, 3]} fov={45} />
            <Environment preset="studio" background={false} />
            <color attach="background" args={["#fafafa"]} />
            <directionalLight position={[5, 8, 4]} intensity={1.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <ambientLight intensity={0.3} />
            <Suspense fallback={null}>
              <RobotArm angles={angles} gripperOpen={gripperOpen} />
              <FloorGrid />
            </Suspense>
            <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={10} blur={2} />
            <OrbitControls enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>
        </div>

        {/* Control Panel */}
        <div className="w-72 border-l border-border bg-card flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3">Joint Controls</h3>
            {["Base Rotation", "Shoulder", "Elbow", "Wrist"].map((label, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{label}</span>
                  <span className="font-mono">{(angles[i] * (180 / Math.PI)).toFixed(1)}°</span>
                </div>
                <input type="range" min={-3.14} max={3.14} step={0.01} value={angles[i]}
                  onChange={e => updateAngles(i, parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-violet-500" />
              </div>
            ))}
          </div>

          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground mb-2">End Effector</h3>
            <button onClick={() => setGripperOpen(!gripperOpen)}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${gripperOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              Gripper: {gripperOpen ? "Open" : "Closed"}
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-xs font-semibold text-foreground mb-2">Joint Torque (Nm)</h3>
            <div className="h-32">
              <PerformanceChart data={torqueData} color="#8b5cf6" label="Torque" unit="Nm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoboticsSimulator;
