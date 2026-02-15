import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DesignParams } from "@/lib/parseDesignParams";

export function BridgeStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  const span = params.beamLength;
  const deckThickness = params.beamHeight;
  const deckWidth = params.beamWidth;
  const pierHeight = params.columnHeight;
  const pierWidth = params.columnWidth;
  const numPiers = Math.max(2, Math.round(span / 1.5));
  const archHeight = pierHeight * 0.6;

  return (
    <group ref={groupRef}>
      {/* Road deck */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[span * 1.1, deckThickness, deckWidth]} />
        <meshStandardMaterial color={params.materialColor} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Deck railing */}
      {[-1, 1].map((side) => (
        <mesh key={`rail-${side}`} position={[0, 0.5 + deckThickness / 2 + 0.15, side * deckWidth * 0.48]}>
          <boxGeometry args={[span * 1.1, 0.25, 0.04]} />
          <meshStandardMaterial color={params.columnColor} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Piers / columns */}
      {Array.from({ length: numPiers }).map((_, i) => {
        const x = -span * 0.45 + (i * span * 0.9) / (numPiers - 1);
        return (
          <group key={`pier-${i}`}>
            <mesh position={[x, 0.5 - pierHeight / 2, 0]}>
              <boxGeometry args={[pierWidth, pierHeight, pierWidth * 1.5]} />
              <meshStandardMaterial color={params.columnColor} metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Pier cap */}
            <mesh position={[x, 0.5 - 0.05, 0]}>
              <boxGeometry args={[pierWidth * 1.6, 0.1, deckWidth * 0.6]} />
              <meshStandardMaterial color={params.baseColor} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Arch cables / suspension lines */}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = (i / 7) - 0.5;
        const x = t * span * 0.9;
        const archY = 0.5 + deckThickness / 2 + archHeight * (1 - 4 * t * t);
        return (
          <group key={`cable-${i}`}>
            {/* Vertical cable */}
            <mesh position={[x, (0.5 + deckThickness / 2 + archY) / 2, 0]}>
              <cylinderGeometry args={[0.02, 0.02, archY - 0.5 - deckThickness / 2, 8]} />
              <meshStandardMaterial color={params.materialColor} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Main arch cable (approximated with segments) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const t1 = (i / 12 - 0.5);
        const t2 = ((i + 1) / 12 - 0.5);
        const x1 = t1 * span * 0.95;
        const x2 = t2 * span * 0.95;
        const y1 = 0.5 + deckThickness / 2 + archHeight * (1 - 4 * t1 * t1);
        const y2 = 0.5 + deckThickness / 2 + archHeight * (1 - 4 * t2 * t2);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        return (
          <mesh key={`arch-${i}`} position={[mx, my, 0]} rotation={[0, 0, angle]}>
            <cylinderGeometry args={[0.04, 0.04, len, 8]} />
            <meshStandardMaterial color={params.materialColor} metalness={0.7} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Abutments (ends) */}
      {[-1, 1].map((side) => (
        <mesh key={`abut-${side}`} position={[side * span * 0.55, 0.5 - pierHeight * 0.35, 0]}>
          <boxGeometry args={[pierWidth * 2.5, pierHeight * 0.7, deckWidth * 1.2]} />
          <meshStandardMaterial color={params.baseColor} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Water/ground plane */}
      <mesh position={[0, 0.5 - pierHeight - 0.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[span * 1.6, 0.05, deckWidth * 3]} />
        <meshStandardMaterial color="#0c4a6e" metalness={0.3} roughness={0.1} opacity={0.6} transparent />
      </mesh>
    </group>
  );
}
