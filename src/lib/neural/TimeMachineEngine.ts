// ============================================================
// Phase 3: AI Time Machine
// Generates snapshots of capital shifts across cities over time
// Users can slide from past 5 years to future 5 years
// ============================================================

import { CITIES, COUNTRIES } from '../global-data';
import { predictCityCapitalFlow } from './CapitalFlowPrediction';

export interface TimeSnapshot {
  year: number;
  label: string;
  isCurrent: boolean;
  cityRankings: { cityId: string; cityName: string; country: string; score: number }[];
  capitalFlows: { source: string; target: string; value: number }[];
  emergingHotspots: string[];
  coolingMarkets: string[];
  growthCorridors: string[];
  currencyAdjustedZones: string[];
}

export const AVAILABLE_YEARS = [
  { year: 2021, label: '5 Years Ago', isCurrent: false },
  { year: 2023, label: '3 Years Ago', isCurrent: false },
  { year: 2025, label: 'Current', isCurrent: true },
  { year: 2026, label: '+1 Year', isCurrent: false },
  { year: 2028, label: '+3 Years', isCurrent: false },
  { year: 2030, label: '+5 Years', isCurrent: false },
];

// =====================
// GENERATE SNAPSHOT FOR A GIVEN YEAR
// =====================
export function generateTimeSnapshot(year: number): TimeSnapshot {
  const availableYear = AVAILABLE_YEARS.find(y => y.year === year);
  const label = availableYear?.label || `${year}`;
  const isCurrent = availableYear?.isCurrent || false;

  // How far from current year (2025)
  const yearDiff = year - 2025;
  const confidenceMultiplier = yearDiff <= 0 ? 1.0 : Math.max(0.4, 1 - yearDiff * 0.12);

  // Generate city rankings
  const cityRankings: TimeSnapshot['cityRankings'] = [];
  for (const [countryCode, cities] of Object.entries(CITIES)) {
    const country = COUNTRIES.find(c => c.code === countryCode);
    for (const city of cities) {
      // Simulate how the city would have scored in the past / future
      const timeFactor = 1 + yearDiff * (city.priceTrend > 0 ? 0.015 : -0.01);
      const adjustedConfidence = Math.round(Math.min(100, Math.max(10, city.confidence * timeFactor)));

      cityRankings.push({
        cityId: city.id,
        cityName: city.name,
        country: country?.name || 'Unknown',
        score: adjustedConfidence,
      });
    }
  }

  // Sort by score descending
  cityRankings.sort((a, b) => b.score - a.score);

  // Generate capital flows between top cities
  const capitalFlows: TimeSnapshot['capitalFlows'] = [];
  const topCities = cityRankings.slice(0, 10);
  for (let i = 0; i < topCities.length - 1; i++) {
    for (let j = i + 1; j < topCities.length; j++) {
      const flowValue = Math.round(Math.abs(topCities[i].score - topCities[j].score) * (0.5 + Math.random() * 0.5));
      if (flowValue > 10) {
        capitalFlows.push({
          source: topCities[i].cityId,
          target: topCities[j].cityId,
          value: flowValue,
        });
      }
    }
  }

  // Emerging hotspots (cities gaining confidence over time)
  const emergingHotspots = cityRankings
    .filter(r => r.score >= 75 && year > 2023)
    .slice(0, 8)
    .map(r => r.cityName);

  // Cooling markets (cities losing confidence)
  const coolingMarkets = cityRankings
    .filter(r => r.score < 50)
    .slice(0, 5)
    .map(r => r.cityName);

  // Growth corridors (groups of nearby high-scoring cities)
  const growthCorridors = [
    'Mumbai-Pune-Hyderabad Tech Corridor',
    'Dubai-Abu Dhabi Luxury Coast',
    'London-Manchester-Birmingham Growth Arc',
    'Singapore-Kuala Lumpur ASEAN Hub',
    'Riyadh-Jeddah-Dammam Golden Triangle',
    'New York-Boston-Washington DC Corridor',
    'Berlin-Munich-Frankfurt Innovation Belt',
    'Sydney-Melbourne-Brisbane East Coast',
  ].slice(0, Math.max(3, Math.min(8, 4 + Math.floor(yearDiff))));

  // Currency-adjusted zones (where currency makes investments attractive)
  const currencyAdjustedZones = (() => {
    const zones = ['Dubai (USD-pegged stability)', 'Singapore (strong SGD)', 'London (post-Brexit discount)'];
    if (year >= 2025) zones.push('Tokyo (weakening yen opportunity)');
    if (year >= 2026) zones.push('Istanbul (TRY discount for foreign buyers)');
    if (year >= 2027) zones.push('Mumbai (INR stability play)');
    if (year >= 2028) zones.push('Berlin (EUR institutional gateway)');
    return zones;
  })();

  return {
    year,
    label,
    isCurrent,
    cityRankings,
    capitalFlows,
    emergingHotspots,
    coolingMarkets,
    growthCorridors,
    currencyAdjustedZones,
  };
}

// =====================
// GENERATE ALL SNAPSHOTS
// =====================
export function generateAllSnapshots(): TimeSnapshot[] {
  return AVAILABLE_YEARS.map(y => generateTimeSnapshot(y.year));
}

// =====================
// GET CAPITAL SHIFT BETWEEN TWO SNAPSHOTS
// =====================
export function getCapitalShift(from: TimeSnapshot, to: TimeSnapshot): {
  citiesGaining: { name: string; delta: number }[];
  citiesLosing: { name: string; delta: number }[];
} {
  const fromMap = new Map(from.cityRankings.map(c => [c.cityName, c.score]));
  const toMap = new Map(to.cityRankings.map(c => [c.cityName, c.score]));
  const shifts: { name: string; delta: number }[] = [];

  for (const [name, toScore] of toMap) {
    const fromScore = fromMap.get(name) || 0;
    shifts.push({ name, delta: toScore - fromScore });
  }

  shifts.sort((a, b) => b.delta - a.delta);

  return {
    citiesGaining: shifts.filter(s => s.delta > 0).slice(0, 10),
    citiesLosing: shifts.filter(s => s.delta < 0).slice(0, 10),
  };
}
