// ============================================================
// LeadLuxe AI — Unified Multi-Factor Ranking Engine
// Single scoring formula used by ALL tabs.
// Score = price_momentum*0.20 + rental_yield*0.15 + infra*0.15
// + inventory_absorption*0.10 + developer_reputation*0.10
// + foreign_capital*0.10 + currency*0.10 + liquidity*0.10
// ============================================================

import { CITIES, COUNTRIES } from '../global-data';

export interface ScoringFactors {
  priceMomentum: number;       // 0-100 | weight 20%
  rentalYield: number;         // 0-100 | weight 15%
  infrastructureImpact: number; // 0-100 | weight 15%
  inventoryAbsorption: number;  // 0-100 | weight 10%
  developerReputation: number;  // 0-100 | weight 10%
  foreignCapitalFlow: number;   // 0-100 | weight 10%
  currencyStability: number;    // 0-100 | weight 10%
  liquidityScore: number;       // 0-100 | weight 10%
}

export interface ScoredOpportunity {
  id: string;
  title: string;
  city: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  score: number;         // 0-100
  confidence: number;    // 0-100
  factors: ScoringFactors;
  expectedAppreciation: string;
  expectedRentalYield: string;
  commissionMin: number;
  commissionMax: number;
  timeHorizon: string;
  primaryCatalyst: string;
  primaryRisk: string;
  evidenceCount: number;
  lastVerified: string;
}

const WEIGHTS = {
  priceMomentum: 0.20,
  rentalYield: 0.15,
  infrastructureImpact: 0.15,
  inventoryAbsorption: 0.10,
  developerReputation: 0.10,
  foreignCapitalFlow: 0.10,
  currencyStability: 0.10,
  liquidityScore: 0.10,
};

// =====================
// COMPUTE SCORE FOR A CITY
// =====================
export function computeCityScore(city: typeof CITIES[string][0]): ScoredOpportunity {
  const country = COUNTRIES.find(c => c.code === city.countryCode);

  // Price Momentum (20%)
  const priceMomentum = Math.min(100, Math.round(
    city.priceTrend > 15 ? 95 : city.priceTrend > 10 ? 85 :
    city.priceTrend > 7 ? 70 : city.priceTrend > 4 ? 55 :
    city.priceTrend > 0 ? 40 : 20
  ));

  // Rental Yield (15%)
  const rentalYield = Math.min(100, Math.round(
    city.averageRoi > 15 ? 95 : city.averageRoi > 12 ? 85 :
    city.averageRoi > 9 ? 70 : city.averageRoi > 6 ? 55 :
    city.averageRoi > 3 ? 35 : 20
  ));

  // Infrastructure Impact (15%)
  const hasInfra = city.tags?.some(t => ['metro', 'airport', 'highway', 'corridor', 'infrastructure'].includes(t.toLowerCase()));
  const infrastructureImpact = Math.min(100, Math.round(
    hasInfra ? 60 + Math.min(city.activeProjects, 40) : 30 + Math.min(city.activeProjects * 0.5, 20)
  ));

  // Inventory Absorption (10%)
  const inventoryAbsorption = Math.min(100, Math.round(
    city.absorptionRate > 85 ? 95 : city.absorptionRate > 75 ? 85 :
    city.absorptionRate > 65 ? 70 : city.absorptionRate > 50 ? 50 : 30
  ));

  // Developer Reputation (10%)
  const developerReputation = city.confidence;

  // Foreign Capital Flow (10%)
  const foreignCapitalFlow = Math.min(100, Math.round(
    city.foreignDemand > 80 ? 90 : city.foreignDemand > 60 ? 75 :
    city.foreignDemand > 40 ? 55 : city.foreignDemand > 20 ? 35 : 20
  ));

  // Currency Stability (10%)
  const currencyStability = Math.min(100, Math.round(
    country?.marketTrend === 'stable' ? 80 :
    country?.marketTrend === 'rising' ? 70 : 50
  ));

  // Liquidity Score (10%)
  const liquidityScore = Math.min(100, Math.round(
    city.investorInterest > 80 ? 90 : city.investorInterest > 60 ? 75 :
    city.investorInterest > 40 ? 55 : 35
  ));

  // Composite Score
  const score = Math.round(
    priceMomentum * WEIGHTS.priceMomentum +
    rentalYield * WEIGHTS.rentalYield +
    infrastructureImpact * WEIGHTS.infrastructureImpact +
    inventoryAbsorption * WEIGHTS.inventoryAbsorption +
    developerReputation * WEIGHTS.developerReputation +
    foreignCapitalFlow * WEIGHTS.foreignCapitalFlow +
    currencyStability * WEIGHTS.currencyStability +
    liquidityScore * WEIGHTS.liquidityScore
  );

  // Confidence based on data completeness
  const dataPoints = [city.priceTrend, city.averageRoi, city.absorptionRate, city.confidence, city.foreignDemand, city.investorInterest].filter(v => v > 0).length;
  const confidence = Math.min(100, Math.round(40 + dataPoints * 10 + (score > 70 ? 5 : 0)));

  // Expected appreciation
  const expectedAppreciation = score >= 85 ? '12-18%' : score >= 70 ? '8-12%' : score >= 55 ? '5-8%' : score >= 40 ? '3-5%' : '1-3%';

  // Expected rental yield
  const expectedRentalYield = `${city.averageRoi.toFixed(1)}%`;

  // Commission range
  const avgDeal = city.pricePerSqft * 1200;
  const commissionMin = Math.round(avgDeal * 0.02);
  const commissionMax = Math.round(avgDeal * 0.04);

  // Time horizon
  const timeHorizon = score >= 80 ? 'Short-term (1-2 yrs)' : score >= 60 ? 'Medium-term (3-5 yrs)' : 'Long-term (5-7 yrs)';

  // Primary catalyst
  const primaryCatalyst = hasInfra ? 'Infrastructure development' :
    priceMomentum > 75 ? 'Strong price momentum' :
    foreignCapitalFlow > 70 ? 'Foreign capital inflow' :
    rentalYield > 70 ? 'Attractive rental yield' : 'Market fundamentals';

  // Primary risk
  const primaryRisk = currencyStability < 50 ? 'Currency volatility' :
    inventoryAbsorption < 40 ? 'Low absorption / oversupply' :
    foreignCapitalFlow < 30 ? 'Low foreign investment' : 'Standard market risk';

  return {
    id: city.id,
    title: `${city.name} — Premium ${city.tags?.find(t => ['luxury', 'premium', 'commercial', 'affordable'].includes(t.toLowerCase())) || 'Residential'} Market`,
    city: city.name,
    country: country?.name || 'Unknown',
    countryCode: city.countryCode,
    countryFlag: country?.flag || '🌍',
    score,
    confidence,
    factors: { priceMomentum, rentalYield, infrastructureImpact, inventoryAbsorption, developerReputation, foreignCapitalFlow, currencyStability, liquidityScore },
    expectedAppreciation,
    expectedRentalYield,
    commissionMin,
    commissionMax,
    timeHorizon,
    primaryCatalyst,
    primaryRisk,
    evidenceCount: 4 + (hasInfra ? 2 : 0) + Math.round(city.activeProjects / 10),
    lastVerified: new Date().toISOString().split('T')[0],
  };
}

// =====================
// RANK ALL CITIES
// =====================
export function rankAllMarkets(): ScoredOpportunity[] {
  const scores: ScoredOpportunity[] = [];
  for (const [countryCode, cities] of Object.entries(CITIES)) {
    for (const city of cities) {
      scores.push(computeCityScore(city));
    }
  }
  return scores.sort((a, b) => b.score - a.score);
}

// =====================
// FILTER OPPORTUNITIES
// =====================
export function filterOpportunities(
  opportunities: ScoredOpportunity[],
  filters: {
    countries?: string[];
    minScore?: number;
    maxScore?: number;
    minYield?: number;
    minAppreciation?: string;
    search?: string;
  }
): ScoredOpportunity[] {
  return opportunities.filter(o => {
    if (filters.countries?.length && !filters.countries.includes(o.countryCode)) return false;
    if (filters.minScore !== undefined && o.score < filters.minScore) return false;
    if (filters.maxScore !== undefined && o.score > filters.maxScore) return false;
    if (filters.minYield !== undefined && parseFloat(o.expectedRentalYield) < filters.minYield) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!o.city.toLowerCase().includes(q) && !o.country.toLowerCase().includes(q) && !o.title.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.score - a.score);
}

// =====================
// GET TOP OPPORTUNITIES BY CATEGORY
// =====================
export function getTopOpportunities(count: number = 10): ScoredOpportunity[] {
  return rankAllMarkets().slice(0, count);
}

export function getHighConfidenceOpportunities(minConfidence: number = 80): ScoredOpportunity[] {
  return rankAllMarkets().filter(o => o.confidence >= minConfidence);
}

export function getHighYieldOpportunities(minYield: number = 10): ScoredOpportunity[] {
  return rankAllMarkets().filter(o => parseFloat(o.expectedRentalYield) >= minYield);
}
