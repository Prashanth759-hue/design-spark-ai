type ExtendedDomainType = "robotics" | "aerospace" | "marine" | "biomedical" | "industrial";

interface ExtendedDomainDrawingProps {
  type: ExtendedDomainType;
  params: Record<string, number | string>;
  width: number;
  height: number;
  margin: number;
}

export function ExtendedDomainDrawing({ type, params, width, height, margin }: ExtendedDomainDrawingProps) {
  const cyan = "#22d3ee";
  const amber = "#e2b340";
  const slate = "#94a3b8";
  const green = "#4ade80";
  const orange = "#f97316";
  const steel = "#334155";

  const dimLine = (x1: number, y1: number, x2: number, y2: number, label: string, color = amber) => {
    const vertical = Math.abs(x2 - x1) < 2;
    const tx = vertical ? x1 + 14 : (x1 + x2) / 2;
    const ty = vertical ? (y1 + y2) / 2 : y1 - 6;

    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.7" markerEnd="url(#dimArrow)" markerStart="url(#dimArrowR)" />
        {vertical ? (
          <text x={tx} y={ty} fill={color} fontSize="8" fontFamily="monospace" transform={`rotate(-90,${tx},${ty})`}>
            {label}
          </text>
        ) : (
          <text x={tx} y={ty} fill={color} fontSize="8" fontFamily="monospace" textAnchor="middle">
            {label}
          </text>
        )}
      </g>
    );
  };

  const specsTable = (rows: string[][]) => {
    const x = margin;
    const y = height - 60;
    const colW = 95;
    return (
      <g>
        <rect x={x} y={y} width={colW * 3} height={48} fill="none" stroke="#1e293b" strokeWidth="1" />
        <line x1={x} y1={y + 12} x2={x + colW * 3} y2={y + 12} stroke="#1e293b" strokeWidth="0.5" />
        <text x={x + 5} y={y + 10} fill={slate} fontSize="7" fontFamily="monospace" fontWeight="bold">SPECIFICATIONS</text>
        {rows.map((row, index) => (
          <text key={index} x={x + 5 + (index % 3) * colW} y={y + 24 + Math.floor(index / 3) * 11} fill="#64748b" fontSize="6.5" fontFamily="monospace">
            {row[0]}: <tspan fill={slate} fontWeight="bold">{row[1]}</tspan>
          </text>
        ))}
      </g>
    );
  };

  const renderRobotics = () => {
    const reach = Number(params.reach || 850);
    const payload = Number(params.payload || 5);
    const joints = Number(params.joints || 6);
    const speed = Number(params.speed || 1.5);
    const material = String(params.material || "Aluminum 7075");
    const baseX = margin + 80;
    const baseY = 390;
    const scale = 0.22;
    const reachPx = reach * scale;

    return (
      <>
        <text x={margin + 5} y={margin + 17} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">ROBOT ARM ELEVATION</text>
        <rect x={margin + 5} y={margin + 25} width={460} height={360} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <circle cx={baseX + 120} cy={baseY - 110} r={reachPx * 0.52} fill="none" stroke={steel} strokeWidth="0.5" strokeDasharray="5 3" />
        <text x={baseX + 120} y={baseY - 110 - reachPx * 0.52 - 8} fill={steel} fontSize="7" fontFamily="monospace" textAnchor="middle">REACH ENVELOPE</text>

        <rect x={baseX - 30} y={baseY} width={90} height={22} rx={4} fill="none" stroke={cyan} strokeWidth="1.2" />
        <circle cx={baseX + 15} cy={baseY - 4} r={12} fill="none" stroke={cyan} strokeWidth="1.1" />
        <line x1={baseX + 15} y1={baseY - 4} x2={baseX + 85} y2={baseY - 115} stroke={cyan} strokeWidth="1.5" />
        <circle cx={baseX + 85} cy={baseY - 115} r={10} fill="none" stroke={slate} strokeWidth="1" />
        <line x1={baseX + 85} y1={baseY - 115} x2={baseX + 175} y2={baseY - 185} stroke="#8b5cf6" strokeWidth="1.4" />
        <circle cx={baseX + 175} cy={baseY - 185} r={8} fill="none" stroke={slate} strokeWidth="1" />
        <line x1={baseX + 175} y1={baseY - 185} x2={baseX + 250} y2={baseY - 220} stroke={orange} strokeWidth="1.2" />
        <rect x={baseX + 248} y={baseY - 237} width={7} height={18} fill="none" stroke={green} strokeWidth="0.9" />
        <rect x={baseX + 258} y={baseY - 237} width={7} height={18} fill="none" stroke={green} strokeWidth="0.9" />
        <text x={baseX + 265} y={baseY - 246} fill={green} fontSize="7" fontFamily="monospace">TCP</text>

        {dimLine(baseX + 15, baseY + 35, baseX + 265, baseY + 35, `REACH ${reach} mm`, cyan)}
        {dimLine(baseX + 290, baseY, baseX + 290, baseY - 220, `VERT ${Math.round(reach * 0.62)} mm`, green)}

        <text x={520} y={margin + 17} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">WRIST DETAIL</text>
        <rect x={520} y={margin + 25} width={210} height={170} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <circle cx={620} cy={120} r={26} fill="none" stroke={amber} strokeWidth="1" />
        <circle cx={620} cy={120} r={10} fill="none" stroke={slate} strokeWidth="0.7" />
        <line x1={620} y1={120} x2={680} y2={96} stroke={amber} strokeWidth="1" />
        <line x1={620} y1={120} x2={680} y2={144} stroke={amber} strokeWidth="1" />
        <text x={620} y={160} fill={amber} fontSize="7" fontFamily="monospace" textAnchor="middle">SERVO/GRIPPER AXIS</text>

        <text x={520} y={230} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">WORK CELL PLAN</text>
        <rect x={520} y={238} width={210} height={147} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x={555} y={272} width={48} height={48} fill="none" stroke={cyan} strokeWidth="1" />
        <circle cx={579} cy={296} r={68} fill="none" stroke={steel} strokeWidth="0.5" strokeDasharray="4 3" />
        <rect x={640} y={282} width={42} height={30} fill="none" stroke={orange} strokeWidth="0.9" />
        <text x={661} y={325} fill={orange} fontSize="6" fontFamily="monospace" textAnchor="middle">PICK AREA</text>

        {specsTable([
          ["Design", "6-DOF Arm"],
          ["Reach", `${reach} mm`],
          ["Payload", `${payload} kg`],
          ["Joints", `${joints}`],
          ["Speed", `${speed} m/s`],
          ["Material", material],
          ["Repeatability", "±0.05 mm"],
          ["Drive", "Servo"],
          ["Mount", "Floor Base"],
        ])}
      </>
    );
  };

  const renderAerospace = () => {
    const wingspan = Number(params.wingspan || 35000);
    const fuselageLength = Number(params.fuselageLength || 38000);
    const altitude = Number(params.altitude || 35000);
    const airspeed = Number(params.airspeed || 480);
    const engines = Number(params.engines || 2);
    const material = String(params.material || "Al-Li 2050");
    const sideX = margin + 5;
    const sideY = margin + 25;
    const scale = 0.0095;

    return (
      <>
        <text x={sideX} y={sideY - 8} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">SIDE ELEVATION — COMMERCIAL JET</text>
        <rect x={sideX} y={sideY} width={470} height={225} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <path d={`M${sideX + 55},${sideY + 145} L${sideX + 365},${sideY + 145} Q${sideX + 402},${sideY + 140} ${sideX + 420},${sideY + 127} Q${sideX + 402},${sideY + 118} ${sideX + 365},${sideY + 115} L${sideX + 55},${sideY + 115} Q${sideX + 35},${sideY + 130} ${sideX + 55},${sideY + 145} Z`} fill="none" stroke={cyan} strokeWidth="1.4" />
        <line x1={sideX + 165} y1={sideY + 116} x2={sideX + 120} y2={sideY + 78} stroke={cyan} strokeWidth="1.1" />
        <line x1={sideX + 178} y1={sideY + 145} x2={sideX + 102} y2={sideY + 174} stroke={cyan} strokeWidth="1.1" />
        <line x1={sideX + 330} y1={sideY + 116} x2={sideX + 370} y2={sideY + 77} stroke={amber} strokeWidth="1" />
        <ellipse cx={sideX + 178} cy={sideY + 162} rx="22" ry="12" fill="none" stroke={orange} strokeWidth="0.9" />
        <ellipse cx={sideX + 230} cy={sideY + 162} rx="22" ry="12" fill="none" stroke={orange} strokeWidth="0.9" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={sideX + 98 + i * 22} y={sideY + 124} width={9} height={5} fill="none" stroke={slate} strokeWidth="0.4" />
        ))}
        {dimLine(sideX + 55, sideY + 188, sideX + 420, sideY + 188, `L ${fuselageLength} mm`, cyan)}
        {dimLine(sideX + 438, sideY + 145, sideX + 438, sideY + 76, `TAIL ${Math.round(fuselageLength * 0.18)} mm`, green)}

        <text x={515} y={sideY - 8} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">TOP VIEW</text>
        <rect x={515} y={sideY} width={215} height={225} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <path d={`M620,72 L632,108 L724,123 L724,127 L632,142 L620,178 L607,142 L520,127 L520,123 L607,108 Z`} fill="none" stroke={cyan} strokeWidth="1.2" />
        <line x1={620} y1={56} x2={620} y2={196} stroke={steel} strokeWidth="0.4" strokeDasharray="6 3" />
        {dimLine(520, 208, 724, 208, `SPAN ${wingspan} mm`, amber)}

        <text x={515} y={280} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">FLIGHT ENVELOPE</text>
        <rect x={515} y={288} width={215} height={97} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <line x1={540} y1={358} x2={705} y2={358} stroke={steel} strokeWidth="0.4" />
        <line x1={540} y1={358} x2={540} y2={305} stroke={steel} strokeWidth="0.4" />
        <path d="M540 352 Q585 330 625 321 T705 312" fill="none" stroke={green} strokeWidth="1.1" />
        <text x={551} y={307} fill={green} fontSize="6" fontFamily="monospace">CRUISE ALT {altitude} ft</text>
        <text x={610} y={372} fill={amber} fontSize="6" fontFamily="monospace">V = {airspeed} kts</text>

        {specsTable([
          ["Type", "Commercial Jet"],
          ["Span", `${(wingspan / 1000).toFixed(1)} m`],
          ["Length", `${(fuselageLength / 1000).toFixed(1)} m`],
          ["Altitude", `${altitude} ft`],
          ["Airspeed", `${airspeed} kts`],
          ["Engines", `${engines}`],
          ["Wing AR", `${((wingspan * wingspan) / (wingspan * fuselageLength * 0.18)).toFixed(1)}`],
          ["Material", material],
          ["Config", "Low Wing Twin"],
        ])}
      </>
    );
  };

  const renderMarine = () => {
    const length = Number(params.length || 120000);
    const beam = Number(params.beam || 18000);
    const displacement = Number(params.displacement || 5000);
    const speed = Number(params.speed || 15);
    const hullDrag = Number(params.hullDrag || 109.7);
    const material = String(params.material || "Marine Steel AH36");
    const x = margin + 5;
    const y = margin + 25;

    return (
      <>
        <text x={x} y={y - 8} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">PROFILE — CARGO VESSEL</text>
        <rect x={x} y={y} width={470} height={225} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <path d={`M${x + 60},${y + 150} L${x + 355},${y + 150} Q${x + 410},${y + 146} ${x + 438},${y + 122} L${x + 452},${y + 110} L${x + 430},${y + 166} Q${x + 404},${y + 182} ${x + 355},${y + 186} L${x + 95},${y + 186} Q${x + 65},${y + 183} ${x + 60},${y + 150} Z`} fill="none" stroke={cyan} strokeWidth="1.4" />
        <rect x={x + 220} y={y + 85} width={72} height={42} fill="none" stroke={amber} strokeWidth="1" />
        <rect x={x + 238} y={y + 58} width={42} height={27} fill="none" stroke={amber} strokeWidth="1" />
        <line x1={x + 20} y1={y + 186} x2={x + 455} y2={y + 186} stroke={green} strokeWidth="0.9" strokeDasharray="6 4" />
        <text x={x + 24} y={y + 198} fill={green} fontSize="6" fontFamily="monospace">WATERLINE</text>
        {dimLine(x + 60, y + 205, x + 452, y + 205, `L ${length} mm`, cyan)}

        <text x={515} y={y - 8} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">DECK PLAN</text>
        <rect x={515} y={y} width={215} height={225} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <path d="M560 75 L675 75 Q705 112 675 175 L560 175 Q535 165 532 125 Q535 88 560 75 Z" fill="none" stroke={cyan} strokeWidth="1.2" />
        <rect x={600} y={102} width={48} height={46} fill="none" stroke={amber} strokeWidth="0.9" />
        <line x1={532} y1={125} x2={705} y2={125} stroke={steel} strokeWidth="0.4" strokeDasharray="5 3" />
        {dimLine(548, 193, 688, 193, `B ${beam} mm`, amber)}

        <text x={515} y={280} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">HYDROSTATIC NOTES</text>
        <rect x={515} y={288} width={215} height={97} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <text x={528} y={314} fill={slate} fontSize="7" fontFamily="monospace">DISP. = {displacement} t</text>
        <text x={528} y={332} fill={amber} fontSize="7" fontFamily="monospace">SERVICE SPEED = {speed} kts</text>
        <text x={528} y={350} fill={green} fontSize="7" fontFamily="monospace">HULL DRAG = {hullDrag.toFixed(1)} kN</text>

        {specsTable([
          ["Type", "Cargo Vessel"],
          ["Length", `${(length / 1000).toFixed(1)} m`],
          ["Beam", `${(beam / 1000).toFixed(1)} m`],
          ["Displacement", `${displacement} t`],
          ["Speed", `${speed} kts`],
          ["Hull Drag", `${hullDrag.toFixed(1)} kN`],
          ["Freeboard", `${(beam * 0.22 / 1000).toFixed(1)} m`],
          ["Material", material],
          ["Class", "ABS/DNV"],
        ])}
      </>
    );
  };

  const renderBiomedical = () => {
    const designType = String(params.designType || "heart");
    const bpm = Number(params.bpm || 72);
    const strokeVolume = Number(params.strokeVolume || 70);
    const systolic = Number(params.systolic || 120);
    const diastolic = Number(params.diastolic || 80);
    const flexion = Number(params.flexion || 0);
    const material = String(params.material || "Ti-6Al-4V");
    const isProsthetic = designType.includes("knee") || designType.includes("implant");

    return isProsthetic ? (
      <>
        <text x={margin + 5} y={margin + 17} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">PROSTHETIC KNEE ELEVATION</text>
        <rect x={margin + 5} y={margin + 25} width={460} height={360} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <line x1={180} y1={90} x2={180} y2={220} stroke={cyan} strokeWidth="1.5" />
        <circle cx={180} cy={220} r={24} fill="none" stroke={amber} strokeWidth="1.2" />
        <line x1={180} y1={220} x2={180 + Math.cos((Math.PI / 2) - flexion) * 138} y2={220 + Math.sin((Math.PI / 2) - flexion) * 138} stroke={cyan} strokeWidth="1.5" />
        <rect x={154} y={100} width={52} height={28} fill="none" stroke={green} strokeWidth="0.9" />
        <rect x={153} y={250} width={54} height={28} fill="none" stroke={green} strokeWidth="0.9" />
        <path d="M520 120 L625 120 L655 180 L548 180 Z" fill="none" stroke={amber} strokeWidth="1" />
        <text x={580} y={105} fill={amber} fontSize="7" fontFamily="monospace" textAnchor="middle">TIBIAL INSERT SECTION</text>
        {dimLine(220, 220, 320, 220, `FLEX ${(flexion * 57.3).toFixed(1)}°`, amber)}
        {specsTable([
          ["Design", "Prosthetic Knee"],
          ["Flexion", `${(flexion * 57.3).toFixed(1)}°`],
          ["Material", material],
          ["Bearing", "UHMWPE"],
          ["Load", "3x Body Wt"],
          ["Fixation", "Cementless"],
          ["ISO", "ISO 14243"],
          ["Finish", "Polished"],
          ["Revision", "A"],
        ])}
      </>
    ) : (
      <>
        <text x={margin + 5} y={margin + 17} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">CARDIAC MODEL — ANTERIOR VIEW</text>
        <rect x={margin + 5} y={margin + 25} width={460} height={360} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <path d="M210 118 C190 82 128 87 124 146 C121 191 161 220 210 276 C259 220 299 191 296 146 C292 87 230 82 210 118 Z" fill="none" stroke={cyan} strokeWidth="1.5" />
        <path d="M209 146 C196 127 166 129 163 152 C161 174 182 190 209 220 C236 190 257 174 255 152 C252 129 222 127 209 146 Z" fill="none" stroke={amber} strokeWidth="1" />
        <line x1={210} y1={92} x2={210} y2={58} stroke={green} strokeWidth="1" />
        <line x1={182} y1={98} x2={150} y2={68} stroke={orange} strokeWidth="1" />
        <text x={525} y={margin + 17} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">HEMODYNAMIC TRACE</text>
        <rect x={525} y={margin + 25} width={205} height={170} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <path d="M540 155 L560 155 L572 110 L584 180 L598 125 L614 155 L730 155" fill="none" stroke={green} strokeWidth="1.1" />
        <text x={540} y={208} fill={amber} fontSize="7" fontFamily="monospace">BP {systolic}/{diastolic} mmHg</text>
        <text x={540} y={226} fill={cyan} fontSize="7" fontFamily="monospace">SV {strokeVolume} mL · HR {bpm} BPM</text>
        <text x={525} y={245} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">SECTION A-A</text>
        <rect x={525} y={252} width={205} height={133} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <ellipse cx={595} cy={320} rx={52} ry={36} fill="none" stroke={amber} strokeWidth="1" />
        <ellipse cx={647} cy={312} rx={32} ry={28} fill="none" stroke={cyan} strokeWidth="1" />

        {specsTable([
          ["Design", "Heart"],
          ["Rate", `${bpm} BPM`],
          ["Stroke Vol", `${strokeVolume} mL`],
          ["Pressure", `${systolic}/${diastolic}`],
          ["Output", `${((bpm * strokeVolume) / 1000).toFixed(1)} L/min`],
          ["Material", material],
          ["Rhythm", "Sinus"],
          ["Valve State", "Normal"],
          ["Std.", "ISO 5840"],
        ])}
      </>
    );
  };

  const renderIndustrial = () => {
    const designType = String(params.designType || "conveyor");
    const beltSpeed = Number(params.beltSpeed || 2);
    const spindleRpm = Number(params.spindleRpm || 3000);
    const throughput = Number(params.throughput || 24);
    const efficiency = Number(params.efficiency || 91);
    const quality = Number(params.quality || 99.2);
    const material = String(params.material || "Tool Steel H13");
    const isCnc = designType.includes("cnc") || spindleRpm > 0;

    return (
      <>
        <text x={margin + 5} y={margin + 17} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">{isCnc ? "CNC WORKCELL ELEVATION" : "CONVEYOR LINE ELEVATION"}</text>
        <rect x={margin + 5} y={margin + 25} width={460} height={360} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <rect x={90} y={238} width={235} height={18} fill="none" stroke={cyan} strokeWidth="1.2" />
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx={108 + i * 38} cy={258} r={12} fill="none" stroke={slate} strokeWidth="0.8" />
        ))}
        <rect x={140} y={218} width={28} height={20} fill="none" stroke={amber} strokeWidth="0.9" />
        <rect x={212} y={218} width={28} height={20} fill="none" stroke={green} strokeWidth="0.9" />
        <rect x={306} y={132} width={86} height={92} fill="none" stroke={orange} strokeWidth="1.1" />
        <rect x={326} y={106} width={46} height={26} fill="none" stroke={orange} strokeWidth="1" />
        <line x1={349} y1={132} x2={349} y2={212} stroke={cyan} strokeWidth="1.2" />
        <circle cx={349} cy={212} r={10} fill="none" stroke={cyan} strokeWidth="1" />
        <text x={349} y={247} fill={cyan} fontSize="7" fontFamily="monospace" textAnchor="middle">SPINDLE</text>

        {dimLine(90, 282, 325, 282, `BELT ${(beltSpeed).toFixed(1)} m/s`, cyan)}
        {dimLine(408, 224, 408, 106, `RPM ${spindleRpm}`, amber)}

        <text x={520} y={margin + 17} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">PROCESS FLOW</text>
        <rect x={520} y={margin + 25} width={210} height={170} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        {[[548, 110, "LOAD"], [620, 110, "MACH"], [692, 110, "QC"]].map(([cx, cy, label]) => (
          <g key={String(label)}>
            <rect x={Number(cx) - 20} y={Number(cy) - 14} width={40} height={28} fill="none" stroke={amber} strokeWidth="0.9" rx={4} />
            <text x={Number(cx)} y={Number(cy) + 4} fill={amber} fontSize="7" fontFamily="monospace" textAnchor="middle">{label}</text>
          </g>
        ))}
        <line x1={568} y1={110} x2={600} y2={110} stroke={green} strokeWidth="1.1" markerEnd="url(#dimArrow)" />
        <line x1={640} y1={110} x2={672} y2={110} stroke={green} strokeWidth="1.1" markerEnd="url(#dimArrow)" />

        <text x={520} y={230} fill={slate} fontSize="10" fontFamily="monospace" fontWeight="bold">PRODUCTION KPIs</text>
        <rect x={520} y={238} width={210} height={147} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        <text x={535} y={268} fill={cyan} fontSize="7" fontFamily="monospace">THROUGHPUT = {throughput} u/hr</text>
        <text x={535} y={292} fill={amber} fontSize="7" fontFamily="monospace">EFFICIENCY = {efficiency}%</text>
        <text x={535} y={316} fill={green} fontSize="7" fontFamily="monospace">QUALITY = {quality}%</text>

        {specsTable([
          ["Design", isCnc ? "CNC Cell" : "Conveyor"],
          ["Belt", `${beltSpeed.toFixed(1)} m/s`],
          ["RPM", `${spindleRpm}`],
          ["Throughput", `${throughput} u/hr`],
          ["Efficiency", `${efficiency}%`],
          ["Quality", `${quality}%`],
          ["Material", material],
          ["Controls", "PLC + HMI"],
          ["Safety", "ISO 13849"],
        ])}
      </>
    );
  };

  const renderers: Record<ExtendedDomainType, () => JSX.Element> = {
    robotics: renderRobotics,
    aerospace: renderAerospace,
    marine: renderMarine,
    biomedical: renderBiomedical,
    industrial: renderIndustrial,
  };

  return renderers[type]();
}