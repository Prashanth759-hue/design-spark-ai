import { motion } from "framer-motion";

interface EngineeringDrawingProps {
  type: "vehicle" | "building" | "machine" | "circuit";
  params?: Record<string, number | string>;
}

export function EngineeringDrawing({ type, params = {} }: EngineeringDrawingProps) {
  const w = 900;
  const h = 600;
  const margin = 50;

  /* ═══════ VEHICLE: Side + Top + Front views ═══════ */
  const drawVehicle = () => {
    const wb = Number(params.wheelbase || 2850);
    const bodyL = Number(params.bodyLength || 4500);
    const bodyH = Number(params.bodyHeight || 1200);
    const bodyW = Number(params.trackWidth || 1580);

    // --- Side View (top-left) ---
    const svW = 380, svH = 200, svX = margin, svY = margin + 20;
    const sScale = svW / bodyL;
    const sCx = svX + svW / 2, sCy = svY + svH * 0.6;

    // --- Front View (top-right) ---
    const fvW = 200, fvH = 200, fvX = w - margin - fvW, fvY = margin + 20;
    const fScale = Math.min(fvW / bodyW, fvH / bodyH) * 0.7;
    const fCx = fvX + fvW / 2, fCy = fvY + fvH * 0.55;

    // --- Top View (bottom) ---
    const tvW = 380, tvH = 180, tvX = margin, tvY = h - margin - tvH - 40;
    const tScale = tvW / bodyL;
    const tCx = tvX + tvW / 2, tCy = tvY + tvH / 2;

    return (
      <>
        {/* ── Side View ── */}
        <text x={svX} y={svY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SIDE VIEW</text>
        <rect x={svX} y={svY} width={svW} height={svH} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <path d={`M${sCx - bodyL*sScale/2},${sCy + 15} L${sCx - bodyL*sScale/2},${sCy - bodyH*sScale*0.3} Q${sCx - bodyL*sScale*0.3},${sCy - bodyH*sScale*0.8} ${sCx},${sCy - bodyH*sScale*0.85} Q${sCx + bodyL*sScale*0.2},${sCy - bodyH*sScale*0.8} ${sCx + bodyL*sScale*0.35},${sCy - bodyH*sScale*0.3} L${sCx + bodyL*sScale/2},${sCy - bodyH*sScale*0.15} L${sCx + bodyL*sScale/2},${sCy + 15} Z`}
          fill="none" stroke="#22d3ee" strokeWidth="1.5" />
        {[-wb*sScale/2, wb*sScale/2].map((x, i) => (
          <g key={i}><circle cx={sCx + x} cy={sCy + 24} r={14} fill="none" stroke="#64748b" strokeWidth="1.5" /><circle cx={sCx + x} cy={sCy + 24} r={8} fill="none" stroke="#475569" strokeWidth="0.5" /></g>
        ))}
        {/* Wheelbase dim */}
        <line x1={sCx - wb*sScale/2} y1={sCy + 50} x2={sCx + wb*sScale/2} y2={sCy + 50} stroke="#f59e0b" strokeWidth="0.8" markerEnd="url(#arrow)" markerStart="url(#arrowR)" />
        <text x={sCx} y={sCy + 64} textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace">WB {wb}</text>
        {/* Overall length */}
        <line x1={sCx - bodyL*sScale/2} y1={sCy + 78} x2={sCx + bodyL*sScale/2} y2={sCy + 78} stroke="#22d3ee" strokeWidth="0.8" markerEnd="url(#arrow)" markerStart="url(#arrowR)" />
        <text x={sCx} y={sCy + 92} textAnchor="middle" fill="#22d3ee" fontSize="9" fontFamily="monospace">L {bodyL}</text>
        {/* Height */}
        <line x1={sCx + bodyL*sScale/2 + 12} y1={sCy + 15} x2={sCx + bodyL*sScale/2 + 12} y2={sCy - bodyH*sScale*0.85} stroke="#4ade80" strokeWidth="0.8" markerEnd="url(#arrowU)" markerStart="url(#arrowD)" />
        <text x={sCx + bodyL*sScale/2 + 18} y={sCy - bodyH*sScale*0.35} fill="#4ade80" fontSize="9" fontFamily="monospace" transform={`rotate(-90,${sCx + bodyL*sScale/2 + 22},${sCy - bodyH*sScale*0.35})`}>H {bodyH}</text>

        {/* ── Front View ── */}
        <text x={fvX} y={fvY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">FRONT VIEW</text>
        <rect x={fvX} y={fvY} width={fvW} height={fvH} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x={fCx - bodyW*fScale/2} y={fCy - bodyH*fScale*0.6} width={bodyW*fScale} height={bodyH*fScale*0.45} rx={4} fill="none" stroke="#22d3ee" strokeWidth="1.2" />
        <rect x={fCx - bodyW*fScale*0.35} y={fCy - bodyH*fScale*0.9} width={bodyW*fScale*0.7} height={bodyH*fScale*0.35} rx={3} fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="3 2" />
        {[-1, 1].map(s => <circle key={s} cx={fCx + s * bodyW*fScale/2 * 0.85} cy={fCy + 10} r={12} fill="none" stroke="#64748b" strokeWidth="1.2" />)}
        <line x1={fCx - bodyW*fScale/2} y1={fCy + 35} x2={fCx + bodyW*fScale/2} y2={fCy + 35} stroke="#f59e0b" strokeWidth="0.8" markerEnd="url(#arrow)" markerStart="url(#arrowR)" />
        <text x={fCx} y={fCy + 48} textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace">W {bodyW}</text>

        {/* ── Top View ── */}
        <text x={tvX} y={tvY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">TOP VIEW (PLAN)</text>
        <rect x={tvX} y={tvY} width={tvW} height={tvH} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x={tCx - bodyL*tScale/2} y={tCy - bodyW*tScale*0.25} width={bodyL*tScale} height={bodyW*tScale*0.5} rx={bodyL*tScale*0.04} fill="none" stroke="#22d3ee" strokeWidth="1.2" />
        {/* Wheel positions */}
        {[[-wb*tScale/2, -bodyW*tScale*0.28], [-wb*tScale/2, bodyW*tScale*0.22], [wb*tScale/2, -bodyW*tScale*0.28], [wb*tScale/2, bodyW*tScale*0.22]].map(([x, y], i) => (
          <rect key={i} x={tCx + x - 8} y={tCy + y} width={16} height={6} rx={2} fill="none" stroke="#64748b" strokeWidth="1" />
        ))}
        {/* CL */}
        <line x1={tCx - bodyL*tScale/2 - 10} y1={tCy} x2={tCx + bodyL*tScale/2 + 10} y2={tCy} stroke="#334155" strokeWidth="0.5" strokeDasharray="6 3" />
        <text x={tCx + bodyL*tScale/2 + 14} y={tCy + 3} fill="#334155" fontSize="7" fontFamily="monospace">CL</text>

        {/* ── Specs Table ── */}
        {renderSpecsTable([
          ["Wheelbase", `${wb} mm`],
          ["Length", `${bodyL} mm`],
          ["Height", `${bodyH} mm`],
          ["Track Width", `${bodyW} mm`],
          ["Scale", `1:${Math.round(1/sScale)}`],
        ])}
      </>
    );
  };

  /* ═══════ BUILDING: Front Elevation + Side Elevation + Floor Plan ═══════ */
  const drawBuilding = () => {
    const floors = Number(params.floors || 5);
    const height = Number(params.height || floors * 3200);
    const bwidth = Number(params.width || 15000);
    const depth = Number(params.depth || 10000);

    const evW = 300, evH = 340, evX = margin, evY = margin + 20;
    const evScale = Math.min(evW / bwidth, evH / height) * 0.8;
    const eCx = evX + evW / 2;
    const eBaseY = evY + evH - 20;

    // Side elevation
    const seX = evX + evW + 40, seW = 180, seH = 340;
    const seScale = Math.min(seW / depth, seH / height) * 0.8;
    const seCx = seX + seW / 2;

    // Floor plan
    const fpX = seX + seW + 40, fpW = 200, fpH = 160, fpY = evY;
    const fpScale = Math.min(fpW / bwidth, fpH / depth) * 0.7;
    const fpCx = fpX + fpW / 2, fpCy = fpY + fpH / 2;

    const floorH = height / floors;

    return (
      <>
        {/* ── Front Elevation ── */}
        <text x={evX} y={evY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">FRONT ELEVATION</text>
        <rect x={evX} y={evY} width={evW} height={evH} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x={eCx - bwidth*evScale/2} y={eBaseY - height*evScale} width={bwidth*evScale} height={height*evScale} fill="none" stroke="#22d3ee" strokeWidth="1.5" />
        {Array.from({ length: floors }).map((_, f) => {
          const fy = eBaseY - (f + 1) * floorH * evScale;
          return (
            <g key={f}>
              <line x1={eCx - bwidth*evScale/2} y1={fy} x2={eCx + bwidth*evScale/2} y2={fy} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 2" />
              <text x={eCx - bwidth*evScale/2 - 6} y={fy + 3} textAnchor="end" fill="#64748b" fontSize="7" fontFamily="monospace">F{f + 1}</text>
              {Array.from({ length: 4 }).map((_, wi) => {
                const wx = eCx - bwidth*evScale*0.35 + wi * bwidth*evScale*0.23;
                const winH = floorH * evScale * 0.5;
                const winW = bwidth*evScale*0.12;
                return <rect key={wi} x={wx} y={fy + (floorH*evScale - winH)/2} width={winW} height={winH} fill="none" stroke="#60a5fa" strokeWidth="0.6" />;
              })}
            </g>
          );
        })}
        {/* Height dim */}
        <line x1={eCx + bwidth*evScale/2 + 12} y1={eBaseY} x2={eCx + bwidth*evScale/2 + 12} y2={eBaseY - height*evScale} stroke="#f59e0b" strokeWidth="0.8" markerEnd="url(#arrowU)" markerStart="url(#arrowD)" />
        <text x={eCx + bwidth*evScale/2 + 18} y={eBaseY - height*evScale/2} fill="#f59e0b" fontSize="8" fontFamily="monospace" transform={`rotate(-90,${eCx + bwidth*evScale/2 + 20},${eBaseY - height*evScale/2})`}>{(height/1000).toFixed(1)}m</text>
        {/* Width dim */}
        <line x1={eCx - bwidth*evScale/2} y1={eBaseY + 14} x2={eCx + bwidth*evScale/2} y2={eBaseY + 14} stroke="#22d3ee" strokeWidth="0.8" markerEnd="url(#arrow)" markerStart="url(#arrowR)" />
        <text x={eCx} y={eBaseY + 28} textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="monospace">{(bwidth/1000).toFixed(1)}m</text>
        {/* Ground line */}
        <line x1={evX + 5} y1={eBaseY} x2={evX + evW - 5} y2={eBaseY} stroke="#4ade80" strokeWidth="1" strokeDasharray="6 3" />
        <text x={evX + 8} y={eBaseY + 12} fill="#4ade80" fontSize="7" fontFamily="monospace">GL ±0.000</text>

        {/* ── Side Elevation ── */}
        <text x={seX} y={evY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SIDE ELEVATION</text>
        <rect x={seX} y={evY} width={seW} height={seH} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x={seCx - depth*seScale/2} y={eBaseY - height*seScale} width={depth*seScale} height={height*seScale} fill="none" stroke="#22d3ee" strokeWidth="1.2" />
        {Array.from({ length: floors }).map((_, f) => {
          const fy = eBaseY - (f + 1) * floorH * seScale;
          return <line key={f} x1={seCx - depth*seScale/2} y1={fy} x2={seCx + depth*seScale/2} y2={fy} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 2" />;
        })}
        <line x1={seCx - depth*seScale/2} y1={eBaseY + 14} x2={seCx + depth*seScale/2} y2={eBaseY + 14} stroke="#f59e0b" strokeWidth="0.8" markerEnd="url(#arrow)" markerStart="url(#arrowR)" />
        <text x={seCx} y={eBaseY + 28} textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">{(depth/1000).toFixed(1)}m</text>

        {/* ── Floor Plan ── */}
        <text x={fpX} y={fpY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">TYPICAL FLOOR PLAN</text>
        <rect x={fpX} y={fpY} width={fpW} height={fpH} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x={fpCx - bwidth*fpScale/2} y={fpCy - depth*fpScale/2} width={bwidth*fpScale} height={depth*fpScale} fill="none" stroke="#22d3ee" strokeWidth="1.2" />
        {/* Columns */}
        {[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4], [0, 0]].map(([cx, cy], i) => (
          <rect key={i} x={fpCx + cx*bwidth*fpScale/2 - 3} y={fpCy + cy*depth*fpScale/2 - 3} width={6} height={6} fill="#f59e0b" stroke="#f59e0b" strokeWidth="0.5" />
        ))}
        {/* Room divisions */}
        <line x1={fpCx} y1={fpCy - depth*fpScale/2} x2={fpCx} y2={fpCy + depth*fpScale/2} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 2" />

        {/* ── Section Mark ── */}
        <text x={fpX} y={fpY + fpH + 24} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SECTION A-A</text>
        {/* Simple cross-section */}
        <rect x={fpX} y={fpY + fpH + 30} width={fpW} height={120} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        {Array.from({ length: Math.min(floors, 8) }).map((_, f) => {
          const secH = 100 / Math.min(floors, 8);
          const sy = fpY + fpH + 35 + (Math.min(floors, 8) - 1 - f) * secH;
          return (
            <g key={f}>
              <rect x={fpX + 20} y={sy} width={fpW - 40} height={secH - 2} fill="none" stroke="#334155" strokeWidth="0.5" />
              <line x1={fpX + 20} y1={sy + secH - 2} x2={fpX + fpW - 20} y2={sy + secH - 2} stroke="#22d3ee" strokeWidth="0.3" />
            </g>
          );
        })}

        {renderSpecsTable([
          ["Floors", `${floors}`],
          ["Height", `${(height/1000).toFixed(1)} m`],
          ["Width", `${(bwidth/1000).toFixed(1)} m`],
          ["Depth", `${(depth/1000).toFixed(1)} m`],
          ["Floor Height", `${(floorH/1000).toFixed(1)} m`],
          ["Structure", "RC Frame"],
        ])}
      </>
    );
  };

  /* ═══════ MACHINE: Assembly + Detail + Section ═══════ */
  const drawMachine = () => {
    const gearRatio = Number(params.gearRatio || 2);
    const rpm = Number(params.rpm || 500);
    const teeth1 = Number(params.teeth1 || 12);
    const teeth2 = Number(params.teeth2 || 24);
    const mod = Number(params.module || 2.5);
    const cd = Number(params.centerDistance || 90);

    const gR1 = 35, gR2 = gR1 * gearRatio;

    // Assembly view
    const avX = margin, avY = margin + 20, avW = 400, avH = 250;
    const aCx = avX + avW * 0.35, aCy = avY + avH / 2;

    // Detail view (gear tooth)
    const dvX = avX + avW + 30, dvY = avY, dvW = 180, dvH = 150;

    // Section view
    const svX = dvX, svY = dvY + dvH + 30, svW = 180, svH = 130;

    return (
      <>
        {/* ── Assembly Drawing ── */}
        <text x={avX} y={avY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">ASSEMBLY - GEAR TRAIN</text>
        <rect x={avX} y={avY} width={avW} height={avH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Input shaft */}
        <line x1={avX + 15} y1={aCy} x2={aCx - gR1 - 5} y2={aCy} stroke="#94a3b8" strokeWidth="2.5" />
        {/* Drive gear */}
        <circle cx={aCx} cy={aCy} r={gR1} fill="none" stroke="#22d3ee" strokeWidth="1.5" />
        <circle cx={aCx} cy={aCy} r={gR1 * 0.3} fill="none" stroke="#22d3ee" strokeWidth="0.8" />
        <circle cx={aCx} cy={aCy} r={gR1 * 0.65} fill="none" stroke="#22d3ee" strokeWidth="0.3" strokeDasharray="2 2" />
        {/* Gear teeth marks */}
        {Array.from({ length: teeth1 }).map((_, i) => {
          const a = (i / teeth1) * Math.PI * 2;
          return <line key={i} x1={aCx + Math.cos(a)*gR1*0.85} y1={aCy + Math.sin(a)*gR1*0.85} x2={aCx + Math.cos(a)*gR1} y2={aCy + Math.sin(a)*gR1} stroke="#22d3ee" strokeWidth="0.8" />;
        })}
        <text x={aCx} y={aCy - gR1 - 8} textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="monospace">Z₁={teeth1}T</text>

        {/* Driven gear */}
        <circle cx={aCx + gR1 + gR2} cy={aCy} r={gR2} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx={aCx + gR1 + gR2} cy={aCy} r={gR2 * 0.3} fill="none" stroke="#f59e0b" strokeWidth="0.8" />
        <circle cx={aCx + gR1 + gR2} cy={aCy} r={gR2 * 0.65} fill="none" stroke="#f59e0b" strokeWidth="0.3" strokeDasharray="2 2" />
        {Array.from({ length: teeth2 }).map((_, i) => {
          const a = (i / teeth2) * Math.PI * 2;
          const cx2 = aCx + gR1 + gR2;
          return <line key={i} x1={cx2 + Math.cos(a)*gR2*0.85} y1={aCy + Math.sin(a)*gR2*0.85} x2={cx2 + Math.cos(a)*gR2} y2={aCy + Math.sin(a)*gR2} stroke="#f59e0b" strokeWidth="0.8" />;
        })}
        <text x={aCx + gR1 + gR2} y={aCy - gR2 - 8} textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">Z₂={teeth2}T</text>

        {/* Output shaft */}
        <line x1={aCx + gR1 + gR2*2 + 5} y1={aCy} x2={avX + avW - 15} y2={aCy} stroke="#94a3b8" strokeWidth="2.5" />

        {/* Center distance dim */}
        <line x1={aCx} y1={aCy + Math.max(gR2, gR1) + 15} x2={aCx + gR1 + gR2} y2={aCy + Math.max(gR2, gR1) + 15} stroke="#4ade80" strokeWidth="0.8" markerEnd="url(#arrow)" markerStart="url(#arrowR)" />
        <text x={aCx + (gR1 + gR2) / 2} y={aCy + Math.max(gR2, gR1) + 28} textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace">C.D. = {cd}mm</text>

        {/* RPM labels */}
        <text x={avX + 15} y={aCy - 12} fill="#94a3b8" fontSize="8" fontFamily="monospace">IN: {rpm} RPM →</text>
        <text x={avX + avW - 15} y={aCy - 12} textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">← OUT: {Math.round(rpm / gearRatio)} RPM</text>

        {/* ── Detail View (gear tooth profile) ── */}
        <text x={dvX} y={dvY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">DETAIL A - TOOTH PROFILE</text>
        <rect x={dvX} y={dvY} width={dvW} height={dvH} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        {/* Involute tooth shape */}
        <path d={`M${dvX+40},${dvY+dvH-25} L${dvX+55},${dvY+30} Q${dvX+65},${dvY+20} ${dvX+75},${dvY+20} Q${dvX+85},${dvY+20} ${dvX+95},${dvY+30} L${dvX+110},${dvY+dvH-25}`} fill="none" stroke="#22d3ee" strokeWidth="1.5" />
        <line x1={dvX+30} y1={dvY+dvH-25} x2={dvX+120} y2={dvY+dvH-25} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 2" />
        {/* Pitch circle */}
        <line x1={dvX+30} y1={dvY+45} x2={dvX+120} y2={dvY+45} stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 2" />
        <text x={dvX+125} y={dvY+48} fill="#f59e0b" fontSize="7" fontFamily="monospace">PCD</text>
        {/* Module dim */}
        <line x1={dvX+140} y1={dvY+20} x2={dvX+140} y2={dvY+dvH-25} stroke="#22d3ee" strokeWidth="0.6" markerEnd="url(#arrowD)" markerStart="url(#arrowU)" />
        <text x={dvX+148} y={dvY+dvH/2} fill="#22d3ee" fontSize="7" fontFamily="monospace">m={mod}</text>

        {/* ── Section View (shaft cross-section) ── */}
        <text x={svX} y={svY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SECTION B-B (SHAFT)</text>
        <rect x={svX} y={svY} width={svW} height={svH} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <circle cx={svX+svW/2} cy={svY+svH/2} r={40} fill="none" stroke="#22d3ee" strokeWidth="1.2" />
        <circle cx={svX+svW/2} cy={svY+svH/2} r={12} fill="none" stroke="#f59e0b" strokeWidth="1.2" />
        {/* Keyway */}
        <rect x={svX+svW/2-3} y={svY+svH/2-12} width={6} height={6} fill="none" stroke="#f59e0b" strokeWidth="0.8" />
        {/* Hatching */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={svX+svW/2+Math.cos(a)*14} y1={svY+svH/2+Math.sin(a)*14} x2={svX+svW/2+Math.cos(a)*38} y2={svY+svH/2+Math.sin(a)*38} stroke="#1e3a5f" strokeWidth="0.3" />;
        })}

        {renderSpecsTable([
          ["Gear Ratio", `${gearRatio}:1`],
          ["Module", `${mod} mm`],
          ["Input RPM", `${rpm}`],
          ["Output RPM", `${Math.round(rpm / gearRatio)}`],
          ["Center Dist.", `${cd} mm`],
          ["Material", `${params.material || "42CrMo4"}`],
        ])}
      </>
    );
  };

  /* ═══════ CIRCUIT: Schematic + PCB Layout ═══════ */
  const drawCircuit = () => {
    const voltage = Number(params.voltage || 9);
    const r1 = Number(params.r1 || 100);
    const r2 = Number(params.r2 || 220);
    const totalR = r1 + r2;
    const current = voltage / totalR * 1000;

    // Schematic
    const scX = margin, scY = margin + 20, scW = 380, scH = 280;
    const cx = scX + scW / 2, cy = scY + scH / 2;

    // PCB Layout
    const pcbX = scX + scW + 40, pcbY = scY, pcbW = 250, pcbH = 180;

    return (
      <>
        {/* ── Schematic ── */}
        <text x={scX} y={scY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SCHEMATIC DIAGRAM</text>
        <rect x={scX} y={scY} width={scW} height={scH} fill="none" stroke="#1e293b" strokeWidth="0.5" />

        {/* Battery */}
        <line x1={scX+60} y1={cy-80} x2={scX+60} y2={cy-15} stroke="#22d3ee" strokeWidth="1.5" />
        <line x1={scX+48} y1={cy-15} x2={scX+72} y2={cy-15} stroke="#22d3ee" strokeWidth="2.5" />
        <line x1={scX+52} y1={cy+2} x2={scX+68} y2={cy+2} stroke="#22d3ee" strokeWidth="1.2" />
        <line x1={scX+60} y1={cy+2} x2={scX+60} y2={cy+80} stroke="#22d3ee" strokeWidth="1.5" />
        <text x={scX+78} y={cy-2} fill="#94a3b8" fontSize="9" fontFamily="monospace">{voltage}V</text>
        <text x={scX+60} y={cy-20} textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">+</text>
        <text x={scX+60} y={cy+14} textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">−</text>

        {/* Top wire */}
        <line x1={scX+60} y1={cy-80} x2={cx-50} y2={cy-80} stroke="#22d3ee" strokeWidth="1.5" />

        {/* R1 zigzag */}
        <path d={`M${cx-50},${cy-80} l10,-12 l10,24 l10,-24 l10,24 l10,-24 l10,12`}
          fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx} y={cy-98} textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace">R₁ = {r1}Ω</text>

        {/* Wire to right */}
        <line x1={cx+10} y1={cy-80} x2={scX+scW-60} y2={cy-80} stroke="#22d3ee" strokeWidth="1.5" />
        <line x1={scX+scW-60} y1={cy-80} x2={scX+scW-60} y2={cy-30} stroke="#22d3ee" strokeWidth="1.5" />

        {/* R2 zigzag (vertical) */}
        <path d={`M${scX+scW-60},${cy-30} l-12,8 l24,8 l-24,8 l24,8 l-24,8 l12,8`}
          fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={scX+scW-35} y={cy+5} fill="#f59e0b" fontSize="9" fontFamily="monospace">R₂ = {r2}Ω</text>

        <line x1={scX+scW-60} y1={cy+18} x2={scX+scW-60} y2={cy+40} stroke="#22d3ee" strokeWidth="1.5" />

        {/* LED */}
        <polygon points={`${scX+scW-72},${cy+40} ${scX+scW-48},${cy+40} ${scX+scW-60},${cy+58}`} fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <line x1={scX+scW-72} y1={cy+58} x2={scX+scW-48} y2={cy+58} stroke="#4ade80" strokeWidth="1.5" />
        <text x={scX+scW-32} y={cy+52} fill="#4ade80" fontSize="9" fontFamily="monospace">LED</text>

        {/* Bottom wire */}
        <line x1={scX+scW-60} y1={cy+58} x2={scX+scW-60} y2={cy+80} stroke="#22d3ee" strokeWidth="1.5" />
        <line x1={scX+scW-60} y1={cy+80} x2={scX+60} y2={cy+80} stroke="#22d3ee" strokeWidth="1.5" />

        {/* Current direction arrows */}
        <text x={cx} y={cy+95} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">I = {current.toFixed(1)} mA →</text>

        {/* Node dots */}
        {[[scX+60,cy-80],[scX+60,cy+80],[scX+scW-60,cy-80],[scX+scW-60,cy+80]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={3} fill="#22d3ee" />
        ))}

        {/* ── PCB Layout ── */}
        <text x={pcbX} y={pcbY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">PCB LAYOUT (TOP VIEW)</text>
        <rect x={pcbX} y={pcbY} width={pcbW} height={pcbH} rx={4} fill="#1a3a2a" stroke="#2d5a3d" strokeWidth="1.5" />
        {/* Traces */}
        <line x1={pcbX+30} y1={pcbY+40} x2={pcbX+pcbW-30} y2={pcbY+40} stroke="#22d3ee" strokeWidth="2" />
        <line x1={pcbX+30} y1={pcbY+pcbH-40} x2={pcbX+pcbW-30} y2={pcbY+pcbH-40} stroke="#22d3ee" strokeWidth="2" />
        <line x1={pcbX+30} y1={pcbY+40} x2={pcbX+30} y2={pcbY+pcbH-40} stroke="#22d3ee" strokeWidth="2" />
        <line x1={pcbX+pcbW-30} y1={pcbY+40} x2={pcbX+pcbW-30} y2={pcbY+pcbH-40} stroke="#22d3ee" strokeWidth="2" />
        {/* Component footprints */}
        <rect x={pcbX+70} y={pcbY+30} width={30} height={20} rx={2} fill="none" stroke="#f59e0b" strokeWidth="1" />
        <text x={pcbX+85} y={pcbY+43} textAnchor="middle" fill="#f59e0b" fontSize="6" fontFamily="monospace">R1</text>
        <rect x={pcbX+140} y={pcbY+30} width={30} height={20} rx={2} fill="none" stroke="#f59e0b" strokeWidth="1" />
        <text x={pcbX+155} y={pcbY+43} textAnchor="middle" fill="#f59e0b" fontSize="6" fontFamily="monospace">R2</text>
        <circle cx={pcbX+pcbW-60} cy={pcbY+pcbH-55} r={8} fill="none" stroke="#4ade80" strokeWidth="1" />
        <text x={pcbX+pcbW-60} y={pcbY+pcbH-40} textAnchor="middle" fill="#4ade80" fontSize="6" fontFamily="monospace">LED</text>
        {/* Via/Pad holes */}
        {[[40,45],[pcbW-40,45],[40,pcbH-45],[pcbW-40,pcbH-45]].map(([x,y],i) => (
          <circle key={i} cx={pcbX+x} cy={pcbY+y} r={4} fill="none" stroke="#64748b" strokeWidth="0.8" />
        ))}

        {/* ── BOM Table ── */}
        <text x={pcbX} y={pcbY + pcbH + 20} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">BILL OF MATERIALS</text>
        <rect x={pcbX} y={pcbY + pcbH + 26} width={pcbW} height={80} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        {[
          ["#", "COMPONENT", "VALUE"],
          ["1", "Battery", `${voltage}V DC`],
          ["2", "Resistor R₁", `${r1}Ω ¼W`],
          ["3", "Resistor R₂", `${r2}Ω ¼W`],
          ["4", "LED", "Green 3mm"],
        ].map((row, ri) => (
          <text key={ri} x={pcbX + 8} y={pcbY + pcbH + 40 + ri * 14} fill={ri === 0 ? "#94a3b8" : "#64748b"} fontSize="8" fontFamily="monospace" fontWeight={ri === 0 ? "bold" : "normal"}>
            {row[0].padEnd(4)}{row[1].padEnd(16)}{row[2]}
          </text>
        ))}

        {renderSpecsTable([
          ["Voltage", `${voltage} V`],
          ["R Total", `${totalR} Ω`],
          ["Current", `${current.toFixed(1)} mA`],
          ["Power", `${(voltage*current/1000*1000).toFixed(1)} mW`],
          ["Circuit", "Series"],
        ])}
      </>
    );
  };

  const renderSpecsTable = (rows: string[][]) => {
    const tX = margin, tY = h - 55;
    return (
      <g>
        <rect x={tX} y={tY} width={280} height={40} fill="none" stroke="#1e293b" strokeWidth="1" />
        <line x1={tX} y1={tY + 14} x2={tX + 280} y2={tY + 14} stroke="#1e293b" strokeWidth="0.5" />
        <text x={tX + 5} y={tY + 11} fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">SPECIFICATIONS</text>
        {rows.map((r, i) => (
          <text key={i} x={tX + 5 + (i % 3) * 93} y={tY + 26 + Math.floor(i / 3) * 12} fill="#64748b" fontSize="7" fontFamily="monospace">
            {r[0]}: {r[1]}
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
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-[#0a0e1a] rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Engineering Drawing — {type}</span>
        <span className="text-[10px] font-mono text-muted-foreground">ISO 128 / ASME Y14.5</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#f59e0b" /></marker>
          <marker id="arrowR" markerWidth="6" markerHeight="4" refX="1" refY="2" orient="auto-start-reverse"><path d="M6,0 L0,2 L6,4" fill="#f59e0b" /></marker>
          <marker id="arrowU" markerWidth="4" markerHeight="6" refX="2" refY="1" orient="auto"><path d="M0,6 L2,0 L4,6" fill="#4ade80" /></marker>
          <marker id="arrowD" markerWidth="4" markerHeight="6" refX="2" refY="5" orient="auto"><path d="M0,0 L2,6 L4,0" fill="#4ade80" /></marker>
        </defs>
        {/* Border frame */}
        <rect x={8} y={8} width={w - 16} height={h - 16} fill="none" stroke="#1e293b" strokeWidth="1" />

        {renderers[type]?.()}

        {/* Title block */}
        <rect x={w - 250} y={h - 55} width={240} height={40} fill="none" stroke="#1e293b" strokeWidth="1" />
        <line x1={w - 250} y1={h - 41} x2={w - 10} y2={h - 41} stroke="#1e293b" strokeWidth="0.5" />
        <text x={w - 245} y={h - 44} fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">CDAI Engineering Optimizer</text>
        <text x={w - 245} y={h - 32} fill="#475569" fontSize="7" fontFamily="monospace">DWG: {type.toUpperCase()}-001  Rev: A</text>
        <text x={w - 245} y={h - 22} fill="#334155" fontSize="7" fontFamily="monospace">Date: {new Date().toLocaleDateString()}  Scale: NTS</text>
        <text x={w - 80} y={h - 32} fill="#334155" fontSize="7" fontFamily="monospace">Sheet 1/1</text>
      </svg>
    </motion.div>
  );
}
