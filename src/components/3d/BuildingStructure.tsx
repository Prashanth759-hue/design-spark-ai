import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { DesignParams } from "@/lib/parseDesignParams";

export function BuildingStructure({ params }: { params: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  // Keep footprint and overall height small enough to stay fully inside the viewport
  const width = Math.min(2.2, params.beamWidth * 2.4);
  const depth = Math.min(1.8, params.beamWidth * 2.0);
  const floors = Math.max(2, Math.min(7, Math.round(params.columnHeight * 3)));
  const floorH = 0.4;
  const totalH = floors * floorH;
  const baseY = -totalH / 2;
  // Auto-fit: if the model is still taller than ~3m, scale it down so the camera frames it
  const fitScale = Math.min(1, 3 / Math.max(totalH, width));

  // Deterministic lit-window pattern using golden-ratio hash (warm interior glow)
  const isLit = (f: number, w: number, side: number) => {
    const h = (f * 73 + w * 37 + side * 191) * 0.6180339887;
    return (h - Math.floor(h)) > 0.55;
  };

  return (
    <group ref={groupRef} scale={[fitScale, fitScale, fitScale]}>
      {/* Foundation */}
      <RoundedBox args={[width * 1.2, 0.25, depth * 1.2]} radius={0.03} position={[0, baseY - 0.12, 0]} receiveShadow>
        <meshPhysicalMaterial color="#57534e" metalness={0.15} roughness={0.85} envMapIntensity={0.3} />
      </RoundedBox>

      {/* Floor slabs & structural elements */}
      {Array.from({ length: floors }).map((_, f) => {
        const y = baseY + f * floorH;
        const isGround = f === 0;
        return (
          <group key={`floor-${f}`}>
            {/* Floor slab — concrete */}
            <mesh position={[0, y + floorH, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 1.02, 0.07, depth * 1.02]} />
              <meshPhysicalMaterial color="#d6d3d1" metalness={0.05} roughness={0.75} />
            </mesh>

            {/* Corner columns — concrete with slight rounding */}
            {[
              [-width * 0.44, -depth * 0.44],
              [width * 0.44, -depth * 0.44],
              [-width * 0.44, depth * 0.44],
              [width * 0.44, depth * 0.44],
            ].map(([cx, cz], ci) => (
              <RoundedBox key={`col-${f}-${ci}`} args={[0.1, floorH - 0.07, 0.1]} radius={0.008} position={[cx, y + floorH / 2 + 0.035, cz]} castShadow>
                <meshPhysicalMaterial color="#a8a29e" metalness={0.1} roughness={0.7} />
              </RoundedBox>
            ))}

            {/* Glass curtain wall — front face */}
            {Array.from({ length: 4 }).map((_, w) => {
              const wx = -width * 0.33 + w * width * 0.22;
              const lit = isLit(f, w, 0);
              return (
                <group key={`win-${f}-${w}`}>
                  {/* Glass pane */}
                  <mesh position={[wx, y + floorH / 2 + 0.035, -depth * 0.5 - 0.005]} castShadow>
                    <boxGeometry args={[width * 0.18, floorH * 0.6, 0.015]} />
                    <meshPhysicalMaterial
                      color="#bfdbfe"
                      metalness={0.1}
                      roughness={0.02}
                      transmission={0.5}
                      thickness={0.5}
                      ior={1.52}
                      envMapIntensity={3.2}
                      emissive={lit ? "#fde68a" : "#000000"}
                      emissiveIntensity={lit ? 0.7 : 0}
                    />
                  </mesh>
                  {/* Window frame */}
                  <mesh position={[wx, y + floorH / 2 + 0.035, -depth * 0.5 - 0.012]}>
                    <boxGeometry args={[width * 0.19, floorH * 0.62, 0.008]} />
                    <meshPhysicalMaterial color="#64748b" metalness={0.8} roughness={0.2} />
                  </mesh>
                </group>
              );
            })}

            {/* Glass — side face */}
            {Array.from({ length: 3 }).map((_, w) => {
              const wz = -depth * 0.25 + w * depth * 0.25;
              const lit = isLit(f, w, 1);
              return (
                <group key={`swin-${f}-${w}`}>
                  <mesh position={[width * 0.5 + 0.005, y + floorH / 2 + 0.035, wz]} castShadow>
                    <boxGeometry args={[0.015, floorH * 0.6, depth * 0.18]} />
                    <meshPhysicalMaterial color="#bfdbfe" metalness={0.1} roughness={0.02} transmission={0.5} thickness={0.5} ior={1.52} envMapIntensity={3.2}
                      emissive={lit ? "#fde68a" : "#000000"} emissiveIntensity={lit ? 0.7 : 0} />
                  </mesh>
                  <mesh position={[width * 0.5 + 0.012, y + floorH / 2 + 0.035, wz]}>
                    <boxGeometry args={[0.008, floorH * 0.62, depth * 0.19]} />
                    <meshPhysicalMaterial color="#64748b" metalness={0.8} roughness={0.2} />
                  </mesh>
                </group>
              );
            })}

            {/* Spandrel panel between floors */}
            <mesh position={[0, y + floorH * 0.12, -depth * 0.5 - 0.008]}>
              <boxGeometry args={[width * 0.98, floorH * 0.2, 0.012]} />
              <meshPhysicalMaterial color={params.materialColor} metalness={0.5} roughness={0.3} envMapIntensity={0.8} />
            </mesh>

            {/* Ground floor entrance */}
            {isGround && (
              <group>
                <mesh position={[0, y + floorH * 0.35, -depth * 0.505]}>
                  <boxGeometry args={[width * 0.22, floorH * 0.6, 0.02]} />
                  <meshPhysicalMaterial color="#93c5fd" metalness={0.05} roughness={0.02} transmission={0.65} thickness={0.4} ior={1.52} />
                </mesh>
                {/* Canopy */}
                <RoundedBox args={[width * 0.35, 0.03, 0.3]} radius={0.01} position={[0, y + floorH * 0.7, -depth * 0.55]} castShadow>
                  <meshPhysicalMaterial color="#475569" metalness={0.7} roughness={0.2} />
                </RoundedBox>
              </group>
            )}
          </group>
        );
      })}

      {/* Roof slab */}
      <RoundedBox args={[width * 1.04, 0.1, depth * 1.04]} radius={0.02} position={[0, baseY + totalH + 0.1, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#78716c" metalness={0.3} roughness={0.6} />
      </RoundedBox>

      {/* Parapet wall */}
      {[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dz], i) => {
        const isX = dx !== 0;
        return (
          <mesh key={`parapet-${i}`} position={[dx * width * 0.52, baseY + totalH + 0.2, dz * depth * 0.52]} castShadow>
            <boxGeometry args={isX ? [0.04, 0.18, depth * 1.04] : [width * 1.04, 0.18, 0.04]} />
            <meshPhysicalMaterial color="#a8a29e" metalness={0.1} roughness={0.7} />
          </mesh>
        );
      })}

      {/* Rooftop equipment */}
      {[[-0.3, -0.2], [0.3, 0.15], [0, 0.3]].map(([rx, rz], ri) => (
        <RoundedBox key={`equip-${ri}`} args={[0.22, 0.18, 0.18]} radius={0.02} position={[rx, baseY + totalH + 0.24, rz]} castShadow>
          <meshPhysicalMaterial color="#71717a" metalness={0.4} roughness={0.5} />
        </RoundedBox>
      ))}

      {/* Ground plane / landscaping */}
      <mesh position={[0, baseY - 0.25, 0]} receiveShadow>
        <boxGeometry args={[width * 2.5, 0.02, depth * 2.5]} />
        <meshPhysicalMaterial color="#4ade80" metalness={0} roughness={0.95} envMapIntensity={0.2} />
      </mesh>
    </group>
  );
}
