// ============================================================
// LeadLuxe AI — Demand Momentum Analysis
// Tracks search demand velocity and price momentum
// to detect accelerating buyer interest before it
// shows up in transaction data.
// ============================================================

export interface DemandMomentum {
  searchDemandScore: number;      // 0-100
  priceMomentumScore: number;     // 0-100
  demandSupplyRatio: number;      // > 1 = demand exceeds supply
  momentumDirection: 'accelerating' | 'stable' | 'decelerating';
  weeksUntilInventoryDepletion: number; // Estimated weeks until current inventory is absorbed
  keyDrivers: string[];
}

interface CityInput {
  id: string;
  name: string;
  pricePerSqft: number;
  priceTrend: number;
  absorptionRate: number;
  investorInterest: number;
  activeProjects: number;
  upcomingLaunches: number;
  averageRoi: number;
  tags: string[];
}

export function computeDemandMomentum(city: CityInput): DemandMomentum {
  // Search demand = investor interest adjusted by absorption rate
  const searchDemandScore = Math.min(100, Math.round(
    (city.investorInterest * 0.5) + (city.absorptionRate * 0.5)
  ));

  // Price momentum = price trend normalized to 0-100
  const priceMomentumScore = Math.min(100, Math.round(
    (city.priceTrend / 15) * 100
  ));

  // Demand/supply ratio: absorption vs total project pipeline
  const totalSupply = city.activeProjects + city.upcomingLaunches;
  const demandSupplyRatio = totalSupply > 0
    ? Math.round(((city.absorptionRate / 100) * totalSupply) / Math.max(1, city.upcomingLaunches) * 10) / 10
    : 1;

  // Momentum direction
  let momentumDirection: 'accelerating' | 'stable' | 'decelerating';
  if (city.priceTrend > 10 && city.absorptionRate > 70) {
    momentumDirection = 'accelerating';
  } else if (city.priceTrend < 3 || city.absorptionRate < 50) {
    momentumDirection = 'decelerating';
  } else {
    momentumDirection = 'stable';
  }

  // Estimated weeks until inventory depletion
  // Rough calculation: if absorption is 100%, inventory depletes fast
  // Lower absorption = more weeks of inventory
  const depletionWeeks = Math.max(
    4,
    Math.round((100 - city.absorptionRate) * 1.5 + city.upcomingLaunches * 2)
  );

  // Key drivers
  const keyDrivers: string[] = [];
  if (city.priceTrend > 10) keyDrivers.push(`Price accelerating at ${city.priceTrend}% YoY`);
  if (city.absorptionRate > 70) keyDrivers.push(`High absorption (${city.absorptionRate}%) — supply constrained`);
  if (city.investorInterest > 75) keyDrivers.push(`Strong investor interest (${city.investorInterest}%)`);
  if (city.averageRoi > 12) keyDrivers.push(`Above-average ROI (${city.averageRoi}%)`);
  if (city.tags.includes('it-hub')) keyDrivers.push('IT corridor employment growth');
  if (city.tags.includes('luxury')) keyDrivers.push('Premium segment demand resilience');
  if (demandSupplyRatio > 1.2) keyDrivers.push('Demand outstripping new supply');

  return {
    searchDemandScore,
    priceMomentumScore,
    demandSupplyRatio,
    momentumDirection,
    weeksUntilInventoryDepletion: depletionWeeks,
    keyDrivers,
  };
}
