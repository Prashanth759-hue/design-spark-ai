export function JetPreview() {
  return (
    <group scale={0.35}>
      {/* Fuselage */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.25, 5, 16]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} clearcoat={0.8} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 2.7, 0]} castShadow>
        <coneGeometry args={[0.3, 0.8, 16]} />
        <meshPhysicalMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Wings */}
      <mesh position={[1.5, 0, 0]} castShadow>
        <boxGeometry args={[3, 0.06, 0.8]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-1.5, 0, 0]} castShadow>
        <boxGeometry args={[3, 0.06, 0.8]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, -2.2, 0]} castShadow>
        <boxGeometry args={[1.2, 0.06, 0.5]} />
        <meshPhysicalMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -2, 0.3]} castShadow>
        <boxGeometry args={[0.06, 0.6, 0.6]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Engines */}
      <mesh position={[0.8, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.5, 12]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.8, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.5, 12]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
