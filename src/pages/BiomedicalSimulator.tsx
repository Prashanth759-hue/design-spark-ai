import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { ArrowLeft, HeartPulse, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

/* ─── Heart Model ─── */
function Heart({ bpm }: { bpm: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      const beatFreq = bpm / 60;
      const beat = Math.pow(Math.sin(t * beatFreq * Math.PI), 2);
      const scale = 1 + beat * 0.08;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={ref}>
      {/* Left ventricle */}
      <mesh position={[-0.2, 0, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhysicalMaterial color="#dc2626" metalness={0.1} roughness={0.6} />
      </mesh>
      {/* Right ventricle */}
      <mesh position={[0.2, 0, 0]} castShadow>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshPhysicalMaterial color="#b91c1c" metalness={0.1} roughness={0.6} />
      </mesh>
      {/* Aorta */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 16]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0.2, 0.9, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.4, 16]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Pulmonary arteries */}
      <mesh position={[-0.3, 0.7, 0.1]} rotation={[0, 0, 0.6]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 12]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0.3, 0.65, 0.1]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.4, 12]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Veins */}
      <mesh position={[-0.15, 0.5, -0.15]} rotation={[0.3, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.4, 12]} />
        <meshPhysicalMaterial color="#6366f1" metalness={0.1} roughness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.55, -0.15]} rotation={[0.3, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.35, 12]} />
        <meshPhysicalMaterial color="#6366f1" metalness={0.1} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Prosthetic Knee Joint ─── */
function ProstheticKnee({ flexion }: { flexion: number }) {
  const lowerRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (lowerRef.current) {
      lowerRef.current.rotation.x = THREE.MathUtils.lerp(lowerRef.current.rotation.x, flexion, 0.05);
    }
  });

  return (
    <group position={[2.5, 0, 0]}>
      {/* Femoral component */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.08, 1, 16]} />
        <meshPhysicalMaterial color="#d4d4d8" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Joint */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshPhysicalMaterial color="#a1a1aa" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Tibial component */}
      <group ref={lowerRef} position={[0, 0.25, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
          <meshPhysicalMaterial color="#e4e4e7" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.8, 16]} />
          <meshPhysicalMaterial color="#d4d4d8" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>
    </group>
  );
}

const BiomedicalSimulator = () => {
  const navigate = useNavigate();
  const [bpm, setBpm] = useState(72);
  const [flexion, setFlexion] = useState(0);
  const [view, setView] = useState<"heart" | "prosthetic">("heart");
  const [ecgData, setEcgData] = useState<{ time: number; value: number }[]>([]);
  const timeRef = useRef(0);

  // Generate ECG-like data
  useState(() => {
    const interval = setInterval(() => {
      timeRef.current += 0.1;
      const t = timeRef.current;
      const beatFreq = bpm / 60;
      const phase = (t * beatFreq) % 1;
      let ecg = 0;
      if (phase < 0.1) ecg = Math.sin(phase * 31.4) * 0.3;
      else if (phase < 0.15) ecg = 0;
      else if (phase < 0.2) ecg = -0.2;
      else if (phase < 0.25) ecg = 1.0;
      else if (phase < 0.3) ecg = -0.4;
      else if (phase < 0.5) ecg = Math.sin((phase - 0.3) * 15.7) * 0.15;
      else ecg = 0;
      setEcgData(prev => [...prev.slice(-80), { time: Math.round(t * 10) / 10, value: ecg }]);
    }, 50);
    return () => clearInterval(interval);
  });

  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <HeartPulse className="w-5 h-5 text-rose-500" />
          <span className="text-sm font-semibold text-foreground">Biomedical Simulator</span>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
          {(["heart", "prosthetic"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {v === "heart" ? "Heart" : "Prosthetic"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <Canvas shadows gl={{ antialias: true, toneMapping: 3 }}>
            <PerspectiveCamera makeDefault position={[3, 1.5, 3]} fov={40} />
            <Environment preset="studio" background={false} />
            <color attach="background" args={["#fff1f2"]} />
            <directionalLight position={[5, 8, 4]} intensity={1.5} castShadow />
            <ambientLight intensity={0.4} />
            <Suspense fallback={null}>
              {view === "heart" ? <Heart bpm={bpm} /> : <ProstheticKnee flexion={flexion} />}
            </Suspense>
            <ContactShadows position={[0, -1, 0]} opacity={0.2} scale={8} blur={2} />
            <OrbitControls enableDamping dampingFactor={0.08} />
          </Canvas>
        </div>

        <div className="w-72 border-l border-border bg-card flex flex-col overflow-y-auto">
          {view === "heart" ? (
            <>
              <div className="p-4 border-b border-border">
                <h3 className="text-xs font-semibold text-foreground mb-3">Heart Parameters</h3>
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Heart Rate</span>
                    <span className="font-mono">{bpm} BPM</span>
                  </div>
                  <input type="range" min={40} max={180} step={1} value={bpm}
                    onChange={e => setBpm(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-rose-500" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[
                    { label: "Cardiac Output", value: `${(bpm * 0.07).toFixed(1)} L/min` },
                    { label: "Stroke Vol", value: "70 mL" },
                    { label: "Systolic", value: "120 mmHg" },
                    { label: "Diastolic", value: "80 mmHg" },
                  ].map(s => (
                    <div key={s.label} className="bg-secondary/50 rounded-lg p-2">
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                      <p className="text-xs font-bold font-mono text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-rose-500" /> ECG Waveform
                </h3>
                <div className="h-32">
                  <PerformanceChart title="ECG" unit="mV" value={Math.sin(Date.now() / 200) * 0.5} maxValue={1.5} color="#e11d48" />
                </div>
              </div>
            </>
          ) : (
            <div className="p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3">Knee Prosthetic</h3>
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Flexion Angle</span>
                  <span className="font-mono">{(flexion * 57.3).toFixed(1)}°</span>
                </div>
                <input type="range" min={0} max={2.2} step={0.01} value={flexion}
                  onChange={e => setFlexion(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-rose-500" />
              </div>
              <div className="space-y-2 mt-4">
                {[
                  { label: "Material", value: "Ti-6Al-4V" },
                  { label: "Bearing", value: "UHMWPE" },
                  { label: "Max Flexion", value: "130°" },
                  { label: "Load Rating", value: "3x BW" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-mono font-medium text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiomedicalSimulator;
