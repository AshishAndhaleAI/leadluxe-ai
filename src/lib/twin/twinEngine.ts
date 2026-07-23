// ============================================================
// LeadLuxe AI — Investor Twin Engine
// 
// The twin engine encodes user preferences into a match vector,
// scores every opportunity against that vector, adjusts for risk,
// optimizes commission estimates, and generates explainable
// recommendations.
// 
// Operates on DealCandidate — a generic interface compatible with
// Opportunity (from useOpportunityEngine), OpportunityRecord (from
// supabaseOpportunityEngine), or any other deal-like structure.
// ============================================================

// ============================================================
// GENERIC DEAL CANDIDATE — twin matching operates on this
// ============================================================
export interface DealCandidate {
  id: string;
  title: string;
  description?: string;
  value: number;
  commission: number;
  confidence: number;
  score?: number;
  country?: string;
  city?: string;
  currency?: string;
  appreciationForecast?: number;
  rentalYield?: number;
  priceMomentum?: number;
  liquidityScore?: number;
  urgency?: number;
  sourceUrl?: string;
  sourceName?: string;
}

// ============================================================
// TYPES
// ============================================================
export interface InvestorProfile {
  userId: string;
  country: string;
  city: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  riskTolerance: 'low' | 'medium' | 'high';
  investmentGoal: 'rental' | 'appreciation' | 'commercial' | 'luxury' | 'land_banking' | 'international';
  holdingPeriodYears: number;
  preferredAssetClasses: string[];
  liquidityPreference: 'low' | 'moderate' | 'high';
}

export interface MatchResult {
  opportunityId: string;
  opportunityTitle: string;
  matchScore: number;
  riskAdjustedScore: number;
  commissionEstimate: number;
  matchedOn: string[];
  invalidatedBy: string[];
  reasoning: string;
  upside: string;
  downside: string;
  confidence: number;
  sources: { name: string; url: string }[];
}

export interface TwinSummary {
  profile: InvestorProfile;
  topMatches: MatchResult[];
  alerts: { priority: number; title: string; reason?: string }[];
  totalMatched: number;
  avgScore: number;
  portfolioValue: number;
  totalCommission: number;
}

// ============================================================
// COMMISSION RATES BY COUNTRY
// ============================================================
const COMMISSION_RATES: Record<string, number> = {
  IN: 0.030, AE: 0.025, US: 0.025, GB: 0.015, SG: 0.020,
  SA: 0.025, DE: 0.0357, FR: 0.035, JP: 0.030, KR: 0.025,
  TH: 0.025, VN: 0.025, BR: 0.030, MX: 0.025, TR: 0.025,
  ZA: 0.025, NG: 0.025, EG: 0.025, ES: 0.030, IT: 0.030,
  NL: 0.020, CA: 0.025, AU: 0.025, MY: 0.025, QA: 0.025,
};

// ============================================================
// PROFILE ENCODER
// ============================================================
export function encodeProfile(profile: InvestorProfile): Record<string, number> {
  return {
    budgetMid: (profile.budgetMin + profile.budgetMax) / 2,
    budgetSpread: profile.budgetMax - profile.budgetMin,
    riskScore: profile.riskTolerance === 'low' ? 0.3 : profile.riskTolerance === 'medium' ? 0.5 : 0.8,
    goalWeight: ({ rental: 0.85, appreciation: 0.75, commercial: 0.65, luxury: 0.55, land_banking: 0.45, international: 0.35 })[profile.investmentGoal] || 0.5,
    liquidityScore: profile.liquidityPreference === 'low' ? 0.3 : profile.liquidityPreference === 'moderate' ? 0.5 : 0.8,
    holdingScore: Math.min(profile.holdingPeriodYears / 10, 1),
    assetDiversity: Math.min(profile.preferredAssetClasses.length / 5, 1),
  };
}

// ============================================================
// OPPORTUNITY MATCHER (0-100)
// ============================================================
export function matchOpportunity(
  opp: DealCandidate,
  profile: InvestorProfile,
  encoded: Record<string, number>
): { score: number; matchedOn: string[]; invalidatedBy: string[] } {
  const matchedOn: string[] = [];
  const invalidatedBy: string[] = [];
  let score = 0;

  // 1. Location match (30 pts)
  if (opp.country === profile.country) {
    score += 15;
    matchedOn.push(`Same country: ${profile.country}`);
    if (opp.city === profile.city) { score += 15; matchedOn.push(`Same city: ${profile.city}`); }
    else { score += 5; matchedOn.push('Country match, different city'); }
  } else {
    score += 3;
    matchedOn.push('International diversification');
  }

  // 2. Budget match (20 pts)
  const value = opp.value || 0;
  if (value >= profile.budgetMin && value <= profile.budgetMax) {
    score += 20;
    matchedOn.push(`Budget match: ${fmtCurrency(value, profile.currency)}`);
  } else if (value >= profile.budgetMin * 0.7 && value <= profile.budgetMax * 1.5) {
    score += 12;
    matchedOn.push('Near budget range');
  } else if (value < profile.budgetMin * 0.7) {
    score += 5;
    invalidatedBy.push('Below minimum budget threshold');
  } else {
    score += 5;
    invalidatedBy.push('Above maximum budget threshold');
  }

  // 3. Confidence (15 pts)
  const conf = opp.confidence || 0;
  score += (conf / 100) * 15;
  if (conf >= 85) matchedOn.push('High confidence signal');
  if (conf < 50) invalidatedBy.push('Low confidence score');

  // 4. Commission potential (10 pts)
  const commission = opp.commission || 0;
  const ratio = value > 0 ? commission / value : 0;
  score += Math.min((ratio / (COMMISSION_RATES[profile.country] || 0.03)) * 10, 10);

  // 5. Risk alignment (10 pts)
  const oppScore = opp.score || 0;
  score += Math.min(oppScore * (encoded.riskScore || 0.5) * 0.2, 10);
  if (oppScore >= 70) matchedOn.push('Risk-aligned opportunity');

  // 6. Goal match (10 pts)
  const appreciation = opp.appreciationForecast || 0;
  const yield_ = opp.rentalYield || 0;
  if (profile.investmentGoal === 'rental' && yield_ > 5) {
    score += 10; matchedOn.push(`Rental yield ${yield_.toFixed(1)}%`);
  } else if (profile.investmentGoal === 'appreciation' && appreciation > 10) {
    score += 10; matchedOn.push(`Appreciation ${appreciation.toFixed(1)}%`);
  } else if (profile.investmentGoal === 'luxury' && value > 100_000_000) {
    score += 10; matchedOn.push('Luxury asset');
  } else if (profile.investmentGoal === 'commercial') {
    score += 8; matchedOn.push('Commercial asset');
  } else if (profile.investmentGoal === 'international' && opp.country !== profile.country) {
    score += 10; matchedOn.push('International investment');
  } else {
    score += 5;
  }

  // 7. Holding period (5 pts)
  if (encoded.holdingScore && appreciation > 0) {
    score += Math.min((appreciation / Math.max(profile.holdingPeriodYears, 1)) * 0.5, 5);
  }

  return { score: Math.min(Math.max(Math.round(score), 0), 100), matchedOn, invalidatedBy };
}

// ============================================================
// RISK ADJUSTER
// ============================================================
export function adjustForRisk(
  score: number,
  profile: InvestorProfile,
  opp: DealCandidate
): { adjustedScore: number; upside: string; downside: string } {
  const upside: string[] = [];
  const downside: string[] = [];
  let adj = 0;

  if (profile.liquidityPreference === 'high') {
    if ((opp.liquidityScore || 0) >= 70) { adj += 5; upside.push('High liquidity'); }
    else { adj -= 5; downside.push('Low liquidity'); }
  }
  if (profile.riskTolerance === 'low') {
    if ((opp.confidence || 0) >= 80) { adj += 5; upside.push('High confidence, low risk'); }
    else if ((opp.confidence || 0) < 60) { adj -= 10; downside.push('Exceeds risk tolerance'); }
  } else if (profile.riskTolerance === 'high' && (opp.score || 0) > 70) {
    adj += 5; upside.push('High-score underappreciated potential');
  }
  if (profile.currency !== 'USD' && opp.currency && opp.currency !== 'USD') {
    downside.push('Currency exposure');
  }
  if ((opp.priceMomentum || 0) > 10) upside.push(`Momentum +${opp.priceMomentum!.toFixed(1)}%`);
  else if ((opp.priceMomentum || 0) < -5) downside.push(`Momentum ${opp.priceMomentum!.toFixed(1)}%`);

  return {
    adjustedScore: Math.min(Math.max(Math.round(score + adj), 0), 100),
    upside: upside.join(' · ') || 'Stable market conditions',
    downside: downside.join(' · ') || 'No significant downside identified',
  };
}

// ============================================================
// COMMISSION OPTIMIZER
// ============================================================
export function optimizeCommission(
  propertyValue: number,
  countryCode: string,
  userTier: 'standard' | 'premium' | 'enterprise' = 'standard'
) {
  const baseRate = COMMISSION_RATES[countryCode] || 0.03;
  const mult = userTier === 'enterprise' ? 0.8 : userTier === 'premium' ? 0.9 : 1.0;
  const effectiveRate = baseRate * mult;
  const gross = Math.round(propertyValue * effectiveRate);
  return {
    grossCommission: gross,
    platformShare: Math.round(gross * 0.2),
    netPayout: Math.round(gross * 0.8),
    rate: effectiveRate,
  };
}

// ============================================================
// TWIN REASONER — natural-language explanation
// ============================================================
export function generateReasoning(
  result: { score: number; matchedOn: string[]; invalidatedBy: string[] },
  opp: DealCandidate,
  profile: InvestorProfile
): string {
  const parts: string[] = [];
  if (result.score >= 90) parts.push(`Exceptional match (${result.score}/100)`);
  else if (result.score >= 75) parts.push(`Strong match (${result.score}/100)`);
  else if (result.score >= 60) parts.push(`Moderate match (${result.score}/100)`);
  else parts.push(`Below-threshold match (${result.score}/100)`);

  if (result.matchedOn.length > 0) parts.push(`Why: ${result.matchedOn.slice(0, 3).join(', ')}.`);
  if (result.invalidatedBy.length > 0) parts.push(`Concerns: ${result.invalidatedBy.join(', ')}.`);

  if (opp.city) parts.push(`Located in ${opp.city}${opp.country ? `, ${opp.country}` : ''}.`);

  const budgetStr = `${fmtCurrency(profile.budgetMin, profile.currency)}–${fmtCurrency(profile.budgetMax, profile.currency)}`;
  if (opp.value >= profile.budgetMin && opp.value <= profile.budgetMax)
    parts.push(`Price fits your ${budgetStr} budget.`);
  else
    parts.push(`Price outside your ${budgetStr} budget.`);

  if (opp.commission) parts.push(`Commission: ${fmtCurrency(opp.commission, profile.currency)}.`);

  const conf = opp.confidence;
  if (conf >= 85) parts.push('High data confidence supports this recommendation.');
  else if (conf >= 70) parts.push('Moderate confidence — verify before proceeding.');
  else parts.push('Low confidence — additional research recommended.');

  if (profile.investmentGoal === 'rental' && (opp.rentalYield || 0) > 5)
    parts.push(`Yield of ${opp.rentalYield!.toFixed(1)}% aligns with your income strategy.`);
  else if (profile.investmentGoal === 'appreciation' && (opp.appreciationForecast || 0) > 10)
    parts.push(`Appreciation of ${opp.appreciationForecast!.toFixed(1)}% aligns with your growth strategy.`);

  return parts.join(' ');
}

// ============================================================
// FULL MATCH PIPELINE
// ============================================================
export function runTwinMatching(
  profile: InvestorProfile,
  opportunities: DealCandidate[]
): MatchResult[] {
  const encoded = encodeProfile(profile);
  return opportunities.map(opp => {
    const match = matchOpportunity(opp, profile, encoded);
    const risk = adjustForRisk(match.score, profile, opp);
    const commission = optimizeCommission(opp.value, profile.country);
    const reasoning = generateReasoning(match, opp, profile);
    return {
      opportunityId: opp.id,
      opportunityTitle: opp.title || 'Unnamed',
      matchScore: match.score,
      riskAdjustedScore: risk.adjustedScore,
      commissionEstimate: commission.grossCommission,
      matchedOn: match.matchedOn,
      invalidatedBy: match.invalidatedBy,
      reasoning,
      upside: risk.upside,
      downside: risk.downside,
      confidence: opp.confidence,
      sources: opp.sourceUrl ? [{ name: opp.sourceName || 'LeadLuxe Intelligence', url: opp.sourceUrl }] : [],
    };
  }).sort((a, b) => b.riskAdjustedScore - a.riskAdjustedScore);
}

// ============================================================
// DETECT MARKET CHANGES
// ============================================================
export function detectMarketChanges(today: MatchResult[], yesterday: MatchResult[]) {
  const tMap = new Map(today.map(m => [m.opportunityId, m.matchScore]));
  const yMap = new Map(yesterday.map(m => [m.opportunityId, m.matchScore]));
  const rising: string[] = [], falling: string[] = [], newHigh: string[] = [];
  for (const [id, s] of tMap) {
    const p = yMap.get(id);
    if (p !== undefined) { const d = s - p; if (d > 5) rising.push(`${id}+${d}`); else if (d < -5) falling.push(`${id}${d}`); }
    else newHigh.push(id);
  }
  return { rising, falling, newHigh };
}

// ============================================================
// UTILITY — map from Opportunity (useOpportunityEngine) to DealCandidate
// ============================================================
import type { Opportunity } from '../../types';

export function opportunityToDealCandidate(opp: Opportunity): DealCandidate {
  return {
    id: opp.id,
    title: opp.title,
    value: opp.estimated_value || 0,
    commission: opp.estimated_commission || 0,
    confidence: opp.confidence_score || 0,
    score: opp.confidence_score || 0,
    currency: opp.commission_currency || 'INR',
    sourceUrl: '',
    sourceName: '',
    // Location data not directly on Opportunity — inferred from developer/project
    country: (opp.developer as any)?.country || (opp.project as any)?.country,
    city: (opp.developer as any)?.city || (opp.project as any)?.city,
  };
}

function fmtCurrency(amount: number, currency: string): string {
  if (currency === 'INR') {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
    if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  if (currency === 'USD') return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (currency === 'GBP') return `£${(amount / 1_000_000).toFixed(2)}M`;
  if (currency === 'EUR') return `€${(amount / 1_000_000).toFixed(2)}M`;
  if (currency === 'AED') return `د.إ${(amount / 1_000_000).toFixed(2)}M`;
  return `${currency}${(amount / 1_000_000).toFixed(2)}M`;
}
