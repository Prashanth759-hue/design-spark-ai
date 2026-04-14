import * as THREE from "three";

export function VesselPreview() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.5, 0);
  shape.lineTo(0.4, 0.25);
  shape.lineTo(-0.4, 0.25);
  shape.lineTo(-0.5, 0);
  shape.closePath();

  return (
    <group scale={0.7}>
      {/* Hull */}
      <group position={[0, -0.3, -1]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <extrudeGeometry args={[shape, { steps: 1, depth: 2.5, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }]} />
          <meshPhysicalMaterial color="#1e3a5f" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      {/* Superstructure */}
      <mesh position={[0, 0.15, 0.2]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.6]} />
        <meshPhysicalMaterial color="#f1f5f9" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.4, 0.15]} castShadow>
        <boxGeometry args={[0.35, 0.15, 0.4]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 0.65, 0.15]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshPhysicalMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}
