// ============================================================
// TerraNexus AI — Closing Probability Analysis
// Predicts the likelihood that a deal in a given market
// will close within 30 days.
//
// Factors:
//   - Gravity score (higher = better conditions)
//   - Market confidence (sentiment alignment)
//   - Price momentum (strong momentum = faster decisions)
//   - Absorption rate (faster absorption = shorter decision cycles)
//   - Seasonality (certain months have higher closing rates)
//   - Market volatility (high volatility = lower probability)
// ============================================================

export interface ClosingProbability {
  probability30d: number;           // 0-100% probability of closing in 30 days
  probability90d: number;           // 0-100% probability of closing in 90 days
  probability180d: number;          // 0-100% probability of closing in 180 days
  estimatedDaysToClose: number;     // Estimated days until deal closes
  keyFactors: string[];             // Factors influencing the probability
  seasonalAdjustment: number;       // Seasonal boost/penalty (percentage points)
  confidenceInterval: [number, number]; // 90% confidence interval [low, high]
  recommendation: string;           // What to do based on probability
}

interface CityInput {
  id: string;
  name: string;
  pricePerSqft: number;
  priceTrend: number;
  absorptionRate: number;
  averageRoi: number;
  investorInterest: number;
  confidence: number;
  tags: string[];
}

export function computeClosingProbability(
  gravityScore: number,
  marketConfidence: number,
  priceTrend: number,
): ClosingProbability {
  // ============================================================
  // BASE PROBABILITY FROM GRAVITY SCORE
  // ============================================================
  // Gravity score maps to base probability:
  //   90+ → 65% (high conviction)
  //   80  → 50%
  //   70  → 38%
  //   60  → 28%
  //   50  → 20%
  //   40  → 14%
  //   30  → 10%
  //   20  → 7%
  //   10  → 5%

  const baseProbability30d = Math.min(65, Math.max(5,
    Math.round(5 * Math.exp(gravityScore * 0.025))
  ));

  // ============================================================
  // CONFIDENCE ALIGNMENT ADJUSTMENT
  // ============================================================
  // Gravity score vs market confidence alignment
  // Aligned = higher probability (buyers & sellers agree on price)
  // Misaligned = lower probability (negotiation gap)
  const scoreDiff = gravityScore - marketConfidence;
  let alignmentAdjustment = 0;
  if (Math.abs(scoreDiff) < 5) {
    alignmentAdjustment = 8; // Aligned = boost
  } else if (Math.abs(scoreDiff) < 15) {
    alignmentAdjustment = 3; // Slightly misaligned = small boost
  } else if (scoreDiff > 15) {
    alignmentAdjustment = -5; // Undervalued = sellers hesitant
  } else {
    alignmentAdjustment = -10; // Overvalued = buyers hesitant
  }

  // ============================================================
  // PRICE MOMENTUM ADJUSTMENT
  // ============================================================
  // Strong price momentum = urgency = faster closing
  let momentumAdjustment = 0;
  if (priceTrend > 12) {
    momentumAdjustment = 10; // FOMO = faster decisions
  } else if (priceTrend > 8) {
    momentumAdjustment = 5;
  } else if (priceTrend < 2) {
    momentumAdjustment = -8; // Stagnant market = longer decisions
  } else if (priceTrend < 0) {
    momentumAdjustment = -15; // Declining = buyers wait
  }

  // ============================================================
  // SEASONALITY ADJUSTMENT
  // ============================================================
  const month = new Date().getMonth(); // 0-11
  // Indian real estate: Mar-Sep is peak (spring/summer/post-monsoon)
  // Oct-Feb is slower (festival/winter)
  const seasonalAdjustment = (month >= 2 && month <= 8) ? 5 : -3;

  // ============================================================
  // VOLATILITY PENALTY
  // ============================================================
  // High price trend volatility = uncertainty = lower probability
  const volatilityPenalty = priceTrend > 15 ? -8 :
    priceTrend < -5 ? -12 : 0;

  // ============================================================
  // FINAL 30-DAY PROBABILITY
  // ============================================================
  const probability30d = Math.min(95, Math.max(1,
    baseProbability30d + alignmentAdjustment + momentumAdjustment + seasonalAdjustment + volatilityPenalty
  ));

  // ============================================================
  // MULTI-TIMEFRAME PROBABILITIES
  // ============================================================
  // 90-day = ~1.8x 30-day (cumulative)
  // 180-day = ~2.5x 30-day
  const multiplier90d = 1.8 + (probability30d > 50 ? 0.2 : -0.1);
  const multiplier180d = 2.5 + (probability30d > 50 ? 0.3 : -0.2);
  const probability90d = Math.min(99, Math.round(probability30d * multiplier90d));
  const probability180d = Math.min(99, Math.round(probability30d * multiplier180d));

  // ============================================================
  // ESTIMATED DAYS TO CLOSE
  // ============================================================
  const estimatedDaysToClose = Math.max(15, Math.round(
    90 - (probability30d * 0.8) + Math.abs(alignmentAdjustment) * 2
  ));

  // ============================================================
  // KEY FACTORS
  // ============================================================
  const keyFactors: string[] = [];
  if (alignmentAdjustment > 0) keyFactors.push(`Market confidence aligned with gravity score (+${alignmentAdjustment} pts)`);
  if (alignmentAdjustment < 0) keyFactors.push(`Gravity-confidence gap (${scoreDiff > 0 ? 'undervalued' : 'overvalued'}) — negotiation friction likely`);
  if (momentumAdjustment > 0) keyFactors.push(`Price momentum (${priceTrend}% YoY) creating buyer urgency (+${momentumAdjustment} pts)`);
  if (momentumAdjustment < 0) keyFactors.push(`Weak price momentum (${priceTrend}%) — buyers in wait-and-watch mode`);
  if (seasonalAdjustment > 0) keyFactors.push(`Peak season — faster decision cycles (+${seasonalAdjustment} pts)`);
  if (seasonalAdjustment < 0) keyFactors.push(`Off-peak season — typically slower closings (${seasonalAdjustment} pts)`);
  keyFactors.push(`Base probability: ${baseProbability30d}% from gravity score of ${gravityScore}`);

  // ============================================================
  // CONFIDENCE INTERVAL
  // ============================================================
  const confidenceWidth = 15 - Math.round(probability30d * 0.08);
  const low = Math.max(1, probability30d - confidenceWidth);
  const high = Math.min(99, probability30d + confidenceWidth);

  // ============================================================
  // RECOMMENDATION
  // ============================================================
  let recommendation: string;
  if (probability30d >= 50) {
    recommendation = `High closing probability (${probability30d}%). Prioritize site visits and negotiation. Estimated close in ${estimatedDaysToClose} days.`;
  } else if (probability30d >= 30) {
    recommendation = `Moderate probability (${probability30d}%). Nurture lead with weekly follow-ups. Re-assess after ${estimatedDaysToClose} days.`;
  } else {
    recommendation = `Low probability (${probability30d}%). Consider lower-effort channels. Re-score in 30 days — conditions may improve.`;
  }

  return {
    probability30d,
    probability90d,
    probability180d,
    estimatedDaysToClose,
    keyFactors,
    seasonalAdjustment,
    confidenceInterval: [low, high],
    recommendation,
  };
}
