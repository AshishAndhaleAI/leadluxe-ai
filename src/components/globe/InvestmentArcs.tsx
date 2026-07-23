import { useMemo } from 'react';
import { CITIES, COUNTRIES } from '../../lib/global-data';

export interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  altitude: number;
  stroke: number;
  label?: string;
}

// Major capital flow routes between tracked cities
const MAJOR_ROUTES: { from: string; to: string }[] = [
  // Gulf → South Asia
  { from: 'ae-dxb', to: 'in-mum' },
  { from: 'ae-dxb', to: 'in-del' },
  { from: 'ae-dxb', to: 'in-blr' },
  // Singapore → Southeast Asia
  { from: 'sg-sin', to: 'my-kul' },
  // Europe → Middle East
  { from: 'gb-lon', to: 'ae-dxb' },
  { from: 'gb-lon', to: 'sg-sin' },
  // North America → Europe
  { from: 'us-nyc', to: 'gb-lon' },
  { from: 'us-sfo', to: 'sg-sin' },
  // Middle East → South Asia
  { from: 'ae-dxb', to: 'in-pun' },
  { from: 'ae-abu', to: 'in-mum' },
  // India internal
  { from: 'in-mum', to: 'in-pun' },
  { from: 'in-mum', to: 'in-blr' },
  { from: 'in-del', to: 'in-mum' },
  { from: 'in-blr', to: 'in-hyd' },
  // UK → India
  { from: 'gb-lon', to: 'in-blr' },
  { from: 'gb-lon', to: 'in-mum' },
  // US → India
  { from: 'us-nyc', to: 'in-blr' },
  { from: 'us-sfo', to: 'in-pun' },
  // China connections
  { from: 'sg-sin', to: 'my-kul' },
  // Middle East internal
  { from: 'ae-dxb', to: 'ae-abu' },
  { from: 'ae-dxb', to: 'sa-ruh' },
  // Australia connections
  { from: 'au-syd', to: 'sg-sin' },
  { from: 'au-mel', to: 'sg-sin' },
];

export function useInvestmentArcs(): ArcData[] {
  return useMemo(() => {
    // Flatten CITIES into lookup
    const cityLookup = new Map<string, { lat: number; lng: number; name: string; countryCode: string }>();
    
    for (const [countryCode, cities] of Object.entries(CITIES)) {
      for (const city of cities) {
        cityLookup.set(city.id, {
          lat: city.latitude,
          lng: city.longitude,
          name: city.name,
          countryCode,
        });
      }
    }

    const arcs: ArcData[] = [];

    for (const route of MAJOR_ROUTES) {
      const from = cityLookup.get(route.from);
      const to = cityLookup.get(route.to);
      
      if (!from || !to) continue;

      // Validate coordinates
      if (from.lat < -90 || from.lat > 90 || from.lng < -180 || from.lng > 180) continue;
      if (to.lat < -90 || to.lat > 90 || to.lng < -180 || to.lng > 180) continue;

      // Color based on confidence (gold for high-confidence routes)
      const isInternational = from.countryCode !== to.countryCode;
      
      arcs.push({
        startLat: from.lat,
        startLng: from.lng,
        endLat: to.lat,
        endLng: to.lng,
        color: isInternational ? '#f59e0b' : '#3b82f6',
        altitude: isInternational ? 0.15 : 0.08,
        stroke: isInternational ? 0.8 : 0.4,
      });
    }

    return arcs;
  }, []);
}
