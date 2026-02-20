// ============================================
// Procedural 3D Character Models — React Three Fiber
// 4 unique tactical operators with distinct silhouettes
// ============================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CharacterDef } from '@/lib/gameRegistry';

interface CharacterModelProps {
  character: CharacterDef;
  rotate?: boolean;
  scale?: number;
  skinLevel?: number;
}

// ---- Ghost Riley: Heavy operator, skull visor, dark armor ----
const GhostRileyModel = ({ colors, emissiveIntensity }: { colors: CharacterDef['colors']; emissiveIntensity: number }) => (
  <group>
    {/* Heavy boots */}
    <mesh position={[-0.12, -0.75, 0]}><boxGeometry args={[0.18, 0.18, 0.26]} /><meshStandardMaterial color="#111" roughness={0.7} metalness={0.5} /></mesh>
    <mesh position={[0.12, -0.75, 0]}><boxGeometry args={[0.18, 0.18, 0.26]} /><meshStandardMaterial color="#111" roughness={0.7} metalness={0.5} /></mesh>
    {/* Legs */}
    <mesh position={[-0.1, -0.45, 0]}><boxGeometry args={[0.16, 0.45, 0.16]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0.1, -0.45, 0]}><boxGeometry args={[0.16, 0.45, 0.16]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    {/* Torso — heavy armor */}
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.48, 0.55, 0.28]} /><meshStandardMaterial color={colors.secondary} roughness={0.4} metalness={0.7} /></mesh>
    {/* Chest plate */}
    <mesh position={[0, 0.12, 0.12]}><boxGeometry args={[0.36, 0.32, 0.08]} /><meshStandardMaterial color={colors.accent} roughness={0.3} metalness={0.9} /></mesh>
    {/* Shoulder pads */}
    <mesh position={[-0.3, 0.2, 0]}><boxGeometry args={[0.14, 0.12, 0.22]} /><meshStandardMaterial color={colors.accent} roughness={0.4} metalness={0.8} /></mesh>
    <mesh position={[0.3, 0.2, 0]}><boxGeometry args={[0.14, 0.12, 0.22]} /><meshStandardMaterial color={colors.accent} roughness={0.4} metalness={0.8} /></mesh>
    {/* Arms */}
    <mesh position={[-0.3, -0.1, 0]}><boxGeometry args={[0.12, 0.4, 0.12]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0.3, -0.1, 0]}><boxGeometry args={[0.12, 0.4, 0.12]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    {/* Neck */}
    <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.06, 0.08, 0.08, 8]} /><meshStandardMaterial color={colors.primary} /></mesh>
    {/* Head */}
    <mesh position={[0, 0.52, 0]}><boxGeometry args={[0.24, 0.24, 0.24]} /><meshStandardMaterial color={colors.primary} roughness={0.5} /></mesh>
    {/* Skull visor */}
    <mesh position={[0, 0.5, 0.12]}>
      <boxGeometry args={[0.2, 0.14, 0.02]} />
      <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
    </mesh>
    {/* Visor eyes (skull motif) */}
    <mesh position={[-0.04, 0.52, 0.135]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color={colors.emissive} emissive={colors.emissive} emissiveIntensity={emissiveIntensity * 2} /></mesh>
    <mesh position={[0.04, 0.52, 0.135]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color={colors.emissive} emissive={colors.emissive} emissiveIntensity={emissiveIntensity * 2} /></mesh>
    {/* Belt / tactical gear */}
    <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.44, 0.06, 0.3]} /><meshStandardMaterial color="#222" roughness={0.5} metalness={0.6} /></mesh>
  </group>
);

// ---- Nova Prime: Sleek futuristic, cyan accents ----
const NovaPrimeModel = ({ colors, emissiveIntensity }: { colors: CharacterDef['colors']; emissiveIntensity: number }) => (
  <group>
    {/* Sleek boots */}
    <mesh position={[-0.1, -0.75, 0]}><boxGeometry args={[0.14, 0.16, 0.22]} /><meshStandardMaterial color={colors.secondary} roughness={0.3} metalness={0.7} /></mesh>
    <mesh position={[0.1, -0.75, 0]}><boxGeometry args={[0.14, 0.16, 0.22]} /><meshStandardMaterial color={colors.secondary} roughness={0.3} metalness={0.7} /></mesh>
    {/* Slim legs */}
    <mesh position={[-0.08, -0.45, 0]}><boxGeometry args={[0.12, 0.45, 0.13]} /><meshStandardMaterial color={colors.primary} roughness={0.4} metalness={0.5} /></mesh>
    <mesh position={[0.08, -0.45, 0]}><boxGeometry args={[0.12, 0.45, 0.13]} /><meshStandardMaterial color={colors.primary} roughness={0.4} metalness={0.5} /></mesh>
    {/* Streamlined torso */}
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.38, 0.5, 0.22]} /><meshStandardMaterial color={colors.primary} roughness={0.3} metalness={0.7} /></mesh>
    {/* Cyan accent lines */}
    <mesh position={[0, 0.1, 0.115]}><boxGeometry args={[0.02, 0.4, 0.005]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity} /></mesh>
    <mesh position={[-0.15, 0.1, 0.115]}><boxGeometry args={[0.01, 0.3, 0.005]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity} /></mesh>
    <mesh position={[0.15, 0.1, 0.115]}><boxGeometry args={[0.01, 0.3, 0.005]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity} /></mesh>
    {/* Smooth shoulder guards */}
    <mesh position={[-0.24, 0.2, 0]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color={colors.secondary} roughness={0.3} metalness={0.8} /></mesh>
    <mesh position={[0.24, 0.2, 0]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color={colors.secondary} roughness={0.3} metalness={0.8} /></mesh>
    {/* Arms */}
    <mesh position={[-0.24, -0.1, 0]}><boxGeometry args={[0.1, 0.38, 0.1]} /><meshStandardMaterial color={colors.primary} roughness={0.4} /></mesh>
    <mesh position={[0.24, -0.1, 0]}><boxGeometry args={[0.1, 0.38, 0.1]} /><meshStandardMaterial color={colors.primary} roughness={0.4} /></mesh>
    {/* Head — visor helmet */}
    <mesh position={[0, 0.48, 0]}><sphereGeometry args={[0.14, 12, 12]} /><meshStandardMaterial color={colors.secondary} roughness={0.2} metalness={0.8} /></mesh>
    {/* Visor */}
    <mesh position={[0, 0.47, 0.1]}>
      <boxGeometry args={[0.22, 0.06, 0.04]} />
      <meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity * 1.5} transparent opacity={0.8} />
    </mesh>
  </group>
);

// ---- Viper Snake: Agile stealth, camo, slim ----
const ViperSnakeModel = ({ colors, emissiveIntensity }: { colors: CharacterDef['colors']; emissiveIntensity: number }) => (
  <group>
    {/* Light boots */}
    <mesh position={[-0.08, -0.75, 0]}><boxGeometry args={[0.12, 0.14, 0.2]} /><meshStandardMaterial color="#1a2a1a" roughness={0.7} /></mesh>
    <mesh position={[0.08, -0.75, 0]}><boxGeometry args={[0.12, 0.14, 0.2]} /><meshStandardMaterial color="#1a2a1a" roughness={0.7} /></mesh>
    {/* Thin legs */}
    <mesh position={[-0.07, -0.45, 0]}><boxGeometry args={[0.1, 0.45, 0.11]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0.07, -0.45, 0]}><boxGeometry args={[0.1, 0.45, 0.11]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    {/* Slim torso */}
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.32, 0.45, 0.18]} /><meshStandardMaterial color={colors.secondary} roughness={0.5} metalness={0.3} /></mesh>
    {/* Camo pattern patches */}
    <mesh position={[0.08, 0.0, 0.095]}><boxGeometry args={[0.08, 0.1, 0.005]} /><meshStandardMaterial color={colors.primary} roughness={0.7} /></mesh>
    <mesh position={[-0.06, 0.15, 0.095]}><boxGeometry args={[0.1, 0.08, 0.005]} /><meshStandardMaterial color="#3a5a2a" roughness={0.7} /></mesh>
    {/* Light shoulder pads */}
    <mesh position={[-0.2, 0.18, 0]}><boxGeometry args={[0.08, 0.08, 0.15]} /><meshStandardMaterial color={colors.secondary} roughness={0.5} /></mesh>
    <mesh position={[0.2, 0.18, 0]}><boxGeometry args={[0.08, 0.08, 0.15]} /><meshStandardMaterial color={colors.secondary} roughness={0.5} /></mesh>
    {/* Arms */}
    <mesh position={[-0.2, -0.1, 0]}><boxGeometry args={[0.09, 0.36, 0.09]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0.2, -0.1, 0]}><boxGeometry args={[0.09, 0.36, 0.09]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    {/* Head — balaclava with goggles */}
    <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.2, 0.22, 0.2]} /><meshStandardMaterial color={colors.primary} roughness={0.7} /></mesh>
    {/* Night vision goggles (raised) */}
    <mesh position={[0, 0.6, 0.04]} rotation={[0.3, 0, 0]}>
      <boxGeometry args={[0.16, 0.06, 0.08]} />
      <meshStandardMaterial color="#222" roughness={0.3} metalness={0.8} />
    </mesh>
    {/* Goggle lenses */}
    <mesh position={[-0.04, 0.6, 0.09]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity} /></mesh>
    <mesh position={[0.04, 0.6, 0.09]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity} /></mesh>
    {/* Utility belt with pouches */}
    <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.34, 0.05, 0.22]} /><meshStandardMaterial color="#2a2a1a" roughness={0.6} /></mesh>
    <mesh position={[0.14, -0.15, 0.1]}><boxGeometry args={[0.05, 0.06, 0.04]} /><meshStandardMaterial color="#3a3a2a" roughness={0.6} /></mesh>
    <mesh position={[-0.14, -0.15, 0.1]}><boxGeometry args={[0.05, 0.06, 0.04]} /><meshStandardMaterial color="#3a3a2a" roughness={0.6} /></mesh>
  </group>
);

// ---- Shadow Exe: Digital warfare, purple/neon, angular ----
const ShadowExeModel = ({ colors, emissiveIntensity }: { colors: CharacterDef['colors']; emissiveIntensity: number }) => (
  <group>
    {/* Angular boots */}
    <mesh position={[-0.1, -0.75, 0]}><boxGeometry args={[0.14, 0.16, 0.24]} /><meshStandardMaterial color={colors.primary} roughness={0.3} metalness={0.6} /></mesh>
    <mesh position={[0.1, -0.75, 0]}><boxGeometry args={[0.14, 0.16, 0.24]} /><meshStandardMaterial color={colors.primary} roughness={0.3} metalness={0.6} /></mesh>
    {/* Legs */}
    <mesh position={[-0.08, -0.45, 0]}><boxGeometry args={[0.12, 0.45, 0.12]} /><meshStandardMaterial color={colors.primary} roughness={0.4} metalness={0.5} /></mesh>
    <mesh position={[0.08, -0.45, 0]}><boxGeometry args={[0.12, 0.45, 0.12]} /><meshStandardMaterial color={colors.primary} roughness={0.4} metalness={0.5} /></mesh>
    {/* Angular torso */}
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.4, 0.5, 0.22]} /><meshStandardMaterial color={colors.secondary} roughness={0.3} metalness={0.7} /></mesh>
    {/* Digital circuit lines (emissive) */}
    {[-0.12, 0, 0.12].map((y, i) => (
      <mesh key={i} position={[0, y + 0.05, 0.115]}><boxGeometry args={[0.3, 0.008, 0.005]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity * 1.5} /></mesh>
    ))}
    {/* Angular shoulder plates */}
    <mesh position={[-0.26, 0.2, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.12, 0.1, 0.18]} /><meshStandardMaterial color={colors.secondary} roughness={0.3} metalness={0.8} /></mesh>
    <mesh position={[0.26, 0.2, 0]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.12, 0.1, 0.18]} /><meshStandardMaterial color={colors.secondary} roughness={0.3} metalness={0.8} /></mesh>
    {/* Arms */}
    <mesh position={[-0.24, -0.1, 0]}><boxGeometry args={[0.1, 0.36, 0.1]} /><meshStandardMaterial color={colors.primary} roughness={0.4} /></mesh>
    <mesh position={[0.24, -0.1, 0]}><boxGeometry args={[0.1, 0.36, 0.1]} /><meshStandardMaterial color={colors.primary} roughness={0.4} /></mesh>
    {/* Wrist emitters */}
    <mesh position={[-0.24, -0.25, 0.06]}><boxGeometry args={[0.06, 0.04, 0.03]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity} /></mesh>
    <mesh position={[0.24, -0.25, 0.06]}><boxGeometry args={[0.06, 0.04, 0.03]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity} /></mesh>
    {/* Head — angular helmet with visor */}
    <mesh position={[0, 0.48, 0]}>
      <boxGeometry args={[0.24, 0.24, 0.22]} />
      <meshStandardMaterial color={colors.secondary} roughness={0.25} metalness={0.8} />
    </mesh>
    {/* Angular visor */}
    <mesh position={[0, 0.47, 0.115]} rotation={[0.1, 0, 0]}>
      <boxGeometry args={[0.22, 0.08, 0.02]} />
      <meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity * 2} transparent opacity={0.7} />
    </mesh>
    {/* Antenna */}
    <mesh position={[0.1, 0.65, -0.05]} rotation={[0.2, 0, 0.1]}>
      <cylinderGeometry args={[0.005, 0.008, 0.12, 4]} />
      <meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={emissiveIntensity} />
    </mesh>
  </group>
);

// ---- Model map ----
const CHARACTER_MODELS: Record<string, React.FC<{ colors: CharacterDef['colors']; emissiveIntensity: number }>> = {
  ghost_riley: GhostRileyModel,
  nova_prime: NovaPrimeModel,
  viper_snake: ViperSnakeModel,
  shadow_exe: ShadowExeModel,
};

const CharacterModel3D: React.FC<CharacterModelProps> = ({ character, rotate = true, scale = 1, skinLevel = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  const ModelComponent = CHARACTER_MODELS[character.id];
  if (!ModelComponent) return null;

  // Skin level increases emissive intensity
  const emissiveIntensity = 0.3 + (skinLevel - 1) * 0.5;

  return (
    <group ref={groupRef} scale={scale}>
      <ModelComponent colors={character.colors} emissiveIntensity={emissiveIntensity} />
    </group>
  );
};

export default CharacterModel3D;
