// ============================================================
// useOpportunityEngine — Autonomous Intelligence Data Hook
// Drains from the knowledge graph, not from demo data
// Falls back to seed entities only when no real data exists
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { knowledgeGraph } from '../lib/core/knowledge-graph';
import { autonomousIntelligence } from '../lib/core/AutonomousIntelligence';
import { formatIndianCurrency } from '../lib/format';
import type { Developer, Project, Signal, Opportunity, CommissionRecord, 
  ActivityLog, RevenueForecast, DashboardMetrics } from '../types';

export interface OpportunityEngineState {
  developers: Developer[];
  projects: Project[];
  signals: Signal[];
  opportunities: Opportunity[];
  commissions: CommissionRecord[];
  activityLogs: ActivityLog[];
  forecasts: RevenueForecast[];
  dashboardMetrics: DashboardMetrics;
  systemStatus: any;
  loading: boolean;
  searchOpportunities: (query: string) => Opportunity[];
}

function convertGraphNodeToDeveloper(node: any): Developer {
  return {
    id: node.id,
    name: node.properties.name || node.label || 'Unknown',
    slug: node.properties.slug || node.id,
    city: node.properties.city || 'Mumbai',
    state: node.properties.state || 'Maharashtra',
    headquarters: node.properties.headquarters || '',
    founded_year: node.properties.founded_year,
    builder_type: node.properties.builder_type,
    pricing_segment: node.properties.pricing_segment,
    annual_revenue: node.properties.annual_revenue,
    growth_rate: node.properties.growth_rate,
    total_projects: node.properties.totalProjects || 0,
    active_projects: node.properties.activeProjects || 0,
    total_units_delivered: node.properties.totalUnitsDelivered || 0,
    hiring_trend: node.properties.hiringTrend,
    hiring_count: node.properties.hiringCount || 0,
    funding_info: node.properties.fundingInfo,
    strengths: node.properties.strengths || [],
    weaknesses: node.properties.weaknesses || [],
    expansion_plans: node.properties.expansionPlans || [],
    is_tracked: true,
    metadata: {},
    created_at: node.createdAt,
    updated_at: node.updatedAt,
  } as Developer;
}

function convertGraphNodeToSignal(node: any): Signal {
  return {
    id: node.id,
    signal_type: node.properties.type || node.properties.signal_type || 'news_coverage',
    title: node.label || node.properties.title || 'Signal',
    description: node.properties.description || '',
    source: node.source || node.properties.source || 'Autonomous Intelligence',
    source_url: node.sourceUrl || node.properties.sourceUrl || '',
    relevance_score: node.confidence || 50,
    impact_level: node.confidence && node.confidence >= 80 ? 'high' : node.confidence && node.confidence >= 60 ? 'medium' : 'low',
    is_processed: true,
    created_at: node.createdAt || node.properties.date || new Date().toISOString(),
  } as Signal;
}

function convertToOpportunity(node: any): Opportunity {
  const properties = node.properties || {};
  const estimatedValue = properties.estimatedValue || properties.estimated_value || 5000000;
  const confidence = properties.confidenceScore || properties.confidence_score || node.confidence || 50;
  const commission = properties.estimatedCommission || properties.estimated_commission || estimateCommission(estimatedValue);

  return {
    id: node.id,
    developer_id: properties.developer_id || properties.developerId || node.id,
    title: node.label || properties.title || 'Opportunity',
    summary: properties.description || properties.summary || '',
    estimated_value: estimatedValue,
    confidence_score: confidence,
    priority: confidence >= 85 ? 'critical' : confidence >= 70 ? 'high' : confidence >= 50 ? 'medium' : 'low',
    deal_stage: 'discovered',
    commission_percentage: 3.00,
    estimated_commission: commission,
    commission_currency: 'INR',
    reasoning: properties.reasoning || properties.reasons || [],
    recommended_actions: properties.recommendedActions || properties.recommended_actions || [],
    next_best_action: properties.nextBestAction || properties.next_best_action || 'Review intelligence data',
    potential_objections: [],
    is_active: true,
    ai_analysis: { source: node.source, confidence: node.confidence },
    signals: [],
    created_at: node.createdAt || new Date().toISOString(),
    updated_at: node.updatedAt || new Date().toISOString(),
  } as Opportunity;
}

function estimateCommission(value: number): number {
  return value * 0.03;
}

export function useOpportunityEngine(): OpportunityEngineState {
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Poll the knowledge graph periodically
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    const interval = setInterval(() => setRefreshKey(k => k + 1), 10000); // Refresh every 10s
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  // Refresh when autonomous intelligence runs a cycle
  useEffect(() => {
    const check = setInterval(() => {
      if (autonomousIntelligence.totalRuns > 0) {
        setRefreshKey(k => k + 1);
      }
    }, 30000);
    return () => clearInterval(check);
  }, []);

  const aiStatus = useMemo(() => autonomousIntelligence.getStatus(), [refreshKey]);

  // Convert knowledge graph data to typed entities
  const graphData = useMemo(() => {
    const developers: Developer[] = knowledgeGraph.findNodes('developer')
      .map(n => convertGraphNodeToDeveloper(n));
    
    const projects: Project[] = knowledgeGraph.findNodes('project')
      .map(n => ({ id: n.id, developer_id: n.properties.developer_id || '', name: n.label || 'Project', slug: n.id, metadata: {}, created_at: n.createdAt, updated_at: n.updatedAt }) as Project);
    
    const signals: Signal[] = knowledgeGraph.findNodes('news')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 200)
      .map(n => convertGraphNodeToSignal(n));

    const approvals: Signal[] = knowledgeGraph.findNodes('approval')
      .map(n => convertGraphNodeToSignal(n));

    const allSignals = [...signals, ...approvals];

    const graphOpportunities: Opportunity[] = autonomousIntelligence.getOpportunities()
      .slice(0, 100)
      .map(n => convertToOpportunity(n));

    // Only use real opportunities from the knowledge graph.
    // No fallback to generated data — if the autonomous system
    // hasn't collected intelligence yet, we show empty states.
    const opportunities = graphOpportunities;

    return { developers, projects, signals: allSignals, opportunities };
  }, [refreshKey]);

  const dashboardMetrics = useMemo((): DashboardMetrics => {
    const opps = graphData.opportunities;
    const active = opps.filter(o => o.is_active);
    const highConf = active.filter(o => o.confidence_score >= 80);
    const totalPipeline = active.reduce((s, o) => s + o.estimated_value, 0);
    const totalCommission = active.reduce((s, o) => s + o.estimated_commission, 0);

    return {
      todayOpportunities: active.length,
      highConfidenceDeals: highConf.length,
      expectedCommission: totalCommission,
      newBuilderActivity: graphData.developers.length,
      recentlyUpdatedProjects: graphData.projects.length,
      upcomingLaunches: graphData.projects.filter(p => (p as any).status === 'announced' || (p as any).status === 'pre_launch').length,
      highestValueOpportunity: active.sort((a, b) => b.estimated_value - a.estimated_value)[0] || null,
      totalPipelineValue: totalPipeline,
      closedCommission: 0,
      activeDealsCount: active.length,
      avgConfidence: active.length > 0 ? Math.round(active.reduce((s, o) => s + o.confidence_score, 0) / active.length) : 0,
      criticalSignals: graphData.signals.filter(s => s.impact_level === 'critical' || s.impact_level === 'high').length,
      hotProperties: 0,
      preLaunchCount: 0,
      totalAvailable: graphData.opportunities.filter(o => o.is_active).length,
      opportunitiesByPriority: [
        { priority: 'critical', count: active.filter(o => o.priority === 'critical').length },
        { priority: 'high', count: active.filter(o => o.priority === 'high').length },
        { priority: 'medium', count: active.filter(o => o.priority === 'medium').length },
        { priority: 'low', count: active.filter(o => o.priority === 'low').length },
      ],
      opportunitiesByStage: (() => {
        const stages = ['discovered', 'qualifying', 'analyzing', 'proposal', 'negotiation', 'closing', 'closed_won', 'closed_lost'];
        return stages.map(stage => ({
          stage,
          count: active.filter(o => o.deal_stage === stage).length,
        })).filter(s => s.count > 0);
      })(),
      commissionForecast: [],
      topOpportunities: active.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 10),
      recentSignals: graphData.signals.slice(0, 20),
      recentActivity: [],
    };
  }, [graphData]);

  const searchOpportunities = useCallback((query: string) => {
    const q = query.toLowerCase();
    return graphData.opportunities.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.summary?.toLowerCase().includes(q)
    );
  }, [graphData]);

  return {
    developers: graphData.developers,
    projects: graphData.projects,
    signals: graphData.signals,
    opportunities: graphData.opportunities,
    commissions: [],
    activityLogs: [],
    forecasts: [],
    dashboardMetrics,
    systemStatus: aiStatus,
    loading,
    searchOpportunities,
  };
}
