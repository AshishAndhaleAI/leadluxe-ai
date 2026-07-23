import { useMemo } from 'react';
import { CITIES, COUNTRIES } from '../../lib/global-data';
import type { City } from '../../lib/global-data';

export interface GlobeCityPoint {
  lat: number;
  lng: number;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  confidence: number;
  priceTrend: number;
  projects: number;
  isHot: boolean;
  investorInterest: number;
  radius: number;
  color: string;
  cityId: string;
}

export function useGlobeCities(): GlobeCityPoint[] {
  return useMemo(() => {
    const points: GlobeCityPoint[] = [];
    
    for (const country of COUNTRIES) {
      const countryCities = CITIES[country.code] || [];
      for (const city of countryCities) {
        // Validate coordinates
        const lat = city.latitude;
        const lng = city.longitude;
        
        // Skip invalid coordinates
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn(`Invalid coordinates for ${city.name}: ${lat}, ${lng}`);
          continue;
        }

        const isHot = city.investorInterest >= 75 || city.confidence >= 85;
        
        points.push({
          lat,
          lng,
          city: city.name,
          country: country.name,
          countryCode: country.code,
          flag: country.flag,
          confidence: city.confidence,
          priceTrend: city.priceTrend,
          projects: city.activeProjects,
          investorInterest: city.investorInterest,
          isHot,
          radius: isHot ? 0.6 : 0.4,
          color: isHot ? '#f59e0b' : '#d4a030',
          cityId: city.id,
        });
      }
    }
    
    return points;
  }, []);
}

// Label formatter for marker tooltips
export function formatCityLabel(point: GlobeCityPoint): string {
  return `
    <div style="background: #050510; border: 1px solid rgba(212,160,48,0.3); border-radius: 8px; padding: 8px 12px; color: white; font-family: system-ui; min-width: 150px;">
      <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
        <span>${point.flag}</span>
        <span>${point.city}</span>
      </div>
      <div style="font-size: 10px; color: #888; margin-bottom: 6px;">${point.country}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">
        <div style="color: #f59e0b;">${point.confidence}% confidence</div>
        <div style="color: #22c55e;">+${point.priceTrend}% trend</div>
        <div style="color: #888;">${point.projects} projects</div>
        <div style="color: #888;">${point.investorInterest}% demand</div>
      </div>
      ${point.isHot ? '<div style="margin-top: 4px; font-size: 9px; color: #f59e0b; text-align: center;">🔥 High opportunity market</div>' : ''}
    </div>
  `;
}
