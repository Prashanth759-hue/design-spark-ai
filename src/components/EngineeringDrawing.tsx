import { motion } from "framer-motion";

interface EngineeringDrawingProps {
  type: "vehicle" | "building" | "machine" | "circuit";
  params?: Record<string, number | string>;
}

export function EngineeringDrawing({ type, params = {} }: EngineeringDrawingProps) {
  const w = 800;
  const h = 500;
  const margin = 60;

  const drawVehicle = () => {
    const wb = Number(params.wheelbase || 2850);
    const tw = Number(params.trackWidth || 1580);
    const bodyL = Number(params.bodyLength || 4500);
    const bodyH = Number(params.bodyHeight || 1200);
    const scale = (w - margin * 2) / bodyL;
    const cx = w / 2;
    const cy = h / 2;

    return (
      <>
        {/* Side view */}
        <text x={margin} y={25} fill="#94a3b8" fontSize="11" fontFamily="monospace">SIDE VIEW (Scale 1:{Math.round(1/scale)})</text>

        {/* Body outline */}
        <path d={`M${cx - bodyL*scale/2},${cy + 20} 
          L${cx - bodyL*scale/2},${cy - bodyH*scale*0.3}
          Q${cx - bodyL*scale*0.3},${cy - bodyH*scale*0.8} ${cx},${cy - bodyH*scale*0.85}
          Q${cx + bodyL*scale*0.2},${cy - bodyH*scale*0.8} ${cx + bodyL*scale*0.35},${cy - bodyH*scale*0.3}
          L${cx + bodyL*scale/2},${cy - bodyH*scale*0.15}
          L${cx + bodyL*scale/2},${cy + 20}
          Z`}
          fill="none" stroke="#22d3ee" strokeWidth="1.5" />

        {/* Wheels */}
        {[-wb*scale/2, wb*scale/2].map((x, i) => (
          <g key={i}>
            <circle cx={cx + x} cy={cy + 30} r={18} fill="none" stroke="#64748b" strokeWidth="1.5" />
            <circle cx={cx + x} cy={cy + 30} r={10} fill="none" stroke="#475569" strokeWidth="0.8" />
          </g>
        ))}

        {/* Wheelbase dimension */}
        <line x1={cx - wb*scale/2} y1={cy + 65} x2={cx + wb*scale/2} y2={cy + 65} stroke="#f59e0b" strokeWidth="0.8" />
        <line x1={cx - wb*scale/2} y1={cy + 55} x2={cx - wb*scale/2} y2={cy + 75} stroke="#f59e0b" strokeWidth="0.8" />
        <line x1={cx + wb*scale/2} y1={cy + 55} x2={cx + wb*scale/2} y2={cy + 75} stroke="#f59e0b" strokeWidth="0.8" />
        <text x={cx} y={cy + 82} textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="monospace">WB: {wb}mm</text>

        {/* Overall length */}
        <line x1={cx - bodyL*scale/2} y1={cy + 100} x2={cx + bodyL*scale/2} y2={cy + 100} stroke="#22d3ee" strokeWidth="0.8" />
        <line x1={cx - bodyL*scale/2} y1={cy + 90} x2={cx - bodyL*scale/2} y2={cy + 110} stroke="#22d3ee" strokeWidth="0.8" />
        <line x1={cx + bodyL*scale/2} y1={cy + 90} x2={cx + bodyL*scale/2} y2={cy + 110} stroke="#22d3ee" strokeWidth="0.8" />
        <text x={cx} y={cy + 118} textAnchor="middle" fill="#22d3ee" fontSize="10" fontFamily="monospace">L: {bodyL}mm</text>

        {/* Height dimension */}
        <line x1={cx + bodyL*scale/2 + 20} y1={cy + 20} x2={cx + bodyL*scale/2 + 20} y2={cy - bodyH*scale*0.85} stroke="#4ade80" strokeWidth="0.8" />
        <line x1={cx + bodyL*scale/2 + 10} y1={cy + 20} x2={cx + bodyL*scale/2 + 30} y2={cy + 20} stroke="#4ade80" strokeWidth="0.8" />
        <line x1={cx + bodyL*scale/2 + 10} y1={cy - bodyH*scale*0.85} x2={cx + bodyL*scale/2 + 30} y2={cy - bodyH*scale*0.85} stroke="#4ade80" strokeWidth="0.8" />
        <text x={cx + bodyL*scale/2 + 35} y={cy - bodyH*scale*0.3} fill="#4ade80" fontSize="10" fontFamily="monospace">H: {bodyH}mm</text>

        {/* Center marks */}
        <line x1={cx - 5} y1={cy + 30} x2={cx + 5} y2={cy + 30} stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1={cx} y1={cy + 25} x2={cx} y2={cy + 35} stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
      </>
    );
  };

  const drawBuilding = () => {
    const floors = Number(params.floors || 5);
    const height = Number(params.height || floors * 3200);
    const width = Number(params.width || 15000);
    const scaleF = (h - margin * 3) / height;
    const cx = w / 2;
    const baseY = h - margin;

    return (
      <>
        <text x={margin} y={25} fill="#94a3b8" fontSize="11" fontFamily="monospace">FRONT ELEVATION (Scale 1:{Math.round(1/scaleF)})</text>

        {/* Building outline */}
        <rect x={cx - width*scaleF/2} y={baseY - height*scaleF} width={width*scaleF} height={height*scaleF}
          fill="none" stroke="#22d3ee" strokeWidth="1.5" />

        {/* Floor lines */}
        {Array.from({ length: floors }).map((_, f) => {
          const fy = baseY - (f + 1) * (height / floors) * scaleF;
          return (
            <g key={f}>
              <line x1={cx - width*scaleF/2} y1={fy} x2={cx + width*scaleF/2} y2={fy}
                stroke="#334155" strokeWidth="0.5" strokeDasharray="4 2" />
              <text x={cx - width*scaleF/2 - 8} y={fy + 4} textAnchor="end" fill="#64748b" fontSize="8" fontFamily="monospace">F{f + 1}</text>
            </g>
          );
        })}

        {/* Windows */}
        {Array.from({ length: floors }).map((_, f) => {
          const fy = baseY - (f + 0.5) * (height / floors) * scaleF;
          return Array.from({ length: 5 }).map((_, wi) => {
            const wx = cx - width*scaleF*0.35 + wi * width*scaleF*0.17;
            return (
              <rect key={`${f}-${wi}`} x={wx - 4} y={fy - 6} width={8} height={12}
                fill="none" stroke="#60a5fa" strokeWidth="0.8" />
            );
          });
        })}

        {/* Height dim */}
        <line x1={cx + width*scaleF/2 + 20} y1={baseY} x2={cx + width*scaleF/2 + 20} y2={baseY - height*scaleF} stroke="#f59e0b" strokeWidth="0.8" />
        <line x1={cx + width*scaleF/2 + 12} y1={baseY} x2={cx + width*scaleF/2 + 28} y2={baseY} stroke="#f59e0b" strokeWidth="0.8" />
        <line x1={cx + width*scaleF/2 + 12} y1={baseY - height*scaleF} x2={cx + width*scaleF/2 + 28} y2={baseY - height*scaleF} stroke="#f59e0b" strokeWidth="0.8" />
        <text x={cx + width*scaleF/2 + 33} y={baseY - height*scaleF/2} fill="#f59e0b" fontSize="10" fontFamily="monospace">{(height/1000).toFixed(1)}m</text>

        {/* Width dim */}
        <line x1={cx - width*scaleF/2} y1={baseY + 20} x2={cx + width*scaleF/2} y2={baseY + 20} stroke="#22d3ee" strokeWidth="0.8" />
        <text x={cx} y={baseY + 35} textAnchor="middle" fill="#22d3ee" fontSize="10" fontFamily="monospace">{(width/1000).toFixed(1)}m</text>

        {/* Ground line */}
        <line x1={margin} y1={baseY} x2={w - margin} y2={baseY} stroke="#4ade80" strokeWidth="1" strokeDasharray="6 3" />
        <text x={margin} y={baseY + 15} fill="#4ade80" fontSize="9" fontFamily="monospace">GL ±0.000</text>
      </>
    );
  };

  const drawMachine = () => {
    const cx = w / 2;
    const cy = h / 2;
    const gearR1 = 40;
    const gearR2 = Number(params.gearRatio || 2) * gearR1;

    return (
      <>
        <text x={margin} y={25} fill="#94a3b8" fontSize="11" fontFamily="monospace">ASSEMBLY DRAWING - GEAR TRAIN</text>

        {/* Input shaft */}
        <line x1={margin + 20} y1={cy} x2={cx - gearR1 - 10} y2={cy} stroke="#94a3b8" strokeWidth="2" />

        {/* Drive gear */}
        <circle cx={cx - gearR1} cy={cy} r={gearR1} fill="none" stroke="#22d3ee" strokeWidth="1.5" />
        <circle cx={cx - gearR1} cy={cy} r={gearR1 * 0.3} fill="none" stroke="#22d3ee" strokeWidth="1" />
        <text x={cx - gearR1} y={cy - gearR1 - 8} textAnchor="middle" fill="#22d3ee" fontSize="9" fontFamily="monospace">Z1={Number(params.teeth1 || 12)}T</text>

        {/* Driven gear */}
        <circle cx={cx + gearR2 - 10} cy={cy} r={gearR2} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx={cx + gearR2 - 10} cy={cy} r={gearR2 * 0.3} fill="none" stroke="#f59e0b" strokeWidth="1" />
        <text x={cx + gearR2 - 10} y={cy - gearR2 - 8} textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace">Z2={Number(params.teeth2 || 24)}T</text>

        {/* Output shaft */}
        <line x1={cx + gearR2 * 2 - 20} y1={cy} x2={w - margin - 20} y2={cy} stroke="#94a3b8" strokeWidth="2" />

        {/* Center distance */}
        <line x1={cx - gearR1} y1={cy + gearR2 + 20} x2={cx + gearR2 - 10} y2={cy + gearR2 + 20} stroke="#4ade80" strokeWidth="0.8" />
        <text x={(cx - gearR1 + cx + gearR2 - 10) / 2} y={cy + gearR2 + 35} textAnchor="middle" fill="#4ade80" fontSize="10" fontFamily="monospace">
          C.D. = {Number(params.centerDistance || 90)}mm
        </text>

        {/* RPM labels */}
        <text x={margin + 20} y={cy - 15} fill="#94a3b8" fontSize="9" fontFamily="monospace">INPUT: {params.rpm || 500} RPM</text>
        <text x={w - margin - 20} y={cy - 15} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          OUTPUT: {Math.round(Number(params.rpm || 500) / Number(params.gearRatio || 2))} RPM
        </text>

        {/* Title block */}
        <rect x={w - 220} y={h - 80} width={200} height={60} fill="none" stroke="#334155" strokeWidth="1" />
        <text x={w - 210} y={h - 60} fill="#94a3b8" fontSize="9" fontFamily="monospace">GEAR RATIO: {params.gearRatio || 2}:1</text>
        <text x={w - 210} y={h - 45} fill="#94a3b8" fontSize="9" fontFamily="monospace">MODULE: {params.module || 2.5}mm</text>
        <text x={w - 210} y={h - 30} fill="#94a3b8" fontSize="9" fontFamily="monospace">MATERIAL: {params.material || "42CrMo4"}</text>
      </>
    );
  };

  const drawCircuit = () => {
    const cx = w / 2;
    const cy = h / 2;

    return (
      <>
        <text x={margin} y={25} fill="#94a3b8" fontSize="11" fontFamily="monospace">SCHEMATIC DIAGRAM</text>

        {/* Battery symbol */}
        <line x1={margin + 40} y1={cy - 80} x2={margin + 40} y2={cy - 15} stroke="#22d3ee" strokeWidth="1.5" />
        <line x1={margin + 30} y1={cy - 15} x2={margin + 50} y2={cy - 15} stroke="#22d3ee" strokeWidth="2" />
        <line x1={margin + 34} y1={cy} x2={margin + 46} y2={cy} stroke="#22d3ee" strokeWidth="1" />
        <line x1={margin + 40} y1={cy} x2={margin + 40} y2={cy + 80} stroke="#22d3ee" strokeWidth="1.5" />
        <text x={margin + 55} y={cy} fill="#94a3b8" fontSize="9" fontFamily="monospace">{params.voltage || 9}V</text>

        {/* Top wire to R1 */}
        <line x1={margin + 40} y1={cy - 80} x2={cx - 40} y2={cy - 80} stroke="#22d3ee" strokeWidth="1.5" />

        {/* Resistor 1 zigzag */}
        <path d={`M${cx - 40},${cy - 80} l8,-10 l8,20 l8,-20 l8,20 l8,-20 l8,10`}
          fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx} y={cy - 95} textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace">R1 = {params.r1 || 100}Ω</text>

        {/* Wire to R2 */}
        <line x1={cx + 16} y1={cy - 80} x2={w - margin - 40} y2={cy - 80} stroke="#22d3ee" strokeWidth="1.5" />
        <line x1={w - margin - 40} y1={cy - 80} x2={w - margin - 40} y2={cy + 80} stroke="#22d3ee" strokeWidth="1.5" />

        {/* LED symbol */}
        <polygon points={`${w - margin - 50},${cy - 10} ${w - margin - 30},${cy - 10} ${w - margin - 40},${cy + 10}`}
          fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <line x1={w - margin - 50} y1={cy + 10} x2={w - margin - 30} y2={cy + 10} stroke="#4ade80" strokeWidth="1.5" />
        <text x={w - margin - 15} y={cy + 5} fill="#4ade80" fontSize="9" fontFamily="monospace">LED</text>

        {/* Bottom wire */}
        <line x1={w - margin - 40} y1={cy + 80} x2={margin + 40} y2={cy + 80} stroke="#22d3ee" strokeWidth="1.5" />

        {/* Current arrow */}
        <text x={cx} y={cy + 100} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          I = {params.current || "28.1"}mA → 
        </text>
      </>
    );
  };

  const renderers: Record<string, () => JSX.Element> = {
    vehicle: drawVehicle,
    building: drawBuilding,
    machine: drawMachine,
    circuit: drawCircuit,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-[#0a0e1a] rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Engineering Drawing — {type}</span>
        <span className="text-[10px] font-mono text-muted-foreground">ISO 128 / ASME Y14.5</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="w-full">
        {/* Border frame */}
        <rect x={10} y={10} width={w - 20} height={h - 20} fill="none" stroke="#1e293b" strokeWidth="1" />
        <rect x={15} y={15} width={w - 30} height={h - 30} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {renderers[type]?.()}

        {/* Title block */}
        <rect x={10} y={h - 40} width={200} height={30} fill="none" stroke="#1e293b" strokeWidth="1" />
        <text x={20} y={h - 22} fill="#475569" fontSize="9" fontFamily="monospace">CDAI Engineering Optimizer</text>
        <text x={20} y={h - 12} fill="#334155" fontSize="8" fontFamily="monospace">Date: {new Date().toLocaleDateString()}</text>
      </svg>
    </motion.div>
  );
}
