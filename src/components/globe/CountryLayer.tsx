import { useState, useEffect, useMemo } from 'react';
import { COUNTRIES } from '../../lib/global-data';

// GeoJSON URL for world country boundaries (Natural Earth 110m via react-globe.gl CDN)
const GEOJSON_URL = 'https://cdn.jsdelivr.net/npm/react-globe.gl@2/example/datasets/ne_110m_admin_0_countries.geojson';

export interface CountryFeature {
  type: string;
  properties: {
    NAME: string;
    ISO_A3: string;
    ISO_A2: string;
    CONTINENT: string;
    POP_EST: number;
  };
  geometry: any;
}

export interface CountryData {
  feature: CountryFeature;
  opportunities: number;
  confidence: number;
  isActive: boolean;
}

export function useCountryData() {
  const [features, setFeatures] = useState<CountryFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchGeoJSON() {
      try {
        const response = await fetch(GEOJSON_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (!cancelled) {
          setFeatures(data.features || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to load GeoJSON country boundaries:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    }

    fetchGeoJSON();
    return () => { cancelled = true; };
  }, []);

  // Map country data to features for polygon rendering
  const countryData = useMemo((): CountryData[] => {
    return features.map(f => {
      const isoA2 = (f.properties.ISO_A2 || '').toUpperCase();
      const country = COUNTRIES.find(c => c.code === isoA2);
      return {
        feature: f,
        opportunities: country?.opportunityCount || 0,
        confidence: country?.confidence || 0,
        isActive: country?.active || false,
      };
    });
  }, [features]);

  return { countryData, loading, error };
}

// Color helpers for country heatmap
export function getCountryColor(country: CountryData): string {
  if (!country.isActive) return 'rgba(30, 30, 50, 0.3)';
  const confidence = country.confidence;
  if (confidence >= 85) return 'rgba(212, 160, 48, 0.35)'; // Gold - high opportunity
  if (confidence >= 75) return 'rgba(245, 158, 11, 0.25)'; // Amber - good
  if (confidence >= 60) return 'rgba(59, 130, 246, 0.2)';  // Blue - moderate
  return 'rgba(107, 114, 128, 0.15)';                       // Gray - low
}

export function getCountrySideColor(country: CountryData): string {
  if (!country.isActive) return 'rgba(20, 20, 40, 0.1)';
  return 'rgba(212, 160, 48, 0.08)';
}

export function getCountryAltitude(country: CountryData): number {
  if (!country.isActive) return 0.001;
  return 0.002 + (country.confidence / 100) * 0.008;
}
