import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import GlobeComponent from 'react-globe.gl';
import { useCountryData, getCountryColor, getCountrySideColor, getCountryAltitude } from './CountryLayer';
import { useGlobeCities, formatCityLabel } from './CityClusters';
import { usePropertyHotspots, formatHotspotLabel } from './PropertyHotspots';
import { useInvestmentArcs } from './InvestmentArcs';

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
  const [loaded, setLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  // Merge city markers and property hotspots into a single pointsData
  // (react-globe.gl only supports one pointsData prop)
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

  // Handle resize
  useEffect(() => {
    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
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

  // Event handlers
  const handleCityClick = useCallback((point: any, event: any) => {
    if (point?.cityId && onCitySelect) {
      onCitySelect(point.cityId);
    }
  }, [onCitySelect]);

  const handleCountryClick = useCallback((polygon: any) => {
    const isoA2 = polygon?.properties?.ISO_A2 || '';
    if (isoA2 && onCountrySelect) {
      onCountrySelect(isoA2.toUpperCase());
    }
  }, [onCountrySelect]);

  // Early return if no data
  if (geoLoading) {
    return <div className="w-full h-full flex items-center justify-center"><div className="w-10 h-10 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  // Country polygon labels
  const polygonLabel = useCallback((d: any) => {
    const countryData = d;
    if (!countryData) return '';
    return `
      <div style="background: #050510; border: 1px solid rgba(212,160,48,0.3); border-radius: 8px; padding: 6px 10px; color: white; font-family: system-ui; font-size: 11px;">
        <b>${countryData.properties?.NAME || ''}</b>
        ${countryData.opportunities > 0 ? `<div style="color: #f59e0b; font-size: 9px; margin-top: 2px;">${countryData.opportunities} opportunities · ${countryData.confidence}% confidence</div>` : ''}
      </div>
    `;
  }, []);

  return (
    <GlobeComponent
      ref={globeRef}
      width={dimensions.width}
      height={dimensions.height}

      // === Country Boundaries ===
      polygonsData={countryData}
      polygonGeoJsonGeometry={(d: any) => d?.feature?.geometry}
      polygonCapColor={(d: any) => getCountryColor(d as any)}
      polygonSideColor={(d: any) => getCountrySideColor(d as any)}
      polygonAltitude={(d: any) => getCountryAltitude(d as any)}
      polygonLabel={(d: any) => polygonLabel(d)}
      onPolygonClick={(d: any) => handleCountryClick(d as any)}
      polygonStrokeColor={() => 'rgba(212, 160, 48, 0.06)' as any}

      // === City Markers + Property Hotspots (merged) ===
      pointsData={mergedPoints as any[]}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointRadius="radius"
      pointAltitude={(d: any) => d._type === 'city' ? 0.02 : 0.01}
      pointLabel={(d: any) => d._label || ''}
      onPointClick={(d: any, event: any) => {
        if (d._type === 'city' && d._cityId && onCitySelect) {
          onCitySelect(d._cityId);
        } else if (d._type === 'hotspot' && d.city && onCitySelect) {
          // For hotspots, find the city by name and navigate
          // (simplified: just pass the city name as context)
          console.log('Hotspot clicked:', d.city);
        }
      }}


      // === Investment Arcs ===
      arcsData={validArcs}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor={(a: any) => a?.color || '#f59e0b'}
      arcAltitude={(a: any) => a?.altitude || 0.1}
      arcStroke={(a: any) => a?.stroke || 0.5}
      arcDashLength={0.15}
      arcDashGap={0.1}
      arcDashInitialGap={() => Math.random()}
      arcDashAnimateTime={3000}

      // === Atmosphere & Visuals ===
      showAtmosphere={true}
      atmosphereColor="#d4a030"
      atmosphereAltitude={0.15}
      
      // === Globe Visuals ===
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"


      
      // === Labels ===
      labelsData={validCities}
      labelLat="lat"
      labelLng="lng"
      labelText={(d: any) => d?.isHot ? d.city : ''}
      labelSize={0.8}

      labelColor={(d: any) => d?.isHot ? '#f59e0b' : 'rgba(255,255,255,0.3)'}
      labelAltitude={0.03}
      labelResolution={8}
    />
  );
}
