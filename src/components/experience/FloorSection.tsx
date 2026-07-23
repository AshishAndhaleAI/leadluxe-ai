import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Group, Mesh } from 'three';

// ─── Glass Panel Floor ─────────────────────────────────────
export function FloorSection({ 
  y, 
  width = 2.8, 
  depth = 2.2, 
  label,
  isLit = false,
  dataPoints = [],
}: { 
  y: number; 
  width?: number; 
  depth?: number;
  label?: string;
  isLit?: boolean;
  dataPoints?: { label: string; value: string; color: string }[];
}) {
  const floorRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    if (glowRef.current && isLit) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(state.clock.elapsedTime * 0.5 + y) * 0.04;
    }
  });

  return (
    <group ref={floorRef} position={[0, y, 0]}>
      {/* Floor slab — glass */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, 0.02, depth]} />
        <meshPhysicalMaterial
          color={isLit ? '#1a2a4a' : '#0f1a2a'}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={isLit ? 0.5 : 0.3}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Gold edge trim */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[width + 0.1, 0.005, depth + 0.1]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.08} />
      </mesh>

      {/* Glow ring for lit floors */}
      {isLit && (
        <mesh ref={glowRef} position={[0, 0.015, 0]}>
          <planeGeometry args={[width * 0.8, depth * 0.6]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Data points on floor */}
      {dataPoints.map((dp, i) => (
        <group key={i} position={[-width * 0.3 + i * 0.5, 0.03, -depth * 0.2]}>
          <mesh>
            <planeGeometry args={[0.35, 0.08]} />
            <meshBasicMaterial color={dp.color} transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Elevator Interior ─────────────────────────────────────
export function GlassElevator({ 
  height, 
  isOpen = false,
}: { 
  height: number; 
  isOpen?: boolean;
}) {
  const elevRef = useRef<Group>(null);

  return (
    <group ref={elevRef} position={[0, height, 0]}>
      {/* Elevator walls */}
      {[
        { pos: [0.3, 0.5, 0] as [number, number, number], scale: [0.02, 1, 0.6] as [number, number, number] },
        { pos: [-0.3, 0.5, 0] as [number, number, number], scale: [0.02, 1, 0.6] as [number, number, number] },
        { pos: [0, 0.5, 0.3] as [number, number, number], scale: [0.6, 1, 0.02] as [number, number, number] },
      ].map((wall, i) => (
        <mesh key={i} position={wall.pos}>
          <boxGeometry args={wall.scale} />
          <meshPhysicalMaterial
            color="#1a2a4a"
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={isOpen ? 0.2 : 0.5}
            envMapIntensity={2}
          />
        </mesh>
      ))}

      {/* Elevator floor */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.1} />
      </mesh>

      {/* Gold trim */}
      <mesh position={[0, 0.5, 0.3]}>
        <planeGeometry args={[0.5, 0.02]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.3} />
      </mesh>

      {/* Elevator glow */}
      <pointLight position={[0, 0.6, 0]} intensity={0.3} color="#fbbf24" distance={1.5} />
    </group>
  );
}

// ─── City Background ───────────────────────────────────────
export function CityBackground() {
  const groupRef = useRef<Group>(null);

  const buildings = useMemo(() => {
    const blds: { pos: [number, number, number]; h: number; w: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 5 + Math.random() * 4;
      blds.push({
        pos: [
          Math.cos(angle) * radius,
          Math.random() * 2,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        h: 0.5 + Math.random() * 3,
        w: 0.2 + Math.random() * 0.5,
      });
    }
    return blds;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshPhysicalMaterial
              color="#0f172a"
              metalness={0.5}
              roughness={0.4}
              transparent
              opacity={0.6}
            />
          </mesh>
          {/* Windows */}
          {Array.from({ length: Math.max(1, Math.floor(b.h / 0.3)) }).map((_, j) => (
            <mesh key={j} position={[0, j * 0.3 + 0.15, b.w / 2 + 0.003]}>
              <planeGeometry args={[b.w * 0.3, 0.04]} />
              <meshBasicMaterial
                color={Math.random() > 0.4 ? '#fbbf24' : '#374151'}
                transparent
                opacity={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ─── Scroll Progress Indicator ─────────────────────────────
export function ScrollProgressBar({ progress }: { progress: number }) {
  const phases = [
    'Skyline', 'Lobby', 'Elevator', 'Property Intel',
    'Global Markets', 'Opportunities', 'Commission',
  ];

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1">
      {phases.map((phase, i) => {
        const phaseStart = (i / phases.length);
        const phaseEnd = ((i + 1) / phases.length);
        const isActive = progress >= phaseStart && progress < phaseEnd;
        const isCompleted = progress >= phaseEnd;
        
        return (
          <div key={i} className="flex items-center gap-2 group">
            <div className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${isActive ? 'w-3 h-3 bg-luxury-gold-400 shadow-lg shadow-luxury-gold-500/30' : ''}
              ${isCompleted ? 'bg-luxury-gold-500/60' : 'bg-gray-700'}
            `} />
            <span className={`
              text-[9px] font-medium transition-all duration-200 opacity-0 group-hover:opacity-100
              ${isActive ? 'text-luxury-gold-400 opacity-100' : 'text-gray-600'}
            `}>
              {phase}
            </span>
          </div>
        );
      })}
    </div>
  );
}
