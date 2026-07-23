import { useMemo } from 'react';
import { CITIES, COUNTRIES } from '../../lib/global-data';

export interface PulseData {
  lat: number;
  lng: number;
  intensity: number;
  color: string;
  cityName: string;
  countryFlag: string;
  opportunityCount: number;
  score: number;
}

export function useOpportunityPulses(minConfidence = 80): PulseData[] {
  return useMemo(() => {
    const pulses: PulseData[] = [];

    for (const country of COUNTRIES) {
      const countryCities = CITIES[country.code] || [];
      for (const city of countryCities) {
        if (city.confidence < minConfidence) continue;

        // Intensity is derived from confidence + investor interest
        const intensity = Math.min(1, (city.confidence + city.investorInterest) / 200);
        
        pulses.push({
          lat: city.latitude,
          lng: city.longitude,
          intensity,
          color: intensity >= 0.85 ? '#f59e0b' : intensity >= 0.7 ? '#d4a030' : '#3b82f6',
          cityName: city.name,
          countryFlag: country.flag,
          opportunityCount: city.activeProjects + city.upcomingLaunches,
          score: city.confidence,
        });
      }
    }

    return pulses;
  }, [minConfidence]);
}

// Sample data for the pulse visualization
export const PULSE_POSITIONS = [
  { lat: 25.2, lng: 55.3, intensity: 0.95, label: 'Dubai' },     // Dubai
  { lat: 19.1, lng: 72.9, intensity: 0.90, label: 'Mumbai' },    // Mumbai
  { lat: 18.5, lng: 73.9, intensity: 0.88, label: 'Pune' },      // Pune
  { lat: 13.0, lng: 77.6, intensity: 0.85, label: 'Bengaluru' },  // Bangalore
  { lat: 1.35, lng: 103.8, intensity: 0.82, label: 'Singapore' }, // Singapore
  { lat: 51.5, lng: -0.13, intensity: 0.78, label: 'London' },    // London
  { lat: 40.7, lng: -74.0, intensity: 0.75, label: 'New York' },  // New York
  { lat: 25.8, lng: -80.2, intensity: 0.80, label: 'Miami' },     // Miami
  { lat: 24.5, lng: 54.4, intensity: 0.77, label: 'Abu Dhabi' },  // Abu Dhabi
  { lat: 24.7, lng: 46.7, intensity: 0.72, label: 'Riyadh' },     // Riyadh
];
