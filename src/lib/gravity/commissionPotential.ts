// ============================================================
// TerraNexus AI — Commission Potential Analysis
// Predicts the expected commission for each market based on:
//   - Estimated deal value (price per sqft × typical unit size)
//   - Commission rate (3% standard)
//   - Deal probability (gravity score / confidence adjusted)
//   - Market depth (active projects × units per project)
// ============================================================

export interface CommissionPotential {
  estimatedDealValue: number;          // Estimated property deal value
  formatted: string;                   // Formatted string (e.g., "₹1.2 Cr")
  commissionRate: number;              // Standard commission rate (e.g., 0.03)
  grossCommission: number;             // Gross commission at standard rate
  expectedCommission: number;          // Probability-adjusted commission
  expectedFormatted: string;           // Formatted expected commission
  dealProbability: number;             // 0-100 probability of closing
  marketDepth: number;                 // Number of potential deals in market
  totalAddressableCommission: number;  // Total commission if all deals close
  totalFormatted: string;              // Formatted total commission
  confidence: 'high' | 'medium' | 'low'; // Confidence in the estimate
  currency: string;
  currencySymbol: string;
}

// Standard unit sizes by market segment
const UNIT_SIZE_SQM: Record<string, number> = {
  luxury: 200,
  premium: 150,
  mid_range: 100,
  affordable: 60,
  studio: 40,
  commercial: 300,
};

export function computeCommissionPotential(
  pricePerSqft: number,
  activeProjects: number,
): CommissionPotential {
  // Determine market segment and typical unit size
  const segment = pricePerSqft > 1000 ? 'luxury' :
    pricePerSqft > 500 ? 'premium' :
    pricePerSqft > 200 ? 'mid_range' : 'affordable';
  
  const unitSize = UNIT_SIZE_SQM[segment] || 100;
  const estimatedDealValue = pricePerSqft * unitSize;
  const commissionRate = 0.03;
  const grossCommission = Math.round(estimatedDealValue * commissionRate);

  // Deal probability — based on gravity score proxy
  // Higher price = more expensive = lower probability but higher value
  const dealProbability = Math.min(95, Math.max(15,
    segment === 'luxury' ? 35 :
    segment === 'premium' ? 45 :
    segment === 'mid_range' ? 60 : 70
  ));

  const expectedCommission = Math.round(grossCommission * (dealProbability / 100));

  // Market depth — rough estimate of how many salable units exist
  const unitsPerProject = segment === 'luxury' ? 50 :
    segment === 'premium' ? 100 :
    segment === 'mid_range' ? 200 : 300;
  const marketDepth = activeProjects * unitsPerProject;

  // Total addressable commission — if all deals in the market close
  const totalAddressable = grossCommission * marketDepth;

  // Confidence
  const confidence: 'high' | 'medium' | 'low' =
    activeProjects > 100 ? 'high' :
    activeProjects > 50 ? 'medium' : 'low';

  // Format
  const currencySymbol = '₹';
  const formatValue = (val: number): string => {
    if (val >= 10000000) return `${currencySymbol}${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `${currencySymbol}${(val / 100000).toFixed(1)} L`;
    if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(1)}K`;
    return `${currencySymbol}${val}`;
  };

  return {
    estimatedDealValue,
    formatted: formatValue(estimatedDealValue),
    commissionRate,
    grossCommission,
    expectedCommission,
    expectedFormatted: formatValue(expectedCommission),
    dealProbability,
    marketDepth,
    totalAddressableCommission: totalAddressable,
    totalFormatted: formatValue(totalAddressable),
    confidence,
    currency: 'INR',
    currencySymbol,
  };
}
