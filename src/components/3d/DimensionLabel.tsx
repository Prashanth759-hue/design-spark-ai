import { Html } from "@react-three/drei";
import * as THREE from "three";

interface DimensionLabelProps {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  offset?: [number, number, number];
  color?: string;
}

/**
 * Renders a 3D dimension line with end-caps and a floating label.
 */
export function DimensionLabel({
  start,
  end,
  label,
  offset = [0, 0, 0],
  color = "#22d3ee",
}: DimensionLabelProps) {
  const s = new THREE.Vector3(...start).add(new THREE.Vector3(...offset));
  const e = new THREE.Vector3(...end).add(new THREE.Vector3(...offset));
  const mid = s.clone().add(e).multiplyScalar(0.5);
  const dir = e.clone().sub(s);
  const len = dir.length();

  // Line geometry
  const points = [s, e];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

  // End-cap tick direction (perpendicular, short)
  const tickLen = 0.08;
  const up = new THREE.Vector3(0, 1, 0);
  const cross = dir.clone().normalize().cross(up).normalize().multiplyScalar(tickLen);
  if (cross.length() < 0.01) cross.set(tickLen, 0, 0);

  const tick1 = [
    s.clone().add(cross),
    s.clone().sub(cross),
  ];
  const tick2 = [
    e.clone().add(cross),
    e.clone().sub(cross),
  ];

  const tickGeo1 = new THREE.BufferGeometry().setFromPoints(tick1);
  const tickGeo2 = new THREE.BufferGeometry().setFromPoints(tick2);

  return (
    <group>
      {/* Main dimension line */}
      <line>
        <bufferGeometry attach="geometry" {...lineGeo} />
        <lineBasicMaterial color={color} transparent opacity={0.7} />
      </line>
      {/* End ticks */}
      <line>
        <bufferGeometry attach="geometry" {...tickGeo1} />
        <lineBasicMaterial color={color} transparent opacity={0.7} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...tickGeo2} />
        <lineBasicMaterial color={color} transparent opacity={0.7} />
      </line>
      {/* Label */}
      <Html position={[mid.x, mid.y, mid.z]} center distanceFactor={8} zIndexRange={[10, 0]}>
        <div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            color,
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "10px",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            border: `1px solid ${color}40`,
            backdropFilter: "blur(4px)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

interface DimensionGroupProps {
  length: number;
  height: number;
  width: number;
  originY?: number;
}

/**
 * Standard dimension labels for beam-like structures (length, height, width).
 */
export function StructureDimensions({ length, height, width, originY = -0.9 }: DimensionGroupProps) {
  const halfL = length / 2;
  const halfW = width / 2;

  return (
    <group>
      {/* Length (X axis) — shown below */}
      <DimensionLabel
        start={[-halfL, originY, halfW + 0.3]}
        end={[halfL, originY, halfW + 0.3]}
        label={`${length.toFixed(2)}m`}
      />
      {/* Height (Y axis) — shown on the side */}
      <DimensionLabel
        start={[-halfL - 0.3, originY, halfW]}
        end={[-halfL - 0.3, originY + height, halfW]}
        label={`${height.toFixed(2)}m`}
        color="#a78bfa"
      />
      {/* Width (Z axis) — shown at front */}
      <DimensionLabel
        start={[halfL + 0.3, originY, -halfW]}
        end={[halfL + 0.3, originY, halfW]}
        label={`${width.toFixed(2)}m`}
        color="#34d399"
      />
    </group>
  );
}

interface CarDimensionsProps {
  wheelbase: number;
  trackWidth: number;
  bodyLength: number;
  bodyHeight: number;
  originY?: number;
}

export function CarDimensions({ wheelbase, trackWidth, bodyLength, bodyHeight, originY = 0 }: CarDimensionsProps) {
  return (
    <group>
      {/* Wheelbase */}
      <DimensionLabel
        start={[-wheelbase / 2, originY - 0.1, trackWidth / 2 + 0.4]}
        end={[wheelbase / 2, originY - 0.1, trackWidth / 2 + 0.4]}
        label={`WB ${(wheelbase * 1000).toFixed(0)}mm`}
      />
      {/* Track width */}
      <DimensionLabel
        start={[wheelbase / 2 + 0.3, originY - 0.1, -trackWidth / 2]}
        end={[wheelbase / 2 + 0.3, originY - 0.1, trackWidth / 2]}
        label={`TW ${(trackWidth * 1000).toFixed(0)}mm`}
        color="#34d399"
      />
      {/* Overall length */}
      <DimensionLabel
        start={[-bodyLength / 2, originY + bodyHeight + 0.3, 0]}
        end={[bodyLength / 2, originY + bodyHeight + 0.3, 0]}
        label={`L ${(bodyLength * 1000).toFixed(0)}mm`}
        color="#fbbf24"
      />
    </group>
  );
}
