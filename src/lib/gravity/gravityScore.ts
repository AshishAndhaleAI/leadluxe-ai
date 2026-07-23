// ============================================================
// LeadLuxe AI — Gravity Score Formula
// Core scoring engine that computes a 0-100 gravity score
// from 8 weighted signal components.
//
// Formula (0-100):
//   Search demand         20%
//   Price momentum        15%
//   Infrastructure prox.  15%
//   Developer activity    15%
//   Inventory absorption  10%
//   Rental yield          10%
//   User-location match   10%
//   Cross-border interest  5%
// ============================================================

import { computeDemandMomentum, type DemandMomentum } from './demandMomentum';
import { computeInfrastructureImpact, type InfrastructureImpact } from './infrastructureImpact';
import { computeCommissionPotential, type CommissionPotential } from './commissionPotential';
import { computeClosingProbability, type ClosingProbability } from './closingProbability';

// ============================================================
// TYPES
// ============================================================

export interface GravityComponentScore {
  component: string;
  label: string;
  weight: number;    // 0-1 contribution to overall score
  rawValue: number;
  score: number;     // 0-100 normalized
  description: string;
}

export interface GravityScoreResult {
  overallScore: number;            // 0-100
  components: GravityComponentScore[];
  demandMomentum: DemandMomentum;
  infrastructureImpact: InfrastructureImpact;
  commissionPotential: CommissionPotential;
  closingProbability: ClosingProbability;
  isUndervalued: boolean;
  isOvervalued: boolean;
  optimalAction: string;
  reasoning: string[];
}

interface CityInput {
  id: string;
  name: string;
  countryCode: string;
  pricePerSqft: number;
  priceTrend: number;
  absorptionRate: number;
  averageRoi: number;
  foreignDemand: number;
  investorInterest: number;
  activeProjects: number;
  upcomingLaunches: number;
  confidence: number;
  tags: string[];
  latitude: number;
  longitude: number;
}

// ============================================================
// COMPONENT SCORERS
// ============================================================

function scoreSearchDemand(city: CityInput): number {
  // Search demand inferred from investorInterest + absorptionRate
  // Higher investor interest + faster absorption = stronger search demand
  const raw = (city.investorInterest * 0.6) + (city.absorptionRate * 0.4);
  return Math.min(100, Math.round(raw));
}

function scorePriceMomentum(city: CityInput): number {
  // Price trend normalized to 0-100
  // 0% = 0, 15%+ = 100
  const normalized = Math.min(100, Math.round((city.priceTrend / 15) * 100));
  return normalized;
}

function scoreInfrastructureProximity(city: CityInput): number {
  // Uses infrastructure impact module
  // Tags like 'metro', 'airport', 'highway' boost score
  let score = 50; // Base score
  if (city.tags.includes('it-hub')) score += 15;
  if (city.tags.includes('commercial')) score += 10;
  if (city.tags.includes('luxury')) score += 5;
  if (city.tags.includes('international')) score += 10;
  // Active projects = development density
  score += Math.min(10, Math.round(city.activeProjects * 0.08));
  return Math.min(100, Math.round(score));
}

function scoreDeveloperActivity(city: CityInput): number {
  // Developer launch activity = active + upcoming projects
  const totalProjects = city.activeProjects + city.upcomingLaunches;
  // Normalize: 0 projects = 0, 200+ projects = 100
  const score = Math.min(100, Math.round((totalProjects / 200) * 100));
  return score;
}

function scoreInventoryAbsorption(city: CityInput): number {
  // Absorption rate directly measures how fast inventory is consumed
  // 0% = 0, 100% = 100
  return Math.min(100, Math.round(city.absorptionRate));
}

function scoreRentalYield(city: CityInput): number {
  // Average ROI as a proxy for rental yield
  // 0% = 0, 20%+ = 100
  const score = Math.min(100, Math.round((city.averageRoi / 20) * 100));
  return score;
}

function scoreUserLocationMatch(city: CityInput): number {
  // How well this city matches default user preferences
  // Weighted by investor interest + confidence
  const raw = (city.investorInterest * 0.5) + (city.confidence * 0.5);
  return Math.min(100, Math.round(raw));
}

function scoreCrossBorderInterest(city: CityInput): number {
  // Foreign demand directly measures cross-border interest
  return Math.min(100, Math.round(city.foreignDemand));
}

// ============================================================
// MAIN GRAVITY SCORE COMPUTATION
// ============================================================

export function computeGravityScore(city: CityInput): GravityScoreResult {
  // Compute each component score
  const searchDemandScore = scoreSearchDemand(city);
  const priceMomentumScore = scorePriceMomentum(city);
  const infraProximityScore = scoreInfrastructureProximity(city);
  const developerActivityScore = scoreDeveloperActivity(city);
  const inventoryAbsorptionScore = scoreInventoryAbsorption(city);
  const rentalYieldScore = scoreRentalYield(city);
  const userLocationMatchScore = scoreUserLocationMatch(city);
  const crossBorderInterestScore = scoreCrossBorderInterest(city);

  // Weight distribution (sums to 1.0)
  const componentScores: GravityComponentScore[] = [
    { component: 'search_demand', label: 'Search Demand', weight: 0.20, rawValue: city.investorInterest, score: searchDemandScore,
      description: `${city.investorInterest}% investor interest + ${city.absorptionRate}% absorption = ${searchDemandScore}/100 demand velocity` },
    { component: 'price_momentum', label: 'Price Momentum', weight: 0.15, rawValue: city.priceTrend, score: priceMomentumScore,
      description: `${city.priceTrend}% YoY price trend — normalized to ${priceMomentumScore}/100` },
    { component: 'infrastructure_proximity', label: 'Infrastructure Proximity', weight: 0.15, rawValue: city.activeProjects, score: infraProximityScore,
      description: `${city.tags.slice(0, 3).join(', ')} corridor — ${city.activeProjects} active projects` },
    { component: 'developer_activity', label: 'Developer Activity', weight: 0.15, rawValue: city.activeProjects + city.upcomingLaunches, score: developerActivityScore,
      description: `${city.activeProjects} active + ${city.upcomingLaunches} upcoming = ${city.activeProjects + city.upcomingLaunches} total projects` },
    { component: 'inventory_absorption', label: 'Inventory Absorption', weight: 0.10, rawValue: city.absorptionRate, score: inventoryAbsorptionScore,
      description: `${city.absorptionRate}% of inventory absorbed — ${inventoryAbsorptionScore >= 70 ? 'supply-constrained' : 'balanced'} market` },
    { component: 'rental_yield', label: 'Rental Yield', weight: 0.10, rawValue: city.averageRoi, score: rentalYieldScore,
      description: `${city.averageRoi}% average ROI — ${rentalYieldScore >= 50 ? 'above-average yield' : 'standard yield'}` },
    { component: 'user_location_match', label: 'User-Location Match', weight: 0.10, rawValue: city.confidence, score: userLocationMatchScore,
      description: `${city.investorInterest}% interest × ${city.confidence}% confidence = ${userLocationMatchScore}/100 match` },
    { component: 'cross_border_interest', label: 'Cross-Border Interest', weight: 0.05, rawValue: city.foreignDemand, score: crossBorderInterestScore,
      description: `${city.foreignDemand}% foreign demand — ${crossBorderInterestScore >= 50 ? 'significant' : 'moderate'} international interest` },
  ];

  // Compute weighted overall score
  const overallScore = Math.round(
    componentScores.reduce((sum, c) => sum + c.score * c.weight, 0),
  );

  // Get dependent modules
  const demandMomentum = computeDemandMomentum(city);
  const infrastructureImpact = computeInfrastructureImpact(city);
  const commissionPotential = computeCommissionPotential(city.pricePerSqft, city.activeProjects);
  const closingProbability = computeClosingProbability(overallScore, city.confidence, city.priceTrend);

  // Determine if undervalued/overvalued
  const scoreConfidenceDiff = overallScore - city.confidence;
  const isUndervalued = scoreConfidenceDiff > 10;
  const isOvervalued = scoreConfidenceDiff < -10;

  // Optimal action
  let optimalAction: string;
  if (isUndervalued) {
    optimalAction = 'BUY — Gravity score exceeds market confidence. Opportunity not yet priced in.';
  } else if (overallScore >= 75) {
    optimalAction = 'MONITOR — Strong fundamentals but already priced in. Watch for corrections.';
  } else if (overallScore >= 60) {
    optimalAction = 'RESEARCH — Emerging opportunity. Deeper due diligence recommended.';
  } else {
    optimalAction = 'WAIT — Entry conditions not optimal. Re-score in 30 days.';
  }

  // Reasoning
  const bestComponent = [...componentScores].sort((a, b) => b.score - a.score)[0];
  const worstComponent = [...componentScores].sort((a, b) => a.score - b.score)[0];
  const reasoning: string[] = [];

  reasoning.push(`Overall gravity score of ${overallScore}/100 from ${componentScores.length} weighted signal components`);
  reasoning.push(`Strongest signal: ${bestComponent.label} (${bestComponent.score}/100) — ${bestComponent.description}`);
  reasoning.push(`Weakest signal: ${worstComponent.label} (${worstComponent.score}/100) — ${worstComponent.description}`);

  if (isUndervalued) {
    reasoning.push(`Market is UNDERVALUED — Gravity score ${scoreConfidenceDiff} points above market confidence. Opportunity exists before repricing.`);
  } else if (isOvervalued) {
    reasoning.push(`Market may be OVERVALUED — Confidence exceeds gravity score by ${Math.abs(scoreConfidenceDiff)} points. Exercise caution.`);
  }

  reasoning.push(`30-day closing probability: ${closingProbability.probability30d}%. Key factors: ${closingProbability.keyFactors.slice(0, 2).join(', ')}.`);
  reasoning.push(`Expected commission: ${commissionPotential.formatted}. Based on ${commissionPotential.estimatedDealValue} estimated deal value at ${commissionPotential.commissionRate}% rate.`);

  return {
    overallScore,
    components: componentScores,
    demandMomentum,
    infrastructureImpact,
    commissionPotential,
    closingProbability,
    isUndervalued,
    isOvervalued,
    optimalAction,
    reasoning,
  };
}
