// ============================================================
// Phase 4: Live Market Signals Engine
// Ingest, categorize, and rank market signals continuously
// ============================================================

export type SignalCategory =
  | 'interest_rate_change'
  | 'mortgage_policy'
  | 'infrastructure_approval'
  | 'metro_rail_expansion'
  | 'foreign_capital_inflow'
  | 'land_acquisition'
  | 'developer_debt_event'
  | 'currency_shock'
  | 'market_milestone'
  | 'government_policy'
  | 'demand_spike'
  | 'supply_constraint'
  | 'regulatory_change'
  | 'economic_indicator';

export type ImpactHorizon = 'immediate' | 'short_term' | 'medium_term' | 'long_term';

export interface MarketSignal {
  id: string;
  category: SignalCategory;
  title: string;
  description: string;
  signalStrength: number;  // 0-100
  affectedCities: string[];
  affectedCountries: string[];
  impactHorizon: ImpactHorizon;
  expectedImpactMonths: number;
  aiConfidence: number;    // 0-100
  sourceUrl?: string;
  sourceName?: string;
  isVerified: boolean;
  detectedAt: string;
}

export interface SignalCategoryInfo {
  category: SignalCategory;
  label: string;
  description: string;
  icon: string;
  typicalImpact: ImpactHorizon;
}

export const SIGNAL_CATEGORIES: SignalCategoryInfo[] = [
  { category: 'interest_rate_change', label: 'Interest Rate Change', description: 'Central bank rate decisions affecting mortgage costs', icon: '📊', typicalImpact: 'immediate' },
  { category: 'mortgage_policy', label: 'Mortgage Policy', description: 'LTV ratio changes, eligibility criteria, tax benefits', icon: '🏦', typicalImpact: 'short_term' },
  { category: 'infrastructure_approval', label: 'Infrastructure Approval', description: 'New road, bridge, airport or rail project approvals', icon: '🏗️', typicalImpact: 'long_term' },
  { category: 'metro_rail_expansion', label: 'Metro/Rail Expansion', description: 'New metro lines and rail connectivity projects', icon: '🚇', typicalImpact: 'medium_term' },
  { category: 'foreign_capital_inflow', label: 'Foreign Capital Inflow', description: 'Cross-border investment volume changes', icon: '🌍', typicalImpact: 'medium_term' },
  { category: 'land_acquisition', label: 'Land Acquisition', description: 'Major land parcels changing ownership', icon: '📐', typicalImpact: 'long_term' },
  { category: 'developer_debt_event', label: 'Developer Debt Event', description: 'Developer fundraising, debt restructuring, or distress', icon: '💰', typicalImpact: 'short_term' },
  { category: 'currency_shock', label: 'Currency Shock', description: 'Significant currency valuation movements', icon: '💱', typicalImpact: 'immediate' },
  { category: 'market_milestone', label: 'Market Milestone', description: 'Price index hitting record levels or significant thresholds', icon: '📈', typicalImpact: 'short_term' },
  { category: 'government_policy', label: 'Government Policy', description: 'New real estate regulations, tax changes, or incentives', icon: '⚖️', typicalImpact: 'medium_term' },
  { category: 'demand_spike', label: 'Demand Spike', description: 'Sudden increase in property search and inquiry volumes', icon: '🔥', typicalImpact: 'immediate' },
  { category: 'supply_constraint', label: 'Supply Constraint', description: 'Reduction in new project launches or inventory', icon: '🏗️', typicalImpact: 'medium_term' },
  { category: 'regulatory_change', label: 'Regulatory Change', description: 'Changes in property laws, stamp duty, or registration fees', icon: '📋', typicalImpact: 'short_term' },
  { category: 'economic_indicator', label: 'Economic Indicator', description: 'GDP growth, employment, or manufacturing data impacting real estate', icon: '📊', typicalImpact: 'medium_term' },
];

// =====================
// SIGNAL GENERATOR (from city/market data)
// =====================
export function generateLiveSignals(): MarketSignal[] {
  const signals: MarketSignal[] = [];
  const now = new Date();

  // Generate signals based on known market conditions
  // In production, this would come from the Supabase ai_signals table

  // Interest rate signal
  signals.push({
    id: 'sig-rate-1',
    category: 'interest_rate_change',
    title: 'RBI holds repo rate at 6.50% — stable mortgage environment',
    description: 'The Reserve Bank held rates steady for the 7th consecutive meeting. Home loan rates remain attractive for qualified buyers, supporting continued demand in mid-range and premium segments.',
    signalStrength: 72,
    affectedCities: ['Mumbai', 'Pune', 'Bengaluru', 'Delhi NCR', 'Hyderabad'],
    affectedCountries: ['India'],
    impactHorizon: 'short_term',
    expectedImpactMonths: 3,
    aiConfidence: 88,
    sourceName: 'RBI Monetary Policy',
    isVerified: true,
    detectedAt: now.toISOString(),
  });

  // Infrastructure signal — Dubai
  signals.push({
    id: 'sig-infra-1',
    category: 'infrastructure_approval',
    title: 'Dubai approves AED 12B urban expansion — new districts opening',
    description: 'Dubai Urban Master Plan 2040 accelerates. New residential and commercial districts approved in Dubai South and Al Maktoum International Airport corridor. Property values in surrounding areas expected to appreciate 15-20% over 24 months.',
    signalStrength: 88,
    affectedCities: ['Dubai'],
    affectedCountries: ['UAE'],
    impactHorizon: 'long_term',
    expectedImpactMonths: 24,
    aiConfidence: 85,
    sourceName: 'Dubai Urban Planning Authority',
    isVerified: true,
    detectedAt: now.toISOString(),
  });

  // Foreign capital inflow — Singapore
  signals.push({
    id: 'sig-foreign-1',
    category: 'foreign_capital_inflow',
    title: 'Singapore luxury property transactions up 28% — foreign buying surge',
    description: 'High-net-worth buyers from China, Indonesia, and India are driving a surge in Singapore luxury condo transactions. The SGD 1.5M+ segment saw 28% more transactions QoQ. Core CBD and Sentosa Cove leading the rally.',
    signalStrength: 85,
    affectedCities: ['Singapore'],
    affectedCountries: ['Singapore'],
    impactHorizon: 'short_term',
    expectedImpactMonths: 6,
    aiConfidence: 82,
    sourceName: 'URA Singapore Market Report',
    isVerified: true,
    detectedAt: now.toISOString(),
  });

  // Metro expansion — Pune
  signals.push({
    id: 'sig-metro-1',
    category: 'metro_rail_expansion',
    title: 'Pune Metro Phase 2 approved — 82km extension across 3 corridors',
    description: 'Phase 2 connecting Hinjewadi IT hub, Kharadi, and Airport via 3 new corridors. 32 new stations expected to serve 800K daily commuters. Property values within 2km of stations projected to rise 25-35% during construction.',
    signalStrength: 92,
    affectedCities: ['Pune'],
    affectedCountries: ['India'],
    impactHorizon: 'medium_term',
    expectedImpactMonths: 48,
    aiConfidence: 90,
    sourceName: 'Maharashtra Metro Rail Corporation',
    isVerified: true,
    detectedAt: now.toISOString(),
  });

  // Demand spike — Riyadh
  signals.push({
    id: 'sig-demand-1',
    category: 'demand_spike',
    title: 'Riyadh residential demand index hits 5-year high — supply gap widens',
    description: 'Riyadh\'s residential demand index surged to 85.6 (vs 62.3 last year) driven by Vision 2030 migration and corporate relocations. Active inventory dropped to 4.2 months — well below the 8-month equilibrium. Rental increases of 15-20% expected.',
    signalStrength: 90,
    affectedCities: ['Riyadh'],
    affectedCountries: ['Saudi Arabia'],
    impactHorizon: 'short_term',
    expectedImpactMonths: 12,
    aiConfidence: 87,
    sourceName: 'Saudi General Authority for Statistics',
    isVerified: true,
    detectedAt: now.toISOString(),
  });

  // Land acquisition — London
  signals.push({
    id: 'sig-land-1',
    category: 'land_acquisition',
    title: 'Major land acquisition in London\'s Golden Triangle — 12-acre site',
    description: 'A 12-acre development site in London\'s Golden Triangle (King\'s Cross to Canary Wharf corridor) acquired by a consortium. Mixed-use development planned with 2,400 residential units and 500K sqft commercial space.',
    signalStrength: 76,
    affectedCities: ['London'],
    affectedCountries: ['United Kingdom'],
    impactHorizon: 'long_term',
    expectedImpactMonths: 60,
    aiConfidence: 78,
    sourceName: 'UK Land Registry',
    isVerified: true,
    detectedAt: now.toISOString(),
  });

  // Currency shock — Turkey
  signals.push({
    id: 'sig-currency-1',
    category: 'currency_shock',
    title: 'TRY volatility creates foreign investor opportunity — Istanbul luxury up 12%',
    description: 'Turkish Lira volatility has created a 40-50% discount for foreign buyers in USD terms. Istanbul luxury property transactions to foreign buyers up 12% despite local currency challenges. High-net-worth buyers from Gulf and Middle East leading.',
    signalStrength: 74,
    affectedCities: ['Istanbul'],
    affectedCountries: ['Turkey'],
    impactHorizon: 'immediate',
    expectedImpactMonths: 6,
    aiConfidence: 80,
    sourceName: 'Central Bank of Turkey',
    isVerified: true,
    detectedAt: now.toISOString(),
  });

  return signals;
}

// =====================
// SIGNAL RANKING
// =====================
export function rankSignals(signals: MarketSignal[]): MarketSignal[] {
  return [...signals].sort((a, b) => {
    // Higher strength + higher confidence = higher ranking
    const scoreA = a.signalStrength * 0.6 + a.aiConfidence * 0.4;
    const scoreB = b.signalStrength * 0.6 + b.aiConfidence * 0.4;
    return scoreB - scoreA;
  });
}
