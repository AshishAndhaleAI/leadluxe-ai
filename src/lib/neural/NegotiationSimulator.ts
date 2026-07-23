// ============================================================
// Phase 5: AI Negotiation Simulator
// Simulates developer counteroffers, payment plan optimization,
// and provides recommended offer prices for every project
// ============================================================

export interface NegotiationInput {
  propertyName: string;
  askingPrice: number;
  city: string;
  country: string;
  propertyType: string;
  inventoryMonths: number;
  quarterEnd: boolean;
  bulkUnits: number;
  brokerCompetition: number; // 0-100
  developerReputation: number; // 0-100
  projectStage: string;
  similarPropertiesPrice: number;
  daysOnMarket: number;
  paymentTerms: string;
}

export interface NegotiationResult {
  recommendedOffer: number;
  maxWalkAwayPrice: number;
  expectedDiscountMin: number;
  expectedDiscountMax: number;
  discountProbability: number; // 0-100
  inventoryPressureScore: number;
  quarterEndDiscountProb: number;
  bulkPurchaseLeverage: number;
  brokerCompetitionIntensity: number;
  paymentPlanOptions: PaymentPlanOption[];
  developerCounterofferSimulation: CounterofferSimulation[];
  commissionImpact: number;
  negotiationStrategy: string;
  confidence: number;
}

export interface PaymentPlanOption {
  name: string;
  downPayment: number;
  installmentMonths: number;
  monthlyPayment: number;
  totalCost: number;
  discount: number;
}

export interface CounterofferSimulation {
  round: number;
  developerPrice: number;
  buyerPrice: number;
  gap: number;
  probability: number;
  likelyOutcome: 'buyer_favored' | 'balanced' | 'developer_favored';
}

// =====================
// RUN NEGOTIATION SIMULATION
// =====================
export function simulateNegotiation(input: NegotiationInput): NegotiationResult {
  const commissionRate = 0.03;
  
  // Inventory pressure score
  const inventoryPressureScore = Math.round(Math.min(100, Math.max(0,
    input.inventoryMonths > 24 ? 85 : input.inventoryMonths > 18 ? 70 :
    input.inventoryMonths > 12 ? 55 : input.inventoryMonths > 6 ? 40 : 25
  )));

  // Quarter-end discount probability
  const quarterEndDiscountProb = input.quarterEnd ? 
    Math.round(65 + input.inventoryMonths * 0.5) : 
    Math.round(25 + input.inventoryMonths * 0.3);

  // Bulk purchase leverage
  const bulkPurchaseLeverage = Math.round(Math.min(100, 
    input.bulkUnits >= 10 ? 90 : input.bulkUnits >= 5 ? 75 :
    input.bulkUnits >= 3 ? 60 : input.bulkUnits >= 2 ? 40 : 10
  ));

  // Broker competition intensity
  const brokerCompetitionIntensity = input.brokerCompetition;

  // Expected discount range based on market conditions
  let expectedDiscountMin = 3;
  let expectedDiscountMax = 8;

  if (inventoryPressureScore > 70) { expectedDiscountMin = 8; expectedDiscountMax = 15; }
  else if (inventoryPressureScore > 55) { expectedDiscountMin = 5; expectedDiscountMax = 10; }
  else if (inventoryPressureScore < 35) { expectedDiscountMin = 1; expectedDiscountMax = 4; }

  if (input.quarterEnd) { expectedDiscountMin += 2; expectedDiscountMax += 4; }
  if (input.bulkUnits > 3) { expectedDiscountMin += 3; expectedDiscountMax += 6; }
  if (input.developerReputation > 80) { expectedDiscountMin -= 1; expectedDiscountMax -= 2; }
  if (input.daysOnMarket > 180) { expectedDiscountMin += 3; expectedDiscountMax += 5; }

  expectedDiscountMin = Math.max(0, expectedDiscountMin);
  expectedDiscountMax = Math.max(expectedDiscountMin + 1, expectedDiscountMax);

  // Discount probability
  const discountProbability = Math.round(Math.min(100,
    40 + inventoryPressureScore * 0.3 +
    (input.quarterEnd ? 15 : 0) +
    (input.bulkUnits > 3 ? 15 : 0) +
    (input.daysOnMarket > 180 ? 10 : 0) -
    (input.developerReputation > 80 ? 15 : 0) -
    (brokerCompetitionIntensity > 70 ? 10 : 0)
  ));

  // Recommended offer and walk-away price
  const avgDiscount = (expectedDiscountMin + expectedDiscountMax) / 2;
  const recommendedOffer = Math.round(input.askingPrice * (1 - avgDiscount / 100));
  const maxWalkAwayPrice = Math.round(input.askingPrice * (1 - expectedDiscountMax / 100));
  const expectedCommissionImpact = Math.round(recommendedOffer * commissionRate);

  // Payment plan options
  const paymentPlanOptions: PaymentPlanOption[] = [
    {
      name: 'Full Payment',
      downPayment: input.askingPrice,
      installmentMonths: 0,
      monthlyPayment: 0,
      totalCost: input.askingPrice * 0.95,
      discount: Math.round((1 - 0.95) * 100),
    },
    {
      name: '50:50 Plan',
      downPayment: Math.round(input.askingPrice * 0.5),
      installmentMonths: 12,
      monthlyPayment: Math.round((input.askingPrice * 0.5) / 12),
      totalCost: input.askingPrice * 0.97,
      discount: Math.round((1 - 0.97) * 100),
    },
    {
      name: 'Construction-Linked Plan',
      downPayment: Math.round(input.askingPrice * 0.2),
      installmentMonths: 36,
      monthlyPayment: Math.round((input.askingPrice * 0.8) / 36),
      totalCost: input.askingPrice,
      discount: 0,
    },
  ];

  // Developer counteroffer simulation
  const counterofferSimulation: CounterofferSimulation[] = [
    {
      round: 1,
      developerPrice: input.askingPrice,
      buyerPrice: recommendedOffer,
      gap: input.askingPrice - recommendedOffer,
      probability: 70,
      likelyOutcome: 'buyer_favored',
    },
    {
      round: 2,
      developerPrice: Math.round((input.askingPrice + recommendedOffer) / 2),
      buyerPrice: Math.round(recommendedOffer * 1.03),
      gap: Math.round((input.askingPrice + recommendedOffer) / 2 - recommendedOffer * 1.03),
      probability: 55,
      likelyOutcome: 'balanced',
    },
    {
      round: 3,
      developerPrice: Math.round((input.askingPrice + recommendedOffer * 1.03) / 2),
      buyerPrice: Math.round(recommendedOffer * 1.05),
      gap: Math.round(((input.askingPrice + recommendedOffer * 1.03) / 2) - recommendedOffer * 1.05),
      probability: 40,
      likelyOutcome: 'developer_favored',
    },
  ];

  // Negotiation strategy
  const strategy = generateStrategy(input, inventoryPressureScore, quarterEndDiscountProb, expectedDiscountMin, expectedDiscountMax);

  // Confidence
  const confidence = Math.round(Math.min(100,
    65 + (input.daysOnMarket > 90 ? 10 : 0) +
    (input.quarterEnd ? 8 : 0) +
    (input.bulkUnits > 2 ? 7 : 0) -
    (input.developerReputation > 80 ? 10 : 0)
  ));

  return {
    recommendedOffer,
    maxWalkAwayPrice,
    expectedDiscountMin,
    expectedDiscountMax,
    discountProbability,
    inventoryPressureScore,
    quarterEndDiscountProb,
    bulkPurchaseLeverage,
    brokerCompetitionIntensity,
    paymentPlanOptions,
    developerCounterofferSimulation: counterofferSimulation,
    commissionImpact: expectedCommissionImpact,
    negotiationStrategy: strategy,
    confidence,
  };
}

function generateStrategy(
  input: NegotiationInput,
  inventoryPressure: number,
  quarterEndProb: number,
  discountMin: number,
  discountMax: number
): string {
  const parts: string[] = [];

  if (inventoryPressure > 65) {
    parts.push('High inventory gives buyers significant leverage. Lead with an offer 10-15% below asking.');
  } else if (inventoryPressure > 45) {
    parts.push('Moderate inventory levels. Start at 5-8% below asking with room to move to 10%.');
  } else {
    parts.push('Low inventory favors the developer. Expect 2-4% discount at most. Focus on payment terms instead.');
  }

  if (input.quarterEnd && quarterEndProb > 50) {
    parts.push('Quarter-end approaching — developers are more flexible on pricing to meet targets. Time your offer strategically.');
  }
  if (input.bulkUnits > 3) {
    parts.push(`Purchasing ${input.bulkUnits} units gives substantial negotiating power. Request a bulk discount of ${Math.min(12, 5 + input.bulkUnits * 2)}%.`);
  }
  if (input.brokerCompetition > 70) {
    parts.push('High broker competition means you must move quickly. Consider a pre-emptive strong offer to lock the deal.');
  }
  if (input.daysOnMarket > 180) {
    parts.push(`Property has been on market for ${input.daysOnMarket} days — developer is motivated. Use this as leverage.`);
  }

  parts.push(`Target discount range: ${discountMin}-${discountMax}%. Recommended opening offer: ${input.askingPrice - Math.round(input.askingPrice * discountMax / 100)}.`);

  return parts.join(' ');
}
