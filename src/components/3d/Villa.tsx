import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function Villa({ color = "#f5f0e8", autoRotate = true }: { color?: string; autoRotate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (groupRef.current && autoRotate) groupRef.current.rotation.y += d * 0.06;
  });

  // Pre-computed warm interior light pattern (some windows lit, some dark)
  const litWindows = [true, false, true, true, false];

  return (
    <group ref={groupRef} position={[0, -0.85, 0]}>
      {/* ── Main building volume ── */}
      <RoundedBox args={[2.6, 1.05, 1.7]} radius={0.02} position={[0, 0.525, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} metalness={0.02} roughness={0.65} />
      </RoundedBox>

      {/* Second floor - offset for modern look */}
      <RoundedBox args={[1.8, 0.75, 1.5]} radius={0.02} position={[-0.25, 1.425, 0]} castShadow>
        <meshPhysicalMaterial color={color} metalness={0.02} roughness={0.65} />
      </RoundedBox>

      {/* Accent wall - dark */}
      <mesh position={[0.6, 0.525, 0.86]} castShadow>
        <boxGeometry args={[0.6, 1.05, 0.02]} />
        <meshPhysicalMaterial color="#292524" metalness={0.15} roughness={0.5} />
      </mesh>

      {/* ── Flat roofs with overhangs ── */}
      <mesh position={[0, 1.06, 0]} castShadow>
        <boxGeometry args={[2.75, 0.04, 1.85]} />
        <meshPhysicalMaterial color="#57534e" metalness={0.3} roughness={0.55} />
      </mesh>
      <mesh position={[-0.25, 1.82, 0]} castShadow>
        <boxGeometry args={[1.95, 0.04, 1.65]} />
        <meshPhysicalMaterial color="#57534e" metalness={0.3} roughness={0.55} />
      </mesh>

      {/* Roof edge trim */}
      <mesh position={[0, 1.08, 0.925]}>
        <boxGeometry args={[2.75, 0.02, 0.01]} />
        <meshPhysicalMaterial color="#78716c" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Ground floor windows - full height glass ── */}
      {[[-0.7, 0.51, 0.86], [0.05, 0.51, 0.86], [0.85, 0.51, 0.86]].map((pos, i) => (
        <group key={`gfw-${i}`}>
          <mesh position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[0.55, 0.8, 0.015]} />
            <meshPhysicalMaterial color="#7dd3fc" metalness={0.08} roughness={0.01}
              transmission={0.55} thickness={0.4} ior={1.52} envMapIntensity={3.2}
              emissive={litWindows[i] ? "#fde68a" : "#000000"} emissiveIntensity={litWindows[i] ? 0.6 : 0} />
          </mesh>
          {/* Window frame */}
          <mesh position={[pos[0], pos[1], pos[2] + 0.005]}>
            <boxGeometry args={[0.57, 0.82, 0.005]} />
            <meshPhysicalMaterial color="#1c1917" metalness={0.4} roughness={0.3} opacity={0.15} transparent />
          </mesh>
          {/* Mullion */}
          <mesh position={[pos[0], pos[1], pos[2] + 0.01]}>
            <boxGeometry args={[0.005, 0.8, 0.005]} />
            <meshPhysicalMaterial color="#44403c" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Second floor windows */}
      {[[-0.75, 1.42, 0.76], [-0.15, 1.42, 0.76]].map((pos, i) => (
        <group key={`sfw-${i}`}>
          <mesh position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[0.48, 0.55, 0.015]} />
            <meshPhysicalMaterial color="#7dd3fc" metalness={0.08} roughness={0.01}
              transmission={0.55} thickness={0.4} ior={1.52} envMapIntensity={3.2}
              emissive={litWindows[i + 3] ? "#fde68a" : "#000000"} emissiveIntensity={litWindows[i + 3] ? 0.7 : 0} />
          </mesh>
          <mesh position={[pos[0], pos[1], pos[2] + 0.01]}>
            <boxGeometry args={[0.005, 0.55, 0.005]} />
            <meshPhysicalMaterial color="#44403c" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Side windows */}
      {[[1.31, 0.51, 0.3], [1.31, 0.51, -0.3]].map((pos, i) => (
        <mesh key={`sw-${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.015, 0.7, 0.4]} />
          <meshPhysicalMaterial color="#7dd3fc" metalness={0.08} roughness={0.01}
            transmission={0.5} thickness={0.3} ior={1.52} />
        </mesh>
      ))}

      {/* ── Entrance ── */}
      <mesh position={[-0.35, 0.38, 0.865]}>
        <boxGeometry args={[0.32, 0.7, 0.015]} />
        <meshPhysicalMaterial color="#292524" metalness={0.35} roughness={0.4} />
      </mesh>
      {/* Door handle */}
      <mesh position={[-0.26, 0.38, 0.88]}>
        <cylinderGeometry args={[0.008, 0.008, 0.08, 6]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Entrance overhang */}
      <mesh position={[-0.35, 0.78, 0.95]} castShadow>
        <boxGeometry args={[0.5, 0.025, 0.2]} />
        <meshPhysicalMaterial color="#57534e" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Entrance light */}
      <mesh position={[-0.35, 0.75, 0.88]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef9c3" emissiveIntensity={2} />
      </mesh>

      {/* ── Balcony ── */}
      <mesh position={[-0.25, 1.06, 0.95]} castShadow>
        <boxGeometry args={[1.4, 0.04, 0.45]} />
        <meshPhysicalMaterial color="#a8a29e" metalness={0.2} roughness={0.55} />
      </mesh>
      {/* Glass railing */}
      <mesh position={[-0.25, 1.17, 1.16]}>
        <boxGeometry args={[1.4, 0.2, 0.008]} />
        <meshPhysicalMaterial color="#e0f2fe" metalness={0.05} roughness={0.01}
          transmission={0.6} thickness={0.2} ior={1.5} opacity={0.5} transparent />
      </mesh>
      {/* Railing posts */}
      {[-0.94, 0.44].map((x, i) => (
        <mesh key={`rp-${i}`} position={[x, 1.14, 1.16]}>
          <boxGeometry args={[0.015, 0.16, 0.015]} />
          <meshPhysicalMaterial color="#d4d4d8" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}

      {/* ── Garage ── */}
      <RoundedBox args={[0.85, 0.75, 1.05]} radius={0.015} position={[1.45, 0.375, 0.32]} castShadow>
        <meshPhysicalMaterial color="#e7e5e4" metalness={0.03} roughness={0.65} />
      </RoundedBox>
      {/* Garage door - sectional */}
      <mesh position={[1.45, 0.32, 0.855]}>
        <boxGeometry args={[0.7, 0.55, 0.015]} />
        <meshPhysicalMaterial color="#44403c" metalness={0.35} roughness={0.45} />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`gd-${i}`} position={[1.45, 0.12 + i * 0.14, 0.87]}>
          <boxGeometry args={[0.68, 0.005, 0.005]} />
          <meshPhysicalMaterial color="#6b6b6b" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* ── Swimming pool ── */}
      <mesh position={[0.4, 0.01, -1.3]} receiveShadow>
        <boxGeometry args={[2.0, 0.14, 0.9]} />
        <meshPhysicalMaterial color="#0284c7" metalness={0.02} roughness={0.05}
          transmission={0.35} thickness={0.6} ior={1.33} />
      </mesh>
      {/* Pool edge - stone */}
      {[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dz], i) => {
        const poolW = dx !== 0 ? 0.03 : 2.06;
        const poolD = dz !== 0 ? 0.03 : 0.96;
        return (
          <mesh key={`pe-${i}`} position={[0.4 + dx * 1.015, 0.08, -1.3 + dz * 0.465]} receiveShadow>
            <boxGeometry args={[poolW, 0.02, poolD]} />
            <meshPhysicalMaterial color="#d6d3d1" metalness={0.1} roughness={0.7} />
          </mesh>
        );
      })}

      {/* ── Landscaping ── */}
      {/* Lawn */}
      <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 6]} />
        <meshPhysicalMaterial color="#4ade80" metalness={0} roughness={0.95} />
      </mesh>

      {/* Driveway */}
      <mesh position={[1.45, 0.005, 1.6]} receiveShadow>
        <boxGeometry args={[1.1, 0.01, 1.6]} />
        <meshPhysicalMaterial color="#a8a29e" metalness={0.08} roughness={0.88} />
      </mesh>
      {/* Driveway edge stones */}
      {[-1, 1].map(s => (
        <mesh key={`de-${s}`} position={[1.45 + s * 0.56, 0.02, 1.6]}>
          <boxGeometry args={[0.02, 0.03, 1.6]} />
          <meshPhysicalMaterial color="#78716c" roughness={0.8} />
        </mesh>
      ))}

      {/* Pathway to entrance */}
      <mesh position={[-0.35, 0.005, 1.3]} receiveShadow>
        <boxGeometry args={[0.5, 0.008, 0.9]} />
        <meshPhysicalMaterial color="#d6d3d1" metalness={0.05} roughness={0.85} />
      </mesh>

      {/* Trees */}
      {[[-1.8, 0.6], [2.2, -0.8], [-1.5, -1.5]].map(([tx, tz], i) => (
        <group key={`tree-${i}`} position={[tx, 0, tz]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.5, 6]} />
            <meshPhysicalMaterial color="#5c3d1e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshPhysicalMaterial color="#16a34a" roughness={0.82} />
          </mesh>
          <mesh position={[0.08, 0.3, 0.05]} castShadow>
            <sphereGeometry args={[0.14, 10, 10]} />
            <meshPhysicalMaterial color="#15803d" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Garden planters */}
      {[[-1.2, 0.86], [0.9, 0.86]].map(([px, pz], i) => (
        <group key={`planter-${i}`} position={[px, 0, pz]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.12, 0.15]} />
            <meshPhysicalMaterial color="#78716c" metalness={0.1} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshPhysicalMaterial color="#22c55e" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Outdoor furniture near pool */}
      {[[-0.5, -1.0], [1.3, -1.0]].map(([fx, fz], i) => (
        <group key={`furn-${i}`} position={[fx, 0.02, fz]}>
          <mesh>
            <boxGeometry args={[0.25, 0.06, 0.4]} />
            <meshPhysicalMaterial color="#e7e5e4" metalness={0.1} roughness={0.6} />
          </mesh>
          {/* Legs */}
          {[[-0.1, -0.17], [0.1, -0.17], [-0.1, 0.17], [0.1, 0.17]].map(([lx, lz], li) => (
            <mesh key={li} position={[lx, -0.02, lz]}>
              <cylinderGeometry args={[0.008, 0.008, 0.04, 4]} />
              <meshPhysicalMaterial color="#a8a29e" metalness={0.5} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Fence */}
      <mesh position={[0, 0.25, -2.2]}>
        <boxGeometry args={[7, 0.5, 0.02]} />
        <meshPhysicalMaterial color="#d4d4d8" metalness={0.1} roughness={0.5} opacity={0.15} transparent />
      </mesh>
    </group>
  );
}
