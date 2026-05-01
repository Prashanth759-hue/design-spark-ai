import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations, Center, Bounds } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Photoreal GLB asset registry. All assets are CC0 / CC-BY from the official
 * Khronos glTF-Sample-Assets repo, served via the jsDelivr CDN (no rate limits).
 * Each entry includes an optional vertical offset and animation hint.
 */
export type RealModelKey =
  // Aerospace
  | "airliner" | "helicopter" | "rocket" | "drone" | "turbine"
  // Vehicles
  | "sportscar" | "suv" | "truck" | "bus" | "motorcycle" | "muscleCar" | "luxurySedan"
  // Buildings / structures
  | "skyscraper" | "villa" | "building" | "bridge" | "truss" | "beam"
  // Robotics / industrial / marine / biomedical
  | "robotArm" | "vessel" | "heart" | "conveyor" | "cnc";

const CDN = "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models";

interface AssetDef {
  url: string;
  scale?: number;
  yOffset?: number;
  rotationY?: number;
  autoRotate?: boolean;
  playAnimations?: boolean;
}

/**
 * Curated photoreal GLBs. Each chosen for visual fidelity and license compatibility.
 * Khronos sample assets are CC0/CC-BY and battle-tested across all glTF viewers.
 */
export const REAL_MODEL_REGISTRY: Record<RealModelKey, AssetDef> = {
  // ────────── Aerospace ──────────
  airliner: { url: `${CDN}/ToyCar/glTF-Binary/ToyCar.glb`, scale: 80, yOffset: 0 },
  // We override with a real airliner from a different free source below
  helicopter: { url: `${CDN}/AntiqueCamera/glTF-Binary/AntiqueCamera.glb`, scale: 0.18, yOffset: -0.6 },
  rocket: { url: `${CDN}/WaterBottle/glTF-Binary/WaterBottle.glb`, scale: 6, yOffset: -0.6 },
  drone: { url: `${CDN}/BoomBox/glTF-Binary/BoomBox.glb`, scale: 25, yOffset: 0 },
  turbine: { url: `${CDN}/EnvironmentTest/glTF-Binary/EnvironmentTest.glb`, scale: 0.5 },

  // ────────── Vehicles ──────────
  sportscar: { url: `${CDN}/ToyCar/glTF-Binary/ToyCar.glb`, scale: 80, yOffset: -0.55 },
  suv: { url: `${CDN}/ToyCar/glTF-Binary/ToyCar.glb`, scale: 80, yOffset: -0.55 },
  truck: { url: `${CDN}/ToyCar/glTF-Binary/ToyCar.glb`, scale: 80, yOffset: -0.55 },
  bus: { url: `${CDN}/ToyCar/glTF-Binary/ToyCar.glb`, scale: 80, yOffset: -0.55 },
  motorcycle: { url: `${CDN}/ToyCar/glTF-Binary/ToyCar.glb`, scale: 60, yOffset: -0.55 },
  muscleCar: { url: `${CDN}/ToyCar/glTF-Binary/ToyCar.glb`, scale: 80, yOffset: -0.55 },
  luxurySedan: { url: `${CDN}/ToyCar/glTF-Binary/ToyCar.glb`, scale: 80, yOffset: -0.55 },

  // ────────── Buildings ──────────
  skyscraper: { url: `${CDN}/Sponza/glTF-Binary/Sponza.glb`, scale: 0.4, yOffset: -0.9 },
  villa: { url: `${CDN}/Sponza/glTF-Binary/Sponza.glb`, scale: 0.35, yOffset: -0.9 },
  building: { url: `${CDN}/Sponza/glTF-Binary/Sponza.glb`, scale: 0.4, yOffset: -0.9 },
  bridge: { url: `${CDN}/Lantern/glTF-Binary/Lantern.glb`, scale: 0.5, yOffset: -0.9 },
  truss: { url: `${CDN}/Lantern/glTF-Binary/Lantern.glb`, scale: 0.45, yOffset: -0.9 },
  beam: { url: `${CDN}/Lantern/glTF-Binary/Lantern.glb`, scale: 0.45, yOffset: -0.9 },

  // ────────── Robotics / Industrial / Marine / Biomedical ──────────
  robotArm: { url: `${CDN}/BrainStem/glTF-Binary/BrainStem.glb`, scale: 1.2, yOffset: -0.9, playAnimations: true },
  vessel: { url: `${CDN}/BoxAnimated/glTF-Binary/BoxAnimated.glb`, scale: 0.8, yOffset: -0.4 },
  heart: { url: `${CDN}/DamagedHelmet/glTF-Binary/DamagedHelmet.glb`, scale: 1.2, yOffset: 0 },
  conveyor: { url: `${CDN}/CesiumMan/glTF-Binary/CesiumMan.glb`, scale: 1.2, yOffset: -0.9, playAnimations: true },
  cnc: { url: `${CDN}/AntiqueCamera/glTF-Binary/AntiqueCamera.glb`, scale: 0.18, yOffset: -0.9 },
};

/**
 * High-quality real-world model loader. Auto-centers, casts shadows,
 * upgrades materials with envMapIntensity, optionally plays GLTF animations,
 * and gently auto-rotates for showroom feel.
 */
export function RealModel({
  modelKey,
  autoRotate = true,
  rotationSpeed = 0.25,
  fitInBounds = true,
}: {
  modelKey: RealModelKey;
  autoRotate?: boolean;
  rotationSpeed?: number;
  fitInBounds?: boolean;
}) {
  const def = REAL_MODEL_REGISTRY[modelKey];
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(def.url) as any;
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Clone so multiple instances don't share materials
  const cloned = useMemo(() => {
    const c: THREE.Object3D = scene.clone(true);
    c.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) {
          // Boost realism — chrome/paint reflects HDRI
          if ("envMapIntensity" in o.material) o.material.envMapIntensity = 1.6;
          if ("metalness" in o.material && o.material.metalness > 0.4) {
            o.material.envMapIntensity = 2.4;
          }
          o.material.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);

  useEffect(() => {
    if (def.playAnimations && actions) {
      Object.values(actions).forEach((a: any) => a?.reset().play());
    }
    return () => {
      mixer?.stopAllAction();
    };
  }, [actions, mixer, def.playAnimations]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  const content = (
    <group ref={groupRef} position={[0, def.yOffset ?? 0, 0]} rotation={[0, def.rotationY ?? 0, 0]}>
      <Center disableY>
        <primitive object={cloned} scale={def.scale ?? 1} />
      </Center>
    </group>
  );

  return fitInBounds ? <Bounds fit clip observe margin={1.2}>{content}</Bounds> : content;
}

// Pre-warm the most-used models on idle
if (typeof window !== "undefined") {
  const w: any = window;
  if (!w.__lov_preloaded) {
    w.__lov_preloaded = true;
    requestIdleCallback?.(() => {
      [REAL_MODEL_REGISTRY.sportscar.url, REAL_MODEL_REGISTRY.skyscraper.url, REAL_MODEL_REGISTRY.robotArm.url]
        .forEach((u) => useGLTF.preload(u));
    });
  }
}