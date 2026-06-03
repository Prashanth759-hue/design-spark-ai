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

  // ── Cable-stayed bridge with twin A-frame pylons ──
  const span = Math.min(Math.max(params.beamLength, 2.5), 5);
  const deckThickness = 0.08;
  const deckWidth = Math.min(Math.max(params.beamWidth, 0.7), 1.0);
  const pylonH = 1.6;              // tall pylons above deck
  const deckY = 0.2;               // deck elevation
  const waterY = -0.45;
  const pylonBaseGap = deckWidth * 1.4;
  const pylonTopGap = 0.12;
  // Two pylons, placed 1/3 and 2/3 along span
  const pylonX = [-span * 0.18, span * 0.18];
  const fitScale = Math.min(1, 3.4 / span);

  // Cable colors
  const cableMat = (
    <meshPhysicalMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} envMapIntensity={2.5} />
  );

  const Cable = ({ from, to, r = 0.012 }: { from: [number, number, number]; to: [number, number, number]; r?: number }) => {
    const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
    // Orient default cylinder (Y-axis) along (dx,dy,dz)
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return (
      <mesh position={mid} rotation={[euler.x, euler.y, euler.z]} castShadow>
        <cylinderGeometry args={[r, r, len, 8]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} envMapIntensity={2.5} />
      </mesh>
    );
  };

  return (
    <group ref={groupRef} scale={fitScale} position={[0, -0.2, 0]}>
      {/* Water plane */}
      <mesh position={[0, waterY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[span * 1.5, deckWidth * 3]} />
        <meshPhysicalMaterial color="#0c4a6e" metalness={0.5} roughness={0.2} transmission={0.4} thickness={1} ior={1.33} envMapIntensity={1.8} />
      </mesh>

      {/* Road deck — slim, continuous */}
      <RoundedBox args={[span * 1.1, deckThickness, deckWidth]} radius={0.015} position={[0, deckY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#3f3f46" metalness={0.15} roughness={0.85} />
      </RoundedBox>
      {/* Center divider line */}
      <mesh position={[0, deckY + deckThickness / 2 + 0.002, 0]}>
        <boxGeometry args={[span * 1.05, 0.004, 0.04]} />
        <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.4} />
      </mesh>
      {/* Lane dashes */}
      {Array.from({ length: Math.floor(span * 1.4) }).map((_, i) => (
        <mesh key={`ld-${i}`} position={[-span * 0.5 + i * 0.7, deckY + deckThickness / 2 + 0.002, deckWidth * 0.25]}>
          <boxGeometry args={[0.25, 0.004, 0.025]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
      ))}

      {/* Edge railings */}
      {[-1, 1].map((s) => (
        <mesh key={`er-${s}`} position={[0, deckY + 0.1, s * deckWidth * 0.5]} castShadow>
          <boxGeometry args={[span * 1.1, 0.12, 0.03]} />
          <meshPhysicalMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Twin A-frame pylons */}
      {pylonX.map((px, pi) => (
        <group key={`pylon-${pi}`} position={[px, 0, 0]}>
          {/* Each pylon: 2 inclined legs meeting near top */}
          {[-1, 1].map((s) => {
            const baseZ = s * pylonBaseGap / 2;
            const topZ = s * pylonTopGap / 2;
            const baseY = waterY + 0.05;
            const topY = deckY + pylonH;
            const dz = topZ - baseZ;
            const dy = topY - baseY;
            const len = Math.sqrt(dz * dz + dy * dy);
            const angle = Math.atan2(dz, dy); // rotate around X
            return (
              <mesh key={s} position={[0, (baseY + topY) / 2, (baseZ + topZ) / 2]} rotation={[angle, 0, 0]} castShadow>
                <boxGeometry args={[0.16, len, 0.18]} />
                <meshPhysicalMaterial color={params.materialColor} metalness={0.4} roughness={0.45} envMapIntensity={1.6} />
              </mesh>
            );
          })}
          {/* Crossbeam below deck */}
          <mesh position={[0, deckY - 0.18, 0]} castShadow>
            <boxGeometry args={[0.18, 0.1, pylonBaseGap * 0.85]} />
            <meshPhysicalMaterial color={params.materialColor} metalness={0.4} roughness={0.45} />
          </mesh>
          {/* Crossbeam at top */}
          <mesh position={[0, deckY + pylonH - 0.05, 0]} castShadow>
            <boxGeometry args={[0.14, 0.08, pylonTopGap + 0.12]} />
            <meshPhysicalMaterial color={params.materialColor} metalness={0.5} roughness={0.35} />
          </mesh>
          {/* Pylon foundation in water */}
          <mesh position={[0, waterY - 0.08, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.5, 0.18, pylonBaseGap + 0.2]} />
            <meshPhysicalMaterial color="#78716c" metalness={0.1} roughness={0.85} />
          </mesh>

          {/* Fan-pattern stay cables: from pylon top to deck on both sides */}
          {[-1, 1].map((dir) =>
            Array.from({ length: 6 }).map((_, i) => {
              const t = (i + 1) / 6;
              const deckX = px + dir * t * (span * 0.42);
              if (Math.abs(deckX) > span * 0.55) return null;
              return (
                <>
                  <Cable
                    key={`cbl-${pi}-${dir}-${i}-a`}
                    from={[0, deckY + pylonH - 0.05, pylonTopGap / 2]}
                    to={[deckX - px, deckY + deckThickness / 2, deckWidth * 0.45]}
                  />
                  <Cable
                    key={`cbl-${pi}-${dir}-${i}-b`}
                    from={[0, deckY + pylonH - 0.05, -pylonTopGap / 2]}
                    to={[deckX - px, deckY + deckThickness / 2, -deckWidth * 0.45]}
                  />
                </>
              );
            })
          )}
        </group>
      ))}

      {/* End abutments on shore */}
      {[-1, 1].map((s) => (
        <RoundedBox key={`ab-${s}`} args={[0.4, 0.45, deckWidth * 1.3]} radius={0.03} position={[s * span * 0.55, deckY - 0.22, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#a8a29e" metalness={0.1} roughness={0.8} />
        </RoundedBox>
      ))}
    </group>
  );
}
