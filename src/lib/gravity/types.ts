// ============================================================
// TerraNexus AI — Investment Gravity Engine Types
// Predictive capital flow intelligence for real estate
// ============================================================

/** Categories of signals that feed into the Gravity Score */
export type GravitySignalCategory =
  | 'infrastructure_velocity'
  | 'employment_gravity'
  | 'market_inefficiency'
  | 'capital_magnetism'
  | 'demographic_pull';

/** A single detected signal feeding the gravity score */
export interface GravitySignal {
  id: string;
  category: GravitySignalCategory;
  label: string;
  detail: string;
  weight: number;        // 0-1 importance within its category
  value: number;         // Raw signal value
  normalizedScore: number; // 0-100 normalized
  direction: 'positive' | 'negative' | 'neutral';
  sourceUrl?: string;
  timestamp: string;
}

/** A micro-market corridor (neighborhood/district level) */
export interface MicroMarket {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  countryCode: string;
  countryFlag: string;
  countryName: string;
  latitude: number;
  longitude: number;

  // Core metrics used by the engine
  pricePerSqft: number;
  priceTrend: number;        // % YoY
  absorptionRate: number;     // % of inventory absorbed
  averageRoi: number;         // % expected return
  foreignDemand: number;      // % foreign buyer interest
  investorInterest: number;   // % investor demand
  activeProjects: number;
  upcomingLaunches: number;
  confidence: number;         // City-level confidence (0-100)

  // Computed by the engine
  gravityScore: number;            // 0-100 overall
  predictedAppreciation: number;   // Predicted % 12-month appreciation
  optimalEntryWindow: string;      // e.g. "Q2 2026"
  riskLevel: 'low' | 'medium' | 'high';
  capitalAtRisk: number;           // Estimated capital required
  expectedCommission: number;      // Commission if deal closes
  signals: GravitySignal[];        // Detected signals for this market
}

/** Category breakdown of the gravity score */
export interface GravityCategoryScore {
  category: GravitySignalCategory;
  label: string;
  icon: string;
  score: number;          // 0-100
  weight: number;         // Weight in overall score
  signalCount: number;
  topSignal: string;
  description: string;
}

/** The full gravity analysis for a market */
export interface GravityAnalysis {
  microMarket: MicroMarket;
  categoryScores: GravityCategoryScore[];
  overallScore: number;
  predictedAppreciation: number;
  confidence: number;
  rank: number;              // Rank among all tracked markets
  outOf: number;             // Total tracked markets
  isUndervalued: boolean;    // Score > confidence (market is underpriced)
  isOvervalued: boolean;     // Score < confidence (market may be priced in)
  optimalAction: string;     // Recommended action
  reasoning: string[];       // Why this market scored this way
}

/** User preferences for the gravity engine */
export interface GravityPreferences {
  minScore: number;
  maxRisk: 'low' | 'medium' | 'high';
  preferredCountries: string[];
  preferredCities: string[];
  minBudget: number;
  maxBudget: number;
  investmentGoal: 'appreciation' | 'rental' | 'flip' | 'development';
  holdingPeriodMonths: number;
}

/** Pre-computed gravity market rankings */
export interface GravityRankings {
  generatedAt: string;
  totalMarkets: number;
  topMarkets: GravityAnalysis[];
  emergingMarkets: GravityAnalysis[];  // High score, low current price
  undervaluedMarkets: GravityAnalysis[]; // Score > price trend
  highestMomentum: GravityAnalysis[];     // Fastest improving scores
}
