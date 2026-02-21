// ============================================
// 3D Character Models — GLB with Procedural Fallback
// ============================================

import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { CharacterDef } from '@/lib/gameRegistry';

interface CharacterModelProps {
  character: CharacterDef;
  rotate?: boolean;
  scale?: number;
  skinLevel?: number;
}

// GLB file mapping — all characters
const CHARACTER_GLB_MAP: Record<string, string> = {
  ghost_riley: '/Models/Characters/snake_eyes__fortnite_item_shop_skin.glb',
  nova_prime: '/Models/Characters/fortnite_oblivion_skin.glb',
  viper_snake: '/Models/Characters/torin__fortnite_chapter_2_season_8_bp_skin.glb',
  shadow_exe: '/Models/Characters/the_omega_tier_100_skin_fortnite_3d_model.glb',
  midas_gold: '/Models/Characters/midas__fortnite_100_tier_s12_bp_skin.glb',
  marigold: '/Models/Characters/marigold_fortnite_skin__female_midas.glb',
  glow_phantom: '/Models/Characters/glow__fortnite_outfit.glb',
};

const CHARACTER_GLB_CONFIG: Record<string, { scale: number; position: [number, number, number] }> = {
  ghost_riley: { scale: 1.2, position: [0, -1.0, 0] },
  nova_prime: { scale: 1.2, position: [0, -1.0, 0] },
  viper_snake: { scale: 1.2, position: [0, -1.0, 0] },
  shadow_exe: { scale: 1.2, position: [0, -1.0, 0] },
  midas_gold: { scale: 1.2, position: [0, -1.0, 0] },
  marigold: { scale: 1.2, position: [0, -1.0, 0] },
  glow_phantom: { scale: 1.2, position: [0, -1.0, 0] },
};

// ---- GLB Loader ----
const GLBCharacter: React.FC<{ characterId: string; scale: number }> = ({ characterId, scale }) => {
  const path = CHARACTER_GLB_MAP[characterId];
  const { scene } = useGLTF(path);
  const config = CHARACTER_GLB_CONFIG[characterId] ?? { scale: 1.2, position: [0, -1.0, 0] as [number, number, number] };
  const cloned = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={cloned}
      scale={config.scale * scale}
      position={config.position}
    />
  );
};

// ---- Simple Fallback (loading placeholder) ----
const FallbackModel: React.FC<{ colors: CharacterDef['colors'] }> = ({ colors }) => (
  <group>
    <mesh position={[0, 0.5, 0]}>
      <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
      <meshStandardMaterial color={colors.primary} roughness={0.5} metalness={0.3} />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshStandardMaterial color={colors.secondary} roughness={0.4} metalness={0.5} />
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

const CharacterModel3D: React.FC<CharacterModelProps> = ({ character, rotate = true, scale = 1, skinLevel = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) groupRef.current.rotation.y += delta * 0.4;
  });

  const hasGLB = character.id in CHARACTER_GLB_MAP;
  const fallback = <FallbackModel colors={character.colors} />;

  return (
    <group ref={groupRef} scale={scale}>
      {hasGLB ? (
        <GLBErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GLBCharacter characterId={character.id} scale={1} />
          </Suspense>
        </GLBErrorBoundary>
      ) : fallback}
    </group>
  );
};

export default CharacterModel3D;

// Preload
Object.values(CHARACTER_GLB_MAP).forEach(path => {
  try { useGLTF.preload(path); } catch {}
});
