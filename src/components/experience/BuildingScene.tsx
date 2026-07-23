import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Points, PointMaterial, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Mesh, Group, Points as PointsType } from 'three';
import { FloorSection, GlassElevator, CityBackground } from './FloorSection';
import { HolographicPanel, MetricCard, SignalCard } from './DataOverlay';
import { getCameraAtProgress } from './CameraPath';

// ============================================================
// CONSTANTS
// ============================================================
const TOTAL_HEIGHT = 7;
const FLOOR_COUNT = 8;
const FLOOR_SPACING = TOTAL_HEIGHT / FLOOR_COUNT;

// ============================================================
// MODERN GLASS TOWER
// ============================================================
function GlassTower() {
  const towerRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (towerRef.current)
      towerRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.04 + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  const floors = useMemo(() => 
    Array.from({ length: FLOOR_COUNT }, (_, i) => ({
      y: i * FLOOR_SPACING,
      isLit: i === 2 || i === 4 || i === 6,
      label: ['Lobby', 'Reception', 'Property Intel', 'Market Analytics', 'Global Markets', 'World Intel', 'Opportunities', 'Commission'][i] || '',
      dataPoints: i === 4 ? [
        { label: 'Dubai', value: '+18%', color: '#22c55e' },
        { label: 'Pune', value: '+12%', color: '#f59e0b' },
        { label: 'Singapore', value: '+15%', color: '#22c55e' },
      ] : i === 6 ? [
        { label: 'Top Deal', value: '₹2.5Cr', color: '#d4a030' },
        { label: 'Confidence', value: '94%', color: '#22c55e' },
      ] : [],
    })),
  []);

  return (
    <group ref={towerRef}>
      {/* Main glass envelope */}
      <mesh position={[0, TOTAL_HEIGHT / 2, 0]}>
        <boxGeometry args={[3.2, TOTAL_HEIGHT, 2.5]} />
        <meshPhysicalMaterial
          color="#1a2a4a"
          metalness={0.95}
          roughness={0.08}
          transparent
          opacity={0.35}
          envMapIntensity={2}
          clearcoat={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floors */}
      {floors.map((floor, i) => (
        <group key={i} position={[0, floor.y + FLOOR_SPACING / 2, 0]}>
          <FloorSection
            y={0}
            width={3.0}
            depth={2.3}
            label={floor.label}
            isLit={floor.isLit}
            dataPoints={floor.dataPoints}
          />
        </group>
      ))}

      {/* Elevator shaft */}
      <GlassElevator height={TOTAL_HEIGHT / 2} isOpen />

      {/* Building glow */}
      <mesh ref={glowRef} position={[0, TOTAL_HEIGHT / 2, 0]}>
        <boxGeometry args={[3.8, TOTAL_HEIGHT * 1.3, 3.2]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>

      {/* Rooftop */}
      <mesh position={[0, TOTAL_HEIGHT + 0.15, 0]}>
        <coneGeometry args={[0.35, 0.5, 6]} />
        <meshPhysicalMaterial color="#d4a030" metalness={0.9} roughness={0.1}
          emissive="#d4a030" emissiveIntensity={0.15} />
      </mesh>
      <pointLight position={[0, TOTAL_HEIGHT + 0.4, 0]} intensity={0.4} color="#d4a030" distance={5} />
    </group>
  );
}

// ============================================================
// GOLD PARTICLES
// ============================================================
function GoldParticles({ count = 2000 }) {
  const ref = useRef<PointsType>(null!);
  const pos = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30;
      p[i * 3 + 1] = Math.random() * 12 - 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return p;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.005;
    ref.current.position.y += delta * 0.01;
    if (ref.current.position.y > 3) ref.current.position.y = -2;
  });

  return (
    <Points ref={ref} positions={pos} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent color="#d4a030" size={0.025} sizeAttenuation
        depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.35}
      />
    </Points>
  );
}

// ============================================================
// GROUND
// ============================================================
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial color="#050510" metalness={0.4} roughness={0.3} transparent opacity={0.8} />
      </mesh>
      <gridHelper args={[14, 20, '#1a1a1a', '#111111']} position={[0, 0, 0]} />
    </group>
  );
}

// ============================================================
// LOBBY ENTRANCE
// ============================================================
function LobbyEntrance() {
  return (
    <group position={[0, 0, 1.8]}>
      {[[1.5, 0], [-1.5, 0]].map(([x], i) => (
        <mesh key={i} position={[x, 0.6, 0]}>
          <planeGeometry args={[0.05, 1.2]} />
          <meshPhysicalMaterial color="#d4a030" metalness={0.9} roughness={0.1} transparent opacity={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.2, 0]}>
        <planeGeometry args={[3.0, 0.05]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.15} />
      </mesh>
      <pointLight position={[0, 1.5, 0.5]} intensity={0.6} color="#fbbf24" distance={4} />
    </group>
  );
}

// ============================================================
// MAIN SCENE
// ============================================================
function Scene({ progress = 0 }: { progress?: number }) {
  const { camera } = useThree();
  
  // Camera follow — smooth scroll-driven animation
  useFrame(() => {
    const camData = getCameraAtProgress(progress);
    const targetPos = new THREE.Vector3(...camData.position);
    const targetLook = new THREE.Vector3(...camData.target);

    // Smooth follow
    camera.position.lerp(targetPos, 0.04);
    camera.lookAt(targetLook);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov += (camData.fov - camera.fov) * 0.04;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 15, 30]} />
      <Environment preset="night" />

      <ambientLight intensity={0.12} color="#4466aa" />
      <directionalLight position={[5, 10, 3]} intensity={0.8} color="#d4a030" />
      <directionalLight position={[-3, 5, -2]} intensity={0.2} color="#f97316" />
      <hemisphereLight args={['#4466aa', '#050510', 0.2]} />

      {/* Volumetric glow */}
      <mesh position={[0, 4, -4]}>
        <planeGeometry args={[12, 10]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.01} side={THREE.DoubleSide} />
      </mesh>

      <Ground />
      <LobbyEntrance />
      <GlassTower />
      <CityBackground />

      {/* Data overlays — positioned at different heights */}
      <HolographicPanel position={[2.5, 3.2, -1]} title="Property Intel" bars={[0.5, 0.8, 0.4, 0.9, 0.6]} />
      <HolographicPanel position={[-2.5, 4.5, -1.2]} title="Global Markets" bars={[0.7, 0.5, 0.9, 0.6, 0.8]} color="#22c55e" />
      
      {/* Metric cards at various floors */}
      <MetricCard position={[2.8, 0.8, -1.5]} label="Pipeline Value" value="₹6.87 Cr" trend="+12%" isPositive color="#d4a030" />
      <MetricCard position={[-2.8, 1.5, -1.3]} label="Hot Leads" value="24" trend="+8%" isPositive color="#22c55e" />
      <MetricCard position={[3, 2.5, -1]} label="Commission" value="₹20.6 L" trend="+15%" isPositive color="#f59e0b" />
      <MetricCard position={[-3, 3.5, -1.2]} label="Avg Confidence" value="86%" trend="+5%" isPositive color="#3b82f6" />
      <MetricCard position={[2.5, 5.5, -1.5]} label="Close Rate" value="68%" trend="+3%" isPositive color="#22c55e" />

      {/* Signal cards — floating notifications */}
      {[
        { text: 'Dubai Marina luxury demand up 18%', type: 'success' as const, pos: [2.5, 1.2, -1.8] as [number, number, number] },
        { text: 'Pune Kharadi launch probability 92%', type: 'critical' as const, pos: [-2.5, 2, -1.5] as [number, number, number] },
        { text: 'Saudi commercial permits surged 31%', type: 'warning' as const, pos: [2.8, 3, -1.2] as [number, number, number] },
        { text: 'London rental inventory dropped 12%', type: 'info' as const, pos: [-2.8, 4, -1] as [number, number, number] },
        { text: 'Bengaluru absorption accelerating', type: 'success' as const, pos: [2.2, 5, -1.6] as [number, number, number] },
      ].map((signal, i) => (
        <SignalCard key={i} position={signal.pos} text={signal.text} type={signal.type} delay={i * 0.5} />
      ))}

      <GoldParticles count={2000} />
      
      {/* Ground lights */}
      <pointLight position={[0, 0.5, 0]} intensity={0.3} color="#fbbf24" distance={6} />
      <pointLight position={[0, 4, 0]} intensity={0.2} color="#d4a030" distance={6} />
    </>
  );
}

// ============================================================
// LOADING FALLBACK
// ============================================================
function Fallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-luxury-black">
      <div className="text-center">
        <div className="w-14 h-14 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading 3D Experience...</p>
      </div>
    </div>
  );
}

// ============================================================
// EXPORTED COMPONENT — Scrolling Dashboard Experience
// ============================================================
export function BuildingExperience({ progress = 0 }: { progress?: number }) {
  return (
    <div className="fixed inset-0 z-0">
      <Suspense fallback={<Fallback />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          camera={{ position: [12, 8, 12], fov: 45, near: 0.1, far: 40 }}
          style={{ background: '#050510' }}
        >
          <Scene progress={progress} />
        </Canvas>
      </Suspense>
    </div>
  );
}
