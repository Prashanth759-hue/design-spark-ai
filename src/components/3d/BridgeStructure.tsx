import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { DesignParams } from "@/lib/parseDesignParams";

export function BridgeStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  const span = params.beamLength;
  const deckThickness = params.beamHeight;
  const deckWidth = params.beamWidth;
  const pierHeight = params.columnHeight;
  const pierWidth = params.columnWidth;
  const numPiers = Math.max(2, Math.round(span / 1.5));
  const archHeight = pierHeight * 0.7;

  return (
    <group ref={groupRef}>
      {/* Road deck with asphalt-like surface */}
      <RoundedBox args={[span * 1.1, deckThickness, deckWidth]} radius={0.02} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#52525b" metalness={0.1} roughness={0.85} envMapIntensity={0.4} />
      </RoundedBox>

      {/* Road surface markings */}
      <mesh position={[0, 0.5 + deckThickness / 2 + 0.003, 0]}>
        <boxGeometry args={[span * 1.05, 0.005, 0.06]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
      </mesh>

      {/* Lane markings */}
      {Array.from({ length: Math.floor(span / 0.6) }).map((_, i) => (
        <mesh key={`lane-${i}`} position={[-span * 0.45 + i * 0.6, 0.5 + deckThickness / 2 + 0.003, deckWidth * 0.15]}>
          <boxGeometry args={[0.3, 0.005, 0.03]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>
      ))}

      {/* Deck railings — tubular steel */}
      {[-1, 1].map((side) => (
        <group key={`rail-${side}`}>
          {/* Top rail */}
          <mesh position={[0, 0.5 + deckThickness / 2 + 0.28, side * deckWidth * 0.48]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, span * 1.08, 16]} />
            <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Bottom rail */}
          <mesh position={[0, 0.5 + deckThickness / 2 + 0.1, side * deckWidth * 0.48]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, span * 1.08, 12]} />
            <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Vertical railing posts */}
          {Array.from({ length: Math.floor(span / 0.5) + 1 }).map((_, i) => {
            const x = -span * 0.5 + i * 0.5;
            return (
              <mesh key={`post-${side}-${i}`} position={[x, 0.5 + deckThickness / 2 + 0.15, side * deckWidth * 0.48]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
                <meshPhysicalMaterial color="#64748b" metalness={0.85} roughness={0.15} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Concrete piers with tapered form */}
      {Array.from({ length: numPiers }).map((_, i) => {
        const x = -span * 0.45 + (i * span * 0.9) / (numPiers - 1);
        return (
          <group key={`pier-${i}`}>
            {/* Main pier body */}
            <mesh position={[x, 0.5 - pierHeight / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[pierWidth * 1.2, pierHeight, pierWidth * 1.8]} />
              <meshPhysicalMaterial color="#a8a29e" metalness={0.1} roughness={0.75} envMapIntensity={0.3} />
            </mesh>
            {/* Pier cap / bearing */}
            <RoundedBox args={[pierWidth * 2, 0.1, deckWidth * 0.5]} radius={0.015} position={[x, 0.5 - 0.04, 0]} castShadow>
              <meshPhysicalMaterial color="#78716c" metalness={0.3} roughness={0.6} />
            </RoundedBox>
            {/* Pier base footing */}
            <mesh position={[x, 0.5 - pierHeight - 0.06, 0]} receiveShadow>
              <boxGeometry args={[pierWidth * 2.5, 0.12, pierWidth * 3]} />
              <meshPhysicalMaterial color="#78716c" metalness={0.15} roughness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Main arch cable with proper tube geometry */}
      {Array.from({ length: 16 }).map((_, i) => {
        const t1 = i / 16 - 0.5;
        const t2 = (i + 1) / 16 - 0.5;
        const x1 = t1 * span * 0.95;
        const x2 = t2 * span * 0.95;
        const y1 = 0.5 + deckThickness / 2 + archHeight * (1 - 4 * t1 * t1);
        const y2 = 0.5 + deckThickness / 2 + archHeight * (1 - 4 * t2 * t2);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        return (
          <mesh key={`arch-${i}`} position={[mx, my, 0]} rotation={[0, 0, angle]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, len, 16]} />
            <meshPhysicalMaterial color={params.materialColor} metalness={0.85} roughness={0.12} clearcoat={0.4} envMapIntensity={1.3} />
          </mesh>
        );
      })}

      {/* Suspension cables / hangers */}
      {Array.from({ length: 10 }).map((_, i) => {
        const t = (i / 9) - 0.5;
        const x = t * span * 0.85;
        const archY = 0.5 + deckThickness / 2 + archHeight * (1 - 4 * t * t);
        const cableLen = archY - 0.5 - deckThickness / 2;
        if (cableLen < 0.05) return null;
        return (
          <mesh key={`cable-${i}`} position={[x, 0.5 + deckThickness / 2 + cableLen / 2, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, cableLen, 8]} />
            <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} roughness={0.08} />
          </mesh>
        );
      })}

      {/* Abutments */}
      {[-1, 1].map((side) => (
        <RoundedBox key={`abut-${side}`} args={[pierWidth * 3, pierHeight * 0.8, deckWidth * 1.3]} radius={0.03} position={[side * span * 0.55, 0.5 - pierHeight * 0.35, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#a8a29e" metalness={0.1} roughness={0.8} envMapIntensity={0.3} />
        </RoundedBox>
      ))}

      {/* Water surface */}
      <mesh position={[0, 0.5 - pierHeight - 0.1, 0]} receiveShadow>
        <boxGeometry args={[span * 1.8, 0.04, deckWidth * 4]} />
        <meshPhysicalMaterial
          color="#0c4a6e"
          metalness={0.6}
          roughness={0.15}
          transmission={0.3}
          thickness={2}
          ior={1.33}
          envMapIntensity={1.5}
        />
      </mesh>
    </group>
  );
}
