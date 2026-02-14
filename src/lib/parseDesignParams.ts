export interface DesignParams {
  beamLength: number;
  beamHeight: number;
  beamWidth: number;
  columnHeight: number;
  columnWidth: number;
  materialColor: string;
  columnColor: string;
  baseColor: string;
  label: string;
}

const DEFAULT_PARAMS: DesignParams = {
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

/**
 * Parse the latest assistant message content and extract design parameters
 * for the 3D viewport. Looks for dimensions, materials, and labels.
 */
export function parseDesignParams(messages: { role: string; content: string }[]): DesignParams {
  // Find last assistant message
  const assistantMsgs = messages.filter((m) => m.role === "assistant");
  if (assistantMsgs.length === 0) return DEFAULT_PARAMS;

  const text = assistantMsgs[assistantMsgs.length - 1].content.toLowerCase();
  const params = { ...DEFAULT_PARAMS };

  // Extract dimensions — look for patterns like "4000mm x 300mm x 600mm", "length: 5m", etc.
  const lengthMatch = text.match(/(?:length|span|long)[:\s]*(\d+\.?\d*)\s*(mm|cm|m|ft|in)/);
  const heightMatch = text.match(/(?:height|depth|thick)[:\s]*(\d+\.?\d*)\s*(mm|cm|m|ft|in)/);
  const widthMatch = text.match(/(?:width|wide|breadth)[:\s]*(\d+\.?\d*)\s*(mm|cm|m|ft|in)/);

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

  // Scale to viewport-friendly sizes (1-8 range)
  const clampScale = (meters: number, min = 0.1, max = 8): number => {
    if (meters <= 0) return DEFAULT_PARAMS.beamLength;
    // Normalize: anything under 0.01m gets scaled up, anything over 20m gets scaled down
    let scaled = meters;
    if (scaled > 10) scaled = scaled / 1000; // probably mm
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

  // Also check for "dimensions" pattern like "4m x 0.3m x 0.6m"
  const dimMatch = text.match(/(\d+\.?\d*)\s*(mm|cm|m)\s*[x×]\s*(\d+\.?\d*)\s*(mm|cm|m)\s*[x×]\s*(\d+\.?\d*)\s*(mm|cm|m)/);
  if (dimMatch) {
    params.beamLength = clampScale(toMeters(parseFloat(dimMatch[1]), dimMatch[2]), 1, 8);
    params.beamHeight = clampScale(toMeters(parseFloat(dimMatch[3]), dimMatch[4]), 0.1, 2);
    params.beamWidth = clampScale(toMeters(parseFloat(dimMatch[5]), dimMatch[6]), 0.1, 2);
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

  // Extract label from bold text or heading near "design" or "structure"
  const labelMatch = text.match(/\*\*([^*]{3,40}(?:beam|structure|frame|truss|column|bridge|girder)[^*]{0,20})\*\*/i)
    || text.match(/#+\s*(.{3,40}(?:beam|structure|frame|truss|column|bridge|girder).{0,20})/i);
  if (labelMatch) {
    params.label = labelMatch[1].trim().slice(0, 30);
  }

  // Adjust column proportions based on beam
  params.columnHeight = Math.max(0.5, params.beamHeight * 4);
  params.columnWidth = Math.max(0.1, params.beamWidth * 0.4);

  return params;
}
