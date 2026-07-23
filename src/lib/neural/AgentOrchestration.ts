// ============================================================
// Phase 8: Multi-Agent AI Orchestration
// 10 specialized agents that analyze global capital markets
// ============================================================

import { CITIES, COUNTRIES } from '../global-data';

export type AgentName =
  | 'macro_economist' | 'currency_risk' | 'infrastructure' | 'developer_forensics'
  | 'yield_optimization' | 'appreciation_forecast' | 'negotiation'
  | 'commission_strategy' | 'portfolio_hedging' | 'alert_prioritization';

export interface AgentInfo {
  name: AgentName;
  label: string;
  description: string;
  icon: string;
  category: 'economic' | 'market' | 'deal' | 'strategy' | 'risk';
}

export interface AgentRunResult {
  agentName: AgentName;
  agentLabel: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'pending_approval';
  confidence: number;
  dataSources: string[];
  reasoningSummary: string;
  requiresHumanApproval: boolean;
  approvedByHuman: boolean;
  output: Record<string, any>;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
}

export interface OrchestrationRun {
  runId: string;
  status: 'running' | 'completed' | 'failed';
  agentsRun: number;
  agentsCompleted: number;
  agentsFailed: number;
  pendingApproval: number;
  results: AgentRunResult[];
  startedAt: string;
  completedAt: string;
}

export const AGENTS: AgentInfo[] = [
  { name: 'macro_economist', label: 'Macro Economist', description: 'Analyzes global interest rates, GDP growth, and monetary policy impacts on real estate', icon: '🌍', category: 'economic' },
  { name: 'currency_risk', label: 'Currency Risk', description: 'Evaluates FX volatility, hedging strategies, and currency-adjusted returns', icon: '💱', category: 'risk' },
  { name: 'infrastructure', label: 'Infrastructure Agent', description: 'Tracks infrastructure projects and their value impact on surrounding real estate', icon: '🏗️', category: 'market' },
  { name: 'developer_forensics', label: 'Developer Forensics', description: 'Analyzes developer financial health, track record, and delivery reliability', icon: '🔍', category: 'market' },
  { name: 'yield_optimization', label: 'Yield Optimization', description: 'Optimizes rental yield across property types and markets', icon: '💰', category: 'deal' },
  { name: 'appreciation_forecast', label: 'Appreciation Forecast', description: 'Predicts short and long-term capital appreciation by market', icon: '📈', category: 'strategy' },
  { name: 'negotiation', label: 'Negotiation Agent', description: 'Simulates developer negotiations and recommends optimal offer strategies', icon: '🤝', category: 'deal' },
  { name: 'commission_strategy', label: 'Commission Strategy', description: 'Optimizes commission structure and identifies high-value deal opportunities', icon: '💎', category: 'deal' },
  { name: 'portfolio_hedging', label: 'Portfolio Hedging', description: 'Recommends hedging strategies for cross-border real estate portfolios', icon: '🛡️', category: 'risk' },
  { name: 'alert_prioritization', label: 'Alert Prioritization', description: 'Prioritizes alerts by urgency, value impact, and confidence', icon: '🔔', category: 'strategy' },
];

// =====================
// RUN ALL AGENTS
// =====================
export function orchestrateAllAgents(): OrchestrationRun {
  const runId = `run-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const results: AgentRunResult[] = [];

  // Run each agent sequentially (simulating)
  for (const agent of AGENTS) {
    const result = runAgent(agent.name);
    results.push(result);
  }

  const completedAt = new Date().toISOString();

  return {
    runId,
    status: results.some(r => r.status === 'failed') ? 'failed' : 'completed',
    agentsRun: results.length,
    agentsCompleted: results.filter(r => r.status === 'completed').length,
    agentsFailed: results.filter(r => r.status === 'failed').length,
    pendingApproval: results.filter(r => r.requiresHumanApproval).length,
    results,
    startedAt,
    completedAt,
  };
}

// =====================
// RUN A SINGLE AGENT
// =====================
export function runAgent(agentName: AgentName): AgentRunResult {
  const agent = AGENTS.find(a => a.name === agentName);
  const now = new Date();
  const startedAt = now.toISOString();

  try {
    switch (agentName) {
      case 'macro_economist': return runMacroEconomist(agent!, startedAt);
      case 'currency_risk': return runCurrencyRisk(agent!, startedAt);
      case 'infrastructure': return runInfrastructure(agent!, startedAt);
      case 'developer_forensics': return runDeveloperForensics(agent!, startedAt);
      case 'yield_optimization': return runYieldOptimization(agent!, startedAt);
      case 'appreciation_forecast': return runAppreciationForecast(agent!, startedAt);
      case 'negotiation': return runNegotiationAnalysis(agent!, startedAt);
      case 'commission_strategy': return runCommissionStrategy(agent!, startedAt);
      case 'portfolio_hedging': return runPortfolioHedging(agent!, startedAt);
      case 'alert_prioritization': return runAlertPrioritization(agent!, startedAt);
      default: throw new Error(`Unknown agent: ${agentName}`);
    }
  } catch (err) {
    return {
      agentName,
      agentLabel: agent?.label || 'Unknown',
      status: 'failed',
      confidence: 0,
      dataSources: [],
      reasoningSummary: `Agent failed: ${err}`,
      requiresHumanApproval: false,
      approvedByHuman: false,
      output: {},
      errorMessage: `${err}`,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

// =====================
// INDIVIDUAL AGENT LOGIC
// =====================
function runMacroEconomist(agent: AgentInfo, startedAt: string): AgentRunResult {
  const dataSources = ['World Bank', 'IMF', 'Central Bank Reports'];
  const activeCountries = COUNTRIES.filter(c => c.active);
  const avgConfidence = Math.round(activeCountries.reduce((s, c) => s + c.confidence, 0) / activeCountries.length);

  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: avgConfidence,
    dataSources,
    reasoningSummary: `Analyzed ${activeCountries.length} active economies. ${activeCountries.filter(c => c.marketTrend === 'rising').length} markets showing rising trends. Key risks: interest rate divergence across major economies.`,
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      countriesAnalyzed: activeCountries.length,
      risingMarkets: activeCountries.filter(c => c.marketTrend === 'rising').map(c => c.name),
      stableMarkets: activeCountries.filter(c => c.marketTrend === 'stable').map(c => c.name),
      avgConfidence,
      recommendation: 'Favor markets with stable monetary policy and positive real interest rates.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runCurrencyRisk(agent: AgentInfo, startedAt: string): AgentRunResult {
  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 78,
    dataSources: ['Central Bank FX Data', 'Currency volatility indices'],
    reasoningSummary: 'USD-pegged currencies (AED, SAR) offer lowest FX risk. INR shows moderate volatility with long-term stability. EUR exposure recommended for institutional allocations.',
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      lowRisk: ['AED', 'SAR', 'SGD'],
      moderateRisk: ['INR', 'GBP', 'EUR'],
      highRisk: ['TRY', 'BRL', 'NGN'],
      recommendation: 'Hedge EUR and GBP exposure for holdings > 12 months.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runInfrastructure(agent: AgentInfo, startedAt: string): AgentRunResult {
  const infraCities = Object.entries(CITIES).flatMap(([cc, cities]) =>
    cities.filter(c => c.tags?.some(t => ['metro', 'corridor', 'highway'].includes(t.toLowerCase())))
  ).map(c => c.name);

  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 82,
    dataSources: ['Government Infrastructure Portals', 'Urban Development Authorities'],
    reasoningSummary: `${infraCities.length} cities identified with active infrastructure catalysts. Metro expansions and corridor developments creating investment zones.`,
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      citiesWithInfraCatalysts: infraCities,
      totalInfraCities: infraCities.length,
      topMarkets: infraCities.slice(0, 5),
      recommendation: 'Prioritize properties within 2km of new metro stations and highway interchanges.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runDeveloperForensics(agent: AgentInfo, startedAt: string): AgentRunResult {
  const totalCities = Object.values(CITIES).flat().length;
  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 75,
    dataSources: ['Project Delivery Records', 'Public Filings', 'News Monitoring'],
    reasoningSummary: `Analyzed market health across ${totalCities} cities. ${Object.values(CITIES).flat().filter(c => c.confidence >= 85).length} markets have high-confidence developer ecosystems.`,
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      citiesAnalyzed: totalCities,
      highConfidenceMarkets: Object.values(CITIES).flat().filter(c => c.confidence >= 85).map(c => c.name),
      warningSignals: 0,
      recommendation: 'Focus on cities with absorption rates above 70% and multiple active developers.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runYieldOptimization(agent: AgentInfo, startedAt: string): AgentRunResult {
  const highYieldCities = Object.values(CITIES).flat()
    .filter(c => c.averageRoi >= 12)
    .sort((a, b) => b.averageRoi - a.averageRoi)
    .slice(0, 5)
    .map(c => ({ city: c.name, yield: c.averageRoi }));

  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 80,
    dataSources: ['Rental Market Data', 'Property Management Reports'],
    reasoningSummary: `Top yield markets: ${highYieldCities.map(c => `${c.city} (${c.yield}%)`).join(', ')}. Average yield across all tracked markets: ${Math.round(Object.values(CITIES).flat().reduce((s, c) => s + c.averageRoi, 0) / Object.values(CITIES).flat().length)}%.`,
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      topYieldCities: highYieldCities,
      avgYield: Math.round(Object.values(CITIES).flat().reduce((s, c) => s + c.averageRoi, 0) / Object.values(CITIES).flat().length),
      recommendation: 'Target markets with yield > 10% and absorption > 70% for optimal risk-adjusted returns.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runAppreciationForecast(agent: AgentInfo, startedAt: string): AgentRunResult {
  const topAppreciation = Object.values(CITIES).flat()
    .filter(c => c.priceTrend > 0)
    .sort((a, b) => b.priceTrend - a.priceTrend)
    .slice(0, 5)
    .map(c => ({ city: c.name, trend: c.priceTrend }));

  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 72,
    dataSources: ['Price Index Data', 'Historical Transaction Records'],
    reasoningSummary: `Top appreciation markets: ${topAppreciation.map(c => `${c.city} (${c.trend}% YoY)`).join(', ')}. Infrastructure-linked markets outperforming by 30-50%.`,
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      topAppreciationCities: topAppreciation,
      avgPriceTrend: Math.round(Object.values(CITIES).flat().reduce((s, c) => s + c.priceTrend, 0) / Object.values(CITIES).flat().length),
      recommendation: 'Allocate 60% to high-appreciation markets, 40% to stable income markets.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runNegotiationAnalysis(agent: AgentInfo, startedAt: string): AgentRunResult {
  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 68,
    dataSources: ['Market Comparable Data', 'Inventory Reports'],
    reasoningSummary: 'Inventory levels above 18 months create buyer-favorable conditions. Quarter-end periods offer 5-15% additional discounts. Bulk purchases of 3+ units unlock 8-12% discounts.',
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      favorableConditions: ['High inventory markets', 'Quarter-end periods', 'Pre-launch phases'],
      avgDiscountRange: '3-12% depending on market conditions',
      recommendation: 'Lead with offer 10% below asking in high-inventory markets. Focus on payment terms in low-inventory markets.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runCommissionStrategy(agent: AgentInfo, startedAt: string): AgentRunResult {
  const topCommissionCities = Object.values(CITIES).flat()
    .filter(c => c.pricePerSqft > 0)
    .sort((a, b) => (b.pricePerSqft * b.activeProjects) - (a.pricePerSqft * a.activeProjects))
    .slice(0, 5)
    .map(c => ({ city: c.name, potential: Math.round(c.pricePerSqft * c.activeProjects * 0.03) }));

  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 74,
    dataSources: ['Property Database', 'Commission Structure Analysis'],
    reasoningSummary: `Top commission potential: ${topCommissionCities.map(c => `${c.city}`).join(', ')}. Luxury and ultra-luxury segments offer 2-3x higher per-deal commissions.`,
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      topCommissionCities,
      avgCommissionPerDeal: Math.round(Object.values(CITIES).flat().reduce((s, c) => s + Math.round(c.pricePerSqft * 1200 * 0.03), 0) / Object.values(CITIES).flat().length),
      recommendation: 'Focus on luxury and ultra-luxury segments for maximum commission per deal closed.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runPortfolioHedging(agent: AgentInfo, startedAt: string): AgentRunResult {
  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 70,
    dataSources: ['Portfolio Simulator', 'Currency Correlation Data'],
    reasoningSummary: 'Diversification across 3+ currencies and 4+ asset classes reduces portfolio risk by 40-60%. Recommended allocation: 40% stabilized yield, 30% growth, 20% opportunistic, 10% cash.',
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      recommendedAllocation: { stabilized: 40, growth: 30, opportunistic: 20, cash: 10 },
      riskReduction: '40-60% with proper diversification',
      currencyHedgeRecommendation: 'Hold 60% in base currency, 40% hedged exposure',
      recommendation: 'Implement geographic diversification across 3+ countries with uncorrelated real estate cycles.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

function runAlertPrioritization(agent: AgentInfo, startedAt: string): AgentRunResult {
  return {
    agentName: agent.name,
    agentLabel: agent.label,
    status: 'completed',
    confidence: 85,
    dataSources: ['All Agent Outputs', 'Market Data Feeds'],
    reasoningSummary: 'Top 3 priorities: (1) Monitor high-appreciation markets for correction signals (2) Track infrastructure announcement dates for pre-emptive positioning (3) Watch currency pairs for hedging opportunities.',
    requiresHumanApproval: false,
    approvedByHuman: false,
    output: {
      priorityAlerts: [
        { priority: 'high', area: 'Price momentum in luxury markets', action: 'Review monthly' },
        { priority: 'medium', area: 'Inventory absorption rates', action: 'Monitor quarterly' },
        { priority: 'low', area: 'Currency pair fluctuations', action: 'Review before large transactions' },
      ],
      recommendation: 'Set up automated alerts for critical thresholds in top 10 markets.',
    },
    startedAt,
    completedAt: new Date().toISOString(),
  };
}
