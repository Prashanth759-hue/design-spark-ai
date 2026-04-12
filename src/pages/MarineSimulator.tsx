import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { ArrowLeft, Ship, Waves, Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

/* ─── Hull ─── */
function Hull() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.8, 0);
  shape.lineTo(0.7, 0.4);
  shape.lineTo(-0.7, 0.4);
  shape.lineTo(-0.8, 0);
  shape.closePath();

  const extrudeSettings = { steps: 1, depth: 4, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };

  return (
    <group position={[0, -0.3, -2]}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial color="#1e3a5f" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Superstructure ─── */
function Superstructure() {
  return (
    <group position={[0, 0.1, -0.5]}>
      {/* Main cabin */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.6, 1.5]} />
        <meshPhysicalMaterial color="#f1f5f9" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Bridge */}
      <mesh position={[0, 0.85, 0.1]} castShadow>
        <boxGeometry args={[1, 0.3, 0.8]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.85, 0.51]}>
        <boxGeometry args={[0.8, 0.15, 0.02]} />
        <meshPhysicalMaterial color="#38bdf8" metalness={0} roughness={0} transmission={0.7} ior={1.5} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshPhysicalMaterial color="#64748b" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Funnel */}
      <mesh position={[0, 0.5, -0.6]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.5, 12]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Water Surface ─── */
function Water({ waveHeight }: { waveHeight: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const geo = ref.current.geometry as THREE.PlaneGeometry;
      const pos = geo.attributes.position;
      const t = clock.getElapsedTime();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, Math.sin(x * 2 + t) * waveHeight * 0.1 + Math.cos(y * 1.5 + t * 0.7) * waveHeight * 0.08);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[20, 20, 40, 40]} />
      <meshPhysicalMaterial color="#0ea5e9" metalness={0.1} roughness={0.1} transmission={0.4} ior={1.33} transparent opacity={0.8} />
    </mesh>
  );
}

/* ─── Ship Assembly ─── */
function ShipModel({ pitch, roll }: { pitch: number; roll: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.03 + pitch;
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.02 + roll;
    }
  });

  return (
    <group ref={ref}>
      <Hull />
      <Superstructure />
    </group>
  );
}

const MarineSimulator = () => {
  const navigate = useNavigate();
  const [waveHeight, setWaveHeight] = useState(3);
  const [speed, setSpeed] = useState(15);
  const [heading, setHeading] = useState(0);

  const displacement = 5000;
  const dragForce = 0.5 * 1025 * (speed * 0.514) ** 2 * 12 * 0.3 / 1000;

  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <Ship className="w-5 h-5 text-cyan-500" />
          <span className="text-sm font-semibold text-foreground">Marine Simulator</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600">Vessel</span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <Canvas shadows gl={{ antialias: true, toneMapping: 3 }}>
            <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={40} />
            <Environment preset="sunset" background={false} />
            <color attach="background" args={["#e0f2fe"]} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <ambientLight intensity={0.3} />
            <Suspense fallback={null}>
              <ShipModel pitch={0} roll={0} />
              <Water waveHeight={waveHeight} />
            </Suspense>
            <OrbitControls enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>

          <div className="absolute top-4 left-4 flex gap-3">
            {[
              { label: "SPD", value: `${speed} kts`, color: "text-cyan-600" },
              { label: "HDG", value: `${heading}°`, color: "text-emerald-600" },
              { label: "DRAG", value: `${dragForce.toFixed(1)} kN`, color: "text-amber-600" },
            ].map(s => (
              <div key={s.label} className="bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2">
                <p className="text-[9px] text-muted-foreground font-mono">{s.label}</p>
                <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-72 border-l border-border bg-card flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3">Navigation</h3>
            {[
              { label: "Speed (kts)", value: speed, set: setSpeed, min: 0, max: 30, step: 1 },
              { label: "Heading (°)", value: heading, set: setHeading, min: 0, max: 359, step: 1 },
              { label: "Wave Height (m)", value: waveHeight, set: setWaveHeight, min: 0, max: 8, step: 0.5 },
            ].map(c => (
              <div key={c.label} className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{c.label}</span>
                  <span className="font-mono">{c.value}</span>
                </div>
                <input type="range" min={c.min} max={c.max} step={c.step} value={c.value}
                  onChange={e => c.set(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-cyan-500" />
              </div>
            ))}
          </div>

          <div className="p-4">
            <h3 className="text-xs font-semibold text-foreground mb-2">Vessel Specs</h3>
            <div className="space-y-2">
              {[
                { label: "Displacement", value: `${displacement} tons` },
                { label: "Hull Drag", value: `${dragForce.toFixed(1)} kN` },
                { label: "Wave State", value: waveHeight < 2 ? "Calm" : waveHeight < 5 ? "Moderate" : "Heavy" },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-mono font-medium text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarineSimulator;
