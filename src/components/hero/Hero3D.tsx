import { Suspense, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Mesh, Group, Points as PointsType } from 'three';

// ─── Constants ──────────────────────────────────────────────
const FLOORS = 24;
const TOWER_W = 2.2;
const TOWER_D = 1.6;
const FLOOR_H = 0.22;
const TOTAL_H = FLOORS * FLOOR_H;

// ─── Glass Tower With Visible Interiors ─────────────────────
function ModernTower() {
  const towerRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);

  // Deterministic window lighting — computed once via useMemo
  const windowStates = useMemo(
    () =>
      Array.from({ length: FLOORS }, () => ({
        lit: Math.random() > 0.25,
      })),
    []
  );

  useFrame((state) => {
    if (towerRef.current)
      towerRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.04;
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.06 + Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    }
  });

  return (
    <group ref={towerRef}>
      {/* Main glass envelope */}
      <mesh position={[0, TOTAL_H / 2, 0]}>
        <boxGeometry args={[TOWER_W, TOTAL_H, TOWER_D]} />
        <meshPhysicalMaterial
          color="#1a2a4a"
          metalness={0.95}
          roughness={0.08}
          transparent
          opacity={0.55}
          envMapIntensity={2}
          clearcoat={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floors: window panes + interior details */}
      {windowStates.map(({ lit }, i) => {
        const y = i * FLOOR_H + FLOOR_H / 2;
        const color = lit ? '#fbbf24' : '#1a2a4a';
        return (
          <group key={i}>
            {/* Front glass pane */}
            <mesh position={[0, y, TOWER_D / 2 + 0.005]}>
              <planeGeometry args={[TOWER_W * 0.85, FLOOR_H * 0.65]} />
              <meshPhysicalMaterial
                color={color}
                emissive={lit ? '#fbbf24' : '#000000'}
                emissiveIntensity={lit ? 0.15 : 0}
                transparent
                opacity={lit ? 0.6 : 0.3}
                metalness={0.3}
                roughness={0.2}
              />
            </mesh>
            {/* Interior furniture silhouette */}
            {lit && (
              <>
                <mesh position={[TOWER_W * 0.15, y - 0.02, TOWER_D / 2 - 0.08]}>
                  <boxGeometry args={[0.08, 0.04, 0.04]} />
                  <meshBasicMaterial color="#1a1a1a" />
                </mesh>
                <mesh position={[-TOWER_W * 0.15, y - 0.02, TOWER_D / 2 - 0.08]}>
                  <boxGeometry args={[0.06, 0.06, 0.04]} />
                  <meshBasicMaterial color="#1a1a1a" />
                </mesh>
              </>
            )}
            {/* Back glass pane (see-through to other side) */}
            <mesh position={[0, y, -TOWER_D / 2 - 0.005]}>
              <planeGeometry args={[TOWER_W * 0.85, FLOOR_H * 0.65]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
            {/* Gold floor divider */}
            <mesh position={[0, y + FLOOR_H / 2, 0]}>
              <boxGeometry args={[TOWER_W * 1.04, 0.015, TOWER_D * 1.04]} />
              <meshBasicMaterial color="#d4a030" transparent opacity={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Rooftop crown */}
      <mesh position={[0, TOTAL_H + 0.2, 0]}>
        <coneGeometry args={[0.35, 0.7, 6]} />
        <meshPhysicalMaterial
          color="#d4a030"
          metalness={0.9}
          roughness={0.1}
          emissive="#d4a030"
          emissiveIntensity={0.15}
        />
      </mesh>
      <pointLight
        position={[0, TOTAL_H + 0.6, 0]}
        intensity={0.6}
        color="#d4a030"
        distance={6}
      />

      {/* Building wrap glow */}
      <mesh ref={glowRef} position={[0, TOTAL_H / 2, 0]}>
        <boxGeometry args={[TOWER_W * 2.2, TOTAL_H * 1.3, TOWER_D * 2.2]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ─── Lobby / Entrance ──────────────────────────────────────
function Lobby() {
  return (
    <group position={[0, 0, TOWER_D / 2 + 0.5]}>
      {/* Glass entrance walls */}
      {[
        [1.2, -0.1],
        [-1.2, -0.1],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.4, z]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshPhysicalMaterial
            color="#1a2a4a"
            transparent
            opacity={0.4}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      ))}
      {/* Entrance roof */}
      <mesh position={[0, 0.9, 0]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Columns */}
      {[
        [-0.7, 0],
        [0.7, 0],
      ].map(([x], i) => (
        <mesh key={i} position={[x, 0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.8]} />
          <meshPhysicalMaterial color="#d4a030" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Warm entrance light */}
      <pointLight position={[0, 1.2, 0]} intensity={0.6} color="#d4a030" distance={3} />
    </group>
  );
}

// ─── Trees & Landscaping ────────────────────────────────────
function Trees() {
  const treeData = useMemo(() => {
    const spots: { x: number; z: number; scale: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      spots.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.3 + Math.random() * 0.4,
      });
    }
    return spots;
  }, []);

  return (
    <group>
      {treeData.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          {/* Trunk */}
          <mesh position={[0, 0.15 * t.scale, 0]}>
            <cylinderGeometry args={[0.02 * t.scale, 0.035 * t.scale, 0.3 * t.scale]} />
            <meshPhysicalMaterial color="#3d2817" roughness={1} />
          </mesh>
          {/* Canopy — layered spheres */}
          <mesh position={[0, 0.35 * t.scale, 0]}>
            <sphereGeometry args={[0.12 * t.scale, 6, 6]} />
            <meshPhysicalMaterial color="#1a3a1a" roughness={0.9} />
          </mesh>
          <mesh position={[0.06 * t.scale, 0.4 * t.scale, 0.04 * t.scale]}>
            <sphereGeometry args={[0.08 * t.scale, 6, 6]} />
            <meshPhysicalMaterial color="#2a5a2a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Ground with subtle reflection ──────────────────────────
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      <gridHelper args={[16, 24, '#1a1a1a', '#111111']} position={[0, 0, 0]} />
      {/* Reflective pool */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 3]}>
        <circleGeometry args={[0.8, 16]} />
        <meshPhysicalMaterial
          color="#0a1628"
          metalness={0.9}
          roughness={0.05}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

// ─── Surrounding City ───────────────────────────────────────
function CityBuildings() {
  const buildings = useMemo(() => {
    const blds: {
      pos: [number, number, number];
      h: number;
      w: number;
      color: string;
    }[] = [];
    const spots = [
      [-4, 0.5, -3.5],
      [4.5, 0.6, -3],
      [-5, 0.4, 2.5],
      [5, 0.8, 2],
      [-3.5, 0.5, -5],
      [3, 0.7, -4.5],
      [0, 0.3, -6],
      [-5.5, 1.2, 0.5],
      [5.5, 0.5, -1],
      [0, 1.0, 5.5],
      [-1.5, 0.4, 5.8],
      [1.5, 0.6, -5.5],
      [-6, 0.8, -1.5],
      [6, 0.5, 1.5],
    ];
    const cols = [
      '#0f172a',
      '#1a1a2e',
      '#16213e',
      '#0f3460',
      '#1a1a2e',
      '#16213e',
    ];
    spots.forEach((s, i) => {
      blds.push({
        pos: s as [number, number, number],
        h: 0.3 + Math.random() * 1.4,
        w: 0.2 + Math.random() * 0.6,
        color: cols[i % cols.length],
      });
    });
    return blds;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshPhysicalMaterial
              color={b.color}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          {/* Windows */}
          {Array.from({ length: Math.max(1, Math.floor(b.h / 0.3)) }).map(
            (_, j) => (
              <mesh
                key={j}
                position={[0, j * 0.3 + 0.15, b.w / 2 + 0.005]}
              >
                <planeGeometry args={[b.w * 0.5, 0.06]} />
                <meshBasicMaterial
                  color={Math.random() > 0.5 ? '#fbbf24' : '#374151'}
                  transparent
                  opacity={0.5}
                />
              </mesh>
            )
          )}
        </group>
      ))}
    </group>
  );
}

// ─── Gold Dust Particles ────────────────────────────────────
function GoldParticles({ count = 2000 }) {
  const ref = useRef<PointsType>(null!);
  const pos = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40;
      p[i * 3 + 1] = Math.random() * 14 - 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return p;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.008;
    ref.current.position.y += delta * 0.015;
    if (ref.current.position.y > 3) ref.current.position.y = -2;
  });

  return (
    <Points ref={ref} positions={pos} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#d4a030"
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.5}
      />
    </Points>
  );
}

// ─── Floating Data Hologram ─────────────────────────────────
function DataHologram() {
  return (
    <Float speed={0.6} rotationIntensity={0.02} floatIntensity={0.3}>
      <group position={[3, 4, -0.5]}>
        {/* Panel bg */}
        <mesh>
          <planeGeometry args={[1.4, 1]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.3, 0.9]} />
          <meshBasicMaterial color="#050505" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* Chart bars */}
        {[0.6, 0.85, 0.45, 0.95, 0.7].map((h, i) => (
          <mesh key={i} position={[i * 0.18 - 0.35, h / 2 - 0.3, 0.02]}>
            <boxGeometry args={[0.06, h, 0.02]} />
            <meshBasicMaterial color="#d4a030" transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Title bar */}
        <mesh position={[0, 0.4, 0.02]}>
          <planeGeometry args={[1, 0.08]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Main Scene ─────────────────────────────────────────────
function Scene({ controls = false }: { controls?: boolean }) {
  const groupRef = useRef<Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      const max = window.innerHeight;
      scroll.current = Math.min(window.scrollY / max, 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mouse parallax
  const onMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    },
    []
  );

  useEffect(() => {
    window.addEventListener('mousemove', onMove as any);
    return () => window.removeEventListener('mousemove', onMove as any);
  }, [onMove]);

  // Apply the walkthrough camera — inlined, no nested useFrame
  useFrame(({ camera, clock }) => {
    // Scene group parallax (gentle lean toward mouse)
    if (groupRef.current) {
      const targetRotY = mouse.current.x * 0.08;
      const targetRotX = -mouse.current.y * 0.04;
      groupRef.current.rotation.y += (
        targetRotY - groupRef.current.rotation.y
      ) * 0.03;
      groupRef.current.rotation.x += (
        targetRotX - groupRef.current.rotation.x
      ) * 0.03;
    }

    // Camera walkthrough — inlined directly
    if (!controls) {
      const t = clock.elapsedTime;
      const s = scroll.current;

      // Phase 1 (s=0–0.3): slow reveal — orbit high, looking down
      // Phase 2 (s=0.3–0.7): approach — descend and move closer
      // Phase 3 (s=0.7–1): ground level — walk past the entrance

      // Radius: starts at 8, shrinks to 3.5
      const radius = 8 - s * 4.5;
      // Height: starts at 5, drops to 1.2
      const height = 5 - s * 3.8;
      // Orbit speed: faster at distance, slower up close
      const speed = 0.04 - s * 0.02;

      const angle = t * speed + s * 0.5;

      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius + s * 1.5;
      camera.position.y = height;
      camera.lookAt(
        0,
        1.5 + Math.max(0, 1 - s * 2),
        0
      );
    }
  });

  return (
    <>
      {/* Atmosphere */}
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 12, 25]} />

      {/* Environment map for reflections */}
      <Environment preset="night" />

      {/* Lighting */}
      <ambientLight intensity={0.15} color="#4466aa" />
      <directionalLight
        position={[8, 15, 5]}
        intensity={1.2}
        color="#d4a030"
      />
      <directionalLight
        position={[-5, 8, -3]}
        intensity={0.3}
        color="#f97316"
      />
      <hemisphereLight
        args={['#4466aa', '#050510', 0.3]}
      />

      {/* Volumetric glow wall */}
      <mesh position={[0, 4, -5]}>
        <planeGeometry args={[14, 10]} />
        <meshBasicMaterial
          color="#d4a030"
          transparent
          opacity={0.015}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={groupRef}>
        <Ground />
        <Lobby />
        <ModernTower />
        <CityBuildings />
        <Trees />
        <DataHologram />
        <GoldParticles count={2000} />
      </group>

      {/* Ambient glow lights (replaces 20 individual floor pointLights) */}
      <pointLight position={[0, 2, 0]} intensity={0.4} color="#fbbf24" distance={8} />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#d4a030" distance={6} />

      {controls && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2.2}
        />
      )}
    </>
  );
}

// ─── Loading Fallback ───────────────────────────────────────
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

// ─── Exported Component ─────────────────────────────────────
export function Hero3D({ interactive = false }: { interactive?: boolean }) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Suspense fallback={<Fallback />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          camera={{ position: [0, 5, 8], fov: 45, near: 0.1, far: 40 }}
          style={{ background: 'transparent' }}
        >
          <Scene controls={interactive} />
        </Canvas>
      </Suspense>
    </div>
  );
}

// ─── Interactive Walkthrough Page Component ─────────────────
// A full-page 3D tour the user can orbit and zoom around.
// Parent component (Landing) handles the close button and hint text.
export function BuildingWalkthrough() {
  return (
    <div className="fixed inset-0 z-50 bg-luxury-black">
      <Suspense fallback={<Fallback />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          camera={{ position: [6, 3, 6], fov: 45, near: 0.1, far: 40 }}
          style={{ background: '#050510' }}
        >
          <Scene controls={true} />
        </Canvas>
      </Suspense>
    </div>
  );
}
