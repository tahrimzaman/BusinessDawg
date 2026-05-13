'use client';

/**
 * Hero R3F scene — stylized low-poly BusinessDawg sitting on a perspective
 * grid floor with neon-lime glow. Subtle idle bob + head tracks the cursor.
 *
 * Inspiration: bruno-simon.com, studiofreight.com. Playful 3D mascot,
 * perspective grid, lime glow, ink fog fade-out.
 *
 * Performance:
 *  - Canvas uses dpr [1, 1.5] so retina displays don't melt mobile GPUs.
 *  - All geometry is hand-built primitives, no GLB load.
 *  - Reduced-motion or low-core CPUs get a static SVG fallback (no R3F at all).
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Float } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import type { Group } from 'three';

/**
 * Dawg sculpture — sphere head, cone ears, body, legs, tail, neon sunglasses.
 * Built from primitives so we can iterate the silhouette without modeling.
 */
function Dawg({
  basePosition = [0, -0.4, 0],
  scale = 1,
}: {
  basePosition?: [number, number, number];
  scale?: number;
}) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const { mouse } = useThree();

  useFrame((state, dt) => {
    if (root.current) {
      // gentle idle bob
      root.current.position.y = basePosition[1] + Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
    }
    if (head.current) {
      // head follows cursor — small range so it doesn't feel possessed
      head.current.rotation.y += (mouse.x * 0.35 - head.current.rotation.y) * Math.min(dt * 4, 1);
      head.current.rotation.x += (-mouse.y * 0.18 - head.current.rotation.x) * Math.min(dt * 4, 1);
    }
  });

  return (
    <group ref={root} position={basePosition} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.78, 16, 12]} />
        <meshStandardMaterial color="#fafafa" roughness={0.45} metalness={0.05} />
      </mesh>
      {/* Chest patch */}
      <mesh position={[0, 0.45, 0.55]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.42, 14, 10]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
      </mesh>

      {/* Legs (front) */}
      <mesh position={[0.35, -0.05, 0.45]}>
        <cylinderGeometry args={[0.14, 0.16, 0.45, 12]} />
        <meshStandardMaterial color="#fafafa" roughness={0.55} />
      </mesh>
      <mesh position={[-0.35, -0.05, 0.45]}>
        <cylinderGeometry args={[0.14, 0.16, 0.45, 12]} />
        <meshStandardMaterial color="#fafafa" roughness={0.55} />
      </mesh>
      {/* Paws */}
      <mesh position={[0.35, -0.28, 0.5]}>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
      </mesh>
      <mesh position={[-0.35, -0.28, 0.5]}>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
      </mesh>

      {/* Haunches (sitting pose, hidden behind body) */}
      <mesh position={[0.55, -0.05, -0.1]}>
        <sphereGeometry args={[0.36, 14, 10]} />
        <meshStandardMaterial color="#fafafa" roughness={0.55} />
      </mesh>
      <mesh position={[-0.55, -0.05, -0.1]}>
        <sphereGeometry args={[0.36, 14, 10]} />
        <meshStandardMaterial color="#fafafa" roughness={0.55} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.5, -0.7]} rotation={[0.7, 0, 0]}>
        <coneGeometry args={[0.14, 0.5, 10]} />
        <meshStandardMaterial color="#fafafa" roughness={0.55} />
      </mesh>

      {/* Head group — tilts with mouse */}
      <group ref={head} position={[0, 1.25, 0.25]}>
        {/* Skull */}
        <mesh>
          <sphereGeometry args={[0.6, 18, 14]} />
          <meshStandardMaterial color="#fafafa" roughness={0.45} metalness={0.05} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.18, 0.5]}>
          <sphereGeometry args={[0.32, 14, 10]} />
          <meshStandardMaterial color="#fafafa" roughness={0.5} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.18, 0.78]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
        </mesh>

        {/* Sunglasses bar — the signature lime moment */}
        <mesh position={[0, 0.08, 0.52]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.95, 16]} />
          <meshStandardMaterial
            color="#c8ff00"
            emissive="#c8ff00"
            emissiveIntensity={1.4}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
        {/* Sunglass lenses (two slightly larger lime discs facing forward) */}
        <mesh position={[0.22, 0.08, 0.55]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.18, 24]} />
          <meshStandardMaterial
            color="#0a0a0a"
            emissive="#c8ff00"
            emissiveIntensity={0.3}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[-0.22, 0.08, 0.55]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.18, 24]} />
          <meshStandardMaterial
            color="#0a0a0a"
            emissive="#c8ff00"
            emissiveIntensity={0.3}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>

        {/* Ears — drooped cones rotated outward */}
        <mesh position={[0.45, 0.32, 0]} rotation={[0.2, 0, -0.6]}>
          <coneGeometry args={[0.18, 0.55, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh position={[-0.45, 0.32, 0]} rotation={[0.2, 0, 0.6]}>
          <coneGeometry args={[0.18, 0.55, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Camera + scene parallax — slight ambient drift independent of the head.
 */
function CameraRig({ offsetX = 0, lookAtX = 0 }: { offsetX?: number; lookAtX?: number }) {
  const { mouse, camera } = useThree();
  useFrame((_, dt) => {
    // Subtle camera dolly toward mouse, offset to compose dawg in right third.
    // R3F treats camera as imperative state — mutating .position is the
    // canonical pattern. The react-hooks/immutability rule doesn't know that.
    const targetX = offsetX + mouse.x * 0.25;
    const targetY = 1 + mouse.y * 0.15;
    /* eslint-disable react-hooks/immutability -- R3F imperative camera control */
    camera.position.x += (targetX - camera.position.x) * Math.min(dt * 1.5, 1);
    camera.position.y += (targetY - camera.position.y) * Math.min(dt * 1.5, 1);
    camera.lookAt(lookAtX, 0.4, 0);
    /* eslint-enable react-hooks/immutability */
  });
  return null;
}

/**
 * Floating accent shapes — a few low-poly geometries drifting around the dawg
 * to fill negative space and add the "we build machines" data-flow vibe.
 */
function AccentShapes() {
  return (
    <>
      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.8} position={[-2.5, 1.4, -1]}>
        <mesh>
          <torusGeometry args={[0.32, 0.06, 8, 24]} />
          <meshStandardMaterial
            color="#c8ff00"
            emissive="#c8ff00"
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>
      </Float>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.7} position={[2.6, 1.7, -1.4]}>
        <mesh>
          <icosahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color="#fafafa" roughness={0.4} flatShading />
        </mesh>
      </Float>
      <Float speed={1.0} rotationIntensity={0.3} floatIntensity={0.5} position={[3.2, 0.4, 0.5]}>
        <mesh>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#ff2ec8" emissive="#ff2ec8" emissiveIntensity={0.4} />
        </mesh>
      </Float>
    </>
  );
}

export default function HeroScene() {
  const [capable, setCapable] = useState(true);
  const [isWide, setIsWide] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cores = navigator.hardwareConcurrency ?? 4;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe capability detection
    setCapable(!reduced && cores >= 4);

    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => setIsWide(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (!capable) {
    return (
      <div className="absolute inset-0">
        <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="hg" cx="50%" cy="55%" r="55%">
              <stop offset="0" stopColor="#c8ff00" stopOpacity="0.22" />
              <stop offset="1" stopColor="#0a0a0a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="grid-fade" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#c8ff00" stopOpacity="0.35" />
              <stop offset="1" stopColor="#c8ff00" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="600" height="600" fill="url(#hg)" />
          {/* horizon line */}
          <line x1="0" y1="380" x2="600" y2="380" stroke="url(#grid-fade)" strokeWidth="1" />
          {/* perspective lines */}
          {[...Array(7)].map((_, i) => (
            <line
              key={i}
              x1={300}
              y1={380}
              x2={i * 100}
              y2={600}
              stroke="#c8ff00"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
          ))}
          <circle cx="300" cy="320" r="80" fill="#fafafa" />
          <rect x="234" y="296" width="132" height="14" rx="6" fill="#c8ff00" />
        </svg>
      </div>
    );
  }

  // Compose dawg in the right third on wide screens; smaller + behind on mobile
  // so it doesn't fight the headline.
  const dawgPos: [number, number, number] = isWide ? [2.6, -0.5, 0] : [0, -0.7, -2];
  const dawgScale = isWide ? 0.85 : 0.7;
  const camPos: [number, number, number] = isWide ? [0.6, 1, 6.5] : [0, 1.4, 8];
  const lookAtX = isWide ? 1.8 : 0;

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: camPos, fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <Suspense fallback={null}>
        {/* Fog so the grid fades into ink toward the horizon */}
        <fog attach="fog" args={['#0a0a0a', 7, 24]} />

        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={1.0} color="#ffffff" castShadow />
        <pointLight position={[dawgPos[0], 0.3, 2]} intensity={1.6} color="#c8ff00" distance={6} />
        <pointLight position={[3, 1.5, -2]} intensity={0.8} color="#ff2ec8" distance={8} />

        <CameraRig offsetX={camPos[0]} lookAtX={lookAtX} />

        {/* Perspective grid floor */}
        <Grid
          position={[0, -0.7, 0]}
          args={[40, 40]}
          cellSize={0.6}
          cellThickness={0.6}
          cellColor="#c8ff00"
          sectionSize={3}
          sectionThickness={1.2}
          sectionColor="#c8ff00"
          fadeDistance={22}
          fadeStrength={1.2}
          infiniteGrid
        />

        <Dawg basePosition={dawgPos} scale={dawgScale} />
        <AccentShapes />
      </Suspense>
    </Canvas>
  );
}
