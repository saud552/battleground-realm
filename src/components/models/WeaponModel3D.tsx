// ============================================
// 3D Weapon Models — GLB with Procedural Fallback
// ============================================

import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface WeaponModelProps {
  weaponId: string;
  rotate?: boolean;
  scale?: number;
}

// GLB file mapping — all weapons
const WEAPON_GLB_MAP: Record<string, string> = {
  k416: '/Models/weapons/rifle__m4a1-s_weapon_model_cs2.glb',
  ak_death: '/Models/weapons/ak-47disassembly_of_weapons.glb',
  awm_x: '/Models/weapons/rifle__awp_weapon_model_cs2.glb',
  vector_neon: '/Models/weapons/animated_pp-19-01.glb',
  s12_breacher: '/Models/weapons/shotgun_mr-133_animated.glb',
  desert_eagle: '/Models/weapons/pistol__desert_eagle_weapon_model_cs2.glb',
  glock_17: '/Models/weapons/glock_17_-_fps_weapon_animations_pack_v.1.glb',
  m4a4_thunder: '/Models/weapons/rifle__m4a4_weapon_model_cs2.glb',
  sniper_elite: '/Models/weapons/sniper.glb',
  usp_shadow: '/Models/weapons/pistol__usp-s_weapon_model_cs2.glb',
  awp_black: '/Models/weapons/rifle__awp_black_version_weapon_model_cs2.glb',
  cz100: '/Models/weapons/cz100__realtime_weapon.glb',
  cheytac: '/Models/weapons/cheytac_m300_mcmillan_stock.glb',
  t77: '/Models/weapons/t77_handgun.glb',
  colt_m1911: '/Models/weapons/colt_pistol_m1911a1_game_asset.glb',
};

// GLB scale/offset tuning per weapon
const WEAPON_GLB_CONFIG: Record<string, { scale: number; position: [number, number, number]; rotation: [number, number, number] }> = {
  k416: { scale: 2.5, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  ak_death: { scale: 2.5, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  awm_x: { scale: 2.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  vector_neon: { scale: 3.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  s12_breacher: { scale: 2.5, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  desert_eagle: { scale: 4.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  glock_17: { scale: 4.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  m4a4_thunder: { scale: 2.5, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  sniper_elite: { scale: 2.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  usp_shadow: { scale: 4.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  awp_black: { scale: 2.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  cz100: { scale: 4.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  cheytac: { scale: 2.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  t77: { scale: 4.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  colt_m1911: { scale: 4.0, position: [0, -0.1, 0], rotation: [0, 0, 0] },
};

// ---- GLB Loader Component ----
const GLBWeapon: React.FC<{ weaponId: string; scale: number }> = ({ weaponId, scale }) => {
  const path = WEAPON_GLB_MAP[weaponId];
  const { scene } = useGLTF(path);
  const config = WEAPON_GLB_CONFIG[weaponId] ?? { scale: 2.5, position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] };

  const cloned = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={cloned}
      scale={config.scale * scale}
      position={config.position}
      rotation={config.rotation}
    />
  );
};

// Simple fallback
const FallbackWeapon: React.FC<{ scale: number }> = ({ scale }) => (
  <group scale={scale}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.2, 0.2, 0.15]} />
      <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
    </mesh>
    <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.03, 0.04, 0.5, 8]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.95} />
    </mesh>
  </group>
);

// Error boundary
class GLBErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

const WeaponModel3D: React.FC<WeaponModelProps> = ({ weaponId, rotate = true, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  const hasGLB = weaponId in WEAPON_GLB_MAP;
  const fallback = <FallbackWeapon scale={scale} />;

  return (
    <group ref={groupRef}>
      {hasGLB ? (
        <GLBErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GLBWeapon weaponId={weaponId} scale={scale} />
          </Suspense>
        </GLBErrorBoundary>
      ) : fallback}
    </group>
  );
};

export default WeaponModel3D;

// Preload GLB files
Object.values(WEAPON_GLB_MAP).forEach(path => {
  try { useGLTF.preload(path); } catch {}
});
