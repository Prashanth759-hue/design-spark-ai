import { motion } from "framer-motion";
import { ExtendedDomainDrawing } from "@/components/engineering/ExtendedDomainDrawing";

interface EngineeringDrawingProps {
  type: "vehicle" | "building" | "machine" | "circuit" | "robotics" | "aerospace" | "marine" | "biomedical" | "industrial";
  params?: Record<string, number | string>;
}

export function EngineeringDrawing({ type, params = {} }: EngineeringDrawingProps) {
  const w = 1000;
  const h = 700;
  const margin = 45;

  /* ═══ Shared SVG drawing helpers ═══ */
  const dimLine = (x1: number, y1: number, x2: number, y2: number, label: string, color = "#e2b340", offset = 0, fontSize = 8) => {
    const isVert = Math.abs(x2 - x1) < 2;
    const mx = (x1 + x2) / 2 + (isVert ? 14 : 0);
    const my = (y1 + y2) / 2 + (isVert ? 0 : -6);
    const ext = 6;
    return (
      <g>
        {/* Extension lines */}
        {isVert ? (
          <>
            <line x1={x1 - ext} y1={y1} x2={x1 + ext} y2={y1} stroke={color} strokeWidth="0.4" />
            <line x1={x2 - ext} y1={y2} x2={x2 + ext} y2={y2} stroke={color} strokeWidth="0.4" />
          </>
        ) : (
          <>
            <line x1={x1} y1={y1 - ext} x2={x1} y2={y1 + ext} stroke={color} strokeWidth="0.4" />
            <line x1={x2} y1={y2 - ext} x2={x2} y2={y2 + ext} stroke={color} strokeWidth="0.4" />
          </>
        )}
        {/* Dimension line */}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.6" markerEnd="url(#dimArrow)" markerStart="url(#dimArrowR)" />
        {/* Label */}
        {isVert ? (
          <text x={mx} y={my} fill={color} fontSize={fontSize} fontFamily="monospace" textAnchor="start" 
            transform={`rotate(-90,${mx},${my})`}>{label}</text>
        ) : (
          <text x={mx} y={my + offset} fill={color} fontSize={fontSize} fontFamily="monospace" textAnchor="middle">{label}</text>
        )}
      </g>
    );
  };

  const crossHatch = (x: number, y: number, w: number, h: number, spacing = 4, color = "#1e3a5f") => {
    const lines = [];
    for (let i = -h; i < w + h; i += spacing) {
      lines.push(
        <line key={i} x1={Math.max(x, x + i)} y1={Math.max(y, y - i + w)} x2={Math.min(x + w, x + i + h)} y2={Math.min(y + h, y + i)} stroke={color} strokeWidth="0.3" clipPath={`url(#clip-${x}-${y})`} />
      );
    }
    return (
      <g>
        <defs>
          <clipPath id={`clip-${x}-${y}`}>
            <rect x={x} y={y} width={w} height={h} />
          </clipPath>
        </defs>
        {lines}
      </g>
    );
  };

  const surfaceFinish = (x: number, y: number, value: string) => (
    <g>
      <path d={`M${x},${y} l4,-8 l4,8`} fill="none" stroke="#94a3b8" strokeWidth="0.7" />
      <line x1={x + 2} y1={y - 8} x2={x + 12} y2={y - 8} stroke="#94a3b8" strokeWidth="0.5" />
      <text x={x + 14} y={y - 5} fill="#94a3b8" fontSize="6" fontFamily="monospace">{value}</text>
    </g>
  );

  const toleranceBox = (x: number, y: number, symbol: string, value: string, datum = "") => (
    <g>
      <rect x={x} y={y} width={datum ? 60 : 44} height={14} fill="none" stroke="#94a3b8" strokeWidth="0.6" />
      <line x1={x + 14} y1={y} x2={x + 14} y2={y + 14} stroke="#94a3b8" strokeWidth="0.4" />
      <line x1={x + 30} y1={y} x2={x + 30} y2={y + 14} stroke="#94a3b8" strokeWidth="0.4" />
      <text x={x + 7} y={y + 10} fill="#22d3ee" fontSize="8" fontFamily="monospace" textAnchor="middle">{symbol}</text>
      <text x={x + 22} y={y + 10} fill="#e2b340" fontSize="7" fontFamily="monospace" textAnchor="middle">{value}</text>
      {datum && <>
        <line x1={x + 44} y1={y} x2={x + 44} y2={y + 14} stroke="#94a3b8" strokeWidth="0.4" />
        <text x={x + 52} y={y + 10} fill="#4ade80" fontSize="8" fontFamily="monospace" textAnchor="middle">{datum}</text>
      </>}
    </g>
  );

  const sectionArrow = (x: number, y1: number, y2: number, label: string) => (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="8 3 2 3" />
      <polygon points={`${x - 4},${y1 + 8} ${x},${y1} ${x + 4},${y1 + 8}`} fill="#94a3b8" />
      <polygon points={`${x - 4},${y2 - 8} ${x},${y2} ${x + 4},${y2 - 8}`} fill="#94a3b8" />
      <text x={x - 10} y={y1 + 5} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">{label}</text>
      <text x={x - 10} y={y2 - 2} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">{label}</text>
    </g>
  );

  /* ═══════ VEHICLE ═══════ */
  const drawVehicle = () => {
    const wb = Number(params.wheelbase || 2850);
    const bodyL = Number(params.bodyLength || 4500);
    const bodyH = Number(params.bodyHeight || 1400);
    const bodyW = Number(params.trackWidth || 1850);
    const oh_f = Number(params.overhangFront || 900);
    const oh_r = Number(params.overhangRear || 750);
    const gc = Number(params.groundClearance || 165);

    // Side view area
    const svX = margin + 5, svY = margin + 25, svW = 440, svH = 220;
    const sScale = svW / bodyL * 0.85;
    const sCx = svX + svW / 2, sBY = svY + svH - 30; // base Y (ground)

    // Front view
    const fvX = svX + svW + 30, fvY = svY, fvW = 200, fvH = 220;
    const fScale = Math.min(fvW / bodyW, fvH / bodyH) * 0.6;
    const fCx = fvX + fvW / 2, fBY = fvY + fvH - 30;

    // Top view
    const tvX = svX, tvY = svY + svH + 50, tvW = 440, tvH = 170;
    const tScale = tvW / bodyL * 0.85;
    const tCx = tvX + tvW / 2, tCy = tvY + tvH / 2;

    // Section view
    const secX = fvX, secY = fvY + fvH + 50, secW = 200, secH = 170;
    const secCx = secX + secW / 2, secCy = secY + secH / 2;

    const wheelRadius = 330 * sScale;
    const tireW = 225 * sScale;

    return (
      <>
        {/* ── SIDE VIEW ── */}
        <text x={svX} y={svY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SIDE VIEW (RIGHT)</text>
        <rect x={svX} y={svY} width={svW} height={svH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Body profile - realistic car silhouette */}
        <path d={`
          M${sCx - bodyL*sScale/2},${sBY - gc*sScale}
          L${sCx - bodyL*sScale/2},${sBY - gc*sScale - bodyH*sScale*0.32}
          Q${sCx - bodyL*sScale*0.35},${sBY - gc*sScale - bodyH*sScale*0.35} ${sCx - bodyL*sScale*0.28},${sBY - gc*sScale - bodyH*sScale*0.38}
          L${sCx - bodyL*sScale*0.18},${sBY - gc*sScale - bodyH*sScale*0.85}
          Q${sCx - bodyL*sScale*0.12},${sBY - gc*sScale - bodyH*sScale*0.95} ${sCx - bodyL*sScale*0.02},${sBY - gc*sScale - bodyH*sScale}
          L${sCx + bodyL*sScale*0.12},${sBY - gc*sScale - bodyH*sScale}
          Q${sCx + bodyL*sScale*0.18},${sBY - gc*sScale - bodyH*sScale*0.98} ${sCx + bodyL*sScale*0.22},${sBY - gc*sScale - bodyH*sScale*0.88}
          L${sCx + bodyL*sScale*0.32},${sBY - gc*sScale - bodyH*sScale*0.42}
          Q${sCx + bodyL*sScale*0.38},${sBY - gc*sScale - bodyH*sScale*0.32} ${sCx + bodyL*sScale/2},${sBY - gc*sScale - bodyH*sScale*0.28}
          L${sCx + bodyL*sScale/2},${sBY - gc*sScale}
          Z
        `} fill="none" stroke="#22d3ee" strokeWidth="1.5" />

        {/* Windshield */}
        <line x1={sCx - bodyL*sScale*0.18} y1={sBY - gc*sScale - bodyH*sScale*0.85}
          x2={sCx - bodyL*sScale*0.08} y2={sBY - gc*sScale - bodyH*sScale*0.38}
          stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2 1" />

        {/* Rear glass */}
        <line x1={sCx + bodyL*sScale*0.12} y1={sBY - gc*sScale - bodyH*sScale}
          x2={sCx + bodyL*sScale*0.22} y2={sBY - gc*sScale - bodyH*sScale*0.42}
          stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2 1" />

        {/* Door lines */}
        <line x1={sCx - bodyL*sScale*0.05} y1={sBY - gc*sScale - bodyH*sScale*0.38}
          x2={sCx - bodyL*sScale*0.05} y2={sBY - gc*sScale - bodyH*sScale*0.9}
          stroke="#334155" strokeWidth="0.5" />
        <line x1={sCx + bodyL*sScale*0.08} y1={sBY - gc*sScale - bodyH*sScale*0.38}
          x2={sCx + bodyL*sScale*0.08} y2={sBY - gc*sScale - bodyH*sScale*0.92}
          stroke="#334155" strokeWidth="0.5" />

        {/* Side mirror */}
        <rect x={sCx - bodyL*sScale*0.16} y={sBY - gc*sScale - bodyH*sScale*0.55} width={6} height={4} fill="none" stroke="#22d3ee" strokeWidth="0.6" />

        {/* Wheels with detail */}
        {[-wb*sScale/2, wb*sScale/2].map((x, i) => (
          <g key={i}>
            <circle cx={sCx + x} cy={sBY - gc*sScale*0.3} r={wheelRadius} fill="none" stroke="#64748b" strokeWidth="1.2" />
            <circle cx={sCx + x} cy={sBY - gc*sScale*0.3} r={wheelRadius * 0.7} fill="none" stroke="#475569" strokeWidth="0.5" />
            <circle cx={sCx + x} cy={sBY - gc*sScale*0.3} r={wheelRadius * 0.3} fill="none" stroke="#475569" strokeWidth="0.5" />
            {/* Spokes */}
            {Array.from({ length: 5 }).map((_, si) => {
              const a = (si / 5) * Math.PI * 2;
              return <line key={si}
                x1={sCx + x + Math.cos(a) * wheelRadius * 0.3}
                y1={sBY - gc*sScale*0.3 + Math.sin(a) * wheelRadius * 0.3}
                x2={sCx + x + Math.cos(a) * wheelRadius * 0.65}
                y2={sBY - gc*sScale*0.3 + Math.sin(a) * wheelRadius * 0.65}
                stroke="#475569" strokeWidth="0.4" />;
            })}
          </g>
        ))}

        {/* Ground line */}
        <line x1={svX + 5} y1={sBY} x2={svX + svW - 5} y2={sBY} stroke="#4ade80" strokeWidth="0.8" strokeDasharray="8 4" />
        <text x={svX + 8} y={sBY + 10} fill="#4ade80" fontSize="6" fontFamily="monospace">GL ±0.000</text>

        {/* Dimensions */}
        {dimLine(sCx - wb*sScale/2, sBY + 16, sCx + wb*sScale/2, sBY + 16, `⌀ WB ${wb}`)}
        {dimLine(sCx - bodyL*sScale/2, sBY + 30, sCx + bodyL*sScale/2, sBY + 30, `L ${bodyL}`, "#22d3ee")}
        {dimLine(sCx + bodyL*sScale/2 + 12, sBY, sCx + bodyL*sScale/2 + 12, sBY - gc*sScale - bodyH*sScale, `H ${bodyH}`, "#4ade80")}
        {dimLine(sCx + bodyL*sScale/2 + 24, sBY, sCx + bodyL*sScale/2 + 24, sBY - gc*sScale, `GC ${gc}`, "#f97316")}

        {/* Surface finish symbol */}
        {surfaceFinish(sCx - bodyL*sScale*0.3, sBY - gc*sScale - bodyH*sScale*0.6, "Ra 0.8")}

        {/* GD&T */}
        {toleranceBox(svX + 10, svY + svH - 24, "⊥", "0.05", "A")}

        {/* ── FRONT VIEW ── */}
        <text x={fvX} y={fvY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">FRONT VIEW</text>
        <rect x={fvX} y={fvY} width={fvW} height={fvH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Front body */}
        <path d={`
          M${fCx - bodyW*fScale/2},${fBY - gc*fScale}
          L${fCx - bodyW*fScale/2},${fBY - gc*fScale - bodyH*fScale*0.45}
          Q${fCx - bodyW*fScale*0.35},${fBY - gc*fScale - bodyH*fScale*0.92} ${fCx},${fBY - gc*fScale - bodyH*fScale}
          Q${fCx + bodyW*fScale*0.35},${fBY - gc*fScale - bodyH*fScale*0.92} ${fCx + bodyW*fScale/2},${fBY - gc*fScale - bodyH*fScale*0.45}
          L${fCx + bodyW*fScale/2},${fBY - gc*fScale}
          Z
        `} fill="none" stroke="#22d3ee" strokeWidth="1.2" />

        {/* Headlights */}
        {[-1, 1].map(s => (
          <ellipse key={s} cx={fCx + s * bodyW*fScale*0.35} cy={fBY - gc*fScale - bodyH*fScale*0.35} rx={bodyW*fScale*0.08} ry={bodyH*fScale*0.06} fill="none" stroke="#fbbf24" strokeWidth="0.8" />
        ))}

        {/* Grille */}
        <rect x={fCx - bodyW*fScale*0.18} y={fBY - gc*fScale - bodyH*fScale*0.22} width={bodyW*fScale*0.36} height={bodyH*fScale*0.1} rx={2} fill="none" stroke="#475569" strokeWidth="0.6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={i} x1={fCx - bodyW*fScale*0.16 + i * bodyW*fScale*0.08} y1={fBY - gc*fScale - bodyH*fScale*0.21}
            x2={fCx - bodyW*fScale*0.16 + i * bodyW*fScale*0.08} y2={fBY - gc*fScale - bodyH*fScale*0.13} stroke="#334155" strokeWidth="0.3" />
        ))}

        {/* Front wheels */}
        {[-1, 1].map(s => (
          <g key={s}>
            <rect x={fCx + s * bodyW*fScale/2 - (s > 0 ? 2 : tireW)} y={fBY - gc*fScale*0.5 - wheelRadius} width={tireW} height={wheelRadius * 2} rx={3} fill="none" stroke="#64748b" strokeWidth="0.8" />
          </g>
        ))}

        {dimLine(fCx - bodyW*fScale/2, fBY + 14, fCx + bodyW*fScale/2, fBY + 14, `W ${bodyW}`)}

        {/* ── TOP VIEW ── */}
        <text x={tvX} y={tvY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">TOP VIEW (PLAN)</text>
        <rect x={tvX} y={tvY} width={tvW} height={tvH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Body outline */}
        <path d={`
          M${tCx - bodyL*tScale/2 + 8},${tCy - bodyW*tScale*0.22}
          Q${tCx - bodyL*tScale/2},${tCy - bodyW*tScale*0.18} ${tCx - bodyL*tScale/2},${tCy}
          Q${tCx - bodyL*tScale/2},${tCy + bodyW*tScale*0.18} ${tCx - bodyL*tScale/2 + 8},${tCy + bodyW*tScale*0.22}
          L${tCx + bodyL*tScale/2 - 12},${tCy + bodyW*tScale*0.24}
          Q${tCx + bodyL*tScale/2},${tCy + bodyW*tScale*0.2} ${tCx + bodyL*tScale/2},${tCy}
          Q${tCx + bodyL*tScale/2},${tCy - bodyW*tScale*0.2} ${tCx + bodyL*tScale/2 - 12},${tCy - bodyW*tScale*0.24}
          Z
        `} fill="none" stroke="#22d3ee" strokeWidth="1.2" />

        {/* Centerline */}
        <line x1={tCx - bodyL*tScale/2 - 15} y1={tCy} x2={tCx + bodyL*tScale/2 + 15} y2={tCy}
          stroke="#334155" strokeWidth="0.5" strokeDasharray="8 3 2 3" />
        <text x={tCx + bodyL*tScale/2 + 18} y={tCy + 3} fill="#334155" fontSize="6" fontFamily="monospace">CL</text>

        {/* Wheel positions */}
        {[[-wb*tScale/2, -1], [-wb*tScale/2, 1], [wb*tScale/2, -1], [wb*tScale/2, 1]].map(([x, s], i) => (
          <rect key={i} x={tCx + x - 9} y={tCy + s * bodyW*tScale*0.25 - 3} width={18} height={6} rx={1.5} fill="none" stroke="#64748b" strokeWidth="0.8" />
        ))}

        {/* Windshield outline */}
        <path d={`M${tCx - bodyL*tScale*0.15},${tCy - bodyW*tScale*0.2} L${tCx - bodyL*tScale*0.15},${tCy + bodyW*tScale*0.2}`}
          fill="none" stroke="#60a5fa" strokeWidth="0.6" strokeDasharray="3 2" />

        {/* Section indicator */}
        {sectionArrow(tCx, tvY + 8, tvY + tvH - 8, "A")}

        {/* ── SECTION A-A ── */}
        <text x={secX} y={secY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SECTION A-A</text>
        <rect x={secX} y={secY} width={secW} height={secH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Cross-section body */}
        <path d={`
          M${secCx - bodyW*fScale*0.4},${secCy + bodyH*fScale*0.15}
          L${secCx - bodyW*fScale*0.4},${secCy - bodyH*fScale*0.15}
          L${secCx - bodyW*fScale*0.3},${secCy - bodyH*fScale*0.42}
          L${secCx + bodyW*fScale*0.3},${secCy - bodyH*fScale*0.42}
          L${secCx + bodyW*fScale*0.4},${secCy - bodyH*fScale*0.15}
          L${secCx + bodyW*fScale*0.4},${secCy + bodyH*fScale*0.15}
          Z
        `} fill="none" stroke="#22d3ee" strokeWidth="1" />

        {/* Interior hatching */}
        {crossHatch(secCx - bodyW*fScale*0.38, secCy - bodyH*fScale*0.4, bodyW*fScale*0.76, bodyH*fScale*0.15, 3)}

        {/* Seats */}
        {[-1, 1].map(s => (
          <rect key={s} x={secCx + s * bodyW*fScale*0.15 - 8} y={secCy - bodyH*fScale*0.05} width={16} height={bodyH*fScale*0.18} rx={2} fill="none" stroke="#475569" strokeWidth="0.6" />
        ))}

        {/* Specs table */}
        {renderSpecsTable([
          ["Wheelbase", `${wb} mm`],
          ["Length", `${bodyL} mm`],
          ["Height", `${bodyH} mm`],
          ["Track Width", `${bodyW} mm`],
          ["Ground Clr", `${gc} mm`],
          ["OH Front", `${oh_f} mm`],
          ["OH Rear", `${oh_r} mm`],
          ["Curb Wt", `~1520 kg`],
          ["Material", "UHSS/Al"],
        ])}
      </>
    );
  };

  /* ═══════ BUILDING ═══════ */
  const drawBuilding = () => {
    const floors = Number(params.floors || 10);
    const height = Number(params.height || floors * 3200);
    const bwidth = Number(params.width || 18000);
    const depth = Number(params.depth || 12000);
    const floorH = height / floors;

    const evX = margin + 5, evY = margin + 25, evW = 320, evH = 380;
    const evScale = Math.min(evW / bwidth, evH / height) * 0.75;
    const eCx = evX + evW / 2;
    const eBaseY = evY + evH - 30;

    const seX = evX + evW + 25, seW = 180, seH = 380;
    const seScale = Math.min(seW / depth, seH / height) * 0.75;
    const seCx = seX + seW / 2;

    const fpX = seX + seW + 25, fpW = 220, fpH = 160, fpY = evY;
    const fpScale = Math.min(fpW / bwidth, fpH / depth) * 0.65;
    const fpCx = fpX + fpW / 2, fpCy = fpY + fpH / 2;

    const secYStart = fpY + fpH + 35;
    const secH = 160;

    return (
      <>
        {/* ── FRONT ELEVATION ── */}
        <text x={evX} y={evY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">FRONT ELEVATION</text>
        <rect x={evX} y={evY} width={evW} height={evH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Building outline */}
        <rect x={eCx - bwidth*evScale/2} y={eBaseY - height*evScale} width={bwidth*evScale} height={height*evScale}
          fill="none" stroke="#22d3ee" strokeWidth="1.5" />

        {/* Floors with windows */}
        {Array.from({ length: floors }).map((_, f) => {
          const fy = eBaseY - (f + 1) * floorH * evScale;
          const numWin = Math.max(3, Math.min(6, Math.floor(bwidth / 3000)));
          return (
            <g key={f}>
              {/* Floor slab */}
              <line x1={eCx - bwidth*evScale/2} y1={fy} x2={eCx + bwidth*evScale/2} y2={fy}
                stroke="#334155" strokeWidth={f === 0 ? "1" : "0.4"} strokeDasharray={f === 0 ? "none" : "3 2"} />
              <text x={eCx - bwidth*evScale/2 - 8} y={fy + 4} textAnchor="end" fill="#475569" fontSize="6" fontFamily="monospace">{f + 1}F</text>

              {/* Windows - different style for ground floor */}
              {f === 0 ? (
                // Entrance
                <g>
                  <rect x={eCx - bwidth*evScale*0.08} y={fy + 2} width={bwidth*evScale*0.16} height={floorH*evScale - 4} rx={1} fill="none" stroke="#60a5fa" strokeWidth="0.8" />
                  <line x1={eCx} y1={fy + 2} x2={eCx} y2={fy + floorH*evScale - 2} stroke="#60a5fa" strokeWidth="0.4" />
                  <text x={eCx} y={fy + floorH*evScale + 8} textAnchor="middle" fill="#475569" fontSize="5" fontFamily="monospace">ENTRANCE</text>
                </g>
              ) : (
                Array.from({ length: numWin }).map((_, wi) => {
                  const spacing = bwidth * evScale / (numWin + 1);
                  const wx = eCx - bwidth*evScale/2 + spacing * (wi + 1);
                  const winH = floorH * evScale * 0.55;
                  const winW = spacing * 0.55;
                  return (
                    <g key={wi}>
                      <rect x={wx - winW/2} y={fy + (floorH*evScale - winH) * 0.45} width={winW} height={winH} fill="none" stroke="#60a5fa" strokeWidth="0.5" />
                      {/* Mullion */}
                      <line x1={wx} y1={fy + (floorH*evScale - winH) * 0.45} x2={wx} y2={fy + (floorH*evScale - winH) * 0.45 + winH} stroke="#334155" strokeWidth="0.3" />
                    </g>
                  );
                })
              )}
            </g>
          );
        })}

        {/* Parapet */}
        <rect x={eCx - bwidth*evScale/2 - 2} y={eBaseY - height*evScale - 4} width={bwidth*evScale + 4} height={4} fill="none" stroke="#22d3ee" strokeWidth="0.6" />

        {/* Foundation hatching */}
        {crossHatch(eCx - bwidth*evScale/2, eBaseY, bwidth*evScale, 8, 3, "#57534e")}

        {/* Ground line */}
        <line x1={evX + 5} y1={eBaseY} x2={evX + evW - 5} y2={eBaseY} stroke="#4ade80" strokeWidth="1" strokeDasharray="8 4" />
        <text x={evX + 8} y={eBaseY + 10} fill="#4ade80" fontSize="6" fontFamily="monospace">GL ±0.000</text>

        {/* Dimensions */}
        {dimLine(eCx + bwidth*evScale/2 + 14, eBaseY, eCx + bwidth*evScale/2 + 14, eBaseY - height*evScale, `${(height/1000).toFixed(1)}m`)}
        {dimLine(eCx - bwidth*evScale/2, eBaseY + 16, eCx + bwidth*evScale/2, eBaseY + 16, `${(bwidth/1000).toFixed(1)}m`, "#22d3ee")}

        {/* Grid lines with labels */}
        {Array.from({ length: Math.min(5, Math.floor(bwidth / 3000) + 1) }).map((_, i) => {
          const gx = eCx - bwidth*evScale/2 + i * bwidth*evScale / Math.min(4, Math.floor(bwidth / 3000));
          return (
            <g key={i}>
              <circle cx={gx} cy={eBaseY + 30} r={6} fill="none" stroke="#94a3b8" strokeWidth="0.5" />
              <text x={gx} y={eBaseY + 33} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">{String.fromCharCode(65 + i)}</text>
            </g>
          );
        })}

        {/* ── SIDE ELEVATION ── */}
        <text x={seX} y={evY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SIDE ELEVATION</text>
        <rect x={seX} y={evY} width={seW} height={seH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        <rect x={seCx - depth*seScale/2} y={eBaseY - height*seScale} width={depth*seScale} height={height*seScale}
          fill="none" stroke="#22d3ee" strokeWidth="1.2" />
        {Array.from({ length: floors }).map((_, f) => {
          const fy = eBaseY - (f + 1) * floorH * seScale;
          return (
            <g key={f}>
              <line x1={seCx - depth*seScale/2} y1={fy} x2={seCx + depth*seScale/2} y2={fy} stroke="#334155" strokeWidth="0.4" strokeDasharray="3 2" />
              {Array.from({ length: 3 }).map((_, wi) => {
                const spacing = depth * seScale / 4;
                const wx = seCx - depth*seScale/2 + spacing * (wi + 1);
                return <rect key={wi} x={wx - spacing*0.25} y={fy + floorH*seScale*0.2} width={spacing*0.5} height={floorH*seScale*0.5} fill="none" stroke="#60a5fa" strokeWidth="0.4" />;
              })}
            </g>
          );
        })}
        {dimLine(seCx - depth*seScale/2, eBaseY + 16, seCx + depth*seScale/2, eBaseY + 16, `${(depth/1000).toFixed(1)}m`, "#f59e0b")}
        {crossHatch(seCx - depth*seScale/2, eBaseY, depth*seScale, 8, 3, "#57534e")}

        {/* ── FLOOR PLAN ── */}
        <text x={fpX} y={fpY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">TYPICAL FLOOR PLAN</text>
        <rect x={fpX} y={fpY} width={fpW} height={fpH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Outer walls - thick */}
        <rect x={fpCx - bwidth*fpScale/2} y={fpCy - depth*fpScale/2} width={bwidth*fpScale} height={depth*fpScale}
          fill="none" stroke="#22d3ee" strokeWidth="2" />

        {/* Column grid */}
        {[[-0.4, -0.4], [0, -0.4], [0.4, -0.4], [-0.4, 0], [0, 0], [0.4, 0], [-0.4, 0.4], [0, 0.4], [0.4, 0.4]].map(([cx, cy], i) => (
          <g key={i}>
            <rect x={fpCx + cx*bwidth*fpScale/2 - 3} y={fpCy + cy*depth*fpScale/2 - 3} width={6} height={6} fill="#e2b340" stroke="#e2b340" strokeWidth="0.5" />
          </g>
        ))}

        {/* Interior walls */}
        <line x1={fpCx} y1={fpCy - depth*fpScale/2} x2={fpCx} y2={fpCy + depth*fpScale/2} stroke="#475569" strokeWidth="1" />
        <line x1={fpCx - bwidth*fpScale/2} y1={fpCy} x2={fpCx + bwidth*fpScale/2} y2={fpCy} stroke="#475569" strokeWidth="0.6" strokeDasharray="4 2" />

        {/* Stair core */}
        <rect x={fpCx + bwidth*fpScale*0.2} y={fpCy - depth*fpScale*0.15} width={bwidth*fpScale*0.15} height={depth*fpScale*0.3} fill="none" stroke="#f97316" strokeWidth="0.6" />
        <text x={fpCx + bwidth*fpScale*0.275} y={fpCy + 3} textAnchor="middle" fill="#f97316" fontSize="5" fontFamily="monospace">CORE</text>

        {/* Elevator */}
        <rect x={fpCx + bwidth*fpScale*0.22} y={fpCy - depth*fpScale*0.1} width={bwidth*fpScale*0.05} height={depth*fpScale*0.08} fill="none" stroke="#f97316" strokeWidth="0.4" />
        <line x1={fpCx + bwidth*fpScale*0.22} y1={fpCy - depth*fpScale*0.1}
          x2={fpCx + bwidth*fpScale*0.27} y2={fpCy - depth*fpScale*0.02} stroke="#f97316" strokeWidth="0.3" />

        {/* Room labels */}
        <text x={fpCx - bwidth*fpScale*0.2} y={fpCy - depth*fpScale*0.15} fill="#475569" fontSize="6" fontFamily="monospace">OFFICE</text>
        <text x={fpCx - bwidth*fpScale*0.2} y={fpCy + depth*fpScale*0.2} fill="#475569" fontSize="6" fontFamily="monospace">MEETING</text>

        {/* Grid axis labels */}
        {["A", "B", "C"].map((l, i) => {
          const gx = fpCx - bwidth*fpScale/2 + i * bwidth*fpScale/2;
          return <g key={l}>
            <circle cx={gx} cy={fpCy + depth*fpScale/2 + 12} r={5} fill="none" stroke="#94a3b8" strokeWidth="0.4" />
            <text x={gx} y={fpCy + depth*fpScale/2 + 15} textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">{l}</text>
          </g>;
        })}

        {/* ── SECTION A-A ── */}
        <text x={fpX} y={secYStart - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SECTION A-A</text>
        <rect x={fpX} y={secYStart} width={fpW} height={secH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {(() => {
          const sH = secH - 20;
          const sFloorH = sH / Math.min(floors, 8);
          return Array.from({ length: Math.min(floors, 8) }).map((_, f) => {
            const sy = secYStart + secH - 10 - (f + 1) * sFloorH;
            return (
              <g key={f}>
                {/* Slab */}
                <rect x={fpX + 15} y={sy} width={fpW - 30} height={3} fill="#475569" />
                {/* Columns */}
                <rect x={fpX + 18} y={sy + 3} width={4} height={sFloorH - 3} fill="none" stroke="#22d3ee" strokeWidth="0.5" />
                <rect x={fpX + fpW - 22} y={sy + 3} width={4} height={sFloorH - 3} fill="none" stroke="#22d3ee" strokeWidth="0.5" />
                {/* Level label */}
                <text x={fpX + 10} y={sy + sFloorH/2 + 3} fill="#475569" fontSize="5" fontFamily="monospace">{f + 1}F</text>
                {/* Wall hatching */}
                {crossHatch(fpX + 18, sy + 3, 4, sFloorH - 3, 2, "#1e3a5f")}
              </g>
            );
          });
        })()}

        {/* Foundation in section */}
        {crossHatch(fpX + 12, secYStart + secH - 10, fpW - 24, 8, 2.5, "#57534e")}

        {renderSpecsTable([
          ["Floors", `${floors}`],
          ["Height", `${(height/1000).toFixed(1)} m`],
          ["Width", `${(bwidth/1000).toFixed(1)} m`],
          ["Depth", `${(depth/1000).toFixed(1)} m`],
          ["Floor Ht", `${(floorH/1000).toFixed(1)} m`],
          ["Structure", "RC Frame"],
          ["Foundation", "Pile/Raft"],
          ["Facade", "Curtain Wall"],
          ["Fire Rating", "2 Hours"],
        ])}
      </>
    );
  };

  /* ═══════ MACHINE ═══════ */
  const drawMachine = () => {
    const gearRatio = Number(params.gearRatio || 2);
    const rpm = Number(params.rpm || 500);
    const teeth1 = Number(params.teeth1 || 18);
    const teeth2 = Math.round(teeth1 * gearRatio);
    const mod = Number(params.module || 2.5);
    const cd = Number(params.centerDistance || (teeth1 + teeth2) * mod / 2);
    const material = String(params.material || "42CrMo4");

    const gR1 = 40, gR2 = gR1 * gearRatio;
    const avX = margin + 5, avY = margin + 25, avW = 460, avH = 280;
    const aCx = avX + avW * 0.3, aCy = avY + avH / 2;

    const dvX = avX + avW + 20, dvY = avY, dvW = 210, dvH = 170;
    const svX = dvX, svY = dvY + dvH + 25, svW = 210, svH = 155;

    return (
      <>
        {/* ── ASSEMBLY ── */}
        <text x={avX} y={avY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">ASSEMBLY — GEAR TRAIN</text>
        <rect x={avX} y={avY} width={avW} height={avH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Motor housing */}
        <rect x={avX + 12} y={aCy - 28} width={45} height={56} rx={3} fill="none" stroke="#94a3b8" strokeWidth="1" />
        {crossHatch(avX + 13, aCy - 27, 43, 54, 4, "#1e3a5f")}
        <text x={avX + 34} y={aCy - 32} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">MOTOR</text>

        {/* Input shaft with keyway detail */}
        <line x1={avX + 57} y1={aCy - 3} x2={aCx - gR1 - 2} y2={aCy - 3} stroke="#94a3b8" strokeWidth="2" />
        <line x1={avX + 57} y1={aCy + 3} x2={aCx - gR1 - 2} y2={aCy + 3} stroke="#94a3b8" strokeWidth="2" />
        {/* Centerline */}
        <line x1={avX + 10} y1={aCy} x2={avX + avW - 10} y2={aCy} stroke="#334155" strokeWidth="0.4" strokeDasharray="8 3 2 3" />

        {/* Drive gear - involute teeth representation */}
        <circle cx={aCx} cy={aCy} r={gR1} fill="none" stroke="#22d3ee" strokeWidth="1.2" />
        <circle cx={aCx} cy={aCy} r={gR1 * 0.85} fill="none" stroke="#22d3ee" strokeWidth="0.4" strokeDasharray="2 2" />
        <circle cx={aCx} cy={aCy} r={gR1 * 0.3} fill="none" stroke="#22d3ee" strokeWidth="0.8" />
        <circle cx={aCx} cy={aCy} r={gR1 * 1.08} fill="none" stroke="#22d3ee" strokeWidth="0.3" strokeDasharray="1 2" />
        {/* Teeth */}
        {Array.from({ length: teeth1 }).map((_, i) => {
          const a = (i / teeth1) * Math.PI * 2;
          const r1 = gR1 * 0.88, r2 = gR1 * 1.06;
          return <line key={i} x1={aCx + Math.cos(a)*r1} y1={aCy + Math.sin(a)*r1}
            x2={aCx + Math.cos(a)*r2} y2={aCy + Math.sin(a)*r2} stroke="#22d3ee" strokeWidth="0.7" />;
        })}
        <text x={aCx} y={aCy - gR1 - 12} textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="monospace" fontWeight="bold">Z₁ = {teeth1}T</text>
        {/* Keyway */}
        <rect x={aCx - 2} y={aCy - gR1*0.3 - 3} width={4} height={4} fill="none" stroke="#22d3ee" strokeWidth="0.5" />

        {/* Driven gear */}
        <circle cx={aCx + gR1 + gR2} cy={aCy} r={gR2} fill="none" stroke="#f59e0b" strokeWidth="1.2" />
        <circle cx={aCx + gR1 + gR2} cy={aCy} r={gR2 * 0.85} fill="none" stroke="#f59e0b" strokeWidth="0.4" strokeDasharray="2 2" />
        <circle cx={aCx + gR1 + gR2} cy={aCy} r={gR2 * 0.3} fill="none" stroke="#f59e0b" strokeWidth="0.8" />
        <circle cx={aCx + gR1 + gR2} cy={aCy} r={gR2 * 1.06} fill="none" stroke="#f59e0b" strokeWidth="0.3" strokeDasharray="1 2" />
        {Array.from({ length: teeth2 }).map((_, i) => {
          const a = (i / teeth2) * Math.PI * 2;
          const cx2 = aCx + gR1 + gR2;
          const r1 = gR2 * 0.88, r2 = gR2 * 1.06;
          return <line key={i} x1={cx2 + Math.cos(a)*r1} y1={aCy + Math.sin(a)*r1}
            x2={cx2 + Math.cos(a)*r2} y2={aCy + Math.sin(a)*r2} stroke="#f59e0b" strokeWidth="0.7" />;
        })}
        <text x={aCx + gR1 + gR2} y={aCy - gR2 - 12} textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">Z₂ = {teeth2}T</text>

        {/* Bearing symbols */}
        {[aCx - gR1*0.3 - 8, aCx + gR1*0.3 + 4].map((bx, i) => (
          <g key={`b1-${i}`}>
            <polygon points={`${bx},${aCy - 8} ${bx + 6},${aCy - 14} ${bx + 6},${aCy - 2}`} fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            <polygon points={`${bx},${aCy + 8} ${bx + 6},${aCy + 14} ${bx + 6},${aCy + 2}`} fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          </g>
        ))}

        {/* Output shaft */}
        <line x1={aCx + gR1 + gR2*2 + 2} y1={aCy - 3} x2={avX + avW - 15} y2={aCy - 3} stroke="#94a3b8" strokeWidth="2" />
        <line x1={aCx + gR1 + gR2*2 + 2} y1={aCy + 3} x2={avX + avW - 15} y2={aCy + 3} stroke="#94a3b8" strokeWidth="2" />

        {/* Load flywheel */}
        <circle cx={avX + avW - 20} cy={aCy} r={18} fill="none" stroke="#94a3b8" strokeWidth="1" />
        {crossHatch(avX + avW - 38, aCy - 18, 36, 36, 3)}
        <text x={avX + avW - 20} y={aCy + 28} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">FLYWHEEL</text>

        {/* Center distance dimension */}
        {dimLine(aCx, aCy + Math.max(gR2, gR1) + 18, aCx + gR1 + gR2, aCy + Math.max(gR2, gR1) + 18, `C.D. = ${cd.toFixed(1)}mm`, "#4ade80")}

        {/* RPM labels */}
        <text x={avX + 60} y={aCy - 35} fill="#22d3ee" fontSize="8" fontFamily="monospace">IN: {rpm} RPM →</text>
        <text x={avX + avW - 60} y={aCy - 35} textAnchor="end" fill="#f59e0b" fontSize="8" fontFamily="monospace">← OUT: {Math.round(rpm / gearRatio)} RPM</text>

        {/* GD&T callout */}
        {toleranceBox(avX + 15, avY + avH - 22, "⊙", "0.02", "A")}
        {surfaceFinish(aCx + gR1 + gR2 + gR2*0.5, aCy - gR2 + 5, "Ra 1.6")}

        {/* ── DETAIL A — TOOTH PROFILE ── */}
        <text x={dvX} y={dvY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">DETAIL A — INVOLUTE TOOTH</text>
        <rect x={dvX} y={dvY} width={dvW} height={dvH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Accurate involute profile */}
        <path d={`
          M${dvX+30},${dvY+dvH-20}
          L${dvX+42},${dvY+dvH-20}
          L${dvX+48},${dvY+30}
          Q${dvX+52},${dvY+18} ${dvX+60},${dvY+15}
          Q${dvX+68},${dvY+12} ${dvX+76},${dvY+15}
          Q${dvX+84},${dvY+18} ${dvX+88},${dvY+30}
          L${dvX+94},${dvY+dvH-20}
          L${dvX+106},${dvY+dvH-20}
          L${dvX+112},${dvY+30}
          Q${dvX+116},${dvY+18} ${dvX+124},${dvY+15}
        `} fill="none" stroke="#22d3ee" strokeWidth="1.3" />

        {/* Reference circles */}
        <line x1={dvX+20} y1={dvY+40} x2={dvX+dvW-10} y2={dvY+40} stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="6 3" />
        <text x={dvX+dvW-8} y={dvY+38} fill="#f59e0b" fontSize="6" fontFamily="monospace" textAnchor="end">PCD</text>
        <line x1={dvX+20} y1={dvY+15} x2={dvX+dvW-10} y2={dvY+15} stroke="#4ade80" strokeWidth="0.4" strokeDasharray="3 2" />
        <text x={dvX+dvW-8} y={dvY+13} fill="#4ade80" fontSize="6" fontFamily="monospace" textAnchor="end">TIP ⌀</text>
        <line x1={dvX+20} y1={dvY+dvH-20} x2={dvX+dvW-10} y2={dvY+dvH-20} stroke="#ef4444" strokeWidth="0.4" strokeDasharray="3 2" />
        <text x={dvX+dvW-8} y={dvY+dvH-22} fill="#ef4444" fontSize="6" fontFamily="monospace" textAnchor="end">ROOT ⌀</text>

        {/* Tooth dims */}
        {dimLine(dvX + 48, dvY + dvH - 10, dvX + 88, dvY + dvH - 10, `p = ${(Math.PI * mod).toFixed(1)}`, "#e2b340")}
        {dimLine(dvX + dvW - 20, dvY + 15, dvX + dvW - 20, dvY + dvH - 20, `h = ${(2.25 * mod).toFixed(1)}`, "#4ade80")}

        {/* Pressure angle */}
        <path d={`M${dvX+68},${dvY+40} L${dvX+60},${dvY+15}`} fill="none" stroke="#f97316" strokeWidth="0.6" strokeDasharray="2 1" />
        <text x={dvX+52} y={dvY+28} fill="#f97316" fontSize="6" fontFamily="monospace">α=20°</text>

        {/* Hatching in tooth root */}
        {crossHatch(dvX + 42, dvY + 40, 52, dvH - 60, 3)}

        {/* ── SECTION B-B (SHAFT) ── */}
        <text x={svX} y={svY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SECTION B-B (SHAFT)</text>
        <rect x={svX} y={svY} width={svW} height={svH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Outer gear profile */}
        <circle cx={svX+svW/2} cy={svY+svH/2} r={48} fill="none" stroke="#22d3ee" strokeWidth="1" />
        <circle cx={svX+svW/2} cy={svY+svH/2} r={42} fill="none" stroke="#22d3ee" strokeWidth="0.3" strokeDasharray="2 2" />

        {/* Shaft bore */}
        <circle cx={svX+svW/2} cy={svY+svH/2} r={14} fill="none" stroke="#f59e0b" strokeWidth="1" />

        {/* Keyway */}
        <rect x={svX+svW/2 - 3} y={svY+svH/2 - 16} width={6} height={5} fill="none" stroke="#f59e0b" strokeWidth="0.7" />

        {/* Cross-hatching in section */}
        {Array.from({ length: 20 }).map((_, i) => {
          const a = (i / 20) * Math.PI * 2;
          return <line key={i}
            x1={svX+svW/2 + Math.cos(a) * 16} y1={svY+svH/2 + Math.sin(a) * 16}
            x2={svX+svW/2 + Math.cos(a) * 40} y2={svY+svH/2 + Math.sin(a) * 40}
            stroke="#1e3a5f" strokeWidth="0.25" />;
        })}

        {/* Dimensions */}
        {dimLine(svX+svW/2 - 48, svY+svH/2 + 56, svX+svW/2 + 48, svY+svH/2 + 56, `⌀${(teeth1 * mod).toFixed(0)}`, "#22d3ee")}
        {dimLine(svX+svW/2 - 14, svY+svH/2 + 68, svX+svW/2 + 14, svY+svH/2 + 68, `⌀${(mod * 8).toFixed(0)} H7`, "#f59e0b")}

        {/* GD&T */}
        {toleranceBox(svX + 10, svY + svH - 20, "◎", "0.01", "B")}

        {renderSpecsTable([
          ["Gear Ratio", `${gearRatio}:1`],
          ["Module", `${mod} mm`],
          ["Pressure ∠", "20°"],
          ["Z₁ / Z₂", `${teeth1} / ${teeth2}`],
          ["Input RPM", `${rpm}`],
          ["Output RPM", `${Math.round(rpm / gearRatio)}`],
          ["C.D.", `${cd.toFixed(1)} mm`],
          ["Material", material],
          ["Heat Treat", "Case Harden"],
        ])}
      </>
    );
  };

  /* ═══════ CIRCUIT ═══════ */
  const drawCircuit = () => {
    const voltage = Number(params.voltage || 9);
    const r1 = Number(params.r1 || 100);
    const r2 = Number(params.r2 || 220);
    const totalR = r1 + r2;
    const current = voltage / totalR * 1000;

    const scX = margin + 5, scY = margin + 25, scW = 420, scH = 300;
    const cx = scX + scW / 2, cy = scY + scH / 2;

    const pcbX = scX + scW + 30, pcbY = scY, pcbW = 270, pcbH = 200;

    return (
      <>
        {/* ── SCHEMATIC ── */}
        <text x={scX} y={scY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SCHEMATIC DIAGRAM</text>
        <rect x={scX} y={scY} width={scW} height={scH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Grid dots */}
        {Array.from({ length: 15 }).map((_, gx) =>
          Array.from({ length: 10 }).map((_, gy) => (
            <circle key={`${gx}-${gy}`} cx={scX + 20 + gx * 26} cy={scY + 20 + gy * 28} r={0.5} fill="#1e293b" />
          ))
        )}

        {/* Battery symbol - IEC standard */}
        <line x1={scX + 70} y1={cy - 100} x2={scX + 70} y2={cy - 18} stroke="#22d3ee" strokeWidth="1.5" />
        <line x1={scX + 54} y1={cy - 18} x2={scX + 86} y2={cy - 18} stroke="#22d3ee" strokeWidth="2.5" />
        <line x1={scX + 58} y1={cy - 8} x2={scX + 82} y2={cy - 8} stroke="#22d3ee" strokeWidth="1.2" />
        <line x1={scX + 54} y1={cy + 2} x2={scX + 86} y2={cy + 2} stroke="#22d3ee" strokeWidth="2.5" />
        <line x1={scX + 58} y1={cy + 12} x2={scX + 82} y2={cy + 12} stroke="#22d3ee" strokeWidth="1.2" />
        <line x1={scX + 70} y1={cy + 12} x2={scX + 70} y2={cy + 100} stroke="#22d3ee" strokeWidth="1.5" />

        <text x={scX + 92} y={cy - 10} fill="#94a3b8" fontSize="9" fontFamily="monospace">V₁</text>
        <text x={scX + 92} y={cy + 4} fill="#e2b340" fontSize="9" fontFamily="monospace" fontWeight="bold">{voltage}V</text>
        <text x={scX + 70} y={cy - 24} textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace">+</text>
        <text x={scX + 70} y={cy + 24} textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="monospace">−</text>

        {/* Top wire */}
        <line x1={scX + 70} y1={cy - 100} x2={cx - 60} y2={cy - 100} stroke="#22d3ee" strokeWidth="1.5" />

        {/* R1 - IEC rectangle style */}
        <rect x={cx - 60} y={cy - 112} width={80} height={24} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx - 20} y={cy - 96} textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">R₁</text>
        <text x={cx - 20} y={cy - 118} textAnchor="middle" fill="#e2b340" fontSize="8" fontFamily="monospace">{r1}Ω ¼W 5%</text>

        {/* Wire */}
        <line x1={cx + 20} y1={cy - 100} x2={scX + scW - 70} y2={cy - 100} stroke="#22d3ee" strokeWidth="1.5" />
        <line x1={scX + scW - 70} y1={cy - 100} x2={scX + scW - 70} y2={cy - 35} stroke="#22d3ee" strokeWidth="1.5" />

        {/* R2 - vertical */}
        <rect x={scX + scW - 82} y={cy - 35} width={24} height={70} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={scX + scW - 48} y={cy} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">R₂</text>
        <text x={scX + scW - 48} y={cy + 14} fill="#e2b340" fontSize="8" fontFamily="monospace">{r2}Ω ¼W 5%</text>

        <line x1={scX + scW - 70} y1={cy + 35} x2={scX + scW - 70} y2={cy + 50} stroke="#22d3ee" strokeWidth="1.5" />

        {/* LED - triangle + bar */}
        <polygon points={`${scX+scW-82},${cy+50} ${scX+scW-58},${cy+50} ${scX+scW-70},${cy+70}`}
          fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <line x1={scX+scW-82} y1={cy+70} x2={scX+scW-58} y2={cy+70} stroke="#4ade80" strokeWidth="1.5" />
        {/* Light emission arrows */}
        <line x1={scX+scW-56} y1={cy+55} x2={scX+scW-48} y2={cy+48} stroke="#4ade80" strokeWidth="0.6" markerEnd="url(#dimArrow)" />
        <line x1={scX+scW-54} y1={cy+60} x2={scX+scW-46} y2={cy+53} stroke="#4ade80" strokeWidth="0.6" markerEnd="url(#dimArrow)" />
        <text x={scX+scW-44} y={cy+60} fill="#4ade80" fontSize="8" fontFamily="monospace">D₁ LED</text>

        <line x1={scX+scW-70} y1={cy+70} x2={scX+scW-70} y2={cy+100} stroke="#22d3ee" strokeWidth="1.5" />

        {/* Bottom wire */}
        <line x1={scX+scW-70} y1={cy+100} x2={scX+70} y2={cy+100} stroke="#22d3ee" strokeWidth="1.5" />

        {/* Ground symbols */}
        {[scX+70, scX+scW-70].map((gx, i) => (
          <g key={i}>
            <line x1={gx-8} y1={cy+100} x2={gx+8} y2={cy+100} stroke="#475569" strokeWidth="0.8" />
          </g>
        ))}

        {/* Node dots */}
        {[[scX+70,cy-100],[scX+70,cy+100],[scX+scW-70,cy-100],[scX+scW-70,cy+100]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={3} fill="#22d3ee" />
        ))}

        {/* Current arrow */}
        <text x={cx} y={cy+115} textAnchor="middle" fill="#f97316" fontSize="9" fontFamily="monospace" fontWeight="bold">I = {current.toFixed(2)} mA →</text>

        {/* Net labels */}
        <text x={scX+70} y={cy-106} textAnchor="middle" fill="#475569" fontSize="6" fontFamily="monospace">NET: VCC</text>
        <text x={scX+70} y={cy+112} textAnchor="middle" fill="#475569" fontSize="6" fontFamily="monospace">NET: GND</text>

        {/* ── PCB LAYOUT ── */}
        <text x={pcbX} y={pcbY - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">PCB LAYOUT (TOP COPPER)</text>
        <rect x={pcbX} y={pcbY} width={pcbW} height={pcbH} rx={4} fill="#0d2818" stroke="#1a4a2a" strokeWidth="1.5" />

        {/* Board outline */}
        <rect x={pcbX + 8} y={pcbY + 8} width={pcbW - 16} height={pcbH - 16} rx={2} fill="none" stroke="#2d5a3d" strokeWidth="0.5" strokeDasharray="3 2" />

        {/* Traces - thicker copper paths */}
        <path d={`M${pcbX+30},${pcbY+40} L${pcbX+80},${pcbY+40} L${pcbX+80},${pcbY+pcbH-40} L${pcbX+pcbW-40},${pcbY+pcbH-40}`}
          fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={`M${pcbX+pcbW-40},${pcbY+40} L${pcbX+140},${pcbY+40}`}
          fill="none" stroke="#22d3ee" strokeWidth="2.5" />
        <path d={`M${pcbX+pcbW-40},${pcbY+40} L${pcbX+pcbW-40},${pcbY+pcbH-40}`}
          fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />

        {/* Component footprints - SMD pads */}
        <rect x={pcbX+90} y={pcbY+30} width={40} height={20} rx={2} fill="none" stroke="#f59e0b" strokeWidth="1" />
        <rect x={pcbX+92} y={pcbY+34} width={8} height={12} rx={1} fill="#f59e0b" opacity="0.3" />
        <rect x={pcbX+120} y={pcbY+34} width={8} height={12} rx={1} fill="#f59e0b" opacity="0.3" />
        <text x={pcbX+110} y={pcbY+43} textAnchor="middle" fill="#f59e0b" fontSize="7" fontFamily="monospace">R1</text>
        <text x={pcbX+110} y={pcbY+24} textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="monospace">{r1}Ω</text>

        <rect x={pcbX+160} y={pcbY+30} width={40} height={20} rx={2} fill="none" stroke="#f59e0b" strokeWidth="1" />
        <rect x={pcbX+162} y={pcbY+34} width={8} height={12} rx={1} fill="#f59e0b" opacity="0.3" />
        <rect x={pcbX+190} y={pcbY+34} width={8} height={12} rx={1} fill="#f59e0b" opacity="0.3" />
        <text x={pcbX+180} y={pcbY+43} textAnchor="middle" fill="#f59e0b" fontSize="7" fontFamily="monospace">R2</text>

        {/* LED footprint */}
        <circle cx={pcbX+pcbW-60} cy={pcbY+pcbH-55} r={10} fill="none" stroke="#4ade80" strokeWidth="1" />
        <rect x={pcbX+pcbW-65} y={pcbY+pcbH-60} width={10} height={10} rx={1} fill="#4ade80" opacity="0.2" />
        <text x={pcbX+pcbW-60} y={pcbY+pcbH-38} textAnchor="middle" fill="#4ade80" fontSize="6" fontFamily="monospace">D1</text>

        {/* Mounting holes */}
        {[[18, 18], [pcbW-18, 18], [18, pcbH-18], [pcbW-18, pcbH-18]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={pcbX+x} cy={pcbY+y} r={5} fill="none" stroke="#475569" strokeWidth="0.6" />
            <circle cx={pcbX+x} cy={pcbY+y} r={2.5} fill="none" stroke="#475569" strokeWidth="0.4" />
          </g>
        ))}

        {/* Silkscreen text */}
        <text x={pcbX + pcbW/2} y={pcbY + pcbH - 14} textAnchor="middle" fill="#2d5a3d" fontSize="6" fontFamily="monospace">CDAI-PCB-001 Rev.A</text>

        {/* ── BOM ── */}
        <text x={pcbX} y={pcbY + pcbH + 20} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">BILL OF MATERIALS</text>
        <rect x={pcbX} y={pcbY + pcbH + 26} width={pcbW} height={90} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        {/* Table header line */}
        <line x1={pcbX} y1={pcbY + pcbH + 40} x2={pcbX + pcbW} y2={pcbY + pcbH + 40} stroke="#1e293b" strokeWidth="0.5" />
        {[
          ["#", "REF", "COMPONENT", "VALUE", "PKG"],
          ["1", "V₁", "Battery", `${voltage}V DC`, "—"],
          ["2", "R₁", "Resistor", `${r1}Ω ¼W`, "0805"],
          ["3", "R₂", "Resistor", `${r2}Ω ¼W`, "0805"],
          ["4", "D₁", "LED", "Green 3mm", "THT"],
        ].map((row, ri) => (
          <text key={ri} x={pcbX + 8} y={pcbY + pcbH + 37 + ri * 14}
            fill={ri === 0 ? "#94a3b8" : "#64748b"} fontSize="7" fontFamily="monospace"
            fontWeight={ri === 0 ? "bold" : "normal"}>
            {row[0].padEnd(4)}{row[1].padEnd(6)}{row[2].padEnd(14)}{row[3].padEnd(12)}{row[4]}
          </text>
        ))}

        {renderSpecsTable([
          ["Voltage", `${voltage} V`],
          ["R Total", `${totalR} Ω`],
          ["Current", `${current.toFixed(2)} mA`],
          ["Power", `${(voltage * current / 1000 * 1000).toFixed(1)} mW`],
          ["Circuit", "Series"],
          ["PCB Size", "50×35 mm"],
          ["Layers", "2"],
          ["Finish", "HASL"],
          ["Standard", "IPC-2221"],
        ])}
      </>
    );
  };

  const renderSpecsTable = (rows: string[][]) => {
    const tX = margin, tY = h - 60;
    const colW = 95;
    const cols = 3;
    return (
      <g>
        <rect x={tX} y={tY} width={colW * cols} height={48} fill="none" stroke="#1e293b" strokeWidth="1" />
        <line x1={tX} y1={tY + 12} x2={tX + colW * cols} y2={tY + 12} stroke="#1e293b" strokeWidth="0.5" />
        <text x={tX + 5} y={tY + 10} fill="#94a3b8" fontSize="7" fontFamily="monospace" fontWeight="bold">SPECIFICATIONS</text>
        {rows.map((r, i) => (
          <text key={i} x={tX + 5 + (i % cols) * colW} y={tY + 24 + Math.floor(i / cols) * 11}
            fill="#64748b" fontSize="6.5" fontFamily="monospace">
            {r[0]}: <tspan fill="#94a3b8" fontWeight="bold">{r[1]}</tspan>
          </text>
        ))}
      </g>
    );
  };

  const renderers: Record<string, () => JSX.Element> = {
    vehicle: drawVehicle,
    building: drawBuilding,
    machine: drawMachine,
    circuit: drawCircuit,
    robotics: () => <ExtendedDomainDrawing type="robotics" params={params} width={w} height={h} margin={margin} />,
    aerospace: () => <ExtendedDomainDrawing type="aerospace" params={params} width={w} height={h} margin={margin} />,
    marine: () => <ExtendedDomainDrawing type="marine" params={params} width={w} height={h} margin={margin} />,
    biomedical: () => <ExtendedDomainDrawing type="biomedical" params={params} width={w} height={h} margin={margin} />,
    industrial: () => <ExtendedDomainDrawing type="industrial" params={params} width={w} height={h} margin={margin} />,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#060a14] rounded-xl border border-border overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-[#0a0e1a]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
            Engineering Drawing — {type}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">ISO 128 · ASME Y14.5 · 1st Angle</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <marker id="dimArrow" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <path d="M0,0 L8,2.5 L0,5" fill="#e2b340" />
          </marker>
          <marker id="dimArrowR" markerWidth="8" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse">
            <path d="M8,0 L0,2.5 L8,5" fill="#e2b340" />
          </marker>
        </defs>

        {/* Drawing border - double line */}
        <rect x={6} y={6} width={w - 12} height={h - 12} fill="none" stroke="#1e293b" strokeWidth="1.5" />
        <rect x={10} y={10} width={w - 20} height={h - 20} fill="none" stroke="#1e293b" strokeWidth="0.4" />

        {renderers[type]?.()}

        {/* Title block - professional */}
        <rect x={w - 290} y={h - 60} width={278} height={48} fill="none" stroke="#1e293b" strokeWidth="1.2" />
        <line x1={w - 290} y1={h - 46} x2={w - 12} y2={h - 46} stroke="#1e293b" strokeWidth="0.5" />
        <line x1={w - 290} y1={h - 32} x2={w - 12} y2={h - 32} stroke="#1e293b" strokeWidth="0.5" />
        <line x1={w - 155} y1={h - 60} x2={w - 155} y2={h - 12} stroke="#1e293b" strokeWidth="0.5" />

        <text x={w - 285} y={h - 49} fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">CDAI Engineering Optimizer</text>
        <text x={w - 285} y={h - 36} fill="#475569" fontSize="7" fontFamily="monospace">DWG: {type.toUpperCase()}-001</text>
        <text x={w - 285} y={h - 22} fill="#334155" fontSize="6.5" fontFamily="monospace">Drawn: AI   Checked: —</text>

        <text x={w - 150} y={h - 49} fill="#94a3b8" fontSize="7" fontFamily="monospace" fontWeight="bold">Rev: A</text>
        <text x={w - 150} y={h - 36} fill="#475569" fontSize="7" fontFamily="monospace">{new Date().toLocaleDateString()}</text>
        <text x={w - 150} y={h - 22} fill="#334155" fontSize="6.5" fontFamily="monospace">Scale: NTS</text>
        <text x={w - 80} y={h - 22} fill="#334155" fontSize="6.5" fontFamily="monospace">Sheet 1/1</text>

        {/* Projection symbol (1st angle) */}
        <g transform={`translate(${w - 60}, ${h - 54})`}>
          <circle cx={0} cy={0} r={5} fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          <circle cx={0} cy={0} r={2} fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1={-8} y1={0} x2={8} y2={0} stroke="#94a3b8" strokeWidth="0.3" />
          <line x1={0} y1={-8} x2={0} y2={8} stroke="#94a3b8" strokeWidth="0.3" />
        </g>
      </svg>
    </motion.div>
  );
}
