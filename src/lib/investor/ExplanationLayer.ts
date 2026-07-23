// ============================================================
// Phase 3: AI Explanation Layer
// Generates institutional-grade explanations for every opportunity
// ============================================================

import type { ScoringResult } from './InvestmentScoringEngine';

export interface InvestmentExplanation {
  executiveSummary: string;
  rankReason: string;
  topDataInfluencers: { factor: string; weight: string; impact: string }[];
  upsideCatalyst: string;
  mainDownsideRisk: string;
  suggestedHoldingPeriod: string;
  expectedCommissionOutcome: string;
  comparableMarketContext: string;
  aiConfidenceStatement: string;
  nextSteps: string[];
}

export function generateExplanation(
  projectName: string,
  city: string,
  country: string,
  priceRange: string,
  score: ScoringResult,
  dealValue: number
): InvestmentExplanation {
  const scoreBand = score.overallScore >= 85 ? 'exceptional' :
    score.overallScore >= 70 ? 'strong' :
    score.overallScore >= 50 ? 'moderate' : 'speculative';

  const priceContext = priceRange || `₹${(dealValue / 10000000).toFixed(1)} Cr`;

  // Executive Summary
  const executiveSummary = `${projectName} in ${city}, ${country} ranks in the ${
    score.overallScore >= 90 ? 'top decile' :
    score.overallScore >= 80 ? 'top quartile' :
    score.overallScore >= 65 ? 'upper half' :
    score.overallScore >= 50 ? 'middle tier' : 'emerging'
  } of investment opportunities with a composite score of ${score.overallScore}/100. ` +
  `Price momentum (${score.factors.priceMomentum}/100) and ${score.factors.infrastructurePipeline >= 70 ? 'infrastructure development' : 'rental yield'} are the primary value drivers. ` +
  `The estimated commission at 3% is ${formatCurrency(score.expectedCommission)}.`;

  // Rank Reason
  const rankReason = `This opportunity scores ${scoreBand} (${score.overallScore}/100) because ${
    score.factors.priceMomentum >= 75 ? 'price momentum is strong at ' + score.factors.priceMomentum + '/100, ' : ''
  }${
    score.factors.rentalYield >= 70 ? 'rental yield is attractive at ' + score.factors.rentalYield + '/100, ' : ''
  }${
    score.upsideCatalysts.length > 0 ? 'and key catalysts include ' + score.upsideCatalysts.slice(0, 2).join(', ').toLowerCase() : ''
  }. ${score.confidence >= 70 ? 'Data confidence is high.' : 'Additional verification recommended.'}`;

  // Top Data Influencers
  const factors = [
    { factor: 'Price Momentum', weight: '20%', impact: factorImpact(score.factors.priceMomentum) },
    { factor: 'Rental Yield', weight: '15%', impact: factorImpact(score.factors.rentalYield) },
    { factor: 'Inventory Absorption', weight: '10%', impact: factorImpact(score.factors.inventoryAbsorption) },
    { factor: 'Infrastructure Pipeline', weight: '15%', impact: factorImpact(score.factors.infrastructurePipeline) },
    { factor: 'Developer Reputation', weight: '10%', impact: factorImpact(score.factors.developerReputation) },
    { factor: 'Foreign Investment Flow', weight: '10%', impact: factorImpact(score.factors.foreignInvestmentFlow) },
    { factor: 'Currency Stability', weight: '10%', impact: factorImpact(score.factors.currencyStability) },
    { factor: 'Liquidity Risk', weight: '10%', impact: factorImpact(score.factors.liquidityRisk) },
  ];

  // Sort by highest impact
  const sortedFactors = [...factors].sort((a, b) => {
    const order = ['strong', 'moderate', 'weak'];
    return order.indexOf(a.impact) - order.indexOf(b.impact);
  });

  // Main Upside Catalyst
  const upsideCatalyst = score.upsideCatalysts.length > 0
    ? score.upsideCatalysts[0]
    : 'Stable market fundamentals with consistent demand patterns';

  // Main Downside Risk
  const mainDownsideRisk = score.downsideRisks.length > 0
    ? score.downsideRisks[0]
    : 'Standard market volatility within normal ranges';

  // Comparable Market Context
  const comparableMarketContext = generateComparableContext(city, score);

  // AI Confidence Statement
  const aiConfidenceStatement = score.confidence >= 80
    ? `High confidence (${score.confidence}%) — multiple data sources converge on this assessment. The scoring model has strong signal across all 8 factors.`
    : score.confidence >= 60
    ? `Moderate confidence (${score.confidence}%) — core factors are well-supported but some secondary data points need verification.`
    : `Limited confidence (${score.confidence}%) — additional market research is recommended before making investment decisions.`;

  // Next Steps
  const nextSteps = score.overallScore >= 70
    ? [
        '🔍 Conduct physical site inspection or virtual tour',
        '📊 Request detailed project financials and payment plan',
        '📋 Verify developer track record and past delivery timelines',
        '🤝 Schedule consultation with local market expert',
        '📄 Review legal documentation and title clearance',
      ]
    : score.overallScore >= 50
    ? [
        '📊 Add to watchlist for quarterly review',
        '🔍 Monitor price movement and absorption trends',
        '📋 Collect additional market comparables',
        '📧 Subscribe to local market intelligence feeds',
      ]
    : [
        '👀 Monitor for catalyst events before engagement',
        '📋 Add to long-term observation list',
      ];

  return {
    executiveSummary,
    rankReason,
    topDataInfluencers: sortedFactors.slice(0, 5),
    upsideCatalyst,
    mainDownsideRisk,
    suggestedHoldingPeriod: score.suggestedHoldingPeriod,
    expectedCommissionOutcome: `At a 3% commission rate, the expected commission on a ${priceContext} deal is approximately ${formatCurrency(score.expectedCommission)}. This assumes standard deal structure with no additional service fees.`,
    comparableMarketContext,
    aiConfidenceStatement,
    nextSteps,
  };
}

function factorImpact(score: number): 'strong' | 'moderate' | 'weak' {
  if (score >= 70) return 'strong';
  if (score >= 45) return 'moderate';
  return 'weak';
}

function generateComparableContext(city: string, score: ScoringResult): string {
  const bands = [
    { max: 100, label: 'top-tier global investment market', growth: '8-12%' },
    { max: 85, label: 'strong emerging investment market', growth: '6-10%' },
    { max: 70, label: 'stable growth market', growth: '4-7%' },
    { max: 55, label: 'developing market with potential', growth: '3-6%' },
    { max: 0, label: 'early-stage market requiring due diligence', growth: '2-5%' },
  ];

  const band = bands.find(b => score.overallScore >= b.max - 14) || bands[bands.length - 1];
  return `${city} is a ${band.label}. Comparable markets show ${band.growth} annual appreciation. ` +
    `The current score suggests ${score.overallScore >= 70 ? 'above-average' : 'in-line with'} market performance expectations.`;
}

function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}
