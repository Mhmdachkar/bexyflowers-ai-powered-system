import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { SelectedFlower } from '@/types/bouquet';
import * as THREE from 'three';

interface Flower3DProps {
  flower: SelectedFlower;
  index: number;
}

const Flower3D: React.FC<Flower3DProps> = ({ flower, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Use the position directly since we're now setting proper 3D coordinates
  const position3D: [number, number, number] = [
    flower.position?.x ?? (Math.random() - 0.5) * 2,
    flower.position?.y ?? Math.random() * 2 + 0.5,
    (flower.position as { x?: number; y?: number; z?: number })?.z ?? (Math.random() - 0.5) * 1
  ];

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      const baseY = position3D[1];
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime + index) * 0.1;
      meshRef.current.rotation.y = (flower.position?.rotation || 0) + state.clock.elapsedTime * 0.2;
      
      // Hover scale effect
      meshRef.current.scale.lerp(
        new THREE.Vector3(
          hovered ? 1.2 : (flower.position?.scale || 1),
          hovered ? 1.2 : (flower.position?.scale || 1),
          hovered ? 1.2 : (flower.position?.scale || 1)
        ),
        0.1
      );
    }
  });

  // Create flower geometry - Make flowers bigger and more visible
  const flowerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const petalGeometry = new THREE.ConeGeometry(0.25, 0.5, 8);
  const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.0);

  return (
    <group
      position={position3D}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Flower Head - Make it bigger and more visible */}
      <mesh ref={meshRef} geometry={flowerGeometry}>
        <meshStandardMaterial
          color={flower.flower.name.toLowerCase().includes('red') ? '#ff0000' :
                 flower.flower.name.toLowerCase().includes('white') ? '#ffffff' :
                 flower.flower.name.toLowerCase().includes('pink') ? '#ff69b4' :
                 flower.flower.name.toLowerCase().includes('rose') ? '#ff6b6b' :
                 flower.flower.name.toLowerCase().includes('tulip') ? '#ff8e8e' :
                 flower.flower.name.toLowerCase().includes('lily') ? '#ff69b4' :
                 flower.flower.name.toLowerCase().includes('sunflower') ? '#ffd700' :
                 '#ff8e8e'}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Petals */}
      {[...Array(6)].map((_, i) => (
        <mesh
          key={i}
          geometry={petalGeometry}
          position={[
            Math.cos((i * Math.PI * 2) / 6) * 0.4,
            0,
            Math.sin((i * Math.PI * 2) / 6) * 0.4
          ]}
          rotation={[Math.PI / 2, (i * Math.PI * 2) / 6, 0]}
        >
          <meshStandardMaterial
            color={flower.flower.name.toLowerCase().includes('rose') ? '#ff8e8e' :
                   flower.flower.name.toLowerCase().includes('tulip') ? '#ffa8a8' :
                   flower.flower.name.toLowerCase().includes('lily') ? '#ff91d4' :
                   flower.flower.name.toLowerCase().includes('sunflower') ? '#ffeb3b' :
                   '#ffa8a8'}
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>
      ))}
      
      {/* Stem */}
      <mesh geometry={stemGeometry} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>
    </group>
  );
};

interface VaseProps {}

const Vase: React.FC<VaseProps> = () => {
  const vaseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (vaseRef.current) {
      vaseRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={vaseRef} position={[0, -1.5, 0]}>
      <cylinderGeometry args={[0.8, 0.6, 1.5, 16]} />
      <meshStandardMaterial
        color="#d4af37"
        roughness={0.3}
        metalness={0.7}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

interface PremiumBouquetPreviewProps {
  selectedFlowers: Record<string, SelectedFlower>;
}

const PremiumBouquetPreview: React.FC<PremiumBouquetPreviewProps> = ({ selectedFlowers }) => {
  const [isLoading, setIsLoading] = useState(true);
  const selectedFlowersArray = Object.values(selectedFlowers);

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading 3D Preview...</p>
          </motion.div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        shadows
        onCreated={() => setIsLoading(false)}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
        />
        
        {/* Vase */}
        <Vase />
        
        {/* Flowers */}
        <Suspense fallback={null}>
          {selectedFlowersArray.map((selectedFlower, index) => {
            console.log('Rendering flower:', selectedFlower.flower.name, 'at position:', selectedFlower.position);
            return (
              <Flower3D
                key={selectedFlower.flower.id}
                flower={selectedFlower}
                index={index}
              />
            );
          })}
        </Suspense>
      </Canvas>

      {/* Overlay Info */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
        <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-lg">
          <p className="text-sm font-medium text-slate-700">3D Preview</p>
          <p className="text-xs text-slate-500">Drag to rotate • Scroll to zoom</p>
        </div>
        
        {selectedFlowersArray.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-2xl shadow-lg">
            <p className="text-sm font-bold">
              {selectedFlowersArray.reduce((sum, item) => sum + item.quantity, 0)} Flowers
            </p>
          </div>
        )}

        {/* Debug: Show test flower if no flowers selected */}
        {selectedFlowersArray.length === 0 && (
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        )}
      </div>

      {/* Quality Badge */}
      <div className="absolute bottom-6 left-6">
        <div className="bg-white/90 backdrop-blur-xl px-3 py-2 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs font-medium text-slate-700">Premium Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumBouquetPreview;
