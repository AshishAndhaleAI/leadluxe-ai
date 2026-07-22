// ============================================================
// useOpportunityEngine — Main data hook for the opportunity engine
// Provides access to developers, projects, signals, opportunities
// Mimics a Supabase/production data layer
// ============================================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Developer, Project, Signal, Opportunity, CommissionRecord, ActivityLog, RevenueForecast, DashboardMetrics } from '../types';
import { generateDataset, type Dataset } from '../lib/demo-data';
import { analyzeOpportunity } from '../lib/opportunity-engine';

let cachedDataset: Dataset | null = null;

function getDataset(): Dataset {
  if (!cachedDataset) {
    cachedDataset = generateDataset();
  }
  return cachedDataset;
}

export interface OpportunityEngineState {
  developers: Developer[];
  projects: Project[];
  signals: Signal[];
  opportunities: Opportunity[];
  commissions: CommissionRecord[];
  activityLogs: ActivityLog[];
  forecasts: RevenueForecast[];
  dashboardMetrics: DashboardMetrics;
  loading: boolean;
  getDeveloper: (id: string) => Developer | undefined;
  getProject: (id: string) => Project | undefined;
  getOpportunity: (id: string) => Opportunity | undefined;
  getDeveloperProjects: (devId: string) => Project[];
  getDeveloperSignals: (devId: string) => Signal[];
  getDeveloperOpportunities: (devId: string) => Opportunity[];
  getOpportunitySignals: (opp: Opportunity) => Signal[];
  searchOpportunities: (query: string) => Opportunity[];
  filterOpportunities: (filters: {
    minConfidence?: number;
    maxConfidence?: number;
    priority?: string;
    stage?: string;
    city?: string;
  }) => Opportunity[];
  refresh: () => void;
}

export function useOpportunityEngine(): OpportunityEngineState {
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const datasetRef = useRef<Dataset | null>(null);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      datasetRef.current = getDataset();
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [version]);

  const dataset = datasetRef.current || cachedDataset || getDataset();

  const dashboardMetrics = useMemo((): DashboardMetrics => {
    const activeOpps = dataset.opportunities.filter(o => o.is_active);
    const highConfidence = activeOpps.filter(o => o.confidence_score >= 80);
    const todayOpps = activeOpps.filter(o => {
      const days = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 7;
    });
    const topByValue = [...activeOpps].sort((a, b) => b.estimated_value - a.estimated_value);
    const recentSignals = [...dataset.signals].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 20);
    const recentLogs = [...dataset.activityLogs].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 10);

    const totalPipeline = activeOpps.reduce((s, o) => s + o.estimated_value, 0);
    const totalCommission = activeOpps.reduce((s, o) => s + o.estimated_commission, 0);
    const avgConfidence = Math.round(
      activeOpps.reduce((s, o) => s + o.confidence_score, 0) / Math.max(activeOpps.length, 1)
    );
    const closedCommission = dataset.opportunities
      .filter(o => o.deal_stage === 'closed_won')
      .reduce((s, o) => s + o.estimated_commission, 0);

    const newDevelopers = dataset.developers.filter(d => {
      const days = (Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 30;
    }).length;

    const recentlyUpdated = dataset.projects.filter(p => {
      const days = (Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 14;
    }).length;

    const upcomingLaunches = dataset.projects.filter(p => p.status === 'announced' || p.status === 'pre_launch').length;

    const criticalSignals = dataset.signals.filter(s => s.impact_level === 'critical' || s.impact_level === 'high').length;

    return {
      todayOpportunities: todayOpps.length,
      highConfidenceDeals: highConfidence.length,
      expectedCommission: totalCommission,
      newBuilderActivity: newDevelopers,
      recentlyUpdatedProjects: recentlyUpdated,
      upcomingLaunches,
      highestValueOpportunity: topByValue[0] || null,
      totalPipelineValue: totalPipeline,
      closedCommission,
      activeDealsCount: activeOpps.length,
      avgConfidence,
      criticalSignals,
      opportunitiesByPriority: [
        { priority: 'critical', count: activeOpps.filter(o => o.priority === 'critical').length },
        { priority: 'high', count: activeOpps.filter(o => o.priority === 'high').length },
        { priority: 'medium', count: activeOpps.filter(o => o.priority === 'medium').length },
        { priority: 'low', count: activeOpps.filter(o => o.priority === 'low').length },
      ],
      opportunitiesByStage: [
        { stage: 'discovered', count: activeOpps.filter(o => o.deal_stage === 'discovered').length },
        { stage: 'qualifying', count: activeOpps.filter(o => o.deal_stage === 'qualifying').length },
        { stage: 'proposal', count: activeOpps.filter(o => o.deal_stage === 'proposal').length },
        { stage: 'negotiation', count: activeOpps.filter(o => o.deal_stage === 'negotiation').length },
        { stage: 'closing', count: activeOpps.filter(o => o.deal_stage === 'closing').length },
      ],
      commissionForecast: dataset.forecasts.map(f => ({
        month: f.month,
        expected: f.expectedCommission,
        probable: f.probableCommission,
        optimistic: f.optimisticCommission,
      })),
      topOpportunities: [...activeOpps]
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 10),
      recentSignals,
      recentActivity: recentLogs,
    };
  }, [dataset]);

  const getDeveloper = useCallback((id: string) =>
    dataset.developers.find(d => d.id === id), [dataset]);

  const getProject = useCallback((id: string) =>
    dataset.projects.find(p => p.id === id), [dataset]);

  const getOpportunity = useCallback((id: string) =>
    dataset.opportunities.find(o => o.id === id), [dataset]);

  const getDeveloperProjects = useCallback((devId: string) =>
    dataset.projects.filter(p => p.developer_id === devId), [dataset]);

  const getDeveloperSignals = useCallback((devId: string) =>
    dataset.signals.filter(s => s.developer_id === devId), [dataset]);

  const getDeveloperOpportunities = useCallback((devId: string) =>
    dataset.opportunities.filter(o => o.developer_id === devId), [dataset]);

  const getOpportunitySignals = useCallback((opp: Opportunity) => {
    if (opp.signals) return opp.signals as Signal[];
    return dataset.signals.filter(s => s.developer_id === opp.developer_id).slice(0, 5);
  }, [dataset]);

  const searchOpportunities = useCallback((query: string) => {
    const q = query.toLowerCase();
    return dataset.opportunities.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.summary?.toLowerCase().includes(q) ||
      dataset.developers.find(d => d.id === o.developer_id)?.name.toLowerCase().includes(q)
    );
  }, [dataset]);

  const filterOpportunities = useCallback((filters: {
    minConfidence?: number;
    maxConfidence?: number;
    priority?: string;
    stage?: string;
    city?: string;
  }) => {
    return dataset.opportunities.filter(o => {
      if (filters.minConfidence !== undefined && o.confidence_score < filters.minConfidence) return false;
      if (filters.maxConfidence !== undefined && o.confidence_score > filters.maxConfidence) return false;
      if (filters.priority && o.priority !== filters.priority) return false;
      if (filters.stage && o.deal_stage !== filters.stage) return false;
      if (filters.city) {
        const dev = dataset.developers.find(d => d.id === o.developer_id);
        if (!dev || !dev.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
      }
      return true;
    });
  }, [dataset]);

  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  return {
    developers: dataset.developers,
    projects: dataset.projects,
    signals: dataset.signals,
    opportunities: dataset.opportunities,
    commissions: dataset.commissions,
    activityLogs: dataset.activityLogs,
    forecasts: dataset.forecasts,
    dashboardMetrics,
    loading,
    getDeveloper,
    getProject,
    getOpportunity,
    getDeveloperProjects,
    getDeveloperSignals,
    getDeveloperOpportunities,
    getOpportunitySignals,
    searchOpportunities,
    filterOpportunities,
    refresh,
  };
}
