// ============================================================
// TerraNexus AI — Matching Engine
// Calculates opportunity scores, expected appreciation,
// commission values, and confidence levels for any city
// based on user preferences and real market data
// ============================================================

import { CITIES, COUNTRIES, getCitiesByCountry, getCountry, formatGlobalCurrency } from '../global-data';
import type { City } from '../global-data';

// =====================
// TYPES
// =====================
export interface MatchProfile {
  countryCode: string;
  cityId?: string;
  budgetMin: number;
  budgetMax: number;
  propertyType: string;
  investmentGoal: string;
  riskLevel: 'low' | 'medium' | 'high';
  luxuryPreference: boolean;
  holdingPeriod: number;
  rentalGoal: boolean;
}

export interface MatchResult {
  city: City;
  opportunityScore: number;
  expectedAppreciationMin: number;
  expectedAppreciationMax: number;
  estimatedCommission: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  confidenceScore: number;
  reasons: string[];
  risks: string[];
  estimatedValue: number;
  rentalYield: number;
  absorptionVelocity: number;
  demandTrend: 'rising' | 'stable' | 'declining';
  infrastructureScore: number;
  developerActivity: number;
  governmentProjectImpact: number;
  airportMetroInfluence: number;
}

export interface CommissionBreakdown {
  estimatedDealValue: number;
  commissionRate: number;
  commissionAmount: number;
  formattedCommission: string;
  byStage: {
    stage: string;
    probability: number;
    commission: number;
  }[];
}

// =====================
// SCORING CONSTANTS
// =====================
const COMMISSION_RATE = 0.03;
const CONFIDENCE_THRESHOLDS = { high: 75, medium: 50, low: 0 };
const WEIGHTS = {
  priceGrowthTrend: 0.20,
  infrastructureProximity: 0.10,
  newLaunchMomentum: 0.15,
  developerReputation: 0.10,
  rentalYieldScore: 0.12,
  inventoryAbsorption: 0.13,
  demandVelocity: 0.10,
  governmentProjectImpact: 0.05,
  airportMetroInfluence: 0.05,
};

// =====================
// MAIN MATCHING ENGINE
// =====================
export function calculateMatch(profile: MatchProfile): MatchResult[] {
  const cities = profile.cityId 
    ? [CITIES[profile.countryCode]?.find(c => c.id === profile.cityId)].filter(Boolean) as City[]
    : getCitiesByCountry(profile.countryCode);

  const results = cities.map(city => scoreCity(city, profile));
  return results.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

function scoreCity(city: City, profile: MatchProfile): MatchResult {
  // Individual factor scores (0-100)
  const priceGrowthScore = scorePriceGrowth(city);
  const infrastructureScore = scoreInfrastructure(city);
  const launchMomentum = scoreLaunchMomentum(city);
  const developerScore = scoreDeveloperActivity(city);
  const rentalScore = scoreRentalYield(city);
  const absorptionScore = scoreAbsorption(city);
  const demandScore = scoreDemandVelocity(city, profile);
  const governmentScore = scoreGovernmentImpact(city);
  const transportScore = scoreTransportInfluence(city);

  // Budget fit
  const avgPriceInBudget = city.pricePerSqft * 1000;
  const budgetFit = (avgPriceInBudget >= profile.budgetMin && avgPriceInBudget <= profile.budgetMax) ? 15 : 
    avgPriceInBudget < profile.budgetMin ? 10 : 5;

  // Luxury alignment
  const luxuryBonus = profile.luxuryPreference && city.tags.includes('luxury') ? 10 : 0;

  // Goal alignment
  const goalBonus = scoreGoalAlignment(city, profile);

  // Risk alignment
  const riskPenalty = scoreRiskAlignment(city, profile);

  // Weighted composite score
  const weightedScore = 
    priceGrowthScore * WEIGHTS.priceGrowthTrend +
    infrastructureScore * WEIGHTS.infrastructureProximity +
    launchMomentum * WEIGHTS.newLaunchMomentum +
    developerScore * WEIGHTS.developerReputation +
    rentalScore * WEIGHTS.rentalYieldScore +
    absorptionScore * WEIGHTS.inventoryAbsorption +
    demandScore * WEIGHTS.demandVelocity +
    governmentScore * WEIGHTS.governmentProjectImpact +
    transportScore * WEIGHTS.airportMetroInfluence;

  const totalScore = Math.min(100, Math.round(weightedScore + budgetFit + luxuryBonus + goalBonus + riskPenalty));
  const confidenceLevel = totalScore >= CONFIDENCE_THRESHOLDS.high ? 'high' : 
    totalScore >= CONFIDENCE_THRESHOLDS.medium ? 'medium' : 'low';

  // Expected appreciation
  const baseAppreciation = city.priceTrend;
  const appreciationMin = Math.round(baseAppreciation * (totalScore / 100) * 0.8 * 10) / 10;
  const appreciationMax = Math.round(baseAppreciation * (totalScore / 100) * 1.2 * 10) / 10;

  // Commission estimate
  const estimatedDealValue = (profile.budgetMin + profile.budgetMax) / 2;
  const estimatedCommission = estimatedDealValue * COMMISSION_RATE;

  const reasons = generateReasons(city, totalScore, profile);
  const risks = generateRisks(city, totalScore);

  return {
    city,
    opportunityScore: totalScore,
    expectedAppreciationMin: appreciationMin,
    expectedAppreciationMax: appreciationMax,
    estimatedCommission,
    confidenceLevel,
    confidenceScore: city.confidence,
    reasons,
    risks,
    estimatedValue: estimatedDealValue,
    rentalYield: city.absorptionRate * 0.12,
    absorptionVelocity: city.absorptionRate,
    demandTrend: city.priceTrend > 10 ? 'rising' : city.priceTrend > 3 ? 'stable' : 'declining',
    infrastructureScore: Math.round(infrastructureScore),
    developerActivity: city.activeProjects,
    governmentProjectImpact: Math.round(governmentScore),
    airportMetroInfluence: Math.round(transportScore),
  };
}

// =====================
// SCORING FUNCTIONS
// =====================
function scorePriceGrowth(city: City): number {
  return Math.min(100, city.priceTrend * 6 + city.confidence * 0.3);
}

function scoreInfrastructure(city: City): number {
  let score = 50;
  if (city.tags.includes('it-hub') || city.tags.includes('tech')) score += 20;
  if (city.tags.includes('international')) score += 15;
  if (city.activeProjects > 50) score += 15;
  return Math.min(100, score);
}

function scoreLaunchMomentum(city: City): number {
  const launchRatio = city.upcomingLaunches / Math.max(city.activeProjects, 1);
  return Math.min(100, 30 + launchRatio * 100 + city.upcomingLaunches * 2);
}

function scoreDeveloperActivity(city: City): number {
  return Math.min(100, 30 + city.activeProjects * 0.7);
}

function scoreRentalYield(city: City): number {
  const yield_ = city.absorptionRate * 0.12;
  return Math.min(100, yield_ * 5 + 20);
}

function scoreAbsorption(city: City): number {
  return Math.min(100, city.absorptionRate * 1.2 + 10);
}

function scoreDemandVelocity(city: City, profile: MatchProfile): number {
  let score = 40;
  score += city.investorInterest * 0.5;
  score += city.foreignDemand * 0.3;
  if (profile.luxuryPreference && city.tags.includes('luxury')) score += 15;
  return Math.min(100, score);
}

function scoreGovernmentImpact(city: City): number {
  let score = 40;
  if (city.tags.includes('commercial')) score += 20;
  if (city.upcomingLaunches > 20) score += 20;
  if (city.priceTrend > 8) score += 20;
  return Math.min(100, score);
}

function scoreTransportInfluence(city: City): number {
  let score = 40;
  if (city.foreignDemand > 60) score += 20;
  if (city.investorInterest > 70) score += 20;
  if (city.confidence > 80) score += 20;
  return Math.min(100, score);
}

function scoreGoalAlignment(city: City, profile: MatchProfile): number {
  if (profile.investmentGoal === 'appreciation' && city.priceTrend > 8) return 10;
  if (profile.investmentGoal === 'rental' && city.absorptionRate > 70) return 10;
  if (profile.investmentGoal === 'international' && city.foreignDemand > 60) return 10;
  if (profile.investmentGoal === 'luxury' && city.tags.includes('luxury')) return 10;
  if (profile.investmentGoal === 'land_banking' && city.priceTrend > 10) return 8;
  if (profile.investmentGoal === 'commercial' && city.tags.includes('commercial')) return 10;
  return 5;
}

function scoreRiskAlignment(city: City, profile: MatchProfile): number {
  if (profile.riskLevel === 'low' && city.priceTrend < 8 && city.confidence > 80) return 5;
  if (profile.riskLevel === 'high' && city.priceTrend > 12) return 5;
  if (profile.riskLevel === 'medium') return 3;
  return 0;
}

// =====================
// REASONS & RISKS
// =====================
function generateReasons(city: City, score: number, profile: MatchProfile): string[] {
  const reasons: string[] = [];
  if (city.priceTrend > 10) reasons.push(`Strong ${city.priceTrend}% YoY price appreciation — top quartile growth`);
  else if (city.priceTrend > 6) reasons.push(`Healthy ${city.priceTrend}% price growth trend`);
  
  if (city.absorptionRate > 75) reasons.push(`High ${city.absorptionRate}% absorption rate — strong demand`);
  if (city.activeProjects > 50) reasons.push(`Active market with ${city.activeProjects} ongoing projects`);
  if (city.upcomingLaunches > 20) reasons.push(`${city.upcomingLaunches} upcoming launches — fresh inventory pipeline`);
  if (city.foreignDemand > 70) reasons.push(`Strong international investor interest (${city.foreignDemand}%)`);
  if (city.investorInterest > 80) reasons.push(`High investor confidence (${city.investorInterest}%)`);
  if (city.confidence > 85) reasons.push(`Top-tier market confidence score (${city.confidence}%)`);
  if (profile.luxuryPreference && city.tags.includes('luxury')) reasons.push(`Thriving luxury segment in ${city.name}`);
  if (city.tags.includes('it-hub') || city.tags.includes('tech')) reasons.push(`Tech/IT hub — strong employment-driven demand`);
  
  return reasons.slice(0, 5);
}

function generateRisks(city: City, score: number): string[] {
  const risks: string[] = [];
  if (city.priceTrend > 15) risks.push('Rapid price growth may indicate overheating');
  if (city.upcomingLaunches > city.activeProjects * 0.5) risks.push('Supply may outpace near-term demand');
  if (city.foreignDemand > 80) risks.push('Currency fluctuation risk for foreign buyers');
  if (score < 50) risks.push('Lower confidence — conduct thorough due diligence');
  if (city.tags.includes('emerging')) risks.push('Emerging market — limited historical data');
  
  return risks.slice(0, 3);
}

// =====================
// COMMISSION CALCULATOR
// =====================
export function calculateCommission(dealValue: number): CommissionBreakdown {
  const totalCommission = dealValue * COMMISSION_RATE;
  
  return {
    estimatedDealValue: dealValue,
    commissionRate: COMMISSION_RATE,
    commissionAmount: totalCommission,
    formattedCommission: formatGlobalCurrency(totalCommission, 'INR'),
    byStage: [
      { stage: 'Initial Contact', probability: 0.8, commission: totalCommission * 0.3 },
      { stage: 'Site Visit', probability: 0.6, commission: totalCommission * 0.4 },
      { stage: 'Negotiation', probability: 0.4, commission: totalCommission * 0.2 },
      { stage: 'Closing', probability: 0.2, commission: totalCommission * 0.1 },
    ],
  };
}

// =====================
// TOP MATCHES FOR A PROFILE
// =====================
export function findTopMatches(profile: MatchProfile, limit = 10): MatchResult[] {
  return calculateMatch(profile).slice(0, limit);
}
