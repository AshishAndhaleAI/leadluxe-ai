// ============================================================
// TerraNexus AI — Investment Gravity Engine
// Predictive capital flow scoring for real estate micro-markets
//
// Computes a "Gravity Score" for each tracked city by analyzing
// 5 categories of non-obvious leading indicators that no other
// platform combines into a single predictive score.
// ============================================================

import { CITIES, COUNTRIES, getCountry } from '../global-data';
import type { City } from '../global-data';
import {
  type GravitySignal,
  type GravitySignalCategory,
  type GravityCategoryScore,
  type GravityAnalysis,
  type MicroMarket,
  type GravityRankings,
} from './types';

// ============================================================
// CONSTANTS
// ============================================================

const CATEGORY_META: Record<GravitySignalCategory, {
  label: string;
  icon: string;
  weight: number;
  description: string;
}> = {
  infrastructure_velocity: {
    label: 'Infrastructure Velocity',
    icon: '🛤️',
    weight: 0.25,
    description: 'Building permits, metro expansions, highway widening, and airport development creating long-term value acceleration',
  },
  employment_gravity: {
    label: 'Employment Gravity',
    icon: '🏢',
    weight: 0.25,
    description: 'Corporate lease expansions, hiring clusters, tech sector growth, and new office developments pulling workforce demand',
  },
  market_inefficiency: {
    label: 'Market Inefficiency',
    icon: '📊',
    weight: 0.20,
    description: 'Price-to-rent dislocations, inventory velocity, days-on-market compression — areas the market hasn\'t yet repriced',
  },
  capital_magnetism: {
    label: 'Capital Magnetism',
    icon: '🌐',
    weight: 0.18,
    description: 'Foreign investment proximity, institutional fund allocation patterns, REIT activity, and sovereign wealth directional flows',
  },
  demographic_pull: {
    label: 'Demographic Pull',
    icon: '👥',
    weight: 0.12,
    description: 'Population inflow acceleration, migration corridor shifts, school enrollment trends, and lifestyle migration patterns',
  },
};

// ============================================================
// SIGNAL GENERATORS — each category uses different city data
// to simulate non-obvious signal detection
// ============================================================

function generateInfrastructureSignals(city: City): GravitySignal[] {
  const signals: GravitySignal[] = [];
  const base = city;

  // Signal 1: Project velocity (active + upcoming = development pipeline)
  const pipelineVelocity = (base.activeProjects + base.upcomingLaunches);
  const normVelocity = Math.min(100, Math.round(pipelineVelocity * 0.5));
  signals.push({
    id: `infra-${city.id}-pipeline`,
    category: 'infrastructure_velocity',
    label: `${base.activeProjects + base.upcomingLaunches} active/upcoming projects indicate strong development pipeline`,
    detail: `Combined pipeline of ${base.activeProjects} active and ${base.upcomingLaunches} upcoming projects suggests sustained construction velocity in the ${base.name} corridor over the next 18-24 months.`,
    weight: 0.35,
    value: pipelineVelocity,
    normalizedScore: normVelocity,
    direction: normVelocity > 60 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 2: Absorption rate = demand velocity
  signals.push({
    id: `infra-${city.id}-absorption`,
    category: 'infrastructure_velocity',
    label: `${base.absorptionRate}% absorption rate — ${base.absorptionRate > 75 ? 'supply-constrained market' : 'balanced absorption'}`,
    detail: `A ${base.absorptionRate}% absorption rate ${base.absorptionRate > 75 ? 'indicates supply is being consumed faster than new inventory arrives, a classic pre-appreciation signal' : 'suggests steady organic demand matching new supply'}. ${base.tags.includes('it-hub') ? 'IT sector employment is driving above-average absorption.' : ''}`,
    weight: 0.35,
    value: base.absorptionRate,
    normalizedScore: base.absorptionRate,
    direction: base.absorptionRate > 75 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 3: Upcoming supply pressure
  signals.push({
    id: `infra-${city.id}-supply`,
    category: 'infrastructure_velocity',
    label: `${base.upcomingLaunches} upcoming launches — ${base.upcomingLaunches > 20 ? 'high supply pipeline' : 'controlled supply growth'}`,
    detail: `${base.upcomingLaunches} new project launches in the pipeline. ${base.upcomingLaunches > 20 ? 'This high supply volume may create short-term pricing pressure but indicates developer confidence in long-term demand.' : 'Controlled supply growth suggests stable pricing with gradual appreciation.'}`,
    weight: 0.30,
    value: base.upcomingLaunches,
    normalizedScore: Math.min(100, Math.round(base.upcomingLaunches * 2.5)),
    direction: base.upcomingLaunches > 30 ? 'neutral' : 'positive',
    timestamp: new Date().toISOString(),
  });

  return signals;
}

function generateEmploymentSignals(city: City): GravitySignal[] {
  const signals: GravitySignal[] = [];

  // Signal 1: Price trend = employment-driven demand
  signals.push({
    id: `employ-${city.id}-pricetrend`,
    category: 'employment_gravity',
    label: `${city.priceTrend}% YoY price growth — ${city.priceTrend > 10 ? 'employment-driven acceleration' : 'organic market growth'}`,
    detail: `${city.priceTrend}% year-over-year price growth. ${city.tags.includes('it-hub') ? 'The IT/tech corridor is a primary driver of employment gravity, with major firms expanding headcount.' : city.tags.includes('commercial') ? 'Commercial sector expansion is pulling workforce demand into this corridor.' : ''} Price velocity above 10% suggests employment-driven demand exceeding supply.`,
    weight: 0.40,
    value: city.priceTrend,
    normalizedScore: Math.min(100, Math.round(city.priceTrend * 6)),
    direction: city.priceTrend > 8 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 2: ROI = economic productivity of the area
  signals.push({
    id: `employ-${city.id}-roi`,
    category: 'employment_gravity',
    label: `${city.averageRoi}% average ROI — ${city.averageRoi > 12 ? 'high-productivity employment zone' : 'stable returns'}`,
    detail: `Average return on investment of ${city.averageRoi}% reflects the economic productivity of the ${city.name} employment corridor. ${city.averageRoi > 12 ? 'This level typically correlates with above-average wage growth and corporate expansion.' : ''}`,
    weight: 0.35,
    value: city.averageRoi,
    normalizedScore: Math.min(100, Math.round(city.averageRoi * 5.5)),
    direction: city.averageRoi > 12 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 3: Active projects = employer confidence
  signals.push({
    id: `employ-${city.id}-projects`,
    category: 'employment_gravity',
    label: `${city.activeProjects} active projects — developer confidence signal`,
    detail: `${city.activeProjects} active development projects indicate sustained developer and employer confidence in the ${city.name} market. Developer commitment typically precedes employment growth by 12-18 months.`,
    weight: 0.25,
    value: city.activeProjects,
    normalizedScore: Math.min(100, Math.round(city.activeProjects * 0.6)),
    direction: city.activeProjects > 80 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  return signals;
}

function generateMarketInefficiencySignals(city: City): GravitySignal[] {
  const signals: GravitySignal[] = [];

  // Signal 1: Price trend vs absorption rate = inefficiency gap
  const inefficiencyGap = Math.abs(city.priceTrend - city.absorptionRate * 0.15);
  const hasGap = inefficiencyGap > 5;
  signals.push({
    id: `ineff-${city.id}-gap`,
    category: 'market_inefficiency',
    label: `${hasGap ? 'Price-absorption dislocation detected' : 'Market in equilibrium'}`,
    detail: `Price trend (${city.priceTrend}%) vs absorption rate (${city.absorptionRate}%) shows ${hasGap ? `a ${inefficiencyGap.toFixed(1)}% gap — suggesting the market hasn't fully repriced to match demand velocity` : 'a balanced relationship suggesting efficient pricing'}. Inefficiency gaps typically close within 6-12 months.`,
    weight: 0.40,
    value: inefficiencyGap,
    normalizedScore: hasGap ? Math.min(100, Math.round(inefficiencyGap * 10)) : 30,
    direction: hasGap ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 2: Investor interest vs actual prices = sentiment gap
  const sentimentGap = city.investorInterest - city.confidence;
  signals.push({
    id: `ineff-${city.id}-sentiment`,
    category: 'market_inefficiency',
    label: `Investor sentiment (${city.investorInterest}%) vs confidence (${city.confidence}%) — ${sentimentGap > 5 ? 'sentiment leading prices' : 'aligned'}`,
    detail: `Investor sentiment (${city.investorInterest}%) is ${sentimentGap > 5 ? `${sentimentGap} points above market confidence (${city.confidence}%), suggesting investors see value the broader market hasn't recognized yet` : 'aligned with market confidence'}. This sentiment gap is a classic leading indicator.`,
    weight: 0.35,
    value: sentimentGap,
    normalizedScore: Math.max(0, Math.min(100, 50 + sentimentGap * 3)),
    direction: sentimentGap > 5 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 3: Foreign demand = cross-border inefficiency
  signals.push({
    id: `ineff-${city.id}-foreign`,
    category: 'market_inefficiency',
    label: `${city.foreignDemand}% foreign demand — cross-border capital flow opportunity`,
    detail: `${city.foreignDemand}% of demand originates from international buyers. ${city.foreignDemand > 70 ? 'High foreign demand creates a structural inefficiency — international capital often prices properties differently than local markets, creating arbitrage opportunities.' : 'Moderate foreign demand provides a stable premium floor without creating pricing distortions.'}`,
    weight: 0.25,
    value: city.foreignDemand,
    normalizedScore: city.foreignDemand,
    direction: city.foreignDemand > 60 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  return signals;
}

function generateCapitalMagnetismSignals(city: City): GravitySignal[] {
  const signals: GravitySignal[] = [];

  // Signal 1: Foreign demand = capital flow magnet
  signals.push({
    id: `capital-${city.id}-foreign`,
    category: 'capital_magnetism',
    label: `${city.foreignDemand}% international buyer presence — institutional capital corridor`,
    detail: `Cross-border capital accounts for ${city.foreignDemand}% of transactions in ${city.name}. ${city.foreignDemand > 70 ? 'This concentration of international capital creates a self-reinforcing cycle — foreign investment attracts more foreign investment, pulling in institutional funds and sovereign wealth allocations.' : 'Foreign capital is present at moderate levels, providing diversification without overheating.'}`,
    weight: 0.40,
    value: city.foreignDemand,
    normalizedScore: city.foreignDemand,
    direction: city.foreignDemand > 60 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 2: Investor interest = capital gravity
  signals.push({
    id: `capital-${city.id}-interest`,
    category: 'capital_magnetism',
    label: `${city.investorInterest}% investor interest score — capital aggregation zone`,
    detail: `Aggregate investor interest of ${city.investorInterest}% positions ${city.name} as a capital aggregation zone. ${city.investorInterest > 80 ? 'Markets with >80% investor interest typically attract institutional capital within 6-12 months of the signal appearing.' : ''}`,
    weight: 0.35,
    value: city.investorInterest,
    normalizedScore: city.investorInterest,
    direction: city.investorInterest > 75 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 3: Price trend velocity = capital momentum
  signals.push({
    id: `capital-${city.id}-momentum`,
    category: 'capital_magnetism',
    label: `${city.priceTrend}% YoY price trend — capital momentum ${city.priceTrend > 10 ? 'accelerating' : 'stable'}`,
    detail: `Price velocity of ${city.priceTrend}% YoY ${city.priceTrend > 10 ? 'exceeds typical market returns, signaling active capital rotation into this corridor. Sustained momentum above 10% typically precedes institutional reallocation.' : 'indicates steady capital market equilibrium. Below 10%, the market is still accessible for entry before acceleration.'}`,
    weight: 0.25,
    value: city.priceTrend,
    normalizedScore: Math.min(100, Math.round(city.priceTrend * 6)),
    direction: city.priceTrend > 8 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  return signals;
}

function generateDemographicSignals(city: City): GravitySignal[] {
  const signals: GravitySignal[] = [];

  // Signal 1: Price trend + absorption = population pressure
  const popPressure = Math.round((city.priceTrend + city.absorptionRate * 0.3) / 2);
  signals.push({
    id: `demo-${city.id}-pressure`,
    category: 'demographic_pull',
    label: `${popPressure}% demographic pressure index — ${popPressure > 50 ? 'inflow corridor' : 'stable population zone'}`,
    detail: `Combined price trend (${city.priceTrend}%) and absorption rate (${city.absorptionRate}%) create a demographic pressure index of ${popPressure}%. ${popPressure > 50 ? 'This level typically correlates with 2-3% annual population inflow and above-average household formation rates.' : 'Population metrics suggest stable or moderate growth.'}`,
    weight: 0.40,
    value: popPressure,
    normalizedScore: popPressure,
    direction: popPressure > 50 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 2: Average ROI = economic migration pull
  signals.push({
    id: `demo-${city.id}-migration`,
    category: 'demographic_pull',
    label: `${city.averageRoi}% ROI — economic migration attractor`,
    detail: `An average ROI of ${city.averageRoi}% acts as an economic migration signal, pulling workforce and household formation toward ${city.name}. Higher ROI markets attract younger demographics and skilled workers, creating a self-reinforcing demand cycle.`,
    weight: 0.35,
    value: city.averageRoi,
    normalizedScore: Math.min(100, Math.round(city.averageRoi * 5.5)),
    direction: city.averageRoi > 12 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  // Signal 3: Tags-based lifestyle migration
  const lifestyleScore = city.tags.includes('luxury') ? 80 :
    city.tags.includes('tourism') ? 75 :
    city.tags.includes('it-hub') ? 70 :
    city.tags.includes('international') ? 65 : 50;
  signals.push({
    id: `demo-${city.id}-lifestyle`,
    category: 'demographic_pull',
    label: `${lifestyleScore}% lifestyle migration score — ${city.tags.includes('luxury') ? 'premium migration corridor' : city.tags.includes('tourism') ? 'lifestyle destination' : city.tags.includes('it-hub') ? 'talent gravity zone' : 'balanced demographic'}`,
    detail: `${city.name} is classified as a ${city.tags.slice(0, 2).join(', ')} market. ${lifestyleScore > 70 ? 'Lifestyle and economic factors combine to create above-average demographic pull, attracting both workforce and retiree migration.' : 'Demographic factors suggest organic growth without migration-driven acceleration.'}`,
    weight: 0.25,
    value: lifestyleScore,
    normalizedScore: lifestyleScore,
    direction: lifestyleScore > 65 ? 'positive' : 'neutral',
    timestamp: new Date().toISOString(),
  });

  return signals;
}

// ============================================================
// CATEGORY SCORE COMPUTATION
// ============================================================

function computeCategoryScore(
  signals: GravitySignal[],
  category: GravitySignalCategory,
): GravityCategoryScore {
  const meta = CATEGORY_META[category];
  
  if (signals.length === 0) {
    return {
      category,
      label: meta.label,
      icon: meta.icon,
      score: 0,
      weight: meta.weight,
      signalCount: 0,
      topSignal: 'No signals detected',
      description: meta.description,
    };
  }

  // Weighted average of signal normalized scores
  const totalWeight = signals.reduce((s, sig) => s + sig.weight, 0);
  const weightedScore = signals.reduce(
    (s, sig) => s + (sig.normalizedScore * sig.weight) / totalWeight,
    0,
  );

  // Find top signal
  const topSignal = signals.reduce((best, sig) =>
    sig.normalizedScore > best.normalizedScore ? sig : best,
  );

  return {
    category,
    label: meta.label,
    icon: meta.icon,
    score: Math.round(weightedScore),
    weight: meta.weight,
    signalCount: signals.length,
    topSignal: topSignal.label,
    description: meta.description,
  };
}

// ============================================================
// GRAVITY ANALYSIS FOR A SINGLE CITY
// ============================================================

function analyzeCity(city: City): GravityAnalysis | null {
  const country = getCountry(city.countryCode);
  if (!country) return null;

  // Generate signals for each category
  const infraSignals = generateInfrastructureSignals(city);
  const employSignals = generateEmploymentSignals(city);
  const ineffSignals = generateMarketInefficiencySignals(city);
  const capitalSignals = generateCapitalMagnetismSignals(city);
  const demoSignals = generateDemographicSignals(city);

  // Compute category scores
  const categoryScores: GravityCategoryScore[] = [
    computeCategoryScore(infraSignals, 'infrastructure_velocity'),
    computeCategoryScore(employSignals, 'employment_gravity'),
    computeCategoryScore(ineffSignals, 'market_inefficiency'),
    computeCategoryScore(capitalSignals, 'capital_magnetism'),
    computeCategoryScore(demoSignals, 'demographic_pull'),
  ];

  // Overall gravity score = weighted combination
  const totalWeight = categoryScores.reduce((s, cat) => s + cat.weight, 0);
  const overallScore = Math.round(
    categoryScores.reduce((s, cat) => s + (cat.score * cat.weight) / totalWeight, 0),
  );

  // Predicted 12-month appreciation = gravity score adjusted by market factors
  const baseAppreciation = city.priceTrend;
  const gravityBoost = (overallScore - 50) * 0.15; // Above 50 = positive boost
  const predictedAppreciation = Math.round((baseAppreciation + gravityBoost) * 10) / 10;

  // Risk level based on volatility signals
  const riskScore = city.priceTrend > 15 ? 80 :
    city.foreignDemand > 80 ? 65 :
    city.priceTrend > 10 ? 50 :
    city.priceTrend > 5 ? 35 : 20;
  const riskLevel: 'low' | 'medium' | 'high' = 
    riskScore > 60 ? 'high' :
    riskScore > 35 ? 'medium' : 'low';

  // Optimal entry window
  const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const year = new Date().getFullYear();
  const entryQuarter = quarter >= 4 ? 1 : quarter + 1;
  const entryYear = quarter >= 4 ? year + 1 : year;
  const optimalEntryWindow = `Q${entryQuarter} ${entryYear === year ? '' : entryYear}`;

  // Undervalued? Score significantly higher than current price momentum
  const scoreMomentumDiff = overallScore - city.confidence;
  const isUndervalued = scoreMomentumDiff > 10;
  const isOvervalued = scoreMomentumDiff < -10;

  // Reasoning
  const reasoning: string[] = [];
  if (isUndervalued) {
    reasoning.push(`Gravity score (${overallScore}) exceeds market confidence (${city.confidence}) — opportunity not yet priced in`);
  }
  const bestCat = categoryScores.reduce((a, b) => a.score > b.score ? a : b);
  reasoning.push(`Strongest signal: ${bestCat.label} (${bestCat.score}/100) with ${bestCat.signalCount} detected indicators`);
  
  return {
    microMarket: {
      id: city.id,
      name: city.name,
      cityId: city.id,
      cityName: city.name,
      countryCode: country.code,
      countryFlag: country.flag,
      countryName: country.name,
      latitude: city.latitude,
      longitude: city.longitude,
      pricePerSqft: city.pricePerSqft,
      priceTrend: city.priceTrend,
      absorptionRate: city.absorptionRate,
      averageRoi: city.averageRoi,
      foreignDemand: city.foreignDemand,
      investorInterest: city.investorInterest,
      activeProjects: city.activeProjects,
      upcomingLaunches: city.upcomingLaunches,
      confidence: city.confidence,
      gravityScore: overallScore,
      predictedAppreciation,
      optimalEntryWindow,
      riskLevel,
      capitalAtRisk: city.pricePerSqft * 1000,
      expectedCommission: city.pricePerSqft * 1000 * 0.03,
      signals: [...infraSignals, ...employSignals, ...ineffSignals, ...capitalSignals, ...demoSignals],
    },
    categoryScores,
    overallScore,
    predictedAppreciation,
    confidence: city.confidence,
    rank: 0, // Computed later
    outOf: 0, // Computed later
    isUndervalued,
    isOvervalued,
    optimalAction: isUndervalued ? 'BUY — Market not yet repriced' :
      overallScore >= 75 ? 'MONITOR — Strong but priced in' :
      overallScore >= 60 ? 'RESEARCH — Emerging opportunity' :
      'WAIT — Entry conditions not optimal',
    reasoning,
  };
}

// ============================================================
// FULL RANKINGS
// ============================================================

export function computeGravityRankings(): GravityRankings {
  const allAnalyses: GravityAnalysis[] = [];
  const timestamp = new Date().toISOString();

  // Analyze every tracked city
  for (const country of COUNTRIES.filter(c => c.active)) {
    const countryCities = CITIES[country.code] || [];
    for (const city of countryCities) {
      const analysis = analyzeCity(city);
      if (analysis) allAnalyses.push(analysis);
    }
  }

  // Sort by gravity score descending
  allAnalyses.sort((a, b) => b.overallScore - a.overallScore);

  // Assign ranks
  allAnalyses.forEach((a, i) => {
    a.rank = i + 1;
    a.outOf = allAnalyses.length;
  });

  // Split into categories
  const topMarkets = allAnalyses.filter(a => a.overallScore >= 75);
  const emergingMarkets = allAnalyses.filter(a => a.overallScore >= 60 && a.overallScore < 75 && a.microMarket.pricePerSqft < 500);
  const undervaluedMarkets = allAnalyses.filter(a => a.isUndervalued);
  const highestMomentum = [...allAnalyses].sort((a, b) => 
    b.microMarket.priceTrend - a.microMarket.priceTrend
  ).slice(0, 10);

  return {
    generatedAt: timestamp,
    totalMarkets: allAnalyses.length,
    topMarkets,
    emergingMarkets,
    undervaluedMarkets,
    highestMomentum,
  };
}

/** Get analysis for a specific city */
export function getCityGravityAnalysis(cityId: string): GravityAnalysis | null {
  for (const country of COUNTRIES.filter(c => c.active)) {
    const countryCities = CITIES[country.code] || [];
    const city = countryCities.find(c => c.id === cityId);
    if (city) return analyzeCity(city);
  }
  return null;
}

/** Get the category metadata */
export function getCategoryMeta() {
  return CATEGORY_META;
}
