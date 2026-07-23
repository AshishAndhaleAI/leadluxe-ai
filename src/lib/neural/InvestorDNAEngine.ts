// ============================================================
// Phase 4: Investor DNA Engine
// 8 behavioral profiles that adapt recommendations, UI emphasis,
// and report language based on investor type
// ============================================================

export type InvestorProfileType =
  | 'yield_hunter'
  | 'capital_growth'
  | 'ultra_luxury_collector'
  | 'institutional_fund'
  | 'family_office'
  | 'nri_investor'
  | 'developer_syndicate'
  | 'reit_manager';

export interface InvestorDNAProfile {
  type: InvestorProfileType;
  name: string;
  description: string;
  icon: string;
  riskTolerance: number; // 0-100
  preferredAssetClasses: string[];
  preferredCountries: string[];
  minBudget: number;
  maxBudget: number;
  minYield: number;
  minAppreciation: number;
  holdingPeriodYears: number;
  maxLoanToValue: number;
  currencyPreferences: string[];
  behavioralTraits: Record<string, number>;
  adaptiveUISettings: {
    emphasizeYield: boolean;
    emphasizeAppreciation: boolean;
    emphasizeExclusivity: boolean;
    emphasizeData: boolean;
    emphasizeRisk: boolean;
    showCommissionProminently: boolean;
    languageStyle: 'professional' | 'conversational' | 'executive' | 'analytical';
    defaultReportSections: string[];
  };
}

// =====================
// 8 INVESTOR PROFILES
// =====================
export const INVESTOR_PROFILES: Record<InvestorProfileType, InvestorDNAProfile> = {
  yield_hunter: {
    type: 'yield_hunter',
    name: 'Yield Hunter',
    description: 'Focuses on maximum rental income and cash flow. Prefers stabilized assets with strong occupancy.',
    icon: '💰',
    riskTolerance: 40,
    preferredAssetClasses: ['commercial', 'residential_rental', 'student_housing', 'co-living'],
    preferredCountries: ['AE', 'GB', 'SG', 'US'],
    minBudget: 2000000,
    maxBudget: 50000000,
    minYield: 8,
    minAppreciation: 3,
    holdingPeriodYears: 10,
    maxLoanToValue: 70,
    currencyPreferences: ['AED', 'GBP', 'SGD', 'USD'],
    behavioralTraits: { income_focused: 90, risk_averse: 70, research_intensive: 60 },
    adaptiveUISettings: {
      emphasizeYield: true,
      emphasizeAppreciation: false,
      emphasizeExclusivity: false,
      emphasizeData: true,
      emphasizeRisk: true,
      showCommissionProminently: false,
      languageStyle: 'analytical',
      defaultReportSections: ['yield-analysis', 'comparable-rentals', 'occupancy-trends', 'expense-analysis'],
    },
  },
  capital_growth: {
    type: 'capital_growth',
    name: 'Capital Growth Seeker',
    description: 'Targets high-appreciation markets. Willing to accept lower yields for superior capital gains.',
    icon: '📈',
    riskTolerance: 65,
    preferredAssetClasses: ['luxury_residential', 'pre-launch', 'emerging_markets', 'land'],
    preferredCountries: ['IN', 'AE', 'SA', 'SG'],
    minBudget: 5000000,
    maxBudget: 100000000,
    minYield: 2,
    minAppreciation: 10,
    holdingPeriodYears: 5,
    maxLoanToValue: 60,
    currencyPreferences: ['INR', 'AED', 'SGD'],
    behavioralTraits: { growth_focused: 95, risk_tolerant: 65, market_timing_sensitive: 80 },
    adaptiveUISettings: {
      emphasizeYield: false,
      emphasizeAppreciation: true,
      emphasizeExclusivity: false,
      emphasizeData: true,
      emphasizeRisk: false,
      showCommissionProminently: true,
      languageStyle: 'executive',
      defaultReportSections: ['appreciation-forecast', 'infrastructure-impact', 'demand-trends', 'comparable-sales'],
    },
  },
  ultra_luxury_collector: {
    type: 'ultra_luxury_collector',
    name: 'Ultra Luxury Collector',
    description: 'Seeks trophy assets in prime global locations. Priority on exclusivity, brand, and scarcity.',
    icon: '💎',
    riskTolerance: 50,
    preferredAssetClasses: ['penthouse', 'villa', 'heritage', 'branded_residences'],
    preferredCountries: ['AE', 'US', 'GB', 'SG', 'FR'],
    minBudget: 50000000,
    maxBudget: 5000000000,
    minYield: 1,
    minAppreciation: 5,
    holdingPeriodYears: 7,
    maxLoanToValue: 40,
    currencyPreferences: ['USD', 'GBP', 'EUR', 'SGD', 'AED'],
    behavioralTraits: { exclusivity_driven: 95, brand_conscious: 90, privacy_focused: 85 },
    adaptiveUISettings: {
      emphasizeYield: false,
      emphasizeAppreciation: true,
      emphasizeExclusivity: true,
      emphasizeData: false,
      emphasizeRisk: false,
      showCommissionProminently: false,
      languageStyle: 'conversational',
      defaultReportSections: ['location-prestige', 'comparable-trophy-assets', 'architectural-significance', 'privacy-assessment'],
    },
  },
  institutional_fund: {
    type: 'institutional_fund',
    name: 'Institutional Fund',
    description: 'Deploys large capital into stabilized, income-producing assets. Requires extensive due diligence.',
    icon: '🏛️',
    riskTolerance: 35,
    preferredAssetClasses: ['commercial', 'office', 'logistics', 'data_centers', 'multifamily'],
    preferredCountries: ['US', 'GB', 'DE', 'SG', 'JP'],
    minBudget: 100000000,
    maxBudget: 10000000000,
    minYield: 6,
    minAppreciation: 3,
    holdingPeriodYears: 15,
    maxLoanToValue: 55,
    currencyPreferences: ['USD', 'EUR', 'GBP', 'JPY', 'SGD'],
    behavioralTraits: { risk_averse: 90, data_driven: 95, process_oriented: 90, esg_focused: 70 },
    adaptiveUISettings: {
      emphasizeYield: true,
      emphasizeAppreciation: false,
      emphasizeExclusivity: false,
      emphasizeData: true,
      emphasizeRisk: true,
      showCommissionProminently: false,
      languageStyle: 'professional',
      defaultReportSections: ['financial-analysis', 'risk-matrix', 'market-fundamentals', 'esg-assessment', 'exit-strategy'],
    },
  },
  family_office: {
    type: 'family_office',
    name: 'Family Office',
    description: 'Preserves and grows multi-generational wealth. Diversified holdings with long time horizons.',
    icon: '👑',
    riskTolerance: 45,
    preferredAssetClasses: ['mixed_use', 'luxury_residential', 'commercial', 'land_banking', 'hospitality'],
    preferredCountries: ['AE', 'US', 'GB', 'SG', 'CH', 'IN'],
    minBudget: 20000000,
    maxBudget: 500000000,
    minYield: 4,
    minAppreciation: 5,
    holdingPeriodYears: 20,
    maxLoanToValue: 45,
    currencyPreferences: ['USD', 'EUR', 'GBP', 'CHF', 'SGD', 'AED'],
    behavioralTraits: { wealth_preservation: 90, multi_generational: 85, relationship_driven: 80 },
    adaptiveUISettings: {
      emphasizeYield: true,
      emphasizeAppreciation: true,
      emphasizeExclusivity: false,
      emphasizeData: true,
      emphasizeRisk: true,
      showCommissionProminently: true,
      languageStyle: 'executive',
      defaultReportSections: ['wealth-preservation', 'diversification-analysis', 'currency-risk', 'legacy-planning'],
    },
  },
  nri_investor: {
    type: 'nri_investor',
    name: 'NRI Investor',
    description: 'Non-resident Indians investing in home country. Balances emotional connection with returns.',
    icon: '🌏',
    riskTolerance: 55,
    preferredAssetClasses: ['luxury_residential', 'commercial', 'pre-launch', 'rental'],
    preferredCountries: ['IN', 'AE', 'US'],
    minBudget: 5000000,
    maxBudget: 50000000,
    minYield: 4,
    minAppreciation: 8,
    holdingPeriodYears: 7,
    maxLoanToValue: 65,
    currencyPreferences: ['INR', 'USD', 'AED'],
    behavioralTraits: { emotional_connection: 70, currency_sensitive: 85, repatriation_focused: 75 },
    adaptiveUISettings: {
      emphasizeYield: true,
      emphasizeAppreciation: true,
      emphasizeExclusivity: false,
      emphasizeData: true,
      emphasizeRisk: true,
      showCommissionProminently: true,
      languageStyle: 'conversational',
      defaultReportSections: ['currency-impact', 'repatriation-analysis', 'market-comparison', 'legal-framework'],
    },
  },
  developer_syndicate: {
    type: 'developer_syndicate',
    name: 'Developer Syndicate',
    description: 'Groups of developers pooling resources for large-scale projects. Focus on JV structures.',
    icon: '🏗️',
    riskTolerance: 70,
    preferredAssetClasses: ['development_land', 'pre-launch', 'township', 'mixed_use'],
    preferredCountries: ['IN', 'AE', 'SA', 'US'],
    minBudget: 10000000,
    maxBudget: 200000000,
    minYield: 0,
    minAppreciation: 15,
    holdingPeriodYears: 4,
    maxLoanToValue: 75,
    currencyPreferences: ['INR', 'AED', 'USD'],
    behavioralTraits: { project_focused: 90, timeline_sensitive: 85, margin_conscious: 80 },
    adaptiveUISettings: {
      emphasizeYield: false,
      emphasizeAppreciation: true,
      emphasizeExclusivity: false,
      emphasizeData: true,
      emphasizeRisk: false,
      showCommissionProminently: true,
      languageStyle: 'professional',
      defaultReportSections: ['project-timeline', 'margin-analysis', 'regulatory-assessment', 'partner-evaluation'],
    },
  },
  reit_manager: {
    type: 'reit_manager',
    name: 'REIT Manager',
    description: 'Manages publicly traded or private REITs. Focus on dividend yield and portfolio metrics.',
    icon: '📊',
    riskTolerance: 40,
    preferredAssetClasses: ['commercial', 'office', 'industrial', 'retail', 'multifamily'],
    preferredCountries: ['US', 'GB', 'SG', 'JP', 'AU'],
    minBudget: 50000000,
    maxBudget: 1000000000,
    minYield: 6,
    minAppreciation: 3,
    holdingPeriodYears: 12,
    maxLoanToValue: 50,
    currencyPreferences: ['USD', 'GBP', 'SGD', 'JPY', 'AUD'],
    behavioralTraits: { yield_focused: 95, diversification_driven: 85, regulatory_compliant: 90 },
    adaptiveUISettings: {
      emphasizeYield: true,
      emphasizeAppreciation: false,
      emphasizeExclusivity: false,
      emphasizeData: true,
      emphasizeRisk: true,
      showCommissionProminently: false,
      languageStyle: 'analytical',
      defaultReportSections: ['portfolio-impact', 'dividend-analysis', 'sector-comparison', 'regulatory-compliance'],
    },
  },
};

// =====================
// ADAPT RECOMMENDATIONS FOR A PROFILE
// =====================
export function adaptRecommendationsForProfile<T extends Record<string, any>>(
  profile: InvestorDNAProfile,
  recommendations: T[],
  scoreField: keyof T
): T[] {
  const weights = profile.behavioralTraits;
  return [...recommendations].sort((a, b) => {
    const aScore = (a[scoreField] as number) || 0;
    const bScore = (b[scoreField] as number) || 0;
    return bScore - aScore;
  });
}

// =====================
// GET DISPLAY NAME FOR A TYPE
// =====================
export function getInvestorProfileLabel(type: InvestorProfileType): string {
  return INVESTOR_PROFILES[type]?.name || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
