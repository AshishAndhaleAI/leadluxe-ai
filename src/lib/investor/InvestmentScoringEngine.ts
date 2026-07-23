// ============================================================
// LeadLuxe AI — Multi-Factor Investment Scoring Engine
// Phase 2: Scores every opportunity 0-100 using 8 weighted factors
// ============================================================

export interface ScoringInput {
  priceTrend: number;              // % price change YoY
  avgPricePerSqft: number;         // Local currency
  rentalYield: number;             // % annual
  absorptionRate: number;          // % of inventory sold per quarter
  inventoryMonths: number;         // Months to clear current inventory
  infrastructureProximity: boolean; // Near metro/highway/airport?
  infraProjectCount: number;       // Active infrastructure projects nearby
  developerReputation: number;     // 0-100 score
  developerProjectsDelivered: number;
  developerOnTimeRate: number;     // %
  foreignInvestmentFlow: number;   // % of total investment
  foreignDemandScore: number;      // 0-100
  currencyVolatility: number;      // % annual volatility
  currencyTrend: 'stable' | 'appreciating' | 'depreciating';
  liquidityScore: number;          // 0-100 (how fast can you sell)
  marketDepth: number;             // Number of active listings/transactions
}

export interface ScoringResult {
  overallScore: number;            // 0-100
  confidence: number;              // 0-100
  factors: {
    priceMomentum: number;
    rentalYield: number;
    inventoryAbsorption: number;
    infrastructurePipeline: number;
    developerReputation: number;
    foreignInvestmentFlow: number;
    currencyStability: number;
    liquidityRisk: number;
  };
  upsideCatalysts: string[];
  downsideRisks: string[];
  suggestedHoldingPeriod: string;
  expectedCommission: number;
}

// =====================
// WEIGHTS
// =====================
const WEIGHTS = {
  priceMomentum: 0.20,
  rentalYield: 0.15,
  inventoryAbsorption: 0.10,
  infrastructurePipeline: 0.15,
  developerReputation: 0.10,
  foreignInvestmentFlow: 0.10,
  currencyStability: 0.10,
  liquidityRisk: 0.10,
};

const COMMISSION_RATE = 0.03;

export function computeInvestmentScore(
  input: ScoringInput,
  dealValue: number = 5000000
): ScoringResult {
  // === Score each factor (0-100) ===

  // Price Momentum (20%)
  let priceMomentum = 50;
  if (input.priceTrend > 15) priceMomentum = 95;
  else if (input.priceTrend > 10) priceMomentum = 85;
  else if (input.priceTrend > 7) priceMomentum = 75;
  else if (input.priceTrend > 4) priceMomentum = 60;
  else if (input.priceTrend > 0) priceMomentum = 45;
  else priceMomentum = 25; // Negative growth

  // Rental Yield (15%)
  let rentalYield = 50;
  if (input.rentalYield > 10) rentalYield = 95;
  else if (input.rentalYield > 7) rentalYield = 85;
  else if (input.rentalYield > 5) rentalYield = 70;
  else if (input.rentalYield > 3) rentalYield = 55;
  else rentalYield = 35;

  // Inventory Absorption (10%)
  let inventoryAbsorption = 50;
  if (input.absorptionRate > 85) inventoryAbsorption = 95;
  else if (input.absorptionRate > 70) inventoryAbsorption = 85;
  else if (input.absorptionRate > 55) inventoryAbsorption = 70;
  else if (input.absorptionRate > 40) inventoryAbsorption = 50;
  else inventoryAbsorption = 30;

  if (input.inventoryMonths < 6) inventoryAbsorption += 10;
  else if (input.inventoryMonths > 24) inventoryAbsorption -= 15;

  inventoryAbsorption = Math.min(100, Math.max(0, inventoryAbsorption));

  // Infrastructure Pipeline (15%)
  let infraScore = 40;
  if (input.infrastructureProximity) infraScore += 25;
  infraScore += Math.min(input.infraProjectCount * 8, 25);
  if (input.infraProjectCount >= 3) infraScore += 10;
  const infrastructurePipeline = Math.min(100, infraScore);

  // Developer Reputation (10%)
  let devScore = 40;
  devScore += input.developerReputation * 0.3;
  if (input.developerProjectsDelivered > 20) devScore += 15;
  else if (input.developerProjectsDelivered > 10) devScore += 10;
  else if (input.developerProjectsDelivered > 5) devScore += 5;
  if (input.developerOnTimeRate > 90) devScore += 15;
  else if (input.developerOnTimeRate > 80) devScore += 10;
  const developerReputation = Math.min(100, devScore);

  // Foreign Investment Flow (10%)
  let foreignScore = 40;
  foreignScore += input.foreignDemandScore * 0.3;
  if (input.foreignInvestmentFlow > 30) foreignScore += 15;
  else if (input.foreignInvestmentFlow > 15) foreignScore += 10;
  else if (input.foreignInvestmentFlow > 5) foreignScore += 5;
  const foreignInvestmentFlow = Math.min(100, foreignScore);

  // Currency Stability (10%)
  let currencyScore = 60;
  if (input.currencyTrend === 'stable') currencyScore += 20;
  else if (input.currencyTrend === 'appreciating') currencyScore += 15;
  else if (input.currencyTrend === 'depreciating') currencyScore -= 15;
  if (input.currencyVolatility < 3) currencyScore += 15;
  else if (input.currencyVolatility < 7) currencyScore += 5;
  else if (input.currencyVolatility > 12) currencyScore -= 10;
  const currencyStability = Math.min(100, Math.max(0, currencyScore));

  // Liquidity Risk (10%) — higher score = more liquid = better
  let liqScore = input.liquidityScore * 0.6;
  if (input.marketDepth > 1000) liqScore += 30;
  else if (input.marketDepth > 500) liqScore += 20;
  else if (input.marketDepth > 200) liqScore += 10;
  const liquidityRisk = Math.min(100, liqScore);

  // === Composite Score ===
  const overallScore = Math.round(
    priceMomentum * WEIGHTS.priceMomentum +
    rentalYield * WEIGHTS.rentalYield +
    inventoryAbsorption * WEIGHTS.inventoryAbsorption +
    infrastructurePipeline * WEIGHTS.infrastructurePipeline +
    developerReputation * WEIGHTS.developerReputation +
    foreignInvestmentFlow * WEIGHTS.foreignInvestmentFlow +
    currencyStability * WEIGHTS.currencyStability +
    liquidityRisk * WEIGHTS.liquidityRisk
  );

  // === Confidence ===
  const dataPoints = [
    input.priceTrend !== undefined,
    input.rentalYield > 0,
    input.absorptionRate > 0,
    input.developerReputation > 0,
    input.foreignDemandScore > 0,
    input.currencyVolatility > 0,
  ].filter(Boolean).length;

  const confidence = Math.min(100, Math.round(40 + dataPoints * 10 + (overallScore > 60 ? 5 : 0)));

  // === Upside Catalysts ===
  const upsideCatalysts: string[] = [];
  if (input.priceTrend > 10) upsideCatalysts.push(`Strong price momentum of ${input.priceTrend}% YoY`);
  if (input.infrastructureProximity) upsideCatalysts.push(`${input.infraProjectCount} infrastructure projects within catchment`);
  if (input.absorptionRate > 70) upsideCatalysts.push(`High absorption rate of ${input.absorptionRate}% — demand exceeding supply`);
  if (input.foreignDemandScore > 70) upsideCatalysts.push('Strong foreign investor demand driving values');
  if (input.currencyTrend === 'appreciating') upsideCatalysts.push('Currency appreciation adds to foreign investor returns');
  if (input.rentalYield > 6) upsideCatalysts.push(`Attractive rental yield of ${input.rentalYield}%`);

  // === Downside Risks ===
  const downsideRisks: string[] = [];
  if (input.priceTrend < 0) downsideRisks.push(`Price depreciation of ${Math.abs(input.priceTrend)}% — potential value erosion`);
  if (input.inventoryMonths > 18) downsideRisks.push('Elevated inventory levels — buyer\'s market conditions');
  if (input.currencyTrend === 'depreciating') downsideRisks.push('Currency depreciation reduces foreign investor returns');
  if (input.currencyVolatility > 10) downsideRisks.push(`High currency volatility (${input.currencyVolatility}%)`);
  if (input.liquidityScore < 40) downsideRisks.push('Low market liquidity — exit could take 12+ months');
  if (input.developerOnTimeRate < 70) downsideRisks.push('Developer has history of project delays');
  if (downsideRisks.length === 0) downsideRisks.push('No significant risks identified at current threshold');

  // === Suggested Holding Period ===
  let suggestedHoldingPeriod = '3-5 years';
  if (overallScore >= 85) suggestedHoldingPeriod = '2-3 years (high-growth market — shorter hold maximizes IRR)';
  else if (overallScore >= 70) suggestedHoldingPeriod = '3-5 years (stable growth — medium-term hold)';
  else if (overallScore >= 50) suggestedHoldingPeriod = '5-7 years (value play — requires patience)';
  else suggestedHoldingPeriod = '7-10 years (turnaround play — long-term commitment)';

  // === Expected Commission ===
  const expectedCommission = dealValue * COMMISSION_RATE;

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    confidence,
    factors: {
      priceMomentum: Math.round(priceMomentum),
      rentalYield: Math.round(rentalYield),
      inventoryAbsorption: Math.round(inventoryAbsorption),
      infrastructurePipeline: Math.round(infrastructurePipeline),
      developerReputation: Math.round(developerReputation),
      foreignInvestmentFlow: Math.round(foreignInvestmentFlow),
      currencyStability: Math.round(currencyStability),
      liquidityRisk: Math.round(liquidityRisk),
    },
    upsideCatalysts,
    downsideRisks,
    suggestedHoldingPeriod,
    expectedCommission,
  };
}

// =====================
// DERIVE SCORING INPUT FROM CITY DATA
// =====================
export function deriveScoringInput(city: {
  pricePerSqft?: number;
  priceTrend?: number;
  averageRoi?: number;
  absorptionRate?: number;
  foreignDemand?: number;
  investorInterest?: number;
  tags?: string[];
  confidence?: number;
  activeProjects?: number;
}): ScoringInput {
  return {
    priceTrend: city.priceTrend || 5,
    avgPricePerSqft: city.pricePerSqft || 10000,
    rentalYield: city.averageRoi || 8,
    absorptionRate: city.absorptionRate || 60,
    inventoryMonths: Math.max(3, Math.round((100 - (city.absorptionRate || 60)) / 5)),
    infrastructureProximity: (city.tags || []).some(t => ['metro', 'infrastructure', 'corridor'].includes(t.toLowerCase())),
    infraProjectCount: city.activeProjects ? Math.min(city.activeProjects, 10) : 2,
    developerReputation: city.confidence || 70,
    developerProjectsDelivered: (city.investorInterest || 50) > 70 ? 15 : 5,
    developerOnTimeRate: 85,
    foreignInvestmentFlow: city.foreignDemand || 30,
    foreignDemandScore: city.foreignDemand || 40,
    currencyVolatility: 5,
    currencyTrend: 'stable',
    liquidityScore: city.investorInterest || 60,
    marketDepth: (city.activeProjects || 20) * 25,
  };
}
