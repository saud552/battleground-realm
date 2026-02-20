// ============================================
// Procedural 3D Weapon Models — React Three Fiber
// Each weapon has a unique geometry matching reference art
// ============================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeaponModelProps {
  weaponId: string;
  rotate?: boolean;
  scale?: number;
}

// ---- K416: Compact AR with rail, foregrip, red-dot ----
const K416Model = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    {/* Receiver body */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.6, 0.22, 0.18]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.8} />
    </mesh>
    {/* Upper rail */}
    <mesh position={[0.1, 0.14, 0]}>
      <boxGeometry args={[1.0, 0.04, 0.12]} />
      <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.9} />
    </mesh>
    {/* Barrel */}
    <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.04, 0.7, 8]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.95} />
    </mesh>
    {/* Muzzle brake */}
    <mesh position={[1.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.045, 0.12, 6]} />
      <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.9} />
    </mesh>
    {/* Magazine */}
    <mesh position={[-0.1, -0.2, 0]} rotation={[0, 0, 0.08]}>
      <boxGeometry args={[0.12, 0.32, 0.1]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
    </mesh>
    {/* Stock */}
    <mesh position={[-0.95, 0.02, 0]}>
      <boxGeometry args={[0.5, 0.16, 0.08]} />
      <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.4} />
    </mesh>
    {/* Buffer tube */}
    <mesh position={[-0.65, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.7} />
    </mesh>
    {/* Pistol grip */}
    <mesh position={[-0.3, -0.18, 0]} rotation={[0, 0, -0.3]}>
      <boxGeometry args={[0.08, 0.22, 0.1]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
    </mesh>
    {/* Foregrip */}
    <mesh position={[0.4, -0.18, 0]} rotation={[0, 0, -0.1]}>
      <boxGeometry args={[0.06, 0.14, 0.08]} />
      <meshStandardMaterial color="#222222" roughness={0.6} metalness={0.4} />
    </mesh>
    {/* Red dot sight */}
    <mesh position={[0.15, 0.22, 0]}>
      <boxGeometry args={[0.12, 0.1, 0.08]} />
      <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.7} />
    </mesh>
    <mesh position={[0.15, 0.24, 0]}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={2} />
    </mesh>
    {/* Trigger guard */}
    <mesh position={[-0.2, -0.1, 0]}>
      <torusGeometry args={[0.05, 0.008, 4, 8, Math.PI]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
    </mesh>
  </group>
);

// ---- AK-Death: Heavy AR with curved mag, wooden finish ----
const AKDeathModel = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    {/* Receiver */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 0.24, 0.2]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.35} metalness={0.85} />
    </mesh>
    {/* Gas tube */}
    <mesh position={[0.5, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
      <meshStandardMaterial color="#333" roughness={0.3} metalness={0.9} />
    </mesh>
    {/* Barrel */}
    <mesh position={[1.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.04, 0.045, 0.8, 8]} />
      <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.95} />
    </mesh>
    {/* Muzzle */}
    <mesh position={[1.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.055, 0.05, 0.1, 8]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.9} />
    </mesh>
    {/* Curved magazine */}
    <mesh position={[-0.05, -0.25, 0]} rotation={[0, 0, 0.15]}>
      <boxGeometry args={[0.14, 0.36, 0.1]} />
      <meshStandardMaterial color="#111" roughness={0.5} metalness={0.7} />
    </mesh>
    {/* Wooden handguard */}
    <mesh position={[0.45, -0.06, 0]}>
      <boxGeometry args={[0.5, 0.14, 0.16]} />
      <meshStandardMaterial color="#6b3a1a" roughness={0.7} metalness={0.1} />
    </mesh>
    {/* Wooden stock */}
    <mesh position={[-1.0, 0.0, 0]}>
      <boxGeometry args={[0.6, 0.15, 0.08]} />
      <meshStandardMaterial color="#6b3a1a" roughness={0.7} metalness={0.1} />
    </mesh>
    {/* Stock curve (buttplate) */}
    <mesh position={[-1.3, -0.05, 0]} rotation={[0, 0, -0.15]}>
      <boxGeometry args={[0.08, 0.18, 0.09]} />
      <meshStandardMaterial color="#4a2a0a" roughness={0.8} metalness={0.1} />
    </mesh>
    {/* Pistol grip */}
    <mesh position={[-0.3, -0.2, 0]} rotation={[0, 0, -0.25]}>
      <boxGeometry args={[0.08, 0.24, 0.1]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
    </mesh>
    {/* Rear sight */}
    <mesh position={[-0.2, 0.16, 0]}>
      <boxGeometry args={[0.06, 0.06, 0.04]} />
      <meshStandardMaterial color="#222" metalness={0.9} />
    </mesh>
    {/* Front sight */}
    <mesh position={[0.8, 0.16, 0]}>
      <boxGeometry args={[0.03, 0.08, 0.03]} />
      <meshStandardMaterial color="#222" metalness={0.9} />
    </mesh>
    {/* Menacing glow */}
    <mesh position={[1.55, 0, 0]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1.5} />
    </mesh>
  </group>
);

// ---- AWM-X: Long bolt-action sniper with scope, bipod ----
const AWMXModel = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    {/* Receiver/action */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.2, 0.2, 0.16]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.9} />
    </mesh>
    {/* Long barrel */}
    <mesh position={[1.3, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.04, 1.4, 8]} />
      <meshStandardMaterial color="#111" roughness={0.15} metalness={0.95} />
    </mesh>
    {/* Heavy muzzle brake */}
    <mesh position={[2.0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.06, 0.055, 0.15, 8]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.9} />
    </mesh>
    {/* Scope body */}
    <mesh position={[0.1, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.055, 0.055, 0.5, 12]} />
      <meshStandardMaterial color="#111" roughness={0.2} metalness={0.9} />
    </mesh>
    {/* Scope objective lens */}
    <mesh position={[0.35, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.06, 0.06, 12]} />
      <meshStandardMaterial color="#001a33" roughness={0.1} metalness={0.5} />
    </mesh>
    {/* Scope lens glow */}
    <mesh position={[0.39, 0.2, 0]}>
      <circleGeometry args={[0.05, 12]} />
      <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.8} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
    {/* Scope rings */}
    {[-0.08, 0.25].map((x, i) => (
      <mesh key={i} position={[x, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.06, 0.08]} />
        <meshStandardMaterial color="#222" metalness={0.9} />
      </mesh>
    ))}
    {/* Bolt handle */}
    <mesh position={[0.15, 0.05, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
      <meshStandardMaterial color="#333" metalness={0.9} />
    </mesh>
    <mesh position={[0.15, 0.05, 0.18]}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshStandardMaterial color="#222" metalness={0.8} />
    </mesh>
    {/* Magazine */}
    <mesh position={[0.0, -0.18, 0]}>
      <boxGeometry args={[0.14, 0.2, 0.1]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.7} />
    </mesh>
    {/* Stock */}
    <mesh position={[-0.9, 0, 0]}>
      <boxGeometry args={[0.6, 0.18, 0.1]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
    </mesh>
    {/* Cheek riser */}
    <mesh position={[-0.7, 0.08, 0]}>
      <boxGeometry args={[0.25, 0.06, 0.08]} />
      <meshStandardMaterial color="#222" roughness={0.6} metalness={0.5} />
    </mesh>
    {/* Pistol grip */}
    <mesh position={[-0.35, -0.18, 0]} rotation={[0, 0, -0.2]}>
      <boxGeometry args={[0.08, 0.22, 0.1]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
    </mesh>
    {/* Bipod legs */}
    {[-0.06, 0.06].map((z, i) => (
      <group key={i}>
        <mesh position={[0.7, -0.2, z]} rotation={[0, 0, 0.15 * (i === 0 ? 1 : -1)]}>
          <cylinderGeometry args={[0.012, 0.01, 0.3, 6]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>
        <mesh position={[0.72, -0.35, z]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshStandardMaterial color="#111" metalness={0.7} />
        </mesh>
      </group>
    ))}
  </group>
);

// ---- Vector-Neon: Compact SMG with neon accents ----
const VectorNeonModel = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    {/* Main body — angled profile */}
    <mesh position={[0, 0.05, 0]} rotation={[0, 0, -0.05]}>
      <boxGeometry args={[1.0, 0.28, 0.16]} />
      <meshStandardMaterial color="#0a0a1a" roughness={0.3} metalness={0.85} />
    </mesh>
    {/* Barrel shroud */}
    <mesh position={[0.65, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
      <meshStandardMaterial color="#111" roughness={0.25} metalness={0.9} />
    </mesh>
    {/* Short barrel */}
    <mesh position={[0.9, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.025, 0.03, 0.15, 8]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.95} />
    </mesh>
    {/* Neon accent strips */}
    {[0.12, 0, -0.12].map((y, i) => (
      <mesh key={i} position={[0.2, y + 0.05, 0.085]}>
        <boxGeometry args={[0.5, 0.015, 0.005]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
      </mesh>
    ))}
    {[0.12, 0, -0.12].map((y, i) => (
      <mesh key={`b${i}`} position={[0.2, y + 0.05, -0.085]}>
        <boxGeometry args={[0.5, 0.015, 0.005]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
      </mesh>
    ))}
    {/* Magazine (straight) */}
    <mesh position={[0.0, -0.2, 0]}>
      <boxGeometry args={[0.1, 0.28, 0.08]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.7} />
    </mesh>
    {/* Folding stock (folded up) */}
    <mesh position={[-0.55, 0.12, 0]}>
      <boxGeometry args={[0.35, 0.04, 0.06]} />
      <meshStandardMaterial color="#111" roughness={0.4} metalness={0.7} />
    </mesh>
    {/* Wire stock arm */}
    <mesh position={[-0.35, 0.08, 0]} rotation={[0, 0, -0.3]}>
      <cylinderGeometry args={[0.01, 0.01, 0.15, 4]} />
      <meshStandardMaterial color="#222" metalness={0.8} />
    </mesh>
    {/* Pistol grip */}
    <mesh position={[-0.2, -0.14, 0]} rotation={[0, 0, -0.15]}>
      <boxGeometry args={[0.07, 0.2, 0.09]} />
      <meshStandardMaterial color="#0a0a1a" roughness={0.6} metalness={0.3} />
    </mesh>
    {/* Red dot */}
    <mesh position={[0.05, 0.24, 0]}>
      <boxGeometry args={[0.08, 0.06, 0.06]} />
      <meshStandardMaterial color="#111" roughness={0.4} metalness={0.7} />
    </mesh>
    <mesh position={[0.05, 0.26, 0]}>
      <sphereGeometry args={[0.012, 6, 6]} />
      <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={3} />
    </mesh>
  </group>
);

// ---- S12-Breacher: Bulky tactical shotgun with drum mag ----
const S12BreacherModel = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    {/* Receiver — wide and chunky */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.3, 0.26, 0.22]} />
      <meshStandardMaterial color="#2a1a1a" roughness={0.35} metalness={0.8} />
    </mesh>
    {/* Wide barrel */}
    <mesh position={[0.95, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.06, 0.065, 0.6, 8]} />
      <meshStandardMaterial color="#1a0a0a" roughness={0.2} metalness={0.9} />
    </mesh>
    {/* Muzzle / breaching tip */}
    <mesh position={[1.28, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.075, 0.065, 0.08, 8]} />
      <meshStandardMaterial color="#111" roughness={0.3} metalness={0.9} />
    </mesh>
    {/* Drum magazine */}
    <mesh position={[0.05, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 0.1, 16]} />
      <meshStandardMaterial color="#111" roughness={0.4} metalness={0.8} />
    </mesh>
    {/* Drum center hub */}
    <mesh position={[0.05, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
      <meshStandardMaterial color="#cc3300" emissive="#ff4400" emissiveIntensity={0.5} />
    </mesh>
    {/* Top rail */}
    <mesh position={[0.1, 0.16, 0]}>
      <boxGeometry args={[0.8, 0.04, 0.1]} />
      <meshStandardMaterial color="#222" roughness={0.4} metalness={0.9} />
    </mesh>
    {/* Stock */}
    <mesh position={[-0.85, 0, 0]}>
      <boxGeometry args={[0.45, 0.18, 0.1]} />
      <meshStandardMaterial color="#2a1a1a" roughness={0.5} metalness={0.5} />
    </mesh>
    {/* Pistol grip */}
    <mesh position={[-0.3, -0.18, 0]} rotation={[0, 0, -0.2]}>
      <boxGeometry args={[0.09, 0.22, 0.11]} />
      <meshStandardMaterial color="#1a0a0a" roughness={0.7} metalness={0.3} />
    </mesh>
    {/* Foregrip */}
    <mesh position={[0.45, -0.14, 0]}>
      <boxGeometry args={[0.08, 0.12, 0.1]} />
      <meshStandardMaterial color="#1a0a0a" roughness={0.6} metalness={0.4} />
    </mesh>
    {/* Accent glow on drum */}
    <pointLight position={[0.05, -0.22, 0]} color="#ff4400" intensity={0.3} distance={0.5} />
  </group>
);

// ---- Main export ----
const WEAPON_MODELS: Record<string, React.FC<{ scale: number }>> = {
  k416: K416Model,
  ak_death: AKDeathModel,
  awm_x: AWMXModel,
  vector_neon: VectorNeonModel,
  s12_breacher: S12BreacherModel,
};

const WeaponModel3D: React.FC<WeaponModelProps> = ({ weaponId, rotate = true, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const ModelComponent = WEAPON_MODELS[weaponId];
  if (!ModelComponent) return null;

  return (
    <group ref={groupRef}>
      <ModelComponent scale={scale} />
    </group>
  );
};

export default WeaponModel3D;
