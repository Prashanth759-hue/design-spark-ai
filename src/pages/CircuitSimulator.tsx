import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, AlertTriangle, Battery, CircleDot, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { useDesigns } from "@/hooks/useDesigns";

/* ─── Circuit Component Types ─── */
interface CircuitComponent {
  id: string;
  type: "battery" | "resistor" | "led" | "wire";
  x: number;
  y: number;
  value: number;
  label: string;
}

/* ─── Current Particle ─── */
function CurrentParticle({ path, speed, color }: {
  path: { x: number; y: number }[];
  speed: number;
  color: string;
}) {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (speed <= 0) return;
    const interval = setInterval(() => {
      setPos((p) => (p + speed * 0.02) % 1);
    }, 16);
    return () => clearInterval(interval);
  }, [speed]);

  const idx = Math.floor(pos * (path.length - 1));
  const t = (pos * (path.length - 1)) % 1;
  const p1 = path[idx];
  const p2 = path[Math.min(idx + 1, path.length - 1)];
  const cx = p1.x + (p2.x - p1.x) * t;
  const cy = p1.y + (p2.y - p1.y) * t;

  return (
    <motion.circle cx={cx} cy={cy} r={4}
      fill={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: speed > 0 ? [0.3, 1, 0.3] : 0 }}
      transition={{ repeat: Infinity, duration: 0.8 }}
    />
  );
}

const CircuitSimulator = () => {
  const navigate = useNavigate();
  const [voltage, setVoltage] = useState(9);
  const [resistance1, setResistance1] = useState(100);
  const [resistance2, setResistance2] = useState(220);
  const [circuitType, setCircuitType] = useState<"series" | "parallel">("series");
  const { saveDesign } = useDesigns();

  // Ohm's law calculations
  const totalResistance = circuitType === "series"
    ? resistance1 + resistance2
    : (resistance1 * resistance2) / (resistance1 + resistance2);
  const current = voltage / totalResistance;
  const power = voltage * current;
  const overload = current > 0.1;
  const ledVoltage = circuitType === "series" ? voltage * (resistance2 / totalResistance) : voltage;
  const ledOn = ledVoltage > 1.8 && !overload;

  // Circuit path for current particles
  const circuitPath = [
    { x: 120, y: 380 }, { x: 120, y: 200 }, { x: 120, y: 120 },
    { x: 300, y: 120 }, { x: 480, y: 120 },
    { x: 480, y: 200 }, { x: 480, y: 380 },
    { x: 300, y: 380 }, { x: 120, y: 380 },
  ];

  return (
    <div className="w-screen h-screen bg-background relative overflow-hidden flex">
      <div className="flex-1 relative flex items-center justify-center" style={{ background: "#0c1222" }}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center px-4 py-3 bg-gradient-to-b from-background/90 to-transparent z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")}
              className="px-3 py-1.5 rounded-lg bg-card/80 border border-border text-xs font-medium text-foreground hover:bg-card transition-colors backdrop-blur-sm">
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">🔌 Electronic Circuit Simulator</h1>
              <p className="text-[10px] text-muted-foreground font-mono">Ohm's Law • Current Flow • Voltage Simulation</p>
            </div>
          </div>
        </div>

        {/* Circuit SVG */}
        <svg width="600" height="500" viewBox="0 0 600 500" className="drop-shadow-2xl">
          {/* PCB Board */}
          <rect x="60" y="60" width="480" height="380" rx="12" fill="#1a3a2a" stroke="#2d5a3d" strokeWidth="2" />
          <rect x="70" y="70" width="460" height="360" rx="8" fill="none" stroke="#2d5a3d" strokeWidth="1" strokeDasharray="4 4" />

          {/* Grid pattern */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h${i}`} x1="70" y1={80 + i * 18} x2="530" y2={80 + i * 18} stroke="#1e4a32" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 26 }).map((_, i) => (
            <line key={`v${i}`} x1={80 + i * 18} y1="70" x2={80 + i * 18} y2="430" stroke="#1e4a32" strokeWidth="0.5" />
          ))}

          {/* Wires */}
          <path d="M120,380 L120,120 L480,120 L480,380 L120,380" fill="none" stroke={overload ? "#ef4444" : "#22d3ee"} strokeWidth="3" />

          {/* Battery */}
          <g>
            <rect x="95" y="260" width="50" height="80" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <rect x="108" y="252" width="24" height="8" rx="2" fill="#64748b" />
            <text x="120" y="295" textAnchor="middle" fill="#22d3ee" fontSize="10" fontFamily="monospace">+</text>
            <text x="120" y="330" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">−</text>
            <text x="120" y="360" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">{voltage}V</text>
          </g>

          {/* Resistor 1 */}
          <g>
            <rect x="230" y="100" width="60" height="40" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            {/* Color bands */}
            <rect x="240" y="104" width="6" height="32" rx="1" fill="#a855f7" />
            <rect x="250" y="104" width="6" height="32" rx="1" fill="#eab308" />
            <rect x="260" y="104" width="6" height="32" rx="1" fill="#ef4444" />
            <rect x="275" y="104" width="6" height="32" rx="1" fill="#d4af37" />
            <text x="260" y="160" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">R1: {resistance1}Ω</text>
          </g>

          {/* Resistor 2 / LED */}
          <g>
            <rect x="405" y="100" width="60" height="40" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <rect x="415" y="104" width="6" height="32" rx="1" fill="#ef4444" />
            <rect x="425" y="104" width="6" height="32" rx="1" fill="#ef4444" />
            <rect x="435" y="104" width="6" height="32" rx="1" fill="#22c55e" />
            <rect x="450" y="104" width="6" height="32" rx="1" fill="#d4af37" />
            <text x="435" y="160" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">R2: {resistance2}Ω</text>
          </g>

          {/* LED */}
          <g>
            <polygon points="480,240 500,260 480,280" fill={ledOn ? "#22c55e" : "#1e293b"} stroke={ledOn ? "#4ade80" : "#334155"} strokeWidth="2" />
            <line x1="500" y1="240" x2="500" y2="280" stroke={ledOn ? "#4ade80" : "#334155"} strokeWidth="2" />
            {ledOn && (
              <>
                <circle cx="490" cy="260" r="20" fill="#22c55e" opacity="0.15" />
                <circle cx="490" cy="260" r="30" fill="#22c55e" opacity="0.05" />
              </>
            )}
            <text x="520" y="265" fill="#94a3b8" fontSize="10" fontFamily="monospace">LED</text>
          </g>

          {/* Current flow particles */}
          {current > 0 && !overload && Array.from({ length: 5 }).map((_, i) => (
            <CurrentParticle key={i} path={circuitPath} speed={current * 100}
              color={overload ? "#ef4444" : "#22d3ee"} />
          ))}

          {/* Overload effect */}
          {overload && (
            <g>
              <rect x="60" y="60" width="480" height="380" rx="12" fill="#ef4444" opacity="0.1">
                <animate attributeName="opacity" values="0.1;0.2;0.1" dur="0.5s" repeatCount="indefinite" />
              </rect>
              <text x="300" y="300" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace">
                ⚡ OVERLOAD ⚡
              </text>
            </g>
          )}

          {/* Node dots */}
          {[
            [120, 120], [120, 380], [480, 120], [480, 380],
            [230, 120], [290, 120], [405, 120], [465, 120],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#22d3ee" />
          ))}
        </svg>

        {/* Current readout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 z-10 w-52 bg-card/85 backdrop-blur-md border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-4 h-4 ${overload ? "text-destructive" : "text-primary"}`} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Current</span>
          </div>
          <div className="text-center mb-2">
            <span className={`text-3xl font-mono font-bold ${overload ? "text-destructive" : "text-foreground"}`}>
              {(current * 1000).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">mA</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-[9px] text-muted-foreground">Power</p>
              <p className="text-[10px] font-mono font-semibold text-foreground">{(power * 1000).toFixed(1)}mW</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground">LED</p>
              <p className={`text-[10px] font-mono font-semibold ${ledOn ? "text-primary" : "text-destructive"}`}>
                {ledOn ? "ON" : "OFF"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control Panel */}
      <motion.div initial={{ x: 320 }} animate={{ x: 0 }}
        className="w-80 bg-card border-l border-border flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Circuit Controls</p>
          <p className="text-[10px] text-muted-foreground">Adjust electrical parameters</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
          {/* Circuit type */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Circuit Type</p>
            <div className="grid grid-cols-2 gap-2">
              {(["series", "parallel"] as const).map((t) => (
                <button key={t} onClick={() => setCircuitType(t)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                    circuitType === t ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:border-primary/40"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Voltage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-foreground">Voltage</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-foreground">{voltage}V</span>
            </div>
            <input type="range" min={1} max={24} step={0.5} value={voltage}
              onChange={(e) => setVoltage(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
          </div>

          {/* Resistance 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-foreground">Resistor 1</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-foreground">{resistance1}Ω</span>
            </div>
            <input type="range" min={10} max={1000} step={10} value={resistance1}
              onChange={(e) => setResistance1(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
          </div>

          {/* Resistance 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-foreground">Resistor 2</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-foreground">{resistance2}Ω</span>
            </div>
            <input type="range" min={10} max={1000} step={10} value={resistance2}
              onChange={(e) => setResistance2(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
          </div>

          {/* Overload warning */}
          {overload && (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-[10px] text-destructive font-medium">Current exceeds 100mA — circuit overload detected!</p>
            </motion.div>
          )}

          {/* Calculations */}
          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Electrical Data</p>
            <div className="space-y-2">
              {[
                { label: "Voltage", value: `${voltage} V` },
                { label: "Total Resistance", value: `${totalResistance.toFixed(1)} Ω` },
                { label: "Current", value: `${(current * 1000).toFixed(2)} mA` },
                { label: "Power", value: `${(power * 1000).toFixed(2)} mW` },
                { label: "LED Voltage", value: `${ledVoltage.toFixed(2)} V` },
                { label: "LED Status", value: ledOn ? "✅ ON" : "❌ OFF" },
                { label: "Circuit Type", value: circuitType.charAt(0).toUpperCase() + circuitType.slice(1) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  <span className="text-[10px] font-mono font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formula */}
          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Ohm's Law</p>
            <div className="bg-background rounded-lg p-3 font-mono text-xs text-foreground space-y-1">
              <p>V = I × R</p>
              <p>{voltage}V = {(current * 1000).toFixed(2)}mA × {totalResistance.toFixed(1)}Ω</p>
              <p className="text-muted-foreground mt-1">P = V × I = {(power * 1000).toFixed(2)}mW</p>
            </div>
          </div>

          {/* Real-time Charts */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Live Performance</p>
            <PerformanceChart title="Current" unit="mA" value={current * 1000} maxValue={150} color="hsl(var(--primary))" />
            <PerformanceChart title="Power" unit="mW" value={power * 1000} maxValue={500} color="hsl(45 93% 47%)" />
          </div>

          {/* Save button */}
          <button onClick={() => saveDesign("circuit", `${circuitType} Circuit ${voltage}V`, { voltage, resistance1, resistance2, circuitType })}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors mt-4">
            <Save className="w-3.5 h-3.5" /> Save Design
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CircuitSimulator;
