// ============================================================
// Phase 6: Portfolio Digital Twin Engine
// Simulates portfolio value over time with stress scenarios
// ============================================================

export interface PortfolioAsset {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'land' | 'mixed_use' | 'fractional' | 'reit';
  city: string;
  country: string;
  purchaseValue: number;
  currentValue: number;
  currency: string;
  investmentDate: string;
  expectedAnnualYield: number;
  holdingPeriodYears: number;
  debtAmount: number;
  equityAmount: number;
  riskScore: number;
  expectedCommission: number;
}

export interface PortfolioSnapshot {
  totalValue: number;
  totalEquity: number;
  totalDebt: number;
  loanToValue: number;
  annualCashFlow: number;
  netYield: number;
  geographicConcentration: { country: string; percentage: number }[];
  assetClassConcentration: { type: string; percentage: number }[];
  currencyExposure: { currency: string; percentage: number }[];
}

export interface StressScenario {
  name: string;
  description: string;
  valueImpact: number;      // % change in property values
  rentalImpact: number;     // % change in rental income
  currencyImpact: number;   // % change in FX rates
  interestRateImpact: number; // % change in debt costs
  liquidityImpact: number;  // % change in exit speed
}

export interface StressResult {
  scenario: StressScenario;
  portfolioValueAfter: number;
  equityAfter: number;
  cashFlowAfter: number;
  loanToValueAfter: number;
  totalLoss: number;
  lossPercentage: number;
  riskRating: 'low' | 'moderate' | 'high' | 'severe';
}

// =====================
// STRESS SCENARIOS
// =====================
export const STRESS_SCENARIOS: StressScenario[] = [
  {
    name: 'Moderate Recession',
    description: 'GDP contraction, moderate job losses, central bank rate cuts',
    valueImpact: -12,
    rentalImpact: -8,
    currencyImpact: -5,
    interestRateImpact: -1,
    liquidityImpact: -20,
  },
  {
    name: 'Severe Recession',
    description: 'Prolonged economic downturn, significant job losses, credit freeze',
    valueImpact: -25,
    rentalImpact: -18,
    currencyImpact: -12,
    interestRateImpact: 2,
    liquidityImpact: -45,
  },
  {
    name: 'Rate Hike Shock',
    description: 'Rapid interest rate increases, mortgage affordability crisis',
    valueImpact: -18,
    rentalImpact: -5,
    currencyImpact: 3,
    interestRateImpact: 3,
    liquidityImpact: -30,
  },
  {
    name: 'Currency Depreciation',
    description: 'Local currency loses 20% vs major currencies, capital flight',
    valueImpact: -10,
    rentalImpact: -5,
    currencyImpact: -20,
    interestRateImpact: 5,
    liquidityImpact: -25,
  },
  {
    name: 'Supply Glut',
    description: 'Massive oversupply from new completions, inventory buildup',
    valueImpact: -15,
    rentalImpact: -20,
    currencyImpact: 0,
    interestRateImpact: 0,
    liquidityImpact: -35,
  },
  {
    name: 'Infrastructure Boom',
    description: 'Major infrastructure projects completed, connectivity improves',
    valueImpact: 18,
    rentalImpact: 12,
    currencyImpact: 5,
    interestRateImpact: 0,
    liquidityImpact: 15,
  },
  {
    name: 'Foreign Capital Surge',
    description: 'Relaxed FDI rules, strong foreign buyer demand returns',
    valueImpact: 22,
    rentalImpact: 10,
    currencyImpact: 8,
    interestRateImpact: -1,
    liquidityImpact: 20,
  },
];

// =====================
// PORTFOLIO SNAPSHOT
// =====================
export function computePortfolioSnapshot(assets: PortfolioAsset[]): PortfolioSnapshot {
  const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalDebt = assets.reduce((s, a) => s + a.debtAmount, 0);
  const totalEquity = assets.reduce((s, a) => s + a.equityAmount, 0);

  const annualCashFlow = assets.reduce((s, a) => s + (a.currentValue * (a.expectedAnnualYield / 100)), 0);

  // Geographic concentration
  const countryMap = new Map<string, number>();
  assets.forEach(a => {
    countryMap.set(a.country, (countryMap.get(a.country) || 0) + a.currentValue);
  });
  const geographicConcentration = Array.from(countryMap.entries())
    .map(([country, value]) => ({ country, percentage: Math.round((value / totalValue) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Asset class concentration
  const typeMap = new Map<string, number>();
  assets.forEach(a => {
    typeMap.set(a.type, (typeMap.get(a.type) || 0) + a.currentValue);
  });
  const assetClassConcentration = Array.from(typeMap.entries())
    .map(([type, value]) => ({ type, percentage: Math.round((value / totalValue) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Currency exposure (simplified)
  const currencyMap = new Map<string, number>();
  assets.forEach(a => {
    currencyMap.set(a.currency, (currencyMap.get(a.currency) || 0) + a.currentValue);
  });
  const currencyExposure = Array.from(currencyMap.entries())
    .map(([currency, value]) => ({ currency, percentage: Math.round((value / totalValue) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  return {
    totalValue,
    totalEquity,
    totalDebt,
    loanToValue: totalValue > 0 ? Math.round((totalDebt / totalValue) * 100) : 0,
    annualCashFlow,
    netYield: totalValue > 0 ? Math.round((annualCashFlow / totalValue) * 100) : 0,
    geographicConcentration,
    assetClassConcentration,
    currencyExposure,
  };
}

// =====================
// STRESS TEST
// =====================
export function runStressTest(assets: PortfolioAsset[], scenario: StressScenario): StressResult {
  // Apply stress to each asset
  const stressedValues = assets.map(asset => {
    const valueImpact = asset.currentValue * (1 + scenario.valueImpact / 100);
    const rentalImpact = (asset.currentValue * (asset.expectedAnnualYield / 100)) * (1 + scenario.rentalImpact / 100);
    const debtCost = asset.debtAmount * (scenario.interestRateImpact / 100);

    return {
      stressedValue: valueImpact,
      stressedCashFlow: rentalImpact - debtCost,
      originalValue: asset.currentValue,
      originalCashFlow: asset.currentValue * (asset.expectedAnnualYield / 100),
    };
  });

  const portfolioValueAfter = stressedValues.reduce((s, v) => s + v.stressedValue, 0);
  const cashFlowAfter = stressedValues.reduce((s, v) => s + v.stressedCashFlow, 0);
  const originalValue = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalLoss = originalValue - portfolioValueAfter;
  const lossPercentage = originalValue > 0 ? Math.round((totalLoss / originalValue) * 100) : 0;

  // Total debt stays the same (principal doesn't change under stress)
  const totalDebt = assets.reduce((s, a) => s + a.debtAmount, 0);
  const equityAfter = portfolioValueAfter - totalDebt;
  const loanToValueAfter = portfolioValueAfter > 0 ? Math.round((totalDebt / portfolioValueAfter) * 100) : 0;

  // Risk rating
  let riskRating: 'low' | 'moderate' | 'high' | 'severe';
  if (lossPercentage <= 5) riskRating = 'low';
  else if (lossPercentage <= 12) riskRating = 'moderate';
  else if (lossPercentage <= 22) riskRating = 'high';
  else riskRating = 'severe';

  return {
    scenario,
    portfolioValueAfter: Math.round(portfolioValueAfter),
    equityAfter: Math.round(equityAfter),
    cashFlowAfter: Math.round(cashFlowAfter),
    loanToValueAfter,
    totalLoss: Math.round(totalLoss),
    lossPercentage,
    riskRating,
  };
}
