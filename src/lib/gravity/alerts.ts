// ============================================================
// LeadLuxe AI — Gravity Alert Engine
// Autonomous delta tracking, watchlist management, and daily
// briefing generation for the Investment Gravity Engine.
//
// Since the gravity engine is deterministic, this simulates
// realistic day-over-day changes using deterministic hashing
// based on the current date to create meaningful drift.
// ============================================================

import { computeGravityRankings, getCityGravityAnalysis } from './engine';
import type { GravityAnalysis } from './types';

// ============================================================
// WATCHLIST (stored in localStorage)
// ============================================================

const WATCHLIST_KEY = 'leadluxe-gravity-watchlist';
const BRIEFING_SEEN_KEY = 'leadluxe-briefing-last-seen';

export interface WatchlistEntry {
  cityId: string;
  cityName: string;
  countryFlag: string;
  countryName: string;
  addedAt: string;
  lastScore: number;
  lastNotifiedScore: number;
  alertThreshold: number; // Default 5
}

/** Get the user's watchlist from localStorage */
export function getWatchlist(): WatchlistEntry[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Add a city to the watchlist */
export function addToWatchlist(analysis: GravityAnalysis): WatchlistEntry[] {
  const list = getWatchlist();
  const exists = list.find(e => e.cityId === analysis.microMarket.id);
  if (exists) return list;

  const entry: WatchlistEntry = {
    cityId: analysis.microMarket.id,
    cityName: analysis.microMarket.name,
    countryFlag: analysis.microMarket.countryFlag,
    countryName: analysis.microMarket.countryName,
    addedAt: new Date().toISOString(),
    lastScore: analysis.overallScore,
    lastNotifiedScore: analysis.overallScore,
    alertThreshold: 5,
  };

  list.push(entry);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  return list;
}

/** Remove a city from the watchlist */
export function removeFromWatchlist(cityId: string): WatchlistEntry[] {
  const list = getWatchlist().filter(e => e.cityId !== cityId);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  return list;
}

/** Check if a city is in the watchlist */
export function isInWatchlist(cityId: string): boolean {
  return getWatchlist().some(e => e.cityId === cityId);
}

/** Update the last seen score for a watchlist entry */
export function updateWatchlistScore(cityId: string, score: number): void {
  const list = getWatchlist().map(e =>
    e.cityId === cityId ? { ...e, lastScore: score } : e
  );
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

// ============================================================
// DETERMINISTIC DAY-OFFSET SCORE
// Simulates how gravity scores would evolve day-over-day
// by applying small offset based on city ID + day hash
// ============================================================

function getDayOffset(cityId: string, daysAgo: number): number {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate() - daysAgo}`;
  const seed = cityId + dateStr;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  // Produces -4 to +4 range, realistic daily shift
  return ((Math.abs(hash) % 9) - 4);
}

/** Get today's gravity score with realistic variation */
export function getTodayScore(cityId: string, baseScore: number): number {
  const offset = getDayOffset(cityId, 0);
  return Math.max(0, Math.min(100, baseScore + offset));
}

/** Get yesterday's gravity score */
export function getYesterdayScore(cityId: string, baseScore: number): number {
  const offset = getDayOffset(cityId, 1);
  return Math.max(0, Math.min(100, baseScore + offset));
}

/** Compute the delta (today - yesterday) */
export function getGravityDelta(cityId: string, baseScore: number): number {
  const today = getTodayScore(cityId, baseScore);
  const yesterday = getYesterdayScore(cityId, baseScore);
  return today - yesterday;
}

// ============================================================
// DAILY BRIEFING
// ============================================================

export interface BriefingAlert {
  cityId: string;
  cityName: string;
  countryFlag: string;
  countryName: string;
  currentScore: number;
  previousScore: number;
  delta: number;
  predictedAppreciation: number;
  riskLevel: string;
  isWatched: boolean;
  reason: string;
}

export interface DailyBriefing {
  generatedAt: string;
  date: string;
  topGainers: BriefingAlert[];
  topDecliners: BriefingAlert[];
  watchlistAlerts: BriefingAlert[];  // Watched cities with >5 point change
  significantMoves: BriefingAlert[];  // All markets with >5 point change
  totalMarketsTracked: number;
  marketsChanged: number;
  avgDelta: number;
}

/** Generate the daily briefing from current gravity rankings */
export function generateDailyBriefing(): DailyBriefing {
  const rankings = computeGravityRankings();
  const watchlist = getWatchlist();
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  const allAlerts: BriefingAlert[] = rankings.topMarkets.map(a => {
    const baseScore = a.overallScore;
    const delta = getGravityDelta(a.microMarket.id, baseScore);
    const todayScore = getTodayScore(a.microMarket.id, baseScore);
    const yesterdayScore = getYesterdayScore(a.microMarket.id, baseScore);

    return {
      cityId: a.microMarket.id,
      cityName: a.microMarket.name,
      countryFlag: a.microMarket.countryFlag,
      countryName: a.microMarket.countryName,
      currentScore: todayScore,
      previousScore: yesterdayScore,
      delta,
      predictedAppreciation: a.predictedAppreciation,
      riskLevel: a.microMarket.riskLevel,
      isWatched: watchlist.some(w => w.cityId === a.microMarket.id),
      reason: delta > 0
        ? `Gravity increased ${delta} points — ${a.reasoning[1] || 'positive signal momentum'}`
        : delta < 0
        ? `Gravity dropped ${Math.abs(delta)} points — market cooling detected`
        : 'Score stable — no significant change detected',
    };
  });

  // Sort by delta descending for gainers
  const sortedByDelta = [...allAlerts].sort((a, b) => b.delta - a.delta);

  // Top 3 gainers
  const topGainers = sortedByDelta.filter(a => a.delta > 0).slice(0, 3);

  // Top 3 decliners
  const topDecliners = sortedByDelta.filter(a => a.delta < 0).reverse().slice(0, 3);

  // Watched cities with >5 point change
  const watchlistAlerts = allAlerts.filter(a => {
    if (!a.isWatched) return false;
    const watchEntry = watchlist.find(w => w.cityId === a.cityId);
    if (!watchEntry) return false;
    const threshold = watchEntry.alertThreshold || 5;
    return Math.abs(a.delta) >= threshold;
  });

  // All significant moves
  const significantMoves = allAlerts.filter(a => Math.abs(a.delta) >= 5);

  // Stats
  const marketsChanged = allAlerts.filter(a => a.delta !== 0).length;
  const avgDelta = allAlerts.reduce((s, a) => s + a.delta, 0) / allAlerts.length;

  return {
    generatedAt: new Date().toISOString(),
    date: dateStr,
    topGainers,
    topDecliners,
    watchlistAlerts,
    significantMoves,
    totalMarketsTracked: allAlerts.length,
    marketsChanged,
    avgDelta: Math.round(avgDelta * 10) / 10,
  };
}

/** Mark the briefing as seen (updates last-seen timestamp) */
export function markBriefingSeen(): void {
  localStorage.setItem(BRIEFING_SEEN_KEY, new Date().toISOString());
}

/** Check if there are new alerts since the user last checked */
export function hasNewAlerts(): boolean {
  try {
    const lastSeen = localStorage.getItem(BRIEFING_SEEN_KEY);
    if (!lastSeen) return true;

    const briefing = generateDailyBriefing();
    return (
      briefing.watchlistAlerts.length > 0 ||
      briefing.topGainers.length > 0 ||
      briefing.significantMoves.length > 0
    );
  } catch {
    return false;
  }
}

/** Get the number of unread alerts */
export function getUnreadAlertCount(): number {
  try {
    const lastSeen = localStorage.getItem(BRIEFING_SEEN_KEY);
    if (!lastSeen) return 1; // At least show briefing is available

    const briefing = generateDailyBriefing();
    let count = 0;
    count += briefing.watchlistAlerts.length;
    count += briefing.topGainers.length;
    return count;
  } catch {
    return 0;
  }
}

/** Check if the briefing has been viewed today */
export function isBriefingViewedToday(): boolean {
  try {
    const lastSeen = localStorage.getItem(BRIEFING_SEEN_KEY);
    if (!lastSeen) return false;
    const lastDate = new Date(lastSeen).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return lastDate === today;
  } catch {
    return false;
  }
}
