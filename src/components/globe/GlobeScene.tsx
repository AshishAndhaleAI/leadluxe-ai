import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import GlobeComponent from 'react-globe.gl';
import { useCountryData, getCountryColor, getCountrySideColor, getCountryAltitude } from './CountryLayer';
import { useGlobeCities, formatCityLabel } from './CityClusters';
import { usePropertyHotspots, formatHotspotLabel } from './PropertyHotspots';
import { useInvestmentArcs } from './InvestmentArcs';
import { GlobeErrorBoundary } from './GlobeErrorBoundary';

// ============================================================
// PROPS
// ============================================================
export interface GlobeSceneProps {
  onCitySelect?: (cityId: string) => void;
  onCountrySelect?: (countryCode: string) => void;
  onBackToWorld?: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAltitude?: number;
}

// ============================================================
// GLOBE SCENE
// ============================================================
export function GlobeScene({
  onCitySelect,
  onCountrySelect,
  onBackToWorld,
  initialLat = 20,
  initialLng = 0,
  initialAltitude = 2.5,
}: GlobeSceneProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Real geospatial data
  const { countryData, loading: geoLoading } = useCountryData();
  const cities = useGlobeCities();
  const hotspots = usePropertyHotspots(70);
  const arcs = useInvestmentArcs();

  // Validation: filter out null/invalid data
  const validCities = useMemo(() => 
    cities.filter(c => 
      !isNaN(c.lat) && !isNaN(c.lng) && 
      c.lat >= -90 && c.lat <= 90 && 
      c.lng >= -180 && c.lng <= 180
    ), [cities]);

  const validHotspots = useMemo(() =>
    hotspots.filter(h =>
      !isNaN(h.lat) && !isNaN(h.lng) &&
      h.lat >= -90 && h.lat <= 90 &&
      h.lng >= -180 && h.lng <= 180
    ), [hotspots]);

  const validArcs = useMemo(() =>
    arcs.filter(a =>
      !isNaN(a.startLat) && !isNaN(a.startLng) &&
      !isNaN(a.endLat) && !isNaN(a.endLng) &&
      a.startLat >= -90 && a.startLat <= 90 &&
      a.startLng >= -180 && a.startLng <= 180 &&
      a.endLat >= -90 && a.endLat <= 90 &&
      a.endLng >= -180 && a.endLng <= 180
    ), [arcs]);

  // Event handlers (defined before being referenced by useCallbacks)
  const handleCountryClick = useCallback((polygon: any) => {
    const isoA2 = polygon?.properties?.ISO_A2 || '';
    if (isoA2 && onCountrySelect) {
      onCountrySelect(isoA2.toUpperCase());
    }
  }, [onCountrySelect]);

  // Stable accessor values — prevents per-render function references that
  // would cause react-globe.gl to rebuild WebGL buffers on every parent render
  const POINT_ALT_FN = useCallback((d: any) => d?._type === 'city' ? 0.02 : 0.01, []);
  const POINT_LABEL_FN = useCallback((d: any) => d?._label || '', []);
  const POLYGON_GEO_GEOM_FN = useCallback((d: any) => d?.feature?.geometry || null, []);
  const POLYGON_STROKE_FN = useCallback(() => 'rgba(212, 160, 48, 0.06)' as any, []);
  const POLYGON_LABEL_FN = useCallback((d: any) => {
    if (!d) return '';
    // d is CountryData: { feature: GeoJSONFeature, opportunities, confidence, isActive }
    const props = d.feature?.properties || d.properties || {};
    return `
      <div style="background: #050510; border: 1px solid rgba(212,160,48,0.3); border-radius: 8px; padding: 6px 10px; color: white; font-family: system-ui; font-size: 11px;">
        <b>${props.NAME || props.name || ''}</b>
        ${d.opportunities > 0 ? `<div style="color: #f59e0b; font-size: 9px; margin-top: 2px;">${d.opportunities} opportunities · ${d.confidence}% confidence</div>` : ''}
      </div>
    `;
  }, []);
  const LABEL_TEXT_FN = useCallback((d: any) => d?.isHot ? d.city : '', []);
  const LABEL_COLOR_FN = useCallback((d: any) => d?.isHot ? '#f59e0b' : 'rgba(255,255,255,0.3)', []);
  const ARC_COLOR_FN = useCallback((a: any) => a?.color || '#f59e0b', []);
  const ARC_ALT_FN = useCallback((a: any) => a?.altitude || 0.1, []);
  const ARC_STROKE_FN = useCallback((a: any) => a?.stroke || 0.5, []);
  const POLYGON_COLOR_FN = useCallback((d: any) => getCountryColor(d as any), []);
  const POLYGON_SIDE_FN = useCallback((d: any) => getCountrySideColor(d as any), []);
  const POLYGON_ALT_FN = useCallback((d: any) => getCountryAltitude(d as any), []);
  const ON_POLYGON_CLICK = useCallback((d: any) => handleCountryClick(d as any), [handleCountryClick]);
  const ON_POINT_CLICK = useCallback((d: any, event: any) => {
    if (d?._type === 'city' && d._cityId && onCitySelect) {
      onCitySelect(d._cityId);
    } else if (d?._type === 'hotspot' && d.city && onCitySelect) {
      console.log('Hotspot clicked:', d.city);
    }
  }, [onCitySelect]);

  // Merge city markers and property hotspots into a single pointsData
  const mergedPoints = useMemo(() => {
    const cityPoints = validCities.map(c => ({
      ...c,
      _type: 'city' as const,
      _cityId: c.cityId,
      _label: formatCityLabel(c),
    }));
    const hotspotPoints = validHotspots.map(h => ({
      ...h,
      _type: 'hotspot' as const,
      _cityId: undefined,
      _label: formatHotspotLabel(h),
    }));
    return [...cityPoints, ...hotspotPoints];
  }, [validCities, validHotspots]);

  // Handle resize — use container dimensions with fallback
  useEffect(() => {
    function updateDimensions() {
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const h = containerRef.current?.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        setDimensions({ width: w, height: h });
      }
    }
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
    };
  }, []);

  // Initial camera position
  useEffect(() => {
    if (globeRef.current && !loaded) {
      globeRef.current.pointOfView({
        lat: initialLat,
        lng: initialLng,
        altitude: initialAltitude,
      });
      setLoaded(true);
    }
  }, [initialLat, initialLng, initialAltitude, loaded]);

  // Early return if no data
  if (geoLoading) {
    return <div className="w-full h-full flex items-center justify-center"><div className="w-10 h-10 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <GlobeErrorBoundary>
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: '500px' }}>
    <GlobeComponent
      ref={globeRef}
      width={dimensions.width}
      height={dimensions.height}

      // === Country Boundaries ===
      polygonsData={countryData}
      polygonGeoJsonGeometry={POLYGON_GEO_GEOM_FN}
      polygonCapColor={POLYGON_COLOR_FN}
      polygonSideColor={POLYGON_SIDE_FN}
      polygonAltitude={POLYGON_ALT_FN}
      polygonLabel={POLYGON_LABEL_FN}
      onPolygonClick={ON_POLYGON_CLICK}
      polygonStrokeColor={POLYGON_STROKE_FN}

      // === City Markers + Property Hotspots (merged) ===
      pointsData={mergedPoints as any[]}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointRadius="radius"
      pointAltitude={POINT_ALT_FN}
      pointLabel={POINT_LABEL_FN}
      onPointClick={ON_POINT_CLICK}

      // === Investment Arcs ===
      arcsData={validArcs}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor={ARC_COLOR_FN}
      arcAltitude={ARC_ALT_FN}
      arcStroke={ARC_STROKE_FN}
      arcDashLength={0.15}
      arcDashGap={0.1}
      arcDashInitialGap={0.2}
      arcDashAnimateTime={4000}

      // === WebGL Renderer Config — stabilize context ===
      rendererConfig={{
        powerPreference: 'high-performance' as any,
        antialias: true,
        failIfMajorPerformanceCaveat: false,
        alpha: false,
      }}

      // === Atmosphere & Visuals ===
      showAtmosphere={true}
      atmosphereColor="#d4a030"
      atmosphereAltitude={0.15}
      
      // === Globe Visuals ===
      globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
      bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"

      // === Labels ===
      labelsData={validCities}
      labelLat="lat"
      labelLng="lng"
      labelText={LABEL_TEXT_FN}
      labelSize={0.8}
      labelColor={LABEL_COLOR_FN}
      labelAltitude={0.03}
      labelResolution={8}
    />
    </div>
    </GlobeErrorBoundary>
  );
}
