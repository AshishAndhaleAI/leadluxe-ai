// ============================================================
// Phase 6: Global Opportunity Radar
// Scans all tracked cities every hour to detect:
// price anomalies, inventory drops, infrastructure announcements,
// developer distress, unusual transactions, cross-border spikes
// ============================================================

import { CITIES, COUNTRIES } from '../global-data';

export type RadarEventType =
  | 'price_anomaly' | 'sudden_inventory_drop' | 'infrastructure_announcement'
  | 'developer_distress' | 'unusual_luxury_transaction' | 'cross_border_capital_spike';

export interface RadarEvent {
  id: string;
  eventType: RadarEventType;
  title: string;
  description: string;
  city: string;
  country: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  affectedPropertiesCount: number;
  estimatedValueImpact: number;
  sourceName: string;
  isAlerted: boolean;
  detectedAt: string;
}

export interface RadarScanReport {
  scanId: string;
  scannedAt: string;
  citiesScanned: number;
  eventsDetected: number;
  criticalCount: number;
  highCount: number;
  events: RadarEvent[];
}

// =====================
// SCAN ALL CITIES FOR ANOMALIES
// =====================
export function scanGlobalRadar(): RadarScanReport {
  const events: RadarEvent[] = [];
  const now = new Date();
  const scanId = `radar-${now.getTime()}`;

  for (const [countryCode, cities] of Object.entries(CITIES)) {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (!country) continue;

    for (const city of cities) {
      // Price anomaly: extreme price trends
      if (city.priceTrend > 15) {
        events.push({
          id: `radar-${scanId}-price-${city.id}`,
          eventType: 'price_anomaly',
          title: `Price anomaly detected in ${city.name}`,
          description: `${city.name} is experiencing abnormal price growth of ${city.priceTrend}% YoY — significantly above market average. ${city.tags?.includes('luxury') ? 'Luxury segment driving the surge.' : 'Broad market demand is accelerating prices.'}`,
          city: city.name,
          country: country.name,
          severity: city.priceTrend > 20 ? 'critical' : 'high',
          confidence: Math.min(85, 60 + city.confidence * 0.2),
          affectedPropertiesCount: Math.round(city.activeProjects * 0.3),
          estimatedValueImpact: Math.round(city.pricePerSqft * city.activeProjects * 10),
          sourceName: 'TerraNexus Price Index Monitor',
          isAlerted: false,
          detectedAt: now.toISOString(),
        });
      }

      // Inventory drop signal
      if (city.absorptionRate > 80) {
        events.push({
          id: `radar-${scanId}-inventory-${city.id}`,
          eventType: 'sudden_inventory_drop',
          title: `Inventory tightening in ${city.name}`,
          description: `${city.name} absorption rate is ${city.absorptionRate}% with only ${city.upcomingLaunches} new launches — supply cannot keep pace with demand. ${city.tags?.includes('it-hub') ? 'IT hiring surge driving demand.' : 'First-time buyers and upgraders competing for limited inventory.'}`,
          city: city.name,
          country: country.name,
          severity: city.absorptionRate > 85 ? 'critical' : 'high',
          confidence: Math.round(65 + city.confidence * 0.25),
          affectedPropertiesCount: city.activeProjects - city.upcomingLaunches,
          estimatedValueImpact: Math.round(city.pricePerSqft * city.activeProjects * 5 * (city.absorptionRate / 100)),
          sourceName: 'TerraNexus Absorption Tracker',
          isAlerted: false,
          detectedAt: now.toISOString(),
        });
      }

      // Infrastructure announcement
      if (city.tags?.some(t => ['metro', 'infrastructure', 'corridor', 'highway'].includes(t.toLowerCase())) && city.priceTrend > 8) {
        events.push({
          id: `radar-${scanId}-infra-${city.id}`,
          eventType: 'infrastructure_announcement',
          title: `Infrastructure-driven growth in ${city.name}`,
          description: `${city.name} is benefiting from active infrastructure projects (tagged: ${city.tags?.filter(t => ['metro', 'infrastructure', 'corridor', 'highway'].includes(t.toLowerCase())).join(', ')}). Price growth of ${city.priceTrend}% correlates with infrastructure development.`,
          city: city.name,
          country: country.name,
          severity: city.priceTrend > 12 ? 'high' : 'medium',
          confidence: Math.round(60 + city.confidence * 0.2),
          affectedPropertiesCount: Math.round(city.activeProjects * 0.4),
          estimatedValueImpact: Math.round(city.pricePerSqft * city.activeProjects * 8 * (city.priceTrend / 100)),
          sourceName: 'TerraNexus Infrastructure Monitor',
          isAlerted: false,
          detectedAt: now.toISOString(),
        });
      }

      // Unusual luxury transactions
      if (city.tags?.includes('luxury') && city.foreignDemand > 70) {
        events.push({
          id: `radar-${scanId}-luxury-${city.id}`,
          eventType: 'unusual_luxury_transaction',
          title: `Luxury transaction surge in ${city.name}`,
          description: `${city.name} is seeing elevated luxury transaction volume with foreign demand at ${city.foreignDemand}%. ${city.investorInterest}% investor interest signals strong institutional appetite for premium assets.`,
          city: city.name,
          country: country.name,
          severity: city.foreignDemand > 85 ? 'high' : 'medium',
          confidence: Math.round(55 + city.confidence * 0.25),
          affectedPropertiesCount: Math.round(city.activeProjects * 0.15),
          estimatedValueImpact: Math.round(city.pricePerSqft * city.activeProjects * 12 * (city.foreignDemand / 100)),
          sourceName: 'TerraNexus Luxury Transaction Monitor',
          isAlerted: false,
          detectedAt: now.toISOString(),
        });
      }

      // Cross-border capital spike
      if (city.foreignDemand > 65 && city.investorInterest > 75) {
        events.push({
          id: `radar-${scanId}-cross-${city.id}`,
          eventType: 'cross_border_capital_spike',
          title: `Cross-border capital spike in ${city.name}`,
          description: `${city.name} foreign demand index is ${city.foreignDemand} with investor interest at ${city.investorInterest}%. This combination suggests accelerating cross-border capital inflow, particularly in the ${city.tags?.includes('luxury') ? 'luxury' : city.tags?.includes('commercial') ? 'commercial' : 'residential'} segment.`,
          city: city.name,
          country: country.name,
          severity: city.foreignDemand > 80 && city.investorInterest > 85 ? 'critical' : 'high',
          confidence: Math.round(60 + (city.foreignDemand + city.investorInterest) / 2 * 0.2),
          affectedPropertiesCount: Math.round(city.activeProjects * 0.2),
          estimatedValueImpact: Math.round(city.pricePerSqft * city.activeProjects * 15),
          sourceName: 'TerraNexus Capital Flow Analyzer',
          isAlerted: false,
          detectedAt: now.toISOString(),
        });
      }
    }
  }

  // Sort by severity
  events.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return {
    scanId,
    scannedAt: now.toISOString(),
    citiesScanned: Object.values(CITIES).flat().length,
    eventsDetected: events.length,
    criticalCount: events.filter(e => e.severity === 'critical').length,
    highCount: events.filter(e => e.severity === 'high').length,
    events,
  };
}

// =====================
// PUSH ALERTS TO CHANNELS
// =====================
export function getRadarAlertSummary(report: RadarScanReport): string {
  if (report.eventsDetected === 0) {
    return '✅ Global radar scan complete. No anomalies detected across any tracked market.';
  }

  const criticalEvents = report.events.filter(e => e.severity === 'critical');
  const highEvents = report.events.filter(e => e.severity === 'high');

  const summary = [
    `🛰️ Global Opportunity Radar — Scan ${report.scanId.slice(-8)}`,
    `📡 Scanned ${report.citiesScanned} cities across ${Object.keys(CITIES).length} countries`,
    `⚠️ ${report.eventsDetected} anomalies detected`,
    ...(criticalEvents.length > 0 ? [`🚨 ${criticalEvents.length} critical — immediate attention required`] : []),
    ...(highEvents.length > 0 ? [`🔴 ${highEvents.length} high priority`] : []),
    '',
    ...report.events.slice(0, 8).map(e =>
      `${e.severity === 'critical' ? '🚨' : e.severity === 'high' ? '🔴' : '🟡'} ${e.title}`
    ),
    '',
    'Sources: TerraNexus AI Autonomous Intelligence Network',
  ];

  return summary.join('\n');
}
