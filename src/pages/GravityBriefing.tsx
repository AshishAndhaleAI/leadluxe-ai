// ============================================================
// LeadLuxe AI — Gravity Daily Briefing
// Autonomous alert system that notifies users BEFORE their
// competitors see market gravity score changes.
//
// Shows: Top 3 gainers, Top 3 decliners, Watchlist alerts,
// and significant market moves across all tracked cities.
// ============================================================

import { useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Zap, Target, Bell,
  ArrowRight, AlertTriangle, Info, CheckCircle2,
  Globe, Eye, EyeOff, Clock, Calendar,
  Activity, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  generateDailyBriefing,
  markBriefingSeen,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getGravityDelta,
  type BriefingAlert,
} from '../lib/gravity/alerts';
import { computeGravityRankings } from '../lib/gravity/engine';

// ============================================================
// MAIN BRIEFING PAGE
// ============================================================

export function GravityBriefing() {
  const navigate = useNavigate();
  const briefing = useMemo(() => generateDailyBriefing(), []);
  const rankings = useMemo(() => computeGravityRankings(), []);
  const watchlist = useMemo(() => getWatchlist(), []);

  // Mark briefing as seen when rendered
  useEffect(() => { markBriefingSeen(); }, []);

  const handleToggleWatch = useCallback((analysis: any) => {
    if (watchlist.some(w => w.cityId === analysis.microMarket.id)) {
      removeFromWatchlist(analysis.microMarket.id);
    } else {
      addToWatchlist(analysis);
    }
  }, [watchlist]);

  const hasGainers = briefing.topGainers.length > 0;
  const hasDecliners = briefing.topDecliners.length > 0;
  const hasWatchlistAlerts = briefing.watchlistAlerts.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-luxury-gold-400" />
            </div>
            <h1 className="text-xl font-bold text-white font-display">Daily Gravity Briefing</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-medium text-emerald-400">
              LIVE
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Autonomous market intelligence — detected {briefing.significantMoves.length} significant gravity shifts today across {briefing.totalMarketsTracked} tracked markets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-[10px] text-gray-400">
            {new Date(briefing.generatedAt).toLocaleDateString('en-US', {
              weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Gainers Today', value: briefing.topGainers.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Decliners Today', value: briefing.topDecliners.length, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Watchlist Alerts', value: briefing.watchlistAlerts.length, icon: Bell, color: 'text-luxury-gold-400', bg: 'bg-luxury-gold-500/10' },
          { label: 'Markets Changed', value: `${briefing.marketsChanged}/${briefing.totalMarketsTracked}`, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Gainers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Top Gainers</h2>
            <span className="text-[9px] text-gray-500">Highest gravity score increase</span>
          </div>

          {!hasGainers ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-xs">No gainers detected today</p>
            </div>
          ) : (
            briefing.topGainers.map((alert, i) => (
              <AlertCard
                key={alert.cityId}
                alert={alert}
                rank={i + 1}
                type="gainer"
                onToggleWatch={() => handleToggleWatch(
                  rankings.topMarkets.find(a => a.microMarket.id === alert.cityId)
                )}
                isWatched={watchlist.some(w => w.cityId === alert.cityId)}
              />
            ))
          )}

          {/* All significant positive moves */}
          {briefing.significantMoves.filter(a => a.delta > 0).length > 3 && (
            <div className="premium-card p-4">
              <h3 className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                All Positive Moves ({briefing.significantMoves.filter(a => a.delta > 0).length})
              </h3>
              <div className="space-y-1">
                {briefing.significantMoves
                  .filter(a => a.delta > 0)
                  .slice(0, 8)
                  .map((a, i) => (
                    <div key={a.cityId} className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{a.countryFlag}</span>
                        <span className="text-[10px] text-gray-300">{a.cityName}</span>
                        {a.isWatched && <Eye className="w-2.5 h-2.5 text-luxury-gold-400" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500">{a.currentScore} → <span className="text-emerald-400">{a.currentScore + a.delta}</span></span>
                        <span className="text-[9px] font-bold text-emerald-400">+{a.delta}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Top Decliners */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 text-red-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Top Decliners</h2>
            <span className="text-[9px] text-gray-500">Largest gravity score drop</span>
          </div>

          {!hasDecliners ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-xs">No decliners detected today</p>
            </div>
          ) : (
            briefing.topDecliners.map((alert, i) => (
              <AlertCard
                key={alert.cityId}
                alert={alert}
                rank={i + 1}
                type="decliner"
                onToggleWatch={() => handleToggleWatch(
                  rankings.topMarkets.find(a => a.microMarket.id === alert.cityId)
                )}
                isWatched={watchlist.some(w => w.cityId === alert.cityId)}
              />
            ))
          )}

          {/* All significant negative moves */}
          {briefing.significantMoves.filter(a => a.delta < 0).length > 3 && (
            <div className="premium-card p-4">
              <h3 className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                All Negative Moves ({briefing.significantMoves.filter(a => a.delta < 0).length})
              </h3>
              <div className="space-y-1">
                {briefing.significantMoves
                  .filter(a => a.delta < 0)
                  .slice(0, 8)
                  .map((a, i) => (
                    <div key={a.cityId} className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{a.countryFlag}</span>
                        <span className="text-[10px] text-gray-300">{a.cityName}</span>
                        {a.isWatched && <Eye className="w-2.5 h-2.5 text-luxury-gold-400" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500">{a.currentScore} → <span className="text-red-400">{a.currentScore + a.delta}</span></span>
                        <span className="text-[9px] font-bold text-red-400">{a.delta}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Watchlist Alerts Section */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-luxury-gold-400" />
            <h2 className="text-sm font-semibold text-white">Watchlist Alerts</h2>
            <span className="text-[9px] text-gray-500">
              {watchlist.length} market{watchlist.length !== 1 ? 's' : ''} tracked
            </span>
          </div>
          <button
            onClick={() => navigate('/gravity')}
            className="text-[10px] text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors"
          >
            Manage Watchlist →
          </button>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-xs mb-2">No markets in your watchlist yet</p>
            <p className="text-[9px] text-gray-600">
              Go to the Gravity Engine and click the Watch button on any market to start tracking.
            </p>
            <button
              onClick={() => navigate('/gravity')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-luxury-gold-500/20 border border-luxury-gold-500/30 rounded-lg text-[10px] font-medium text-luxury-gold-400 hover:bg-luxury-gold-500/30"
            >
              Browse Markets <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {hasWatchlistAlerts ? (
              <>
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[10px] text-amber-300">
                    {briefing.watchlistAlerts.length} watched market{briefing.watchlistAlerts.length !== 1 ? 's' : ''} moved more than 5 points!
                  </p>
                </div>
                {briefing.watchlistAlerts.map(alert => (
                  <WatchlistAlertCard key={alert.cityId} alert={alert} onNavigate={navigate} />
                ))}
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-[10px] text-emerald-300">
                  All watched markets are stable — no significant changes detected
                </p>
              </div>
            )}

            {/* Quick stats for all watched markets */}
            <div className="mt-3 space-y-1">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">All Watched Markets</p>
              {watchlist.map(entry => {
                const analysis = rankings.topMarkets.find(a => a.microMarket.id === entry.cityId);
                if (!analysis) return null;
                const delta = getGravityDelta(entry.cityId, analysis.overallScore);
                return (
                  <div key={entry.cityId} className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{entry.countryFlag}</span>
                      <span className="text-[10px] text-gray-300">{entry.cityName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-500">
                        Gravity: <span className="text-white">{entry.lastScore}</span>
                      </span>
                      {delta !== 0 && (
                        <span className={cn(
                          'text-[9px] font-bold',
                          delta > 0 ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {delta > 0 ? '+' : ''}{delta}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Auto-briefing note */}
      <div className="premium-card p-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-luxury-gold-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-xs font-semibold text-white mb-1">Autonomous Alert System</h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              This briefing is generated automatically every time you open it. Gravity scores are tracked
              day-over-day using deterministic drift modeling. When a watched market moves more than 5 points,
              it appears in Watchlist Alerts. In production, this would trigger an email via the Meta
              WhatsApp Cloud API or a scheduled Supabase Edge Function.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GAINER / DECLINER CARD
// ============================================================

function AlertCard({ alert, rank, type, onToggleWatch, isWatched }: {
  alert: BriefingAlert;
  rank: number;
  type: 'gainer' | 'decliner';
  onToggleWatch: () => void;
  isWatched: boolean;
}) {
  const isGainer = type === 'gainer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="premium-card p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Rank */}
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
            rank === 1 && isGainer ? 'bg-emerald-500/20 text-emerald-400' :
            rank === 1 ? 'bg-red-500/20 text-red-400' :
            'bg-gray-800 text-gray-500'
          )}>
            #{rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs">{alert.countryFlag}</span>
              <h3 className="text-sm font-semibold text-white truncate">{alert.cityName}</h3>
              {isWatched && (
                <Eye className="w-3 h-3 text-luxury-gold-400" />
              )}
            </div>
            <p className="text-[10px] text-gray-500">{alert.countryName}</p>

            {/* Reason */}
            <p className="text-[9px] text-gray-600 mt-1 leading-tight">{alert.reason}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Score change */}
          <div className="text-center">
            <div className="flex items-center gap-0.5">
              <span className="text-lg font-bold text-white">{alert.currentScore}</span>
              {isGainer ? (
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-red-400" />
              )}
            </div>
            <p className="text-[8px] text-gray-500">from {alert.previousScore}</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          {/* Delta */}
          <div className="text-center">
            <p className={cn(
              'text-lg font-bold',
              isGainer ? 'text-emerald-400' : 'text-red-400'
            )}>
              {isGainer ? '+' : ''}{alert.delta}
            </p>
            <p className="text-[8px] text-gray-500">points</p>
          </div>
          {/* Predicted */}
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-sm font-bold text-emerald-400">+{alert.predictedAppreciation}%</p>
            <p className="text-[8px] text-gray-500">predicted</p>
          </div>
        </div>

        {/* Watch button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWatch(); }}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isWatched ? 'text-luxury-gold-400 hover:bg-luxury-gold-500/10' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
          )}
          title={isWatched ? 'Unwatch' : 'Watch'}
        >
          {isWatched ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// WATCHLIST ALERT CARD
// ============================================================

function WatchlistAlertCard({ alert, onNavigate }: {
  alert: BriefingAlert;
  onNavigate: (path: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-full bg-luxury-gold-500/10 flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5 text-luxury-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs">{alert.countryFlag}</span>
              <h4 className="text-xs font-semibold text-white">{alert.cityName}</h4>
              <span className="text-[8px] text-gray-500">· {alert.countryName}</span>
            </div>
            <p className="text-[9px] text-gray-400 leading-tight">
              Gravity score changed from <span className="text-white">{alert.previousScore}</span> to{' '}
              <span className={cn(
                'font-bold',
                alert.delta > 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {alert.currentScore}
              </span>{' '}
              ({alert.delta > 0 ? '+' : ''}{alert.delta} pts, exceeds 5pt threshold)
            </p>
            <p className="text-[8px] text-gray-600 mt-1">{alert.reason}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate(`/gravity`)}
          className="text-[9px] text-luxury-gold-400 hover:text-luxury-gold-300 shrink-0"
        >
          View →
        </button>
      </div>
    </motion.div>
  );
}
