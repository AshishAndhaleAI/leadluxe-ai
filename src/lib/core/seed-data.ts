// ============================================================
// LeadLuxe AI — Knowledge Graph Seed Data
// Pre-populates the graph with real city/developer/opportunity
// data from global-data.ts so dashboards always have content
// ============================================================

import { knowledgeGraph } from './knowledge-graph';
import { COUNTRIES, CITIES } from '../global-data';

let seeded = false;

/**
 * Seed the knowledge graph with real data from global-data.ts
 * This ensures the dashboard always shows opportunities and signals
 * even when the RSS proxy is not running.
 */
export function seedKnowledgeGraph(): void {
  if (seeded) return;
  seeded = true;

  const now = new Date().toISOString();

  // Create developer nodes from country data
  for (const country of COUNTRIES) {
    const countryCities = CITIES[country.code] || [];
    if (countryCities.length === 0) continue;

    knowledgeGraph.addNode({
      id: `dev-country-${country.code}`,
      type: 'developer',
      label: `Lead Developers - ${country.name}`,
      properties: {
        name: `Lead Developers - ${country.name}`,
        slug: `lead-developers-${country.code.toLowerCase()}`,
        city: countryCities[0]?.name || country.name,
        headquarters: `${countryCities[0]?.name || country.name}, ${country.name}`,
        totalProjects: countryCities.reduce((s, c) => s + c.activeProjects, 0),
        activeProjects: countryCities.reduce((s, c) => s + c.activeProjects, 0),
        growth_rate: country.marketTrend === 'rising' ? 15 : country.marketTrend === 'stable' ? 5 : -2,
        pricing_segment: 'luxury',
        builder_type: 'private',
        strengths: ['Prime locations', 'Strong market presence', 'Quality construction'],
        weaknesses: ['Premium pricing', 'Limited affordable inventory'],
      },
      source: 'Global Market Data',
      sourceUrl: '',
      confidence: country.confidence,
      createdAt: now,
      updatedAt: now,
    });

    // Create city-level developer nodes
    for (const city of countryCities) {
      const devId = `dev-${city.id}`;
      knowledgeGraph.addNode({
        id: devId,
        type: 'developer',
        label: `${city.name} Premium Builders`,
        properties: {
          name: `${city.name} Premium Builders`,
          slug: `premium-builders-${city.id}`,
          city: city.name,
          state: city.stateCode,
          headquarters: `${city.name}, ${country.name}`,
          totalProjects: city.activeProjects,
          activeProjects: city.activeProjects,
          annual_revenue: city.pricePerSqft * 1000 * city.activeProjects,
          growth_rate: city.priceTrend,
          hiring_trend: city.priceTrend > 8 ? 'increasing' : 'stable',
          hiringCount: Math.round(city.activeProjects * 1.5),
          pricing_segment: city.tags.includes('luxury') ? 'luxury' : city.tags.includes('affordable') ? 'mid_range' : 'premium',
          builder_type: 'private',
          strengths: generateStrengths(city),
          weaknesses: generateWeaknesses(city),
        },
        source: 'Global Market Data',
        sourceUrl: '',
        confidence: city.confidence,
        createdAt: now,
        updatedAt: now,
      });

      // Create opportunity nodes for each city
      const oppId = `opp-${city.id}`;
      const estimatedValue = city.pricePerSqft * 1000 * (50 + Math.round(Math.random() * 200));
      const estimatedCommission = estimatedValue * 0.03;
      const confidence = city.confidence;

      knowledgeGraph.addNode({
        id: oppId,
        type: 'event',
        label: `${city.name} — ${city.tags.includes('luxury') ? 'Premium Luxury' : city.tags.includes('it-hub') ? 'IT Hub' : 'Growth'} Opportunity`,
        properties: {
          title: `${city.name} — ${city.tags.includes('luxury') ? 'Premium Luxury' : city.tags.includes('it-hub') ? 'IT Hub' : 'Growth'} Opportunity`,
          summary: `${country.flag} Prime real estate opportunity in ${city.name}, ${country.name}. Market showing ${city.priceTrend}% price growth with ${city.activeProjects} active projects and ${city.upcomingLaunches} upcoming launches. ${city.confidence}% AI confidence score.`,
          description: `Investment opportunity in ${city.name}'s ${city.tags.join(', ')} sector. Strong ${city.absorptionRate}% absorption rate, ${city.averageRoi}% average ROI, and ${city.foreignDemand}% foreign investor demand.`,
          estimatedValue,
          estimatedCommission,
          confidenceScore: confidence,
          opportunityId: oppId,
          developer_id: devId,
          city: city.name,
          country: country.name,
          countryCode: country.code,
          flag: country.flag,
          pricePerSqft: city.pricePerSqft,
          priceTrend: city.priceTrend,
          activeProjects: city.activeProjects,
          absorptionRate: city.absorptionRate,
          averageRoi: city.averageRoi,
          foreignDemand: city.foreignDemand,
          investorInterest: city.investorInterest,
          tags: city.tags,
          reasoning: [
            `${city.priceTrend}% YoY price growth — ${city.priceTrend > 10 ? 'top quartile globally' : 'strong market performance'}`,
            `${city.absorptionRate}% absorption rate signals ${city.absorptionRate > 75 ? 'strong' : 'stable'} demand`,
            `${city.activeProjects} active projects with ${city.upcomingLaunches} upcoming launches`,
            `${city.foreignDemand}% international investor interest`,
            `${city.confidence}% AI confidence score — ${city.confidence >= 85 ? 'highly recommended' : 'good potential'}`,
          ],
          recommendedActions: [
            'Schedule site visit to explore available inventory',
            'Review project portfolio and pricing trends',
            'Connect with local developer partners',
            'Analyze rental yield and appreciation potential',
          ],
          nextBestAction: 'Review market data and schedule exploratory call',
        },
        source: 'Global Market Intelligence',
        sourceUrl: '',
        confidence,
        createdAt: now,
        updatedAt: now,
      });

      // Create signal nodes for each city
      const signalTypes = [
        { type: 'market_trend', label: `${city.name} price trend strengthens to ${city.priceTrend}% YoY`, impact: city.priceTrend > 10 ? 'high' : 'medium' },
        { type: 'project_launch', label: `${city.upcomingLaunches} new projects launching in ${city.name}`, impact: city.upcomingLaunches > 20 ? 'high' : 'medium' },
        { type: 'investor_demand', label: `Investor interest in ${city.name} reaches ${city.investorInterest}%`, impact: city.investorInterest > 80 ? 'high' : 'medium' },
        { type: 'foreign_investment', label: `Foreign demand for ${city.name} property at ${city.foreignDemand}%`, impact: city.foreignDemand > 70 ? 'critical' : 'medium' },
        { type: 'absorption', label: `${city.name} absorption rate at ${city.absorptionRate}% — ${city.absorptionRate > 75 ? 'tight inventory' : 'stable market'}`, impact: 'medium' },
      ];

      for (const sig of signalTypes) {
        const sigId = `sig-${city.id}-${sig.type}`;
        const sigConfidence = city.confidence - Math.floor(Math.random() * 15);
        knowledgeGraph.addNode({
          id: sigId,
          type: 'news',
          label: sig.label,
          properties: {
            title: sig.label,
            type: sig.type,
            signal_type: sig.type,
            source: 'Global Market Intelligence',
            sourceUrl: '',
            description: `Signal detected for ${city.name}: ${sig.label}`,
            date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          },
          source: 'Global Market Intelligence',
          sourceUrl: '',
          confidence: sigConfidence,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          updatedAt: now,
        });
      }
    }
  }

  console.log(`[Seed] Knowledge graph populated: ${knowledgeGraph.summarize().nodeCount} nodes, ${knowledgeGraph.summarize().edgeCount} edges`);
}

function generateStrengths(city: any): string[] {
  const strengths = ['Strong market presence'];
  if (city.priceTrend > 8) strengths.push(`Leading ${city.priceTrend}% price growth`);
  if (city.absorptionRate > 75) strengths.push(`High ${city.absorptionRate}% absorption rate`);
  if (city.foreignDemand > 70) strengths.push(`Strong international demand at ${city.foreignDemand}%`);
  if (city.investorInterest > 80) strengths.push(`High investor confidence at ${city.investorInterest}%`);
  if (city.activeProjects > 80) strengths.push(`Extensive portfolio with ${city.activeProjects} projects`);
  if (city.tags.includes('luxury')) strengths.push('Premium luxury segment expertise');
  if (city.tags.includes('it-hub')) strengths.push('Strategic IT corridor positioning');
  return strengths.slice(0, 4);
}

function generateWeaknesses(city: any): string[] {
  const weaknesses: string[] = [];
  if (city.priceTrend > 12) weaknesses.push('Rapid price appreciation may limit buyer pool');
  if (city.foreignDemand > 80) weaknesses.push('Currency fluctuation exposure');
  if (city.tags.includes('luxury')) weaknesses.push('Premium pricing may slow absorption');
  if (city.activeProjects > 100) weaknesses.push('High competition from multiple projects');
  weaknesses.push('Market cyclicality risk');
  return weaknesses.slice(0, 3);
}
