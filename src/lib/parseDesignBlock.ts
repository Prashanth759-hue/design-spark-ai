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
export function designBlockToDrawingType(block: DesignBlock): "vehicle" | "building" | "machine" | "circuit" {
  const map: Record<string, "vehicle" | "building" | "machine" | "circuit"> = {
    vehicle: "vehicle",
    building: "building",
    machine: "machine",
    circuit: "circuit",
    robotics: "machine",
    aerospace: "vehicle",
    marine: "vehicle",
    biomedical: "machine",
    industrial: "machine",
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
    case "robotics":
    case "biomedical":
    case "industrial":
      return {
        rpm: p.rpm || p.spindleRpm || 500,
        gearRatio: p.gearRatio || 2,
        teeth1: p.teeth1 || p.joints || 12,
        teeth2: p.teeth2 || 24,
        centerDistance: p.centerDistance || 90,
        module: p.module || 2.5,
        material: p.material || "42CrMo4",
      };
    case "circuit":
      return {
        voltage: p.voltage || 9,
        r1: p.resistance || 100,
        current: p.current || "28.1",
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

  return {
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
}

/**
 * Strips the <!--DESIGN:...--> block from message content for display
 */
export function stripDesignBlock(content: string): string {
  return content.replace(DESIGN_REGEX, '').trim();
}
