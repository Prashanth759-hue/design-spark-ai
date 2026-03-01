import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Text } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { motion } from "framer-motion";
import { ArrowLeft, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Keyboard State ─── */
const useKeyboard = () => {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  return keys;
};

/* ─── Wheel Component ─── */
function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.35, 0.12, 16, 32]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
      </mesh>
    </group>
  );
}

/* ─── Drivable Car ─── */
function DrivableCar({ onSpeedUpdate }: { onSpeedUpdate: (speed: number) => void }) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const keys = useKeyboard();
  const steeringAngle = useRef(0);
  const currentSpeed = useRef(0);

  useFrame((state, delta) => {
    if (!bodyRef.current) return;

    const body = bodyRef.current;
    const velocity = body.linvel();
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2) * 3.6; // km/h
    currentSpeed.current = speed;
    onSpeedUpdate(speed);

    const rotation = body.rotation();
    const euler = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    );
    const forward = new THREE.Vector3(
      -Math.sin(euler.y),
      0,
      -Math.cos(euler.y)
    );

    // Engine force
    const engineForce = 18;
    const brakeForce = 25;

    if (keys.current["ArrowUp"] || keys.current["KeyW"]) {
      body.applyImpulse(
        { x: forward.x * engineForce * delta, y: 0, z: forward.z * engineForce * delta },
        true
      );
    }
    if (keys.current["ArrowDown"] || keys.current["KeyS"]) {
      body.applyImpulse(
        { x: -forward.x * brakeForce * delta, y: 0, z: -forward.z * brakeForce * delta },
        true
      );
    }

    // Steering
    const steerSpeed = 2.5;
    const steerReturn = 4;
    if (keys.current["ArrowLeft"] || keys.current["KeyA"]) {
      steeringAngle.current = Math.min(steeringAngle.current + steerSpeed * delta, 0.8);
    } else if (keys.current["ArrowRight"] || keys.current["KeyD"]) {
      steeringAngle.current = Math.max(steeringAngle.current - steerSpeed * delta, -0.8);
    } else {
      steeringAngle.current *= (1 - steerReturn * delta);
    }

    if (speed > 1) {
      body.applyTorqueImpulse(
        { x: 0, y: steeringAngle.current * 3.5 * delta, z: 0 },
        true
      );
    }

    // Damping
    const lv = body.linvel();
    body.setLinvel({ x: lv.x * 0.995, y: lv.y, z: lv.z * 0.995 }, true);
    const av = body.angvel();
    body.setAngvel({ x: av.x * 0.95, y: av.y * 0.97, z: av.z * 0.95 }, true);

    // Camera follow
    const pos = body.translation();
    const cameraOffset = new THREE.Vector3(
      pos.x - forward.x * 8 + 0,
      pos.y + 4,
      pos.z - forward.z * 8
    );
    state.camera.position.lerp(cameraOffset, 3 * delta);
    state.camera.lookAt(pos.x, pos.y + 0.5, pos.z);
  });

  return (
    <RigidBody ref={bodyRef} colliders={false} mass={1500} position={[0, 2, 0]}
      linearDamping={0.5} angularDamping={0.8}>
      <CuboidCollider args={[1.1, 0.35, 2.4]} position={[0, 0.35, 0]} />

      <group ref={meshRef}>
        {/* Body */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[2.2, 0.7, 4.8]} />
          <meshPhysicalMaterial color="#c8102e" metalness={0.85} roughness={0.08}
            clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2} />
        </mesh>
        {/* Cabin */}
        <mesh position={[0, 0.85, -0.3]} castShadow>
          <boxGeometry args={[1.8, 0.55, 2.2]} />
          <meshPhysicalMaterial color="#0a1020" metalness={0.15} roughness={0.04}
            transmission={0.4} thickness={0.3} ior={1.5} opacity={0.7} transparent />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 1.14, -0.3]} castShadow>
          <boxGeometry args={[1.85, 0.06, 2.25]} />
          <meshPhysicalMaterial color="#c8102e" metalness={0.85} roughness={0.08} clearcoat={1} />
        </mesh>
        {/* Wheels */}
        <Wheel position={[-1, 0, 1.5]} />
        <Wheel position={[1, 0, 1.5]} />
        <Wheel position={[-1, 0, -1.5]} />
        <Wheel position={[1, 0, -1.5]} />
        {/* Headlights */}
        {[-1, 1].map(s => (
          <mesh key={s} position={[s * 0.8, 0.35, 2.42]}>
            <boxGeometry args={[0.35, 0.15, 0.05]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
          </mesh>
        ))}
        {/* Tail lights */}
        {[-1, 1].map(s => (
          <mesh key={s} position={[s * 0.8, 0.35, -2.42]}>
            <boxGeometry args={[0.35, 0.15, 0.05]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={3} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

/* ─── Ground with Ramps ─── */
function Terrain() {
  return (
    <>
      {/* Main ground */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[100, 0.1, 100]} position={[0, -0.1, 0]} />
        <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#2a3a2a" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Ramp 1 */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3, 0.1, 5]} position={[15, 1, 0]} rotation={[0.2, 0, 0]} />
        <mesh position={[15, 1, 0]} rotation={[0.2, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[6, 0.2, 10]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Ramp 2 */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3, 0.1, 5]} position={[-15, 1.5, 15]} rotation={[0.25, 0.5, 0]} />
        <mesh position={[-15, 1.5, 15]} rotation={[0.25, 0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[6, 0.2, 10]} />
          <meshStandardMaterial color="#4a5a5a" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Obstacle boxes */}
      {[
        [8, 0.5, -10],
        [-8, 0.5, -15],
        [20, 0.5, 12],
      ].map((pos, i) => (
        <RigidBody key={i} type="fixed">
          <mesh position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[2, 1, 2]} />
            <meshStandardMaterial color="#6a4a3a" roughness={0.7} />
          </mesh>
        </RigidBody>
      ))}

      {/* Road markings */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, 0.01, -40 + i * 4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 2]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>
      ))}
    </>
  );
}

/* ─── Speedometer HUD ─── */
function SpeedometerHUD({ speed }: { speed: number }) {
  const displaySpeed = Math.round(speed);
  const maxSpeed = 250;
  const pct = Math.min(speed / maxSpeed, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 right-6 z-10 w-52 bg-card/85 backdrop-blur-md border border-border rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-4 h-4 text-primary" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Speedometer</span>
      </div>
      <div className="text-center mb-2">
        <span className="text-4xl font-mono font-bold text-foreground">{displaySpeed}</span>
        <span className="text-sm text-muted-foreground ml-1">km/h</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${pct * 100}%`,
            background: pct > 0.8 ? "hsl(var(--destructive))" : pct > 0.5 ? "hsl(var(--warning, 45 93% 47%))" : "hsl(var(--primary))",
          }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1 font-mono">
        <span>0</span>
        <span>{maxSpeed}</span>
      </div>
    </motion.div>
  );
}

/* ─── Controls Help ─── */
function ControlsHelp() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute bottom-6 left-6 z-10 bg-card/85 backdrop-blur-md border border-border rounded-xl p-3"
    >
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Controls</p>
      <div className="space-y-1 text-[11px]">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">↑</kbd>
          <span className="text-muted-foreground">Accelerate</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">↓</kbd>
          <span className="text-muted-foreground">Brake / Reverse</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">← →</kbd>
          <span className="text-muted-foreground">Steer</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">W A S D</kbd>
          <span className="text-muted-foreground">Alternative</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
const DrivingSimulator = () => {
  const [speed, setSpeed] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-background relative overflow-hidden">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 border border-border text-xs font-medium text-foreground hover:bg-card transition-colors backdrop-blur-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </motion.button>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center"
      >
        <h1 className="text-sm font-semibold text-foreground">🏎 Driving Simulator</h1>
        <p className="text-[10px] text-muted-foreground font-mono">Physics powered by Rapier</p>
      </motion.div>

      <Canvas shadows gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1 }}>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
        <Environment preset="sunset" background />

        <directionalLight position={[20, 30, 10]} intensity={2} castShadow
          shadow-mapSize-width={4096} shadow-mapSize-height={4096}
          shadow-camera-far={80} shadow-camera-left={-30} shadow-camera-right={30}
          shadow-camera-top={30} shadow-camera-bottom={-30} />
        <ambientLight intensity={0.3} />
        <hemisphereLight args={["#87ceeb", "#3d5a3d", 0.5]} />

        <Physics gravity={[0, -9.81, 0]}>
          <DrivableCar onSpeedUpdate={setSpeed} />
          <Terrain />
        </Physics>
      </Canvas>

      <SpeedometerHUD speed={speed} />
      <ControlsHelp />
    </div>
  );
};

export default DrivingSimulator;
