export type StructureType = "beam" | "car" | "building" | "bridge" | "truss" | "generic" | "robotics" | "aerospace" | "marine" | "biomedical" | "industrial";

export interface DesignParams {
  structureType: StructureType;
  beamLength: number;
  beamHeight: number;
  beamWidth: number;
  columnHeight: number;
  columnWidth: number;
  materialColor: string;
  columnColor: string;
  baseColor: string;
  label: string;
  // Car-specific
  wheelbase?: number;
  trackWidth?: number;
  groundClearance?: number;
  bodyHeight?: number;
}

const DEFAULT_PARAMS: DesignParams = {
  structureType: "beam",
  beamLength: 4,
  beamHeight: 0.3,
  beamWidth: 0.6,
  columnHeight: 1.2,
  columnWidth: 0.25,
  materialColor: "#22d3ee",
  columnColor: "#0e7490",
  baseColor: "#164e63",
  label: "Beam Structure",
};

const MATERIAL_COLORS: Record<string, { main: string; column: string; base: string }> = {
  steel: { main: "#22d3ee", column: "#0e7490", base: "#164e63" },
  aluminum: { main: "#94a3b8", column: "#64748b", base: "#475569" },
  "carbon fiber": { main: "#a78bfa", column: "#7c3aed", base: "#5b21b6" },
  titanium: { main: "#fbbf24", column: "#d97706", base: "#92400e" },
  composite: { main: "#34d399", column: "#059669", base: "#065f46" },
  concrete: { main: "#a8a29e", column: "#78716c", base: "#57534e" },
  wood: { main: "#d97706", column: "#92400e", base: "#78350f" },
};

const STRUCTURE_KEYWORDS: Record<StructureType, string[]> = {
  car: ["car design", "design a car", "vehicle design", "sedan", "suv", "coupe", "hatchback", "automobile", "drivetrain", "wheelbase", "chassis design", "bev design", "ev design", "motor vehicle", "truck design", "pickup truck"],
  bridge: ["bridge", "abutment", "pier", "deck slab", "viaduct", "overpass"],
  building: ["building", "floor", "storey", "story", "foundation", "slab", "tower", "skyscraper", "house", "apartment", "office block"],
  truss: ["truss", "warren truss", "pratt truss", "howe truss", "roof truss", "space frame", "lattice"],
  beam: ["beam", "girder", "i-beam", "cantilever", "joist"],
  robotics: [],
  aerospace: [],
  marine: [],
  biomedical: [],
  industrial: [],
  generic: [],
};

function detectStructureType(text: string): StructureType {
  const lower = text.toLowerCase();

  // Score each type by counting keyword matches, with negative-context filtering
  const negativePatterns: Record<string, RegExp[]> = {
    bridge: [/(?:not|don'?t|no|isn'?t|without|rather than|instead of|seeing)\s+(?:a\s+)?bridge/i],
    car: [/(?:not|don'?t|no|isn'?t|without|rather than|instead of)\s+(?:a\s+)?car/i],
    building: [/(?:not|don'?t|no|isn'?t|without|rather than|instead of)\s+(?:a\s+)?building/i],
    truss: [/(?:not|don'?t|no|isn'?t|without|rather than|instead of)\s+(?:a\s+)?truss/i],
  };

  const scores: Record<string, number> = {};
  const types: StructureType[] = ["car", "truss", "bridge", "building", "beam"];

  for (const type of types) {
    let score = 0;
    // Check if user is negating this type
    const negs = negativePatterns[type] || [];
    const isNegated = negs.some((re) => re.test(lower));
    if (isNegated) {
      scores[type] = -10;
      continue;
    }
    for (const kw of STRUCTURE_KEYWORDS[type]) {
      // Count occurrences for stronger signal
      const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = lower.match(re);
      if (matches) score += matches.length;
    }
    scores[type] = score;
  }

  // Find the type with the highest positive score
  let best: StructureType = "beam";
  let bestScore = 0;
  for (const type of types) {
    if ((scores[type] || 0) > bestScore) {
      bestScore = scores[type];
      best = type;
    }
  }
  return best;
}

/**
 * Parse the latest assistant message content and extract design parameters
 * for the 3D viewport. Looks for dimensions, materials, labels, and structure type.
 */
export function parseDesignParams(messages: { role: string; content: string }[]): DesignParams {
  // Find last assistant message
  const assistantMsgs = messages.filter((m) => m.role === "assistant");
  if (assistantMsgs.length === 0) return DEFAULT_PARAMS;

  const text = assistantMsgs[assistantMsgs.length - 1].content.toLowerCase();
  const params = { ...DEFAULT_PARAMS };

  // Detect structure type — scan the last 3 user messages (most recent first) for strongest signal
  const userMsgs = messages.filter((m) => m.role === "user");
  const recentUserMsgs = userMsgs.slice(-3).reverse(); // newest first
  let detectedType: StructureType = "beam";
  for (const msg of recentUserMsgs) {
    const detected = detectStructureType(msg.content);
    if (detected !== "beam") {
      detectedType = detected;
      break;
    }
  }
  if (detectedType !== "beam") {
    params.structureType = detectedType;
  } else {
    // Fallback: check latest assistant message
    params.structureType = detectStructureType(text);
  }

  // Extract dimensions — look for patterns like "4000mm x 300mm x 600mm", "length: 5m", etc.
  const lengthMatch = text.match(/(?:length|span|long|wheelbase)[:\s]*(\d+[\.,]?\d*)\s*(mm|cm|m|ft|in)/);
  const heightMatch = text.match(/(?:height|depth|thick|ground clearance)[:\s]*(\d+[\.,]?\d*)\s*(mm|cm|m|ft|in)/);
  const widthMatch = text.match(/(?:width|wide|breadth|track width)[:\s]*(\d+[\.,]?\d*)\s*(mm|cm|m|ft|in)/);

  const toMeters = (val: number, unit: string): number => {
    switch (unit) {
      case "mm": return val / 1000;
      case "cm": return val / 100;
      case "m": return val;
      case "ft": return val * 0.3048;
      case "in": return val * 0.0254;
      default: return val;
    }
  };

  const clampScale = (meters: number, min = 0.1, max = 8): number => {
    if (meters <= 0) return DEFAULT_PARAMS.beamLength;
    let scaled = meters;
    if (scaled > 10) scaled = scaled / 1000;
    if (scaled > 10) scaled = 8;
    if (scaled < 0.05) scaled = 0.1;
    return Math.max(min, Math.min(max, scaled));
  };

  if (lengthMatch) {
    params.beamLength = clampScale(toMeters(parseFloat(lengthMatch[1]), lengthMatch[2]), 1, 8);
  }
  if (heightMatch) {
    params.beamHeight = clampScale(toMeters(parseFloat(heightMatch[1]), heightMatch[2]), 0.1, 2);
  }
  if (widthMatch) {
    params.beamWidth = clampScale(toMeters(parseFloat(widthMatch[1]), widthMatch[2]), 0.1, 2);
  }

  // Dimensions pattern like "4m x 0.3m x 0.6m"
  const dimMatch = text.match(/(\d+\.?\d*)\s*(mm|cm|m)\s*[x×]\s*(\d+\.?\d*)\s*(mm|cm|m)\s*[x×]\s*(\d+\.?\d*)\s*(mm|cm|m)/);
  if (dimMatch) {
    params.beamLength = clampScale(toMeters(parseFloat(dimMatch[1]), dimMatch[2]), 1, 8);
    params.beamHeight = clampScale(toMeters(parseFloat(dimMatch[3]), dimMatch[4]), 0.1, 2);
    params.beamWidth = clampScale(toMeters(parseFloat(dimMatch[5]), dimMatch[6]), 0.1, 2);
  }

  // Car-specific parsing
  if (params.structureType === "car") {
    const wbMatch = text.match(/wheelbase[:\s]*(\d+[\.,]?\d*)\s*(mm|cm|m)/);
    const twMatch = text.match(/track\s*width[:\s]*(\d+[\.,]?\d*)\s*(mm|cm|m)/);
    const gcMatch = text.match(/ground\s*clearance[:\s]*(\d+[\.,]?\d*)\s*(mm|cm|m)/);
    
    if (wbMatch) params.wheelbase = toMeters(parseFloat(wbMatch[1]), wbMatch[2]);
    if (twMatch) params.trackWidth = toMeters(parseFloat(twMatch[1]), twMatch[2]);
    if (gcMatch) params.groundClearance = toMeters(parseFloat(gcMatch[1]), gcMatch[2]);
    
    // Set sensible defaults for car
    params.wheelbase = params.wheelbase || 2.85;
    params.trackWidth = params.trackWidth || 1.58;
    params.groundClearance = params.groundClearance || 0.145;
    params.bodyHeight = 1.45;
    params.label = "Vehicle Design";
  }

  // Extract material
  for (const [material, colors] of Object.entries(MATERIAL_COLORS)) {
    if (text.includes(material)) {
      params.materialColor = colors.main;
      params.columnColor = colors.column;
      params.baseColor = colors.base;
      break;
    }
  }

  // Extract label from bold text or heading
  if (params.structureType === "car") {
    const carLabel = text.match(/\*\*([^*]{3,40}(?:car|vehicle|sedan|suv|bev|ev|auto)[^*]{0,20})\*\*/i)
      || text.match(/#+\s*(.{3,40}(?:car|vehicle|sedan|suv|bev|ev|auto).{0,20})/i);
    if (carLabel) params.label = carLabel[1].trim().slice(0, 30);
  } else {
    const labelMatch = text.match(/\*\*([^*]{3,40}(?:beam|structure|frame|truss|column|bridge|girder)[^*]{0,20})\*\*/i)
      || text.match(/#+\s*(.{3,40}(?:beam|structure|frame|truss|column|bridge|girder).{0,20})/i);
    if (labelMatch) params.label = labelMatch[1].trim().slice(0, 30);
  }

  // Adjust column proportions based on beam (for non-car types)
  if (params.structureType !== "car") {
    params.columnHeight = Math.max(0.5, params.beamHeight * 4);
    params.columnWidth = Math.max(0.1, params.beamWidth * 0.4);
  }

  return params;
}
