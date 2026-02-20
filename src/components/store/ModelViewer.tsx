// ============================================
// 3D Model Viewer Card — Canvas wrapper for store items
// ============================================

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface ModelViewerProps {
  children: React.ReactNode;
  height?: string;
  orbitControls?: boolean;
  bgColor?: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  children,
  height = 'h-48',
  orbitControls = false,
  bgColor = 'transparent',
}) => (
  <div className={`${height} w-full rounded-xl overflow-hidden`} style={{ background: bgColor }}>
    <Canvas camera={{ position: [0, 0.3, 2.5], fov: 35 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <directionalLight position={[-2, 2, -3]} intensity={0.4} color="#4488ff" />
      <pointLight position={[0, -1, 2]} intensity={0.3} color="#ff4444" />
      <Suspense fallback={null}>
        {children}
      </Suspense>
      {orbitControls && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />}
    </Canvas>
  </div>
);

export default ModelViewer;
