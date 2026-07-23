// ============================================================
// LeadLuxe AI — useInvestorTwin Hook
// 
// Central hook for the Investor Twin System. Handles:
//   - Profile creation and persistence (localStorage)
//   - Twin matching against opportunities
//   - Alert management
//   - Behavioral tracking via analytics
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Opportunity } from '../types';
import {
  runTwinMatching,
  opportunityToDealCandidate,
  type InvestorProfile,
  type MatchResult,
  type TwinSummary,
  type DealCandidate,
} from '../lib/twin/twinEngine';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../lib/analytics';
import { useOpportunityEngine } from './useOpportunityEngine';

// ============================================================
// DEFAULT PROFILE
// ============================================================
export const DEFAULT_PROFILE: InvestorProfile = {
  userId: '',
  country: 'IN',
  city: 'Pune',
  budgetMin: 5_000_000,
  budgetMax: 50_000_000,
  currency: 'INR',
  riskTolerance: 'medium',
  investmentGoal: 'appreciation',
  holdingPeriodYears: 5,
  preferredAssetClasses: ['apartment'],
  liquidityPreference: 'moderate',
};

// ============================================================
// TWIN ALERT TYPE
// ============================================================
export interface TwinAlert {
  id: string;
  priority: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  matchScore?: number;
  estimatedCommission?: number;
  reason?: string;
  delivered: boolean;
  createdAt: string;
}

// ============================================================
// HOOK
// ============================================================
export function useInvestorTwin() {
  const { user } = useAuth();
  const { opportunities: engineOpportunities } = useOpportunityEngine();

  // Convert opportunities from the engine to DealCandidates
  const candidates: DealCandidate[] = useMemo(() =>
    engineOpportunities.map(opportunityToDealCandidate),
    [engineOpportunities]
  );

  // Load profile from localStorage or build from user preferences
  const [profile, setProfile] = useState<InvestorProfile>(() => {
    if (user) {
      try {
        const saved = localStorage.getItem(`leadluxe_twin_${user.id}`);
        if (saved) return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    if (user?.preferences) {
      return {
        userId: user.id,
        country: user.preferences.countryCode || 'IN',
        city: user.preferences.city?.name || 'Pune',
        budgetMin: user.preferences.budgetRangeMin || 5_000_000,
        budgetMax: user.preferences.budgetRangeMax || 50_000_000,
        currency: 'INR',
        riskTolerance: user.preferences.riskLevel || 'medium',
        investmentGoal: (user.preferences.investmentGoal as InvestorProfile['investmentGoal']) || 'appreciation',
        holdingPeriodYears: user.preferences.holdingPeriod || 5,
        preferredAssetClasses: user.preferences.propertyType ? [user.preferences.propertyType] : ['apartment'],
        liquidityPreference: 'moderate',
      };
    }
    return { ...DEFAULT_PROFILE, userId: user?.id || '' };
  });

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [alerts, setAlerts] = useState<TwinAlert[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);

  // ============================================================
  // RUN TWIN MATCHING
  // ============================================================
  const runMatching = useCallback(() => {
    if (!profile.userId || candidates.length === 0) return;

    setScanning(true);
    try {
      const results = runTwinMatching(profile, candidates);
      setMatches(results);

      // Generate alerts for P1/P2 matches (score >= 85)
      const newAlerts: TwinAlert[] = results
        .filter((r) => r.riskAdjustedScore >= 85)
        .map((r) => ({
          id: `alert-${r.opportunityId}-${Date.now()}`,
          priority: (r.riskAdjustedScore >= 90 ? 1 : 2) as 1 | 2,
          title: `${r.opportunityTitle} — ${r.riskAdjustedScore}/100 match`,
          description: r.reasoning,
          matchScore: r.riskAdjustedScore,
          estimatedCommission: r.commissionEstimate,
          reason: r.matchedOn.join(', ') || 'Strong profile match',
          delivered: false,
          createdAt: new Date().toISOString(),
        }));

      setAlerts((prev) => {
        const existing = new Set(prev.map((a) => a.id));
        const unique = newAlerts.filter((a) => !existing.has(a.id));
        return [...unique, ...prev].slice(0, 50);
      });

      setLastScanAt(new Date().toISOString());

      trackEvent('twin_match_generated', {
        userId: profile.userId,
        matchCount: results.length,
        topScore: results[0]?.riskAdjustedScore || 0,
      });
    } finally {
      setScanning(false);
    }
  }, [profile, candidates]);

  // Auto-run on candidate changes
  useEffect(() => {
    if (profile.userId && candidates.length > 0) {
      runMatching();
    }
  }, [candidates.length, profile.userId, runMatching]);

  // ============================================================
  // SAVE / UPDATE PROFILE
  // ============================================================
  const saveProfile = useCallback(async (updated: Partial<InvestorProfile>) => {
    if (!user) return;
    const merged = { ...profile, ...updated, userId: user.id };
    setProfile(merged);
    localStorage.setItem(`leadluxe_twin_${user.id}`, JSON.stringify(merged));

    trackEvent('twin_profile_updated', {
      userId: user.id,
      country: merged.country,
      city: merged.city,
      goal: merged.investmentGoal,
    });

    // Re-run matching
    setTimeout(runMatching, 100);
  }, [profile, user, runMatching]);

  // ============================================================
  // CREATE TWIN
  // ============================================================
  const createTwin = useCallback(async (initialProfile: InvestorProfile) => {
    if (!user) return { error: 'No authenticated user' };
    setIsCreating(true);
    try {
      const newProfile = { ...initialProfile, userId: user.id };
      setProfile(newProfile);
      localStorage.setItem(`leadluxe_twin_${user.id}`, JSON.stringify(newProfile));

      trackEvent('twin_created', {
        userId: user.id,
        country: newProfile.country,
        city: newProfile.city,
        goal: newProfile.investmentGoal,
        riskTolerance: newProfile.riskTolerance,
        holdingPeriod: newProfile.holdingPeriodYears,
      });

      setTimeout(runMatching, 300);
      return { error: undefined };
    } catch (err) {
      return { error: String(err) };
    } finally {
      setIsCreating(false);
    }
  }, [user, runMatching]);

  // ============================================================
  // DISMISS ALERT
  // ============================================================
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  // ============================================================
  // COMPUTED SUMMARY
  // ============================================================
  const summary = useMemo((): TwinSummary => {
    const topMatches = matches.slice(0, 5);
    const totalMatched = matches.length;
    const avgScore = totalMatched > 0
      ? Math.round(matches.reduce((s, m) => s + m.riskAdjustedScore, 0) / totalMatched)
      : 0;
    const portfolioValue = matches
      .filter((m) => m.riskAdjustedScore >= 75)
      .reduce((s, m) => s + m.commissionEstimate * 20, 0);
    const totalCommission = matches
      .filter((m) => m.riskAdjustedScore >= 75)
      .reduce((s, m) => s + m.commissionEstimate, 0);

    return {
      profile,
      topMatches,
      alerts: alerts.filter((a) => a.priority <= 2).slice(0, 5) as TwinAlert[],
      totalMatched,
      avgScore,
      portfolioValue,
      totalCommission,
    };
  }, [matches, alerts, profile]);

  // ============================================================
  // LOG BEHAVIOR — sends GA4 event
  // ============================================================
  const logBehavior = useCallback((actionType: string, entityId?: string) => {
    trackEvent(`twin_${actionType}`, { userId: profile.userId, entityId });
  }, [profile.userId]);

  return {
    profile,
    matches,
    alerts,
    isCreating,
    scanning,
    lastScanAt,
    summary,
    saveProfile,
    createTwin,
    dismissAlert,
    runMatching,
    logBehavior,
  };
}
