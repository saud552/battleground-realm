import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerModel3DProps {
  position: [number, number, number];
  rotation: number;
  team: 'blue' | 'red';
  skinLevel: number;
  health: number;
  isDead: boolean;
  isLocal: boolean;
  characterId?: string;
}

const TEAM_COLORS = { blue: '#4d8fff', red: '#ff4d4d' };
const LEVEL_EMISSIVE: Record<number, string> = {
  1: '#000000',
  2: '#00ff88',
  3: '#00ccff',
  4: '#ff8800',
  5: '#ff00ff',
};

// Character GLB mapping (same as CharacterModel3D)
const CHARACTER_GLB_MAP: Record<string, string> = {
  ghost_riley: '/Models/Characters/snake_eyes__fortnite_item_shop_skin.glb',
  nova_prime: '/Models/Characters/fortnite_oblivion_skin.glb',
  viper_snake: '/Models/Characters/torin__fortnite_chapter_2_season_8_bp_skin.glb',
  shadow_exe: '/Models/Characters/the_omega_tier_100_skin_fortnite_3d_model.glb',
  midas_gold: '/Models/Characters/midas__fortnite_100_tier_s12_bp_skin.glb',
  marigold: '/Models/Characters/marigold_fortnite_skin__female_midas.glb',
  glow_phantom: '/Models/Characters/glow__fortnite_outfit.glb',
};

const GLBPlayerCharacter: React.FC<{ characterId: string }> = ({ characterId }) => {
  const path = CHARACTER_GLB_MAP[characterId];
  const { scene } = useGLTF(path);
  const cloned = React.useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={0.6} position={[0, 0, 0]} />;
};

// Simple capsule fallback for arena
const CapsuleFallback: React.FC<{ teamColor: string; emissiveColor: string; emissiveIntensity: number }> = ({ teamColor, emissiveColor, emissiveIntensity }) => (
  <mesh castShadow position={[0, 0.8, 0]}>
    <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
    <meshStandardMaterial
      color={teamColor}
      emissive={emissiveColor}
      emissiveIntensity={emissiveIntensity}
      roughness={0.5}
      metalness={0.3}
    />
  </mesh>
);

class GLBErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

const PlayerModel3D: React.FC<PlayerModel3DProps> = ({
  position, rotation, team, skinLevel, health, isDead, isLocal, characterId,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const teamColor = TEAM_COLORS[team];
  const emissiveColor = LEVEL_EMISSIVE[Math.min(5, Math.max(1, skinLevel))];
  const emissiveIntensity = skinLevel >= 2 ? 0.3 * (skinLevel - 1) : 0;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -rotation + Math.PI / 2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 2;
    }
  });

  if (isDead) {
    return (
      <group position={position}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[0.8, 16]} />
          <meshBasicMaterial color="#ff3333" transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  const hasGLB = characterId && characterId in CHARACTER_GLB_MAP;
  const capsuleFallback = <CapsuleFallback teamColor={teamColor} emissiveColor={emissiveColor} emissiveIntensity={emissiveIntensity} />;

  return (
    <group position={position} ref={groupRef}>
      {/* Character model or capsule fallback */}
      {hasGLB ? (
        <GLBErrorBoundary fallback={capsuleFallback}>
          <Suspense fallback={capsuleFallback}>
            <GLBPlayerCharacter characterId={characterId!} />
          </Suspense>
        </GLBErrorBoundary>
      ) : capsuleFallback}

      {/* Weapon barrel */}
      <mesh position={[0, 0.6, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.8, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Local player indicator ring */}
      {isLocal && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Level 4+ rotating ring */}
      {skinLevel >= 4 && (
        <mesh ref={ringRef} position={[0, 1.2, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.7, 0.03, 8, 32]} />
          <meshBasicMaterial color={emissiveColor} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Level 5 sparkles */}
      {skinLevel >= 5 && (
        <Sparkles count={20} scale={2} size={3} speed={0.4} color={emissiveColor} position={[0, 0.8, 0]} />
      )}

      {/* Health bar */}
      {health < 100 && health > 0 && (
        <group position={[0, 2, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.1]} />
            <meshBasicMaterial color="#222222" />
          </mesh>
          <mesh position={[(health / 100 - 1) * 0.6, 0, 0.001]}>
            <planeGeometry args={[1.2 * (health / 100), 0.1]} />
            <meshBasicMaterial color={health > 50 ? '#00ff44' : health > 20 ? '#ffcc00' : '#ff3333'} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default React.memo(PlayerModel3D);
