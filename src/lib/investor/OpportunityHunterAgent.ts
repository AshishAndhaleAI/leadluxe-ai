// ============================================================
// Phase 7: Autonomous Opportunity Hunter Agent
// Daily discovery workflow — scans, detects, compares, estimates
// ============================================================

import { CITIES, COUNTRIES } from '../global-data';
import { computeInvestmentScore, deriveScoringInput } from './InvestmentScoringEngine';
import type { ScoringInput, ScoringResult } from './InvestmentScoringEngine';

export interface DiscoveredOpportunity {
  id: string;
  title: string;
  city: string;
  country: string;
  countryFlag: string;
  pricePerSqft: number;
  priceTrend: number;
  score: ScoringResult;
  estimatedValue: number;
  commission: number;
  discoveryReason: string;
  source: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  detectedAt: string;
  isNew: boolean;
}

export interface HunterRunReport {
  agentName: string;
  runAt: string;
  scanDuration: number;
  marketsScanned: number;
  opportunitiesFound: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  topDiscoveries: DiscoveredOpportunity[];
  errors: string[];
}

// =====================
// HUNTER AGENT
// =====================
export function runOpportunityHunter(): HunterRunReport {
  const startTime = Date.now();
  const discovered: DiscoveredOpportunity[] = [];
  const errors: string[] = [];

  // Scan all active cities in the database
  const allCities = Object.entries(CITIES).flatMap(([countryCode, cities]) =>
    cities.map(city => ({ ...city, countryCode }))
  );

  for (const city of allCities) {
    try {
      const input = deriveScoringInput(city);
      const score = computeInvestmentScore(input, city.pricePerSqft * 1000);
      const country = COUNTRIES.find(c => c.code === city.countryCode);

      // Only surface high-potential opportunities
      if (score.overallScore < 50) continue;

      const estimatedValue = city.pricePerSqft * 1200; // ~1200 sqft unit
      const commission = estimatedValue * 0.03;

      // Determine discovery reason
      let discoveryReason = '';
      if (score.overallScore >= 85) {
        discoveryReason = '🔥 Top-tier investment grade — multiple factors converging';
      } else if (score.factors.infrastructurePipeline >= 75) {
        discoveryReason = `🏗️ Infrastructure catalyst — ${city.tags?.filter(t => ['metro', 'corridor', 'highway'].includes(t.toLowerCase())).join(', ') || 'major projects'} driving value`;
      } else if (score.factors.priceMomentum >= 75) {
        discoveryReason = '📈 Strong price momentum — above-market appreciation';
      } else if (score.factors.foreignInvestmentFlow >= 70) {
        discoveryReason = '🌍 Foreign capital inflow — international demand driving market';
      } else if (score.factors.rentalYield >= 70) {
        discoveryReason = '💰 Attractive rental yield — strong income potential';
      } else {
        discoveryReason = '📊 Balanced fundamentals — steady growth profile';
      }

      const confidenceLevel: 'high' | 'medium' | 'low' =
        score.overallScore >= 75 && score.confidence >= 70 ? 'high' :
        score.overallScore >= 60 ? 'medium' : 'low';

      discovered.push({
        id: `hunter-${city.countryCode}-${city.id}`,
        title: `${city.name} — Premium ${city.tags?.find(t => ['luxury', 'premium', 'commercial'].includes(t)) || 'Residential'} Market`,
        city: city.name,
        country: country?.name || 'Unknown',
        countryFlag: country?.flag || '🌍',
        pricePerSqft: city.pricePerSqft,
        priceTrend: city.priceTrend,
        score,
        estimatedValue,
        commission,
        discoveryReason,
        source: 'LeadLuxe Autonomous Hunter — City Market Scan',
        confidenceLevel,
        detectedAt: new Date().toISOString(),
        isNew: true,
      });
    } catch (err) {
      errors.push(`Error scanning ${city.name}: ${err}`);
    }
  }

  // Sort by score descending
  discovered.sort((a, b) => b.score.overallScore - a.score.overallScore);

  const duration = Date.now() - startTime;

  return {
    agentName: 'Opportunity Hunter v1.0',
    runAt: new Date().toISOString(),
    scanDuration: duration,
    marketsScanned: allCities.length,
    opportunitiesFound: discovered.length,
    highConfidenceCount: discovered.filter(d => d.confidenceLevel === 'high').length,
    mediumConfidenceCount: discovered.filter(d => d.confidenceLevel === 'medium').length,
    lowConfidenceCount: discovered.filter(d => d.confidenceLevel === 'low').length,
    topDiscoveries: discovered.slice(0, 15),
    errors,
  };
}

// =====================
// DAILY SCAN SUMMARY
// =====================
export function getDailyScanSummary(report: HunterRunReport): string {
  if (report.opportunitiesFound === 0) {
    return 'No opportunities discovered in today\'s scan. Intelligence pipeline may be offline.';
  }

  const top = report.topDiscoveries.slice(0, 3);
  const summary = [
    `🤖 ${report.agentName}`,
    `📊 Scanned ${report.marketsScanned} markets across ${Object.keys(CITIES).length} countries`,
    `🎯 Discovered ${report.opportunitiesFound} opportunities (${report.highConfidenceCount} high-confidence, ${report.mediumConfidenceCount} medium)`,
    `⚡ Scan completed in ${(report.scanDuration / 1000).toFixed(1)}s`,
    '',
    '🏆 Top Discoveries:',
    ...top.map((d, i) =>
      `  ${i + 1}. ${d.countryFlag} ${d.city}, ${d.country} — Score: ${d.score.overallScore}/100 | Commission: ${formatCurrency(d.commission)} | ${d.discoveryReason.split('—')[0]}`
    ),
    '',
    report.errors.length > 0 ? `⚠️ ${report.errors.length} errors during scan` : '✅ Scan completed without errors',
  ];

  return summary.join('\n');
}

function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
}
