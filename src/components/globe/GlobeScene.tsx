// ============================================================
// LeadLuxe AI — Globe Scene (React Three Fiber)
// Complete rewrite using @react-three/fiber + Drei instead of
// react-globe.gl for better stability and control.
// ============================================================

import { useRef, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGlobeCities } from './CityClusters';
import { useInvestmentArcs } from './InvestmentArcs';
import type { GlobeCityPoint } from './CityClusters';
import type { ArcData } from './InvestmentArcs';
import { GlobeErrorBoundary } from './GlobeErrorBoundary';

// ============================================================
// PROPS
// ============================================================
export interface GlobeSceneProps {
  onCitySelect?: (cityId: string) => void;
  onCountrySelect?: (countryCode: string) => void;
}

// ============================================================
// CONSTANTS
// ============================================================
const GLOBE_RADIUS = 2;
const MARKER_RADIUS = 2.02; // Just above globe surface
const ARC_ALTITUDE = 0.6;   // How high arcs go above the surface
const ATMOSPHERE_RADIUS = 2.08; // Slightly larger than globe

// ============================================================
// UTILITY: Convert lat/lng to 3D position on sphere
// ============================================================
function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// ============================================================
// EARTH COMPONENT
// ============================================================
function Earth() {
  const texture = useTexture('https://unpkg.com/three-globe/example/img/earth-day.jpg');
  const meshRef = useRef<THREE.Mesh>(null);

  // Slow rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshPhongMaterial
        map={texture}
        specular={new THREE.Color(0x333333)}
        shininess={5}
      />
    </mesh>
  );
}

// ============================================================
// ATMOSPHERE GLOW
// ============================================================
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[ATMOSPHERE_RADIUS, 48, 48]} />
      <meshPhongMaterial
        color="#d4a030"
        transparent
        opacity={0.12}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ============================================================
// CITY MARKERS (InstancedMesh for performance)
// ============================================================
function CityMarkers({
  cities,
  onCityClick,
}: {
  cities: GlobeCityPoint[];
  onCityClick: (cityId: string) => void;
}) {
  const markerPositions = useMemo(() => {
    const valid = cities.filter(
      c => !isNaN(c.lat) && !isNaN(c.lng) && c.lat >= -90 && c.lat <= 90 && c.lng >= -180 && c.lng <= 180
    );
    return valid.map(c => ({ point: c, pos: latLngToVec3(c.lat, c.lng, MARKER_RADIUS) }));
  }, [cities]);

  // Create a simple circle sprite texture
  const spriteTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(212,160,48,0.6)');
    gradient.addColorStop(1, 'rgba(212,160,48,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Handle click on a marker
  const handleClick = useCallback(
    (cityId: string) => {
      if (onCityClick) onCityClick(cityId);
    },
    [onCityClick],
  );

  return (
    <group>
      {markerPositions.map(({ point, pos }, i) => {
        const isHot = point.isHot;
        const scale = isHot ? 0.08 : 0.05;
        const color = isHot ? '#f59e0b' : '#d4a030';
        return (
          <sprite
            key={point.cityId}
            position={pos}
            scale={[scale, scale, 1]}
            onClick={() => handleClick(point.cityId)}
          >
            <spriteMaterial
              map={spriteTexture}
              color={color}
              transparent
              depthTest={false}
            />
          </sprite>
        );
      })}
    </group>
  );
}

// ============================================================
// INVESTMENT ARCS
// ============================================================
function InvestmentArcs({ arcs }: { arcs: ArcData[] }) {
  const lines = useMemo(() => {
    const valid = arcs.filter(
      a =>
        !isNaN(a.startLat) && !isNaN(a.startLng) && !isNaN(a.endLat) && !isNaN(a.endLng) &&
        a.startLat >= -90 && a.startLat <= 90 && a.startLng >= -180 && a.startLng <= 180 &&
        a.endLat >= -90 && a.endLat <= 90 && a.endLng >= -180 && a.endLng <= 180
    );

    return valid.map(a => {
      const start = latLngToVec3(a.startLat, a.startLng, GLOBE_RADIUS);
      const end = latLngToVec3(a.endLat, a.endLng, GLOBE_RADIUS);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + ARC_ALTITUDE);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(30);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const color = a.color || '#f59e0b';

      // Dashed line effect
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }),
      );

      return { line, color, start, end };
    });
  }, [arcs]);

  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l.line} />
      ))}
    </group>
  );
}

// ============================================================
// STARS BACKGROUND
// ============================================================
function Stars() {
  const positions = useMemo(() => {
    const pos = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2000}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================================
// INNER GLOBE SCENE (rendered inside Canvas)
// ============================================================
function GlobeInner({
  onCitySelect,
  onCountrySelect,
}: {
  onCitySelect?: (cityId: string) => void;
  onCountrySelect?: (countryCode: string) => void;
}) {
  const cities = useGlobeCities();
  const arcs = useInvestmentArcs();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <directionalLight position={[-5, -1, -3]} intensity={0.3} color="#d4a030" />

      {/* Earth */}
      <Earth />

      {/* Atmosphere */}
      <Atmosphere />

      {/* City markers */}
      <CityMarkers cities={cities} onCityClick={(id) => onCitySelect?.(id)} />

      {/* Investment arcs */}
      <InvestmentArcs arcs={arcs} />

      {/* Stars */}
      <Stars />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3.5}
        maxDistance={12}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

// ============================================================
// GLOBE LOADING FALLBACK
// ============================================================
function GlobeFallback() {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-luxury-black/50 rounded-xl">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading Globe Intelligence...</p>
      </div>
    </div>
  );
}

// ============================================================
// EXPORTED GLOBE SCENE
// ============================================================
export function GlobeScene({
  onCitySelect,
  onCountrySelect,
}: GlobeSceneProps) {
  return (
    <div className="w-full h-full min-h-[500px]">
      <GlobeErrorBoundary>
        <Suspense fallback={<GlobeFallback />}>
          <Canvas
            camera={{
              position: [0, 0, 6],
              fov: 45,
              near: 0.1,
              far: 100,
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
              failIfMajorPerformanceCaveat: false,
            }}
            style={{ background: '#050510' }}
          >
            <GlobeInner
              onCitySelect={onCitySelect}
              onCountrySelect={onCountrySelect}
            />
          </Canvas>
        </Suspense>
      </GlobeErrorBoundary>
    </div>
  );
}
