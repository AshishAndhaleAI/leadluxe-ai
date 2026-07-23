// ============================================================
// Phase 2: Capital Flow Prediction Engine
// Predicts where real estate capital will move using
// multi-factor analysis across 10 features
// ============================================================

import { CITIES, COUNTRIES } from '../global-data';

export type PredictionHorizon = '30d' | '90d' | '1yr' | '3yr';

export interface CityPrediction {
  cityId: string;
  cityName: string;
  country: string;
  horizon: PredictionHorizon;
  inflowProbability: number;   // 0-100
  momentumScore: number;       // 0-100
  appreciationForecast: number; // % expected appreciation
  institutionalDemandForecast: number; // 0-100
  confidence: number;          // 0-100
  featuresUsed: CityFeatures;
  reasoning: string;
}

interface CityFeatures {
  interestRateDifferential: number;
  currencyTrend: number;
  constructionPermits: number;
  landAcquisitionActivity: number;
  infrastructureSpending: number;
  foreignDirectInvestment: number;
  officeAbsorption: number;
  luxuryTransactionVolume: number;
  migrationInflow: number;
  techEmploymentGrowth: number;
}

// =====================
// DERIVE FEATURES FROM CITY DATA
// =====================
function deriveFeatures(city: typeof CITIES[string][0]): CityFeatures {
  return {
    interestRateDifferential: city.confidence > 80 ? 65 : city.confidence > 70 ? 50 : 40,
    currencyTrend: city.foreignDemand > 60 ? 55 : 45,
    constructionPermits: Math.min(city.upcomingLaunches * 3, 100),
    landAcquisitionActivity: city.activeProjects > 80 ? 70 : city.activeProjects > 50 ? 55 : 40,
    infrastructureSpending: city.tags?.some(t => ['metro', 'infrastructure', 'corridor'].includes(t.toLowerCase())) ? 75 : 45,
    foreignDirectInvestment: city.foreignDemand,
    officeAbsorption: Math.min(city.absorptionRate + 10, 100),
    luxuryTransactionVolume: city.tags?.includes('luxury') ? city.investorInterest : 40,
    migrationInflow: city.priceTrend > 8 ? 65 : city.priceTrend > 4 ? 50 : 35,
    techEmploymentGrowth: city.tags?.includes('it-hub') ? 70 : city.tags?.includes('tech') ? 65 : 40,
  };
}

// =====================
// PREDICT FOR A SINGLE CITY
// =====================
export function predictCityCapitalFlow(
  city: typeof CITIES[string][0],
  horizon: PredictionHorizon
): CityPrediction {
  const features = deriveFeatures(city);

  // Horizon multipliers
  const horizonMultiplier: Record<PredictionHorizon, number> = {
    '30d': 0.6,
    '90d': 0.8,
    '1yr': 1.0,
    '3yr': 1.2,
  };

  const multiplier = horizonMultiplier[horizon];

  // Weighted feature scoring
  const inflowProbability = Math.round(Math.min(100,
    (features.foreignDirectInvestment * 0.20 +
     features.migrationInflow * 0.15 +
     features.infrastructureSpending * 0.15 +
     features.officeAbsorption * 0.12 +
     features.techEmploymentGrowth * 0.12 +
     features.luxuryTransactionVolume * 0.10 +
     features.landAcquisitionActivity * 0.08 +
     features.constructionPermits * 0.08) * multiplier
  ));

  const momentumScore = Math.round(Math.min(100,
    (features.techEmploymentGrowth * 0.25 +
     features.migrationInflow * 0.20 +
     features.constructionPermits * 0.18 +
     features.infrastructureSpending * 0.17 +
     features.officeAbsorption * 0.10 +
     features.luxuryTransactionVolume * 0.10) * multiplier
  ));

  // Appreciation forecast varies by horizon
  const baseAppreciation = city.priceTrend || 5;
  const appreciationForecast = Math.round(
    baseAppreciation * (horizon === '30d' ? 0.3 : horizon === '90d' ? 0.5 : horizon === '1yr' ? 1.0 : 2.5)
  );

  // Institutional demand
  const institutionalDemandForecast = Math.round(Math.min(100,
    (features.foreignDirectInvestment * 0.25 +
     features.officeAbsorption * 0.20 +
     features.migrationInflow * 0.20 +
     features.landAcquisitionActivity * 0.15 +
     features.infrastructureSpending * 0.10 +
     features.techEmploymentGrowth * 0.10) * multiplier
  ));

  // Confidence decreases with horizon
  const confidence = Math.round(Math.min(100,
    (80 + city.confidence * 0.15) * (horizon === '30d' ? 1.0 : horizon === '90d' ? 0.92 : horizon === '1yr' ? 0.82 : 0.68)
  ));

  // Generate reasoning
  const reasoning = generateReasoning(city, horizon, inflowProbability, momentumScore, features);

  return {
    cityId: city.id,
    cityName: city.name,
    country: COUNTRIES.find(c => c.code === city.countryCode)?.name || 'Unknown',
    horizon,
    inflowProbability,
    momentumScore,
    appreciationForecast,
    institutionalDemandForecast,
    confidence,
    featuresUsed: features,
    reasoning,
  };
}

// =====================
// PREDICT FOR ALL ACTIVE CITIES
// =====================
export function predictGlobalCapitalFlows(horizon: PredictionHorizon = '1yr'): CityPrediction[] {
  const predictions: CityPrediction[] = [];

  for (const [countryCode, cities] of Object.entries(CITIES)) {
    for (const city of cities) {
      const prediction = predictCityCapitalFlow(city, horizon);
      predictions.push(prediction);
    }
  }

  // Sort by inflow probability descending
  predictions.sort((a, b) => b.inflowProbability - a.inflowProbability);
  return predictions;
}

// =====================
// FIND EMERGING HOTSPOTS
// =====================
export function findEmergingHotspots(predictions: CityPrediction[]): CityPrediction[] {
  return predictions
    .filter(p => p.horizon === '1yr' && p.inflowProbability >= 65 && p.momentumScore >= 60)
    .sort((a, b) => b.momentumScore - a.momentumScore);
}

// =====================
// FIND COOLING MARKETS
// =====================
export function findCoolingMarkets(predictions: CityPrediction[]): CityPrediction[] {
  return predictions
    .filter(p => p.horizon === '1yr' && p.inflowProbability < 40 && p.momentumScore < 45)
    .sort((a, b) => a.inflowProbability - b.inflowProbability);
}

// =====================
// REASONING GENERATOR
// =====================
function generateReasoning(
  city: typeof CITIES[string][0],
  horizon: PredictionHorizon,
  inflowProb: number,
  momentum: number,
  features: CityFeatures
): string {
  const parts: string[] = [];
  const horizonLabel = { '30d': '30 days', '90d': '90 days', '1yr': '1 year', '3yr': '3 years' }[horizon];

  if (inflowProb >= 75) {
    parts.push(`Strong capital inflow probability (${inflowProb}%) over ${horizonLabel}`);
  } else if (inflowProb >= 60) {
    parts.push(`Moderate capital inflow probability (${inflowProb}%) over ${horizonLabel}`);
  } else {
    parts.push(`Cautious capital inflow outlook (${inflowProb}%) over ${horizonLabel}`);
  }

  if (features.infrastructureSpending > 60) {
    parts.push(`Infrastructure spending is a key catalyst (${features.infrastructureSpending}/100)`);
  }
  if (features.techEmploymentGrowth > 60) {
    parts.push(`Tech employment growth driving demand (${features.techEmploymentGrowth}/100)`);
  }
  if (features.foreignDirectInvestment > 60) {
    parts.push(`Strong foreign direct investment interest (${features.foreignDirectInvestment}/100)`);
  }
  if (features.landAcquisitionActivity > 60) {
    parts.push(`Active land acquisition suggests developer confidence (${features.landAcquisitionActivity}/100)`);
  }

  const trend = momentum >= 70 ? 'rapidly accelerating' : momentum >= 55 ? 'steadily growing' : 'showing mixed signals';
  parts.push(`Momentum score of ${momentum} indicates a ${trend} market.`);

  if (city.tags?.includes('luxury')) {
    parts.push('Premium segment driving above-average transaction values.');
  }
  if (city.tags?.includes('it-hub')) {
    parts.push('IT sector employment creating sustained housing demand.');
  }

  return parts.join('. ') + '.';
}
