/**
 * Parses the <!--DESIGN:{...}--> JSON block from AI responses.
 * Returns the latest design block found across all messages, or null if none.
 */

export interface DesignBlock {
  domain: string;
  type: string;
  params: Record<string, any>;
}

const DESIGN_REGEX = /<!--DESIGN:(.*?)-->/gs;

export function parseDesignBlock(messages: { role: string; content: string }[]): DesignBlock | null {
  // Scan assistant messages from newest to oldest
  const assistantMsgs = messages.filter(m => m.role === "assistant");
  for (let i = assistantMsgs.length - 1; i >= 0; i--) {
    const content = assistantMsgs[i].content;
    const matches = [...content.matchAll(DESIGN_REGEX)];
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      try {
        const parsed = JSON.parse(lastMatch[1]);
        if (parsed.domain && parsed.params) {
          return parsed as DesignBlock;
        }
      } catch {
        // Try to fix common JSON issues (trailing commas, etc.)
        try {
          const cleaned = lastMatch[1].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          const parsed = JSON.parse(cleaned);
          if (parsed.domain && parsed.params) return parsed as DesignBlock;
        } catch { /* skip */ }
      }
    }
  }
  return null;
}

/**
 * Maps a DesignBlock to the drawing type used by EngineeringDrawing
 */
export function designBlockToDrawingType(block: DesignBlock): "vehicle" | "building" | "machine" | "circuit" | "robotics" | "aerospace" | "marine" | "biomedical" | "industrial" {
  const map: Record<string, "vehicle" | "building" | "machine" | "circuit" | "robotics" | "aerospace" | "marine" | "biomedical" | "industrial"> = {
    vehicle: "vehicle",
    building: "building",
    machine: "machine",
    circuit: "circuit",
    robotics: "robotics",
    aerospace: "aerospace",
    marine: "marine",
    biomedical: "biomedical",
    industrial: "industrial",
  };
  return map[block.domain] || "machine";
}

/**
 * Maps a DesignBlock to the drawing params
 */
export function designBlockToDrawingParams(block: DesignBlock): Record<string, number | string> {
  const p = block.params;

  switch (block.domain) {
    case "vehicle":
    case "aerospace":
    case "marine":
      return {
        wheelbase: p.wheelbase || p.fuselageLength || p.length || 2850,
        trackWidth: p.trackWidth || p.wingspan || p.beam || 1580,
        bodyLength: p.bodyLength || p.fuselageLength || p.length || 4500,
        bodyHeight: p.bodyHeight || 1400,
        groundClearance: p.groundClearance || 165,
        overhangFront: p.overhangFront || 900,
        overhangRear: p.overhangRear || 750,
      };
    case "building":
      return {
        floors: p.floors || 10,
        height: p.height || (p.floors || 10) * (p.floorHeight || 3200),
        width: p.width || 18000,
        depth: p.depth || 12000,
      };
    case "machine":
      return {
        rpm: p.rpm || p.spindleRpm || 500,
        gearRatio: p.gearRatio || 2,
        teeth1: p.teeth1 || p.joints || 12,
        teeth2: p.teeth2 || 24,
        centerDistance: p.centerDistance || 90,
        module: p.module || 2.5,
        material: p.material || "42CrMo4",
      };
    case "robotics":
      return {
        reach: p.reach || 850,
        payload: p.payload || 5,
        joints: p.joints || 6,
        speed: p.speed || 1.5,
        material: p.material || "Aluminum 7075",
      };
    case "biomedical":
      return {
        designType: block.type,
        bpm: p.bpm || 72,
        strokeVolume: p.strokeVolume || 70,
        systolic: p.systolic || 120,
        diastolic: p.diastolic || 80,
        flexion: p.flexion || 0,
        material: p.material || "Ti-6Al-4V",
      };
    case "industrial":
      return {
        designType: block.type,
        beltSpeed: p.beltSpeed || 2,
        spindleRpm: p.spindleRpm || 3000,
        throughput: p.throughput || 24,
        efficiency: p.efficiency || 91,
        quality: p.quality || 99.2,
        material: p.material || "Tool Steel H13",
      };
    case "circuit":
      return {
        voltage: p.voltage || 9,
        r1: p.resistance || 100,
        current: p.current || "28.1",
      };
    case "aerospace":
      return {
        wingspan: p.wingspan || 35000,
        fuselageLength: p.fuselageLength || 38000,
        altitude: p.altitude || 35000,
        airspeed: p.airspeed || 480,
        engines: p.engines || 2,
        material: p.material || "Al-Li 2050",
      };
    case "marine":
      return {
        length: p.length || 120000,
        beam: p.beam || 18000,
        displacement: p.displacement || 5000,
        speed: p.speed || 15,
        hullDrag: p.hullDrag || 109.7,
        material: p.material || "Marine Steel AH36",
      };
    default:
      return p;
  }
}

/**
 * Maps a DesignBlock to DesignParams for the 3D viewport
 */
export function designBlockTo3DParams(block: DesignBlock) {
  const p = block.params;
  
  // Map domain to structure type
  const structureTypeMap: Record<string, string> = {
    vehicle: "car",
    building: "building",
    machine: "beam",
    circuit: "beam",
    robotics: "beam",
    aerospace: "car",
    marine: "beam",
    biomedical: "beam",
    industrial: "beam",
  };

  const base = {
    structureType: structureTypeMap[block.domain] || "beam",
    beamLength: (p.bodyLength || p.fuselageLength || p.length || 4000) / 1000,
    beamHeight: (p.bodyHeight || p.height || 300) / 1000,
    beamWidth: (p.trackWidth || p.width || 600) / 1000,
    columnHeight: Math.max(0.5, ((p.bodyHeight || p.height || 1200) / 1000) * 0.4),
    columnWidth: 0.25,
    materialColor: "#22d3ee",
    columnColor: "#0e7490",
    baseColor: "#164e63",
    label: `${block.type.replace(/_/g, ' ')} Design`,
    wheelbase: (p.wheelbase || 2850) / 1000,
    trackWidth: (p.trackWidth || 1580) / 1000,
    groundClearance: (p.groundClearance || 165) / 1000,
    bodyHeight: (p.bodyHeight || 1450) / 1000,
  };

  switch (block.domain) {
    case "robotics":
      return {
        ...base,
        structureType: "robotics",
        beamLength: (p.reach || 850) / 1000,
        beamHeight: Math.max(0.35, (p.payload || 5) * 0.08),
        beamWidth: 0.6,
        columnHeight: 1.2,
        label: `${block.type.replace(/_/g, " ")} • ${p.reach || 850}mm reach`,
      };
    case "aerospace":
      return {
        ...base,
        structureType: "aerospace",
        beamLength: (p.fuselageLength || 38000) / 1000,
        beamWidth: (p.wingspan || 35000) / 1000,
        beamHeight: 3.6,
        label: `${block.type.replace(/_/g, " ")} • ${(p.wingspan || 35000) / 1000}m span`,
      };
    case "marine":
      return {
        ...base,
        structureType: "marine",
        beamLength: (p.length || 120000) / 1000,
        beamWidth: (p.beam || 18000) / 1000,
        beamHeight: Math.max(4, ((p.beam || 18000) / 1000) * 0.32),
        label: `${block.type.replace(/_/g, " ")} • ${(p.length || 120000) / 1000}m LOA`,
      };
    case "biomedical":
      return {
        ...base,
        structureType: "biomedical",
        beamLength: Math.max(0.35, (p.strokeVolume || 70) / 120),
        beamWidth: 0.55,
        beamHeight: 0.7,
        label: `${block.type.replace(/_/g, " ")} • ${(p.bpm || p.flexion || 72).toString()}`,
      };
    case "industrial":
      return {
        ...base,
        structureType: "industrial",
        beamLength: Math.max(2.5, (p.throughput || 24) / 6),
        beamWidth: 0.8,
        beamHeight: Math.max(0.5, (p.efficiency || 91) / 120),
        label: `${block.type.replace(/_/g, " ")} • ${p.throughput || 24} u/hr`,
      };
    default:
      return base;
  }
}

/**
 * Strips the <!--DESIGN:...--> block from message content for display
 */
export function stripDesignBlock(content: string): string {
  return content.replace(DESIGN_REGEX, '').trim();
}
