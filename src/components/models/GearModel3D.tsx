// ============================================
// Procedural 3D Gear Models — Helmets & Backpacks
// ============================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GearModelProps {
  gearId: string;
  gearType: 'helmet' | 'backpack';
  rotate?: boolean;
  scale?: number;
  color?: string;
}

// ---- HELMETS ----
const ReconCapModel = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0, 0]}><boxGeometry args={[0.3, 0.12, 0.28]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
    <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
    {/* Bill */}
    <mesh position={[0, -0.01, 0.16]} rotation={[-0.2, 0, 0]}><boxGeometry args={[0.22, 0.02, 0.12]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
  </group>
);

const TacticalOpsModel = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0, 0]}><sphereGeometry args={[0.18, 12, 10]} /><meshStandardMaterial color={color} roughness={0.3} metalness={0.7} /></mesh>
    {/* Visor */}
    <mesh position={[0, -0.04, 0.15]}><boxGeometry args={[0.24, 0.08, 0.04]} /><meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.8} transparent opacity={0.7} /></mesh>
    {/* Side rails */}
    <mesh position={[-0.17, 0.02, 0]}><boxGeometry args={[0.04, 0.06, 0.2]} /><meshStandardMaterial color="#333" metalness={0.9} /></mesh>
    <mesh position={[0.17, 0.02, 0]}><boxGeometry args={[0.04, 0.06, 0.2]} /><meshStandardMaterial color="#333" metalness={0.9} /></mesh>
    {/* NVG mount */}
    <mesh position={[0, 0.16, 0.05]}><boxGeometry args={[0.06, 0.04, 0.06]} /><meshStandardMaterial color="#222" metalness={0.8} /></mesh>
  </group>
);

const TitaniumJuggernautModel = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0, 0]}><sphereGeometry args={[0.2, 14, 12]} /><meshStandardMaterial color={color} roughness={0.2} metalness={0.9} /></mesh>
    {/* Full face plate */}
    <mesh position={[0, -0.04, 0.16]}><boxGeometry args={[0.28, 0.18, 0.06]} /><meshStandardMaterial color="#0a0a1a" roughness={0.15} metalness={0.85} /></mesh>
    {/* Visor slit */}
    <mesh position={[0, -0.02, 0.195]}><boxGeometry args={[0.2, 0.04, 0.01]} /><meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1} transparent opacity={0.6} /></mesh>
    {/* Ear protection */}
    <mesh position={[-0.2, -0.02, 0]}><boxGeometry args={[0.06, 0.14, 0.14]} /><meshStandardMaterial color={color} roughness={0.3} metalness={0.8} /></mesh>
    <mesh position={[0.2, -0.02, 0]}><boxGeometry args={[0.06, 0.14, 0.14]} /><meshStandardMaterial color={color} roughness={0.3} metalness={0.8} /></mesh>
    {/* Top armor ridge */}
    <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.08, 0.04, 0.24]} /><meshStandardMaterial color="#222" metalness={0.9} /></mesh>
  </group>
);

// ---- BACKPACKS ----
const LightScoutModel = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0, 0]}><boxGeometry args={[0.22, 0.28, 0.1]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
    <mesh position={[0, 0.05, 0.055]}><boxGeometry args={[0.16, 0.12, 0.04]} /><meshStandardMaterial color="#2a3a2a" roughness={0.6} /></mesh>
    {/* Strap */}
    <mesh position={[-0.1, 0.14, 0.04]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.02, 0.2, 0.02]} /><meshStandardMaterial color="#3a3a2a" /></mesh>
  </group>
);

const CommandoModel = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0, 0]}><boxGeometry args={[0.28, 0.36, 0.14]} /><meshStandardMaterial color={color} roughness={0.6} metalness={0.2} /></mesh>
    {/* MOLLE straps */}
    {[-0.08, 0, 0.08].map((y, i) => (
      <mesh key={i} position={[0, y, 0.075]}><boxGeometry args={[0.24, 0.02, 0.005]} /><meshStandardMaterial color="#3a4a3a" /></mesh>
    ))}
    {/* Side pouches */}
    <mesh position={[-0.16, -0.05, 0]}><boxGeometry args={[0.06, 0.12, 0.1]} /><meshStandardMaterial color="#2a3a2a" roughness={0.6} /></mesh>
    <mesh position={[0.16, -0.05, 0]}><boxGeometry args={[0.06, 0.12, 0.1]} /><meshStandardMaterial color="#2a3a2a" roughness={0.6} /></mesh>
    {/* Top flap */}
    <mesh position={[0, 0.2, 0.03]}><boxGeometry args={[0.26, 0.05, 0.16]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
  </group>
);

const EliteExpeditionModel = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0, 0]}><boxGeometry args={[0.34, 0.44, 0.18]} /><meshStandardMaterial color={color} roughness={0.5} metalness={0.3} /></mesh>
    {/* Bottom roll */}
    <mesh position={[0, -0.26, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.28, 8]} /><meshStandardMaterial color="#1a2a2a" roughness={0.6} /></mesh>
    {/* Top compartment */}
    <mesh position={[0, 0.26, 0]}><boxGeometry args={[0.3, 0.1, 0.16]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
    {/* Side pockets */}
    <mesh position={[-0.2, 0, 0]}><boxGeometry args={[0.08, 0.2, 0.12]} /><meshStandardMaterial color="#1a2a3a" roughness={0.5} /></mesh>
    <mesh position={[0.2, 0, 0]}><boxGeometry args={[0.08, 0.2, 0.12]} /><meshStandardMaterial color="#1a2a3a" roughness={0.5} /></mesh>
    {/* MOLLE webbing */}
    {[-0.1, 0, 0.1].map((y, i) => (
      <mesh key={i} position={[0, y, 0.095]}><boxGeometry args={[0.28, 0.02, 0.005]} /><meshStandardMaterial color="#2a3a4a" /></mesh>
    ))}
    {/* Antenna pouch */}
    <mesh position={[0.14, 0.3, -0.06]} rotation={[0.1, 0, 0.1]}><cylinderGeometry args={[0.01, 0.008, 0.14, 4]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
  </group>
);

const HELMET_MODELS: Record<string, React.FC<{ color: string }>> = {
  recon_cap: ReconCapModel,
  tactical_ops: TacticalOpsModel,
  titanium_juggernaut: TitaniumJuggernautModel,
};

const BACKPACK_MODELS: Record<string, React.FC<{ color: string }>> = {
  light_scout: LightScoutModel,
  commando: CommandoModel,
  elite_expedition: EliteExpeditionModel,
};

const GearModel3D: React.FC<GearModelProps> = ({ gearId, gearType, rotate = true, scale = 1, color = '#2a2a3a' }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  const models = gearType === 'helmet' ? HELMET_MODELS : BACKPACK_MODELS;
  const ModelComponent = models[gearId];
  if (!ModelComponent) return null;

  return (
    <group ref={groupRef} scale={scale}>
      <ModelComponent color={color} />
    </group>
  );
};

export default GearModel3D;
