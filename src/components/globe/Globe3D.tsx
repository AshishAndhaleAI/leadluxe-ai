import { Suspense, useRef, useMemo, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import type { Mesh, Group, Points as PointsType } from 'three';
import { COUNTRIES, CITIES } from '../../lib/global-data';

// ============================================================
// CONSTANTS
// ============================================================
const GLOBE_RADIUS = 2.5;
const MARKER_SIZE = 0.06;
const HOT_MARKER_SIZE = 0.1;

// ============================================================
// LAT/LNG TO 3D POSITION
// ============================================================
function latLngToPosition(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

// ============================================================
// CITY MARKER DATA
// ============================================================
interface GlobeCity {
  id: string;
  name: string;
  countryCode: string;
  position: [number, number, number];
  confidence: number;
  priceTrend: number;
  isHot: boolean;
  projects: number;
  flag: string;
}

function buildGlobeCities(): GlobeCity[] {
  const cities: GlobeCity[] = [];
  for (const country of COUNTRIES) {
    const countryCities = CITIES[country.code] || [];
    for (const city of countryCities) {
      const pos = latLngToPosition(city.latitude, city.longitude, GLOBE_RADIUS);
      cities.push({
        id: city.id,
        name: city.name,
        countryCode: country.code,
        position: pos,
        confidence: city.confidence,
        priceTrend: city.priceTrend,
        isHot: city.investorInterest >= 75 || city.confidence >= 85,
        projects: city.activeProjects,
        flag: country.flag,
      });
    }
  }
  return cities;
}

// ============================================================
// GLOBE SPHERE (procedural texture)
// ============================================================
function GlobeSphere() {
  const ref = useRef<Mesh>(null);

  // Procedural earth texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Ocean base
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(0.3, '#0f1a3a');
    gradient.addColorStop(0.5, '#0a1a2a');
    gradient.addColorStop(0.7, '#0f1a3a');
    gradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Land masses (simplified continent shapes)
    const landColor = '#1a2a3a';
    const continentColors = ['#1a2a3a', '#1e3045', '#162838', '#1a2e40', '#203548'];
    
    // Generate organic land shapes
    const continents: { x: number; y: number; w: number; h: number; color: string }[] = [
      // North America
      { x: 150, y: 100, w: 180, h: 120, color: continentColors[0] },
      { x: 160, y: 110, w: 160, h: 100, color: continentColors[1] },
      // South America
      { x: 260, y: 240, w: 80, h: 160, color: continentColors[2] },
      // Europe
      { x: 480, y: 110, w: 100, h: 60, color: continentColors[1] },
      // Africa
      { x: 500, y: 180, w: 100, h: 180, color: continentColors[3] },
      // Asia
      { x: 590, y: 80, w: 250, h: 160, color: continentColors[0] },
      { x: 620, y: 90, w: 200, h: 130, color: continentColors[2] },
      // India
      { x: 580, y: 170, w: 60, h: 100, color: continentColors[3] },
      // Southeast Asia
      { x: 650, y: 180, w: 120, h: 80, color: continentColors[4] },
      // Australia
      { x: 700, y: 300, w: 80, h: 60, color: continentColors[2] },
      // Middle East
      { x: 540, y: 160, w: 50, h: 40, color: continentColors[3] },
    ];

    for (const continent of continents) {
      ctx.fillStyle = continent.color;
      ctx.beginPath();
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const rx = continent.w / 2 + (Math.sin(i * 2.7) * continent.w * 0.15);
        const ry = continent.h / 2 + (Math.cos(i * 1.3) * continent.h * 0.15);
        const px = continent.x + Math.cos(angle) * rx;
        const py = continent.y + Math.sin(angle) * ry;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Latitude/longitude grid lines
    ctx.strokeStyle = 'rgba(212, 160, 48, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
    for (let i = 0; i < 24; i++) {
      const x = (i / 24) * 1024;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    // Gold ambient dots (scattered cities)
    ctx.fillStyle = 'rgba(212, 160, 48, 0.08)';
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 512, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshPhongMaterial
        map={texture}
        transparent
        opacity={0.9}
        emissive="#0a1628"
        emissiveIntensity={0.2}
        specular="#224488"
        shininess={15}
      />
    </mesh>
  );
}

// ============================================================
// GLOBE ATMOSPHERE GLOW
// ============================================================
function Atmosphere() {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03;
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.12, 48, 48]} />
      <meshBasicMaterial
        color="#d4a030"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ============================================================
// CITY MARKERS
// ============================================================
function CityMarkers({ 
  onCityClick,
  hoveredCity,
  setHoveredCity,
}: { 
  onCityClick: (city: GlobeCity) => void;
  hoveredCity: string | null;
  setHoveredCity: (id: string | null) => void;
}) {
  const cities = useMemo(() => buildGlobeCities(), []);
  const markerRefs = useRef<(Group | null)[]>([]);

  useFrame((state) => {
    markerRefs.current.forEach((ref, i) => {
      if (ref && cities[i]?.isHot) {
        ref.position.y = Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.04;
      }
    });
  });

  return (
    <group>
      {/* Connection lines from hot cities */}
      {cities.filter(c => c.isHot).map((city, i) => (
        <HotCityRing key={`ring-${city.id}`} position={city.position} delay={i * 0.3} />
      ))}

      {/* City markers */}
      {cities.map((city, i) => {
        const isHovered = hoveredCity === city.id;
        const size = city.isHot ? HOT_MARKER_SIZE : MARKER_SIZE;
        return (
          <group
            key={city.id}
            ref={(el) => { markerRefs.current[i] = el; }}
            position={city.position}
          >
            {/* Clickable area */}
            <mesh
              onPointerOver={() => setHoveredCity(city.id)}
              onPointerOut={() => setHoveredCity(null)}
              onClick={() => onCityClick(city)}
            >
              <sphereGeometry args={[size * 2.5, 8, 8]} />
              <meshBasicMaterial transparent opacity={0.001} />
            </mesh>

            {/* Marker dot */}
            <mesh>
              <sphereGeometry args={[size, 8, 8]} />
              <meshBasicMaterial
                color={city.isHot ? '#f59e0b' : '#d4a030'}
                transparent
                opacity={isHovered ? 1 : 0.7}
              />
            </mesh>

            {/* Glow ring for hot cities */}
            {city.isHot && (
              <mesh>
                <ringGeometry args={[size * 2, size * 3, 16]} />
                <meshBasicMaterial
                  color="#f59e0b"
                  transparent
                  opacity={0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Light beam */}
            <mesh position={[0, -size * 4, 0]}>
              <cylinderGeometry args={[0.005, 0.015, size * 4, 4]} />
              <meshBasicMaterial color="#d4a030" transparent opacity={0.15} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============================================================
// HOT CITY RING (pulsing ring around hot cities)
// ============================================================
function HotCityRing({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<Mesh>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    if (ref.current) {
      const t = (state.clock.elapsedTime + delay) % 4;
      const scale = 1 + t * 2;
      ref.current.scale.set(scale, scale, scale);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.3 - t * 0.1);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.05, 0.08, 16]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ============================================================
// GOLD PARTICLE SYSTEM (orbiting around globe)
// ============================================================
function GlobeParticles({ count = 1500 }) {
  const ref = useRef<PointsType>(null!);
  const pos = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = GLOBE_RADIUS * 1.8 + Math.random() * GLOBE_RADIUS * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = radius * Math.cos(phi);
    }
    return p;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.015;
    ref.current.rotation.x += delta * 0.005;
  });

  return (
    <Points ref={ref} positions={pos} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#d4a030"
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.3}
      />
    </Points>
  );
}

// ============================================================
// HOVER TOOLTIP (3D label)
// ============================================================
function CityTooltip({ city }: { city: GlobeCity | null }) {
  const [targetPos, setTargetPos] = useState<[number, number, number]>([0, 0, 0]);

  useMemo(() => {
    if (city) {
      // Find city in the global cities data
      for (const country of COUNTRIES) {
        const countryCities = CITIES[country.code] || [];
        const found = countryCities.find(c => c.id === city.id);
        if (found) {
          setTargetPos(latLngToPosition(found.latitude, found.longitude, GLOBE_RADIUS * 1.35));
          break;
        }
      }
    }
  }, [city]);

  if (!city) return null;

  const isHot = city.isHot;

  return (
    <Float speed={1} rotationIntensity={0} floatIntensity={0.3}>
      <group position={targetPos}>
        {/* Tooltip background */}
        <mesh>
          <planeGeometry args={[0.8, 0.35]} />
          <meshBasicMaterial color="#050505" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.8, 0.35]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
        {/* City name */}
        <mesh position={[0, 0.1, 0.01]}>
          <planeGeometry args={[0.7, 0.06]} />
          <meshBasicMaterial color="#d4a030" transparent opacity={0.2} />
        </mesh>
        {/* Confidence bar */}
        <mesh position={[-0.2, -0.05, 0.01]}>
          <planeGeometry args={[0.3, 0.04]} />
          <meshBasicMaterial color={isHot ? '#f59e0b' : '#d4a030'} transparent opacity={0.4} />
        </mesh>
        {/* Trend indicator */}
        {city.priceTrend > 0 && (
          <mesh position={[0.2, -0.05, 0.01]}>
            <planeGeometry args={[0.2, 0.04]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.4} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

// ============================================================
// GLOBE SCENE
// ============================================================
function GlobeScene({ 
  onCountrySelect,
  onCitySelect,
  onBackToWorld,
}: {
  onCountrySelect: (countryCode: string) => void;
  onCitySelect: (cityId: string) => void;
  onBackToWorld: () => void;
}) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<GlobeCity | null>(null);
  const [targetZoom, setTargetZoom] = useState<[number, number, number] | null>(null);
  const cameraRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 6 });
  const isAnimating = useRef(false);

  const cities = useMemo(() => buildGlobeCities(), []);

  const handleCityClick = useCallback((city: GlobeCity) => {
    setSelectedCity(city);
    setTargetZoom(city.position);
    isAnimating.current = true;
    onCountrySelect(city.countryCode);
    
    // After zoom animation completes, navigate to city view
    setTimeout(() => {
      if (isAnimating.current) {
        isAnimating.current = false;
        onCitySelect(city.id);
      }
    }, 1500);
  }, [onCountrySelect, onCitySelect]);

  useFrame(({ camera }) => {
    // Smooth zoom animation
    if (targetZoom && isAnimating.current) {
      const target = new THREE.Vector3(targetZoom[0] * 1.5, targetZoom[1] * 1.5, targetZoom[2] * 1.5);
      camera.position.lerp(target, 0.03);
      camera.lookAt(0, 0, 0);
      
      if (camera.position.distanceTo(target) < 0.1) {
        isAnimating.current = false;
      }
    } else if (!targetZoom) {
      // Default orbiting position
      const t = Date.now() * 0.0001;
      camera.position.x = Math.sin(t) * 6;
      camera.position.z = Math.cos(t) * 6;
      camera.position.y = 0.5;
      camera.lookAt(0, 0, 0);
    }
  });

  const hoveredCityData = useMemo(() => 
    hoveredCity ? cities.find(c => c.id === hoveredCity) || null : null,
  [hoveredCity, cities]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#4466aa" />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color="#d4a030" />
      <directionalLight position={[-5, -1, -3]} intensity={0.3} color="#4488cc" />
      <hemisphereLight args={['#4466aa', '#050510', 0.3]} />

      {/* Background */}
      <color attach="background" args={['#050510']} />

      {/* Globe */}
      <GlobeSphere />
      <Atmosphere />
      <CityMarkers 
        onCityClick={handleCityClick}
        hoveredCity={hoveredCity}
        setHoveredCity={setHoveredCity}
      />

      {/* Particles */}
      <GlobeParticles count={1500} />

      {/* Tooltip */}
      <CityTooltip city={hoveredCityData} />

      {/* Orbit controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={!isAnimating.current}
        autoRotateSpeed={0.5}
        rotateSpeed={0.8}
        zoomSpeed={1.0}
      />
    </>
  );
}

// ============================================================
// LOADING FALLBACK
// ============================================================
function GlobeFallback() {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-luxury-black/50 rounded-xl">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading Globe...</p>
      </div>
    </div>
  );
}

// ============================================================
// EXPORTED COMPONENT
// ============================================================
export function InteractiveGlobe({
  onCountrySelect,
  onCitySelect,
  onBackToWorld,
}: {
  onCountrySelect: (countryCode: string) => void;
  onCitySelect: (cityId: string) => void;
  onBackToWorld: () => void;
}) {
  return (
    <div className="w-full min-h-[500px] relative">
      <Suspense fallback={<GlobeFallback />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          camera={{ position: [0, 0.5, 6], fov: 45, near: 0.1, far: 30 }}
          style={{ background: '#050510', borderRadius: '12px' }}
        >
          <GlobeScene
            onCountrySelect={onCountrySelect}
            onCitySelect={onCitySelect}
            onBackToWorld={onBackToWorld}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
