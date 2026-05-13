'use client';

/**
 * Hero R3F scene — slowly rotating low-poly "machine":
 * stacked gears + a stylized dog silhouette in negative space.
 * Cursor causes subtle parallax. Degrades to a static SVG fallback on low-power devices.
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import type { Mesh, Group } from 'three';
import * as THREE from 'three';

function GearTorus({
  position,
  color,
  scale = 1,
  speed = 0.4,
  segments = 10,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  segments?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1, 0.34, 8, segments]} />
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} flatShading />
    </mesh>
  );
}

function FloatingBlock({
  position,
  color,
  size = 1,
}: {
  position: [number, number, number];
  color: string;
  size?: number;
}) {
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh position={position}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} flatShading />
      </mesh>
    </Float>
  );
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const { mouse } = useThree();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += (mouse.x * 0.25 - ref.current.rotation.y) * 0.05;
    ref.current.rotation.x += (-mouse.y * 0.18 - ref.current.rotation.x) * 0.05;
  });
  return <group ref={ref}>{children}</group>;
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line react-hooks/purity -- particle scatter; randomness scoped to first mount only
      arr[i * 3] = (Math.random() - 0.5) * 12;
      // eslint-disable-next-line react-hooks/purity
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      // eslint-disable-next-line react-hooks/purity
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.04;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#c8ff00" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  const [capable, setCapable] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cores = navigator.hardwareConcurrency ?? 4;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe capability detection
    setCapable(!reduced && cores >= 4);
  }, []);

  if (!capable) {
    return (
      <div className="absolute inset-0">
        <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="hg" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#c8ff00" stopOpacity="0.18" />
              <stop offset="1" stopColor="#0a0a0a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="600" height="600" fill="url(#hg)" />
          <circle
            cx="300"
            cy="300"
            r="120"
            fill="none"
            stroke="#c8ff00"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <circle
            cx="300"
            cy="300"
            r="180"
            fill="none"
            stroke="#fafafa"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} color="#ffffff" />
        <directionalLight position={[-4, -2, 2]} intensity={0.6} color="#c8ff00" />
        <ParallaxRig>
          <GearTorus
            position={[-1.6, 0.4, 0]}
            color="#c8ff00"
            scale={1.0}
            speed={0.35}
            segments={10}
          />
          <GearTorus
            position={[1.3, -0.6, -0.6]}
            color="#fafafa"
            scale={0.72}
            speed={-0.55}
            segments={8}
          />
          <GearTorus
            position={[0.5, 1.2, -1.4]}
            color="#3a3a3a"
            scale={0.55}
            speed={0.7}
            segments={6}
          />
          <FloatingBlock position={[2.4, 0.9, 0.4]} color="#1a1a1a" size={0.45} />
          <FloatingBlock position={[-2.6, -1.2, 0.6]} color="#c8ff00" size={0.28} />
          <FloatingBlock position={[0, -1.6, 1]} color="#fafafa" size={0.22} />
          <Particles />
        </ParallaxRig>
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
