import { Suspense, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Mesh, Group, Points as PointsType } from 'three';

// ─── Constants ──────────────────────────────────────────────
const FLOORS = 32;
const TOWER_W = 2.4;
const TOWER_D = 1.8;
const FLOOR_H = 0.2;
const TOTAL_H = FLOORS * FLOOR_H;

// ─── Glass Tower With Visible Interiors ─────────────────────
function ModernTower() {
  const towerRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  const windowStates = useMemo(
    () => Array.from({ length: FLOORS }, (_, i) => ({
      lit: Math.random() > 0.2,
      warm: Math.random() > 0.5,
    })),
    []
  );

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    if (towerRef.current)
      towerRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.05 + Math.sin(state.clock.elapsedTime * 0.35) * 0.03;
    }
  });

  return (
    <group ref={towerRef}>
      {/* Main glass envelope */}
      <mesh position={[0, TOTAL_H / 2, 0]}>
        <boxGeometry args={[TOWER_W, TOTAL_H, TOWER_D]} />
        <meshPhysicalMaterial
          color="#1a2a4a" metalness={0.95} roughness={0.08}
          transparent opacity={0.5} envMapIntensity={2} clearcoat={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floors */}
      {windowStates.map(({ lit, warm }, i) => {
        const y = i * FLOOR_H + FLOOR_H / 2;
        const color = lit ? (warm ? '#fbbf24' : '#e0e7ff') : '#1a2a4a';
        return (
          <group key={i}>
            {/* Front pane */}
            <mesh position={[0, y, TOWER_D / 2 + 0.005]}>
              <planeGeometry args={[TOWER_W * 0.88, FLOOR_H * 0.7]} />
              <meshPhysicalMaterial
                color={color} emissive={lit ? (warm ? '#fbbf24' : '#e0e7ff') : '#000000'}
                emissiveIntensity={lit ? 0.12 : 0} transparent
                opacity={lit ? 0.55 : 0.25} metalness={0.3} roughness={0.2}
              />
            </mesh>
            {/* Interior silhouettes */}
            {lit && (
              <>
                <mesh position={[TOWER_W * 0.15, y - 0.02, TOWER_D / 2 - 0.1]}>
                  <boxGeometry args={[0.08, 0.04, 0.05]} />
                  <meshBasicMaterial color={warm ? '#1a1a1a' : '#2a2a3a'} />
                </mesh>
                <mesh position={[-TOWER_W * 0.12, y - 0.02, TOWER_D / 2 - 0.1]}>
                  <boxGeometry args={[0.05, 0.06, 0.05]} />
                  <meshBasicMaterial color={warm ? '#1a1a1a' : '#2a2a3a'} />
                </mesh>
              </>
            )}
            {/* Back pane */}
            <mesh position={[0, y, -TOWER_D / 2 - 0.005]}>
              <planeGeometry args={[TOWER_W * 0.88, FLOOR_H * 0.7]} />
              <meshBasicMaterial color={color} transparent opacity={0.15} />
            </mesh>
            {/* Floor divider */}
            <mesh position={[0, y + FLOOR_H / 2, 0]}>
              <boxGeometry args={[TOWER_W * 1.06, 0.012, TOWER_D * 1.06]} />
              <meshBasicMaterial color="#d4a030" transparent opacity={0.15} />
            </mesh>
          </group>
        );
      })}

      {/* Rooftop crown */}
      <mesh position={[0, TOTAL_H + 0.18, 0]}>
        <coneGeometry args={[0.4, 0.6, 6]} />
        <meshPhysicalMaterial color="#d4a030" metalness={0.9} roughness={0.1}
          emissive="#d4a030" emissiveIntensity={0.2} />
      </mesh>
      <pointLight position={[0, TOTAL_H + 0.5, 0]} intensity={0.5} color="#d4a030" distance={6} />

      {/* Building glow */}
      <mesh ref={glowRef} position={[0, TOTAL_H / 2, 0]}>
        <boxGeometry args={[TOWER_W * 2.4, TOTAL_H * 1.4, TOWER_D * 2.4]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ─── Lobby / Reception ──────────────────────────────────────
function Lobby() {
  return (
    <group position={[0, 0, TOWER_D / 2 + 0.6]}>
      {/* Glass walls */}
      {[[1.4, -0.1], [-1.4, -0.1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5, z]}>
          <planeGeometry args={[0.7, 1.0]} />
          <meshPhysicalMaterial color="#1a2a4a" transparent opacity={0.35} metalness={0.8} roughness={0.1} />
        </mesh>
      ))}
      {/* Entrance roof */}
      <mesh position={[0, 1.1, 0]}>
        <planeGeometry args={[2.2, 1.0]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* Columns */}
      {[[-0.8, 0], [0.8, 0]].map(([x], i) => (
        <mesh key={i} position={[x, 0.5, 0]}>
          <cylinderGeometry args={[0.035, 0.045, 1.0]} />
          <meshPhysicalMaterial color="#d4a030" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Welcome mat glow */}
      <mesh position={[0, 0.02, 0.05]}>
        <planeGeometry args={[0.6, 0.3]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.08} />
      </mesh>
      {/* Warm lobby light */}
      <pointLight position={[0, 1.4, 0]} intensity={0.7} color="#d4a030" distance={4} />
      {/* Reception desk silhouette */}
      <mesh position={[0, 0.2, TOWER_D / 2 + 0.35]}>
        <boxGeometry args={[0.5, 0.15, 0.15]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
    </group>
  );
}

// ─── Elevator Shaft ─────────────────────────────────────────
function ElevatorShaft() {
  return (
    <group position={[-0.3, 0, 0]}>
      {/* Elevator doors */}
      {[0.12, -0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.5, TOWER_D / 2 + 0.005]}>
          <planeGeometry args={[0.1, 0.35]} />
          <meshPhysicalMaterial color="#d4a030" metalness={0.95} roughness={0.05} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Elevator frame */}
      <mesh position={[0, 0.5, TOWER_D / 2 + 0.005]}>
        <planeGeometry args={[0.28, 0.4]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.08} />
      </mesh>
      {/* Up arrow glow */}
      <mesh position={[0, 0.72, TOWER_D / 2 + 0.008]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
      </mesh>
      {/* Shaft light */}
      <pointLight position={[0, 2, 0.3]} intensity={0.2} color="#fbbf24" distance={2} />
    </group>
  );
}

// ─── Sky Lounge ─────────────────────────────────────────────
function SkyLounge() {
  const glowRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.01} floatIntensity={0.2}>
      <group position={[0.5, 3.5, -1.5]}>
        {/* Lounge platform */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.8, 0.6]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
        {/* Lounge chairs */}
        {[[-0.2, 0.04, 0.1] as const, [0.2, 0.04, -0.1] as const].map((pos, i) => (
          <mesh key={i} position={pos as unknown as [number, number, number]}>
            <boxGeometry args={[0.06, 0.02, 0.04]} />
            <meshBasicMaterial color="#1a1a2e" />
          </mesh>
        ))}
        {/* Lounge table */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.02]} />
          <meshBasicMaterial color="#d4a030" />
        </mesh>
        {/* Glass wall glow */}
        <mesh ref={glowRef} position={[0, 0.15, -0.3]}>
          <planeGeometry args={[0.8, 0.3]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.06} />
        </mesh>
        {/* Warm light */}
        <pointLight position={[0, 0.3, 0]} intensity={0.3} color="#fbbf24" distance={2} />
      </group>
    </Float>
  );
}

// ─── Penthouse ──────────────────────────────────────────────
function Penthouse() {
  return (
    <Float speed={0.7} rotationIntensity={0.01} floatIntensity={0.15}>
      <group position={[-0.8, 5.2, 1.2]}>
        {/* Penthouse floor */}
        <mesh position={[0, -0.05, 0]}>
          <planeGeometry args={[0.6, 0.5]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
        {/* Luxury furniture */}
        <mesh position={[-0.1, 0.04, 0.05]}>
          <boxGeometry args={[0.15, 0.03, 0.08]} />
          <meshPhysicalMaterial color="#2a1a0a" metalness={0.1} roughness={0.8} />
        </mesh>
        {/* Gold accent piece */}
        <mesh position={[0.15, 0.04, -0.05]}>
          <boxGeometry args={[0.04, 0.06, 0.04]} />
          <meshPhysicalMaterial color="#d4a030" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Chandelier glow */}
        <pointLight position={[0, 0.2, 0]} intensity={0.4} color="#fbbf24" distance={1.5} />
      </group>
    </Float>
  );
}

// ─── AI Data Overlay ────────────────────────────────────────
function AIDataOverlay() {
  const dataRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (dataRef.current) {
      dataRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  interface DataLabel { label: string; value: string; icon: string; color: string }
  const dataLabels: DataLabel[] = useMemo(() => [
    { label: 'PRICE MOVE', value: '+12.4%', icon: '📈', color: '#22c55e' },
    { label: 'LAUNCH PROB', value: '92%', icon: '🚀', color: '#f59e0b' },
    { label: 'DEMAND SCORE', value: '88', icon: '🔥', color: '#ef4444' },
    { label: 'INVESTOR INT', value: '85', icon: '💎', color: '#d4a030' },
    { label: 'EXP COMMISSION', value: '₹3.6L', icon: '💰', color: '#22c55e' },
  ], []);

  return (
    <group ref={dataRef} position={[-1.5, 3, -1]}>
      {/* Panel background */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.2, 2.4]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[1.2, 2.4]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.04} />
      </mesh>
      {/* Header */}
      <mesh position={[0, 1.1, 0.01]}>
        <planeGeometry args={[1.0, 0.1]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.15} />
      </mesh>
      {/* Data rows */}
      {dataLabels.map((item, i) => (
        <group key={i} position={[0, 0.8 - i * 0.38, 0.01]}>
          {/* Label background */}
          <mesh position={[-0.4, 0, 0]}>
            <planeGeometry args={[0.8, 0.25]} />
            <meshBasicMaterial color="#111111" transparent opacity={0.5} />
          </mesh>
          {/* Colored value indicator */}
          <mesh position={[0.45, 0, 0]}>
            <planeGeometry args={[0.35, 0.25]} />
            <meshBasicMaterial color={item.color} transparent opacity={0.1} />
          </mesh>
        </group>
      ))}
      {/* Decorative bar chart */}
      {[0.5, 0.8, 0.4, 0.9, 0.65, 0.75].map((h, i) => (
        <mesh key={`bar-${i}`} position={[i * 0.16 - 0.4, h * 0.5 - 1.25, 0.008]}>
          <boxGeometry args={[0.04, h, 0.01]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Second AI Data Panel ───────────────────────────────────
function AISecondaryPanel() {
  return (
    <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.2}>
      <group position={[2, 2.5, -2]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.8, 1.2]} />
          <meshBasicMaterial color="#050505" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.8, 1.2]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.03} />
        </mesh>
        {/* Mini chart line */}
        {[0.3, 0.5, 0.35, 0.6, 0.5, 0.75, 0.65, 0.85].map((h, i) => (
          <mesh key={i} position={[i * 0.09 - 0.32, h * 0.4 - 0.35, 0.008]}>
            <boxGeometry args={[0.02, h * 0.3, 0.005]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// ─── Surrounding City Skyline ───────────────────────────────
function CitySkyline() {
  const buildingData = useMemo(() => {
    const spots: [number, number, number][] = [
      [-4.5, 0.6, -4], [5, 0.7, -3.5], [-5.5, 0.5, 3], [5.5, 0.9, 2.5],
      [-4, 0.5, -5.5], [3.5, 0.8, -5], [0, 0.4, -7], [-6, 1.3, 0.5],
      [6, 0.6, -1.5], [0, 1.1, 6], [-2, 0.5, 6.5], [2, 0.7, -6.5],
      [-7, 0.9, -2], [7, 0.6, 2], [-3.5, 1.0, 5], [4, 0.7, 4.5],
      [-6.5, 0.4, -4], [6.5, 1.2, 0], [-3, 0.8, -6], [3, 0.5, 6],
    ];
    const cols = ['#0f172a', '#1a1a2e', '#16213e', '#0f3460', '#1a1a2e', '#16213e', '#0f2929', '#1a162a'];
    return spots.map((pos, i) => ({
      pos,
      h: 0.3 + Math.random() * 1.8,
      w: 0.15 + Math.random() * 0.7,
      color: cols[i % cols.length],
      hasCrown: Math.random() > 0.7,
    }));
  }, []);

  return (
    <group>
      {buildingData.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshPhysicalMaterial color={b.color} metalness={0.5} roughness={0.4} />
          </mesh>
          {b.hasCrown && (
            <mesh position={[0, b.h + 0.05, 0]}>
              <boxGeometry args={[b.w * 0.3, 0.05, b.w * 0.3]} />
              <meshBasicMaterial color="#d4a030" transparent opacity={0.3} />
            </mesh>
          )}
          {/* Windows */}
          {Array.from({ length: Math.max(1, Math.floor(b.h / 0.25)) }).map((_, j) => (
            <mesh key={j} position={[0, j * 0.25 + 0.12, b.w / 2 + 0.003]}>
              <planeGeometry args={[b.w * 0.4, 0.05]} />
              <meshBasicMaterial color={Math.random() > 0.45 ? '#fbbf24' : '#374151'} transparent opacity={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ─── Trees & Landscaping ────────────────────────────────────
function Trees() {
  const treeData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      x: Math.cos(i * 0.9) * (3 + Math.random() * 2.5),
      z: Math.sin(i * 0.9) * (3 + Math.random() * 2.5),
      scale: 0.3 + Math.random() * 0.5,
    }));
  }, []);

  return (
    <group>
      {treeData.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, 0.15 * t.scale, 0]}>
            <cylinderGeometry args={[0.02 * t.scale, 0.04 * t.scale, 0.3 * t.scale]} />
            <meshPhysicalMaterial color="#3d2817" roughness={1} />
          </mesh>
          <mesh position={[0, 0.35 * t.scale, 0]}>
            <sphereGeometry args={[0.14 * t.scale, 6, 6]} />
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

// ─── Ground ─────────────────────────────────────────────────
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial color="#0a0a0a" metalness={0.5} roughness={0.3} transparent opacity={0.65} />
      </mesh>
      <gridHelper args={[20, 30, '#1a1a1a', '#111111']} position={[0, 0, 0]} />
      {/* Reflective pool */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, 0, 3.5]}>
        <circleGeometry args={[1.2, 16]} />
        <meshPhysicalMaterial color="#0a1628" metalness={0.9} roughness={0.05} transparent opacity={0.4} />
      </mesh>
      {/* Walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.5]}>
        <planeGeometry args={[2.5, 1.5]} />
        <meshBasicMaterial color="#111111" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ─── Gold Particles ─────────────────────────────────────────
function GoldParticles({ count = 2500 }) {
  const ref = useRef<PointsType>(null!);
  const pos = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = Math.random() * 16 - 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.006;
    ref.current.position.y += delta * 0.012;
    if (ref.current.position.y > 4) ref.current.position.y = -2;
  });

  return (
    <Points ref={ref} positions={pos} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent color="#d4a030" size={0.03} sizeAttenuation
        depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.4}
      />
    </Points>
  );
}

// ─── Floating Holographic Dashboard ─────────────────────────
function HolographicDashboard() {
  return (
    <Float speed={0.5} rotationIntensity={0.03} floatIntensity={0.4}>
      <group position={[3.2, 4.5, -0.8]}>
        {/* Panel background */}
        <mesh>
          <planeGeometry args={[1.6, 1.2]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.04} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.5, 1.1]} />
          <meshBasicMaterial color="#050505" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
        {/* Header bar */}
        <mesh position={[0, 0.5, 0.02]}>
          <planeGeometry args={[1.3, 0.08]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.25} />
        </mesh>
        {/* Chart bars with values */}
        {[[0.55, 0.12], [0.8, 0.2], [0.4, 0.08], [0.9, 0.25], [0.65, 0.15], [0.75, 0.18]].map(([h, w], i) => (
          <mesh key={i} position={[i * 0.18 - 0.42, h / 2 - 0.35, 0.02]}>
            <boxGeometry args={[w, h, 0.02]} />
            <meshBasicMaterial color={h > 0.7 ? '#22c55e' : h > 0.5 ? '#f59e0b' : '#d4a030'} transparent opacity={0.6} />
          </mesh>
        ))}
        {/* Bottom labels */}
        <mesh position={[0, -0.5, 0.02]}>
          <planeGeometry args={[1.3, 0.06]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.08} />
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
  const timeRef = useRef(0);

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
  const onMove = useCallback((e: { clientX: number; clientY: number }) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove as any);
    return () => window.removeEventListener('mousemove', onMove as any);
  }, [onMove]);

  // Walkthrough camera — 5 cinematic phases
  useFrame(({ camera, clock }) => {
    timeRef.current = clock.elapsedTime;
    
    // Scene group parallax
    if (groupRef.current) {
      const targetRotY = mouse.current.x * 0.06;
      const targetRotX = -mouse.current.y * 0.03;
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.03;
    }

    if (!controls) {
      const t = clock.elapsedTime;
      const s = scroll.current;

      // Cinematic walkthrough phases:
      // Phase 0 (s=0–0.15): Wide shot — reveal the skyline
      // Phase 1 (s=0.15–0.35): Approach — descend toward lobby
      // Phase 2 (s=0.35–0.55): Lobby level — walk past entrance
      // Phase 3 (s=0.55–0.75): Elevator ascent — rise up the tower
      // Phase 4 (s=0.75–0.9): Sky view — look across city
      // Phase 5 (s=0.9–1): Penthouse — luxury interior reveal

      let radius = 8;
      let height = 5;
      let lookY = 2;
      let angleOffset = 0;
      let centerZ = 0;

      if (s < 0.15) {
        // Phase 0: Wide reveal
        const p = s / 0.15;
        radius = 8 - p * 1.5;
        height = 5 - p * 1.5;
        angleOffset = p * 0.3;
      } else if (s < 0.35) {
        // Phase 1: Approach
        const p = (s - 0.15) / 0.2;
        radius = 6.5 - p * 2.5;
        height = 3.5 - p * 1.8;
        angleOffset = 0.3 + p * 0.4;
        lookY = 2 - p * 0.5;
      } else if (s < 0.55) {
        // Phase 2: Lobby
        const p = (s - 0.35) / 0.2;
        radius = 4 - p * 1.2;
        height = 1.7 - p * 0.5;
        angleOffset = 0.7 + p * 0.2;
        lookY = 1.5 - p * 0.3;
        centerZ = p * 0.5;
      } else if (s < 0.75) {
        // Phase 3: Elevator ascent
        const p = (s - 0.55) / 0.2;
        radius = 2.8;
        height = 1.2 + p * 3.5;
        angleOffset = 0.9 + p * 0.3;
        lookY = 1.2 + p * 3.5;
      } else if (s < 0.9) {
        // Phase 4: Sky view
        const p = (s - 0.75) / 0.15;
        radius = 3 + p * 2;
        height = 4.7 - p * 0.5;
        angleOffset = 1.2 + p * 0.5;
        lookY = 4.5;
      } else {
        // Phase 5: Penthouse reveal
        const p = (s - 0.9) / 0.1;
        radius = 5 - p * 1.5;
        height = 4.2 + p * 0.5;
        angleOffset = 1.7 + p * 0.3;
        lookY = 4.5 + p * 0.5;
      }

      const speed = 0.03 + (1 - s) * 0.02;
      const angle = t * speed + angleOffset;

      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius + centerZ;
      camera.position.y = height;
      camera.lookAt(0, lookY, 0);
    }
  });

  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 14, 28]} />

      <Environment preset="night" />

      <ambientLight intensity={0.12} color="#4466aa" />
      <directionalLight position={[8, 15, 5]} intensity={1.0} color="#d4a030" />
      <directionalLight position={[-5, 8, -3]} intensity={0.25} color="#f97316" />
      <hemisphereLight args={['#4466aa', '#050510', 0.25]} />

      {/* Volumetric glow */}
      <mesh position={[0, 5, -6]}>
        <planeGeometry args={[18, 12]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.012} side={THREE.DoubleSide} />
      </mesh>

      <group ref={groupRef}>
        <Ground />
        <Lobby />
        <ElevatorShaft />
        <ModernTower />
        <SkyLounge />
        <Penthouse />
        <CitySkyline />
        <Trees />
        <AIDataOverlay />
        <AISecondaryPanel />
        <HolographicDashboard />
        <GoldParticles count={2500} />
      </group>

      <pointLight position={[0, 2, 0]} intensity={0.35} color="#fbbf24" distance={8} />
      <pointLight position={[0, 6, 0]} intensity={0.25} color="#d4a030" distance={8} />

      {controls && (
        <OrbitControls
          enablePan={false} enableZoom={true}
          minDistance={2.5} maxDistance={15}
          minPolarAngle={0.05} maxPolarAngle={Math.PI / 2.1}
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

// ─── Exported Hero Component ────────────────────────────────
export function Hero3D({ interactive = false }: { interactive?: boolean }) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Suspense fallback={<Fallback />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true, alpha: true, powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0,
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

// ─── Interactive Walkthrough (full page) ────────────────────
export function BuildingWalkthrough() {
  return (
    <div className="fixed inset-0 z-50 bg-luxury-black">
      <Suspense fallback={<Fallback />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true, alpha: true, powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0,
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
