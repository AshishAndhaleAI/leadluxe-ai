import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import type { Group } from 'three';

// ─── Floating Holographic Dashboard Panel ──────────────────
export function HolographicPanel({
  position = [0, 0, 0],
  width = 1.5,
  height = 1,
  title = '',
  bars = [0.5, 0.7, 0.4, 0.9, 0.6],
  color = '#d4a030',
}: {
  position?: [number, number, number];
  width?: number;
  height?: number;
  title?: string;
  bars?: number[];
  color?: string;
}) {
  return (
    <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.2}>
      <group position={position}>
        {/* Panel background */}
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color={color} transparent opacity={0.04} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[width - 0.1, height - 0.1]} />
          <meshBasicMaterial color="#050505" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>

        {/* Title bar */}
        <mesh position={[0, height * 0.4, 0.02]}>
          <planeGeometry args={[width * 0.8, 0.06]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>

        {/* Chart bars */}
        {bars.map((h, i) => {
          const barW = (width * 0.6) / bars.length;
          return (
            <mesh
              key={i}
              position={[
                -width * 0.25 + i * (barW + 0.02),
                h * height * 0.3 - height * 0.15,
                0.02,
              ]}
            >
              <boxGeometry args={[barW * 0.6, h * height * 0.3, 0.01]} />
              <meshBasicMaterial
                color={h > 0.7 ? '#22c55e' : h > 0.5 ? '#f59e0b' : color}
                transparent
                opacity={0.5}
              />
            </mesh>
          );
        })}

        {/* Bottom label */}
        <mesh position={[0, -height * 0.4, 0.02]}>
          <planeGeometry args={[width * 0.8, 0.04]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Floating Metric Card ──────────────────────────────────
export function MetricCard({
  position = [0, 0, 0],
  label = '',
  value = '',
  trend = '+0%',
  isPositive = true,
  color = '#d4a030',
}: {
  position?: [number, number, number];
  label?: string;
  value?: string;
  trend?: string;
  isPositive?: boolean;
  color?: string;
}) {
  const ref = useRef<Group>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.03;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.01} floatIntensity={0.15}>
      <group ref={ref} position={position}>
        <mesh>
          <planeGeometry args={[0.9, 0.35]} />
          <meshBasicMaterial color="#050505" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.9, 0.35]} />
          <meshBasicMaterial color={color} transparent opacity={0.03} side={THREE.DoubleSide} />
        </mesh>
        {/* Value area */}
        <mesh position={[0, 0.06, 0.01]}>
          <planeGeometry args={[0.7, 0.06]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
        {/* Trend indicator */}
        {trend && (
          <mesh position={[0.3, -0.08, 0.01]}>
            <planeGeometry args={[0.25, 0.04]} />
            <meshBasicMaterial
              color={isPositive ? '#22c55e' : '#ef4444'}
              transparent
              opacity={0.3}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}

// ─── Floating Signal Card (holographic notification) ───────
export function SignalCard({
  position = [0, 0, 0],
  text = '',
  type = 'info',
  delay = 0,
}: {
  position?: [number, number, number];
  text?: string;
  type?: 'info' | 'success' | 'warning' | 'critical';
  delay?: number;
}) {
  const ref = useRef<Group>(null);
  const colors = {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444',
  };
  const color = colors[type];

  return (
    <Float speed={1} rotationIntensity={0.01} floatIntensity={0.1}>
      <group ref={ref} position={position}>
        <mesh>
          <planeGeometry args={[1.2, 0.2]} />
          <meshBasicMaterial color="#050505" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.55, 0, 0.005]}>
          <planeGeometry args={[0.04, 0.12]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Signal Feed data ──────────────────────────────────────
export const DEMO_SIGNALS = [
  { text: 'Dubai Marina luxury demand up 18%', type: 'success' as const, pos: [2.5, 0.5, -1.5] as [number, number, number] },
  { text: 'Pune Kharadi launch probability 92%', type: 'critical' as const, pos: [-2, 0.8, -1.8] as [number, number, number] },
  { text: 'Saudi Arabia commercial permits surged 31%', type: 'warning' as const, pos: [2.8, 1.2, -1.2] as [number, number, number] },
  { text: 'London Zone 2 rental inventory dropped 12%', type: 'info' as const, pos: [-2.5, 1.5, -1] as [number, number, number] },
  { text: 'Bengaluru Whitefield absorption accelerating', type: 'success' as const, pos: [2, 1.8, -1.6] as [number, number, number] },
];
