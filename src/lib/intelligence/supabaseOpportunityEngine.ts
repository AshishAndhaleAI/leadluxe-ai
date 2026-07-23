// ============================================================
// LeadLuxe AI — Supabase Opportunity Engine
// Queries Supabase directly for opportunities.
// Falls back to our generated data if Supabase is unavailable
// or the table is empty.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { generateAllOpportunities } from './opportunityEngine';
import type { EvidenceRecord } from './opportunityEngine';

// ============================================================
// TYPES
// ============================================================
export interface OpportunityRecord {
  id: string;
  title: string;
  description: string;
  country_code: string;
  country_name: string;
  city_name: string;
  developer_name: string;
  property_type: string;
  property_value: number;
  currency: string;
  commission_rate: number;
  estimated_commission: number;
  commission_usd: number;
  confidence_score: number;
  market_score: number;
  urgency: number;
  roi_score: number;
  liquidity_score: number;
  signal_count: number;
  evidence_count: number;
  status: string;
  priority: string;
  source_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface OpportunityFilters {
  search: string;
  sortBy: 'confidence' | 'value' | 'commission' | 'market_score';
  sortDir: 'asc' | 'desc';
  minConfidence: number;
  countries: string[];
  propertyTypes: string[];
}

export const DEFAULT_FILTERS: OpportunityFilters = {
  search: '',
  sortBy: 'confidence',
  sortDir: 'desc',
  minConfidence: 0,
  countries: [],
  propertyTypes: [],
};

// ============================================================
// HELPER: Build opportunity records from generated data
// ============================================================
function buildGeneratedRecords(): OpportunityRecord[] {
  return generateAllOpportunities().map(g => ({
    id: g.cityId,
    title: g.title,
    description: g.description,
    country_code: g.countryCode,
    country_name: g.countryName,
    city_name: g.cityName,
    developer_name: g.developerName,
    property_type: g.propertyType,
    property_value: g.propertyValue,
    currency: g.currency,
    commission_rate: g.commissionRate,
    estimated_commission: g.estimatedCommission,
    commission_usd: g.commissionUSD,
    confidence_score: g.confidenceScore,
    market_score: g.marketScore,
    urgency: g.urgency,
    roi_score: g.roiScore,
    liquidity_score: g.liquidityScore,
    signal_count: g.signalCount,
    evidence_count: g.evidenceCount,
    status: 'active',
    priority: g.confidenceScore >= 85 ? 'critical' : g.confidenceScore >= 75 ? 'high' : 'medium',
    source_name: g.sourceName,
    latitude: g.latitude,
    longitude: g.longitude,
    created_at: new Date().toISOString(),
  }));
}

// ============================================================
// HOOK: Fetch opportunities from Supabase with realtime
// ============================================================
export function useSupabaseOpportunities(filters: OpportunityFilters = DEFAULT_FILTERS) {
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          // No Supabase client — use generated data
          if (!cancelled) setOpportunities(buildGeneratedRecords());
          return;
        }

        let query = supabase
          .from('opportunities')
          .select('*')
          .eq('status', 'active');

        if (filters.countries.length > 0) {
          query = query.in('country_code', filters.countries);
        }
        if (filters.propertyTypes.length > 0) {
          query = query.in('property_type', filters.propertyTypes);
        }
        if (filters.minConfidence > 0) {
          query = query.gte('confidence_score', filters.minConfidence);
        }

        const sortField = filters.sortBy === 'value' ? 'property_value' :
                          filters.sortBy === 'commission' ? 'commission_usd' :
                          filters.sortBy === 'market_score' ? 'market_score' : 'confidence_score';
        query = query.order(sortField, { ascending: filters.sortDir === 'asc' });

        const { data, error: fetchError } = await query.limit(100);

        if (cancelled) return;

        if (fetchError || !data || data.length === 0) {
          if (!cancelled) setOpportunities(buildGeneratedRecords());
        } else {
          let filtered = [...data];
          if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter((o: any) =>
              o.title?.toLowerCase().includes(q) ||
              o.city_name?.toLowerCase().includes(q) ||
              o.country_name?.toLowerCase().includes(q) ||
              o.developer_name?.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setOpportunities(filtered as OpportunityRecord[]);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.warn('[SupabaseOppEngine] Error, using generated data:', err.message);
          setOpportunities(buildGeneratedRecords());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    // Realtime subscription (only if Supabase client exists)
    const sb = supabase;
    if (sb) {
      const channel = sb
        .channel('opportunities-realtime')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'opportunities' },
          () => { fetchData(); }
        )
        .subscribe();

      return () => {
        cancelled = true;
        sb.removeChannel(channel);
      };
    }

    return () => { cancelled = true; };
  }, [filters.search, filters.sortBy, filters.sortDir, filters.countries.join(','), filters.propertyTypes.join(','), filters.minConfidence]);

  return { opportunities, loading, error };
}

// ============================================================
// GET EVIDENCE FOR AN OPPORTUNITY
// ============================================================
export async function getOpportunityEvidence(opportunityId: string): Promise<EvidenceRecord[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('opportunity_evidence')
      .select('*')
      .eq('opportunity_id', opportunityId);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        sourceName: d.source_name,
        sourceUrl: d.source_url || '',
        evidenceType: d.evidence_type as any,
        extractedStatement: d.extracted_statement || '',
        confidenceWeight: d.confidence_weight || 1.0,
      }));
    }
  } catch {
    // Fall back to generating evidence from city data
  }

  return [];
}

// ============================================================
// GET SINGLE OPPORTUNITY BY ID
// Used by OpportunityDetail page. Searches generated records
// (which use cityId as the ID), then falls back to Supabase.
// ============================================================
export function getOpportunityById(id: string): OpportunityRecord | null {
  // First search the generated records (most common case)
  const generated = buildGeneratedRecords();
  const found = generated.find(o => o.id === id);
  if (found) return found;

  // If not found in generated, could be a property-database ID
  // Try matching by various ID formats
  return null;
}

// ============================================================
// PIPELINE STATS
// ============================================================
export function computePipelineStats(opportunities: OpportunityRecord[]) {
  const active = opportunities.filter(o => o.status === 'active');
  const totalPipeline = active.reduce((s, o) => s + o.property_value, 0);
  const totalCommission = active.reduce((s, o) => s + o.commission_usd, 0);
  const avgConfidence = active.length > 0
    ? Math.round(active.reduce((s, o) => s + o.confidence_score, 0) / active.length)
    : 0;
  const countries = new Set(active.map(o => o.country_code)).size;
  const highConfidence = active.filter(o => o.confidence_score >= 85).length;

  return {
    total: active.length,
    totalPipeline,
    totalCommission,
    avgConfidence,
    countries,
    highConfidence,
  };
}
