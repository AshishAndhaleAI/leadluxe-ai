// ============================================================
// LeadLuxe AI — Investment Gravity Engine Page
// The world's first predictive capital flow intelligence system
// Shows where institutional money is heading before it arrives
// ============================================================

import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Globe, MapPin, Zap, Activity,
  Shield, Target, ArrowRight, Sparkles, AlertTriangle, Info,
  Building2, Layers, Crosshair, Star, Search, Bell, Eye, EyeOff
} from 'lucide-react';
import { cn } from '../lib/utils';

import { computeGravityRankings, getCityGravityAnalysis, getCategoryMeta } from '../lib/gravity/engine';
import type { GravityAnalysis, GravityCategoryScore } from '../lib/gravity/types';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from '../lib/gravity/alerts';

// ============================================================
// MAIN PAGE
// ============================================================

export function GravityEngine() {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState<GravityAnalysis | null>(null);
  const [activeCategory, setActiveCategory] = useState<'top' | 'emerging' | 'undervalued' | 'momentum'>('top');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState(getWatchlist());

  const rankings = useMemo(() => computeGravityRankings(), []);
  const categoryMeta = useMemo(() => getCategoryMeta(), []);

  const handleToggleWatch = useCallback((analysis: GravityAnalysis) => {
    if (watchlist.some(w => w.cityId === analysis.microMarket.id)) {
      setWatchlist(removeFromWatchlist(analysis.microMarket.id));
    } else {
      setWatchlist(addToWatchlist(analysis));
    }
  }, [watchlist]);

  // Get the source list based on active category
  const categorySource = useMemo(() => {
    switch (activeCategory) {
      case 'top': return rankings.topMarkets;
      case 'emerging': return rankings.emergingMarkets;
      case 'undervalued': return rankings.undervaluedMarkets;
      case 'momentum': return rankings.highestMomentum;
      default: return rankings.topMarkets;
    }
  }, [rankings, activeCategory]);

  // Filter markets by risk level and search
  const filteredMarkets = useMemo(() => {
    let markets = categorySource;
    if (filterRisk !== 'all') {
      markets = markets.filter(m => m.microMarket.riskLevel === filterRisk);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      markets = markets.filter(m => 
        m.microMarket.name.toLowerCase().includes(q) || 
        m.microMarket.countryName.toLowerCase().includes(q)
      );
    }
    return markets;
  }, [categorySource, filterRisk, searchQuery]);

  const selectedAnalysis = useMemo(() => {
    if (!selectedMarket) return null;
    return selectedMarket;
  }, [selectedMarket]);

  return (
    <div className="space-y-6">
      {/* Header */}          <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-luxury-gold-400" />
            </div>
            <h1 className="text-xl font-bold text-white font-display">Investment Gravity Engine</h1>
            <span className="px-2 py-0.5 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-[9px] font-medium text-luxury-gold-400">
              BETA
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Predictive capital flow intelligence — analyzes 5 non-obvious signal categories 
            across {rankings.totalMarkets} micro-markets to predict where institutional value 
            will flow before traditional signals appear.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/briefing')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-luxury-gold-500/20 border border-luxury-gold-500/30 rounded-lg text-[10px] font-medium text-luxury-gold-400 hover:bg-luxury-gold-500/30 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            Daily Briefing
            {watchlist.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-luxury-gold-500 text-[8px] font-bold text-black flex items-center justify-center">
                {watchlist.length}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[9px] text-gray-600">Last analysis</p>
            <p className="text-[10px] text-gray-400">
              {new Date(rankings.generatedAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-right">
            <p className="text-[9px] text-gray-600">Markets tracked</p>
            <p className="text-[10px] text-luxury-gold-400 font-bold">{rankings.totalMarkets}</p>
          </div>
        </div>
      </div>

      {/* Category Tabs — clickable KPI cards that switch the active list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { key: 'top' as const, label: 'Top Gravity Markets', value: rankings.topMarkets.length, sub: 'Score ≥ 75', icon: Star, color: 'text-luxury-gold-400', bg: 'bg-luxury-gold-500/10' },
          { key: 'emerging' as const, label: 'Emerging Opportunities', value: rankings.emergingMarkets.length, sub: 'Score 60-74, low price', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { key: 'undervalued' as const, label: 'Undervalued Markets', value: rankings.undervaluedMarkets.length, sub: 'Gravity > Confidence', icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { key: 'momentum' as const, label: 'Highest Momentum', value: rankings.highestMomentum[0]?.microMarket.priceTrend.toFixed(1) + '%', sub: 'Fastest price acceleration', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ] as const).map((stat, i) => (
          <motion.button
            key={stat.label}
            onClick={() => setActiveCategory(stat.key)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'premium-card p-4 text-left transition-all cursor-pointer',
              activeCategory === stat.key
                ? 'ring-2 ring-luxury-gold-500/40 border-luxury-gold-500/30'
                : 'hover:border-gray-600/50 hover:bg-white/[0.02]'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              {activeCategory === stat.key && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-luxury-gold-400 animate-pulse" />
              )}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-gray-600">{stat.sub}</p>
          </motion.button>
        ))}
      </div>

      {/* Category Tab Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-900/60 border border-gray-800/50 w-fit">
        {[
          { key: 'top' as const, label: 'Top Markets', count: rankings.topMarkets.length },
          { key: 'emerging' as const, label: 'Emerging', count: rankings.emergingMarkets.length },
          { key: 'undervalued' as const, label: 'Undervalued', count: rankings.undervaluedMarkets.length },
          { key: 'momentum' as const, label: 'Momentum', count: rankings.highestMomentum.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all',
              activeCategory === tab.key
                ? 'bg-luxury-gold-500/15 text-luxury-gold-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            )}
          >
            {tab.label}
            <span className={cn(
              'px-1.5 py-0.5 rounded text-[8px] font-bold',
              activeCategory === tab.key
                ? 'bg-luxury-gold-500/20 text-luxury-gold-300'
                : 'bg-gray-800 text-gray-500'
            )}>
              {tab.count}
            </span>
            {activeCategory === tab.key && (
              <motion.div
                layoutId="tab-active"
                className="absolute inset-0 rounded-lg border border-luxury-gold-500/20 pointer-events-none"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Market Rankings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by city or country..."
                className="input-glass pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              {['all', 'low', 'medium', 'high'].map(risk => (
                <button
                  key={risk}
                  onClick={() => setFilterRisk(risk)}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-medium transition-colors',
                    filterRisk === risk
                      ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/20'
                      : 'text-gray-500 hover:text-white border border-transparent'
                  )}
                >
                  {risk === 'all' ? 'All' : risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                </button>
              ))}
            </div>
          </div>

          {/* Market Cards */}
          <div className="space-y-2">
            {filteredMarkets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No markets match your filter criteria</p>
              </div>
            ) : (
              filteredMarkets.map((analysis, i) => (
                <MarketCard
                  key={analysis.microMarket.id}
                  analysis={analysis}
                  rank={i + 1}
                  isSelected={selectedMarket?.microMarket.id === analysis.microMarket.id}
                  isWatched={watchlist.some(w => w.cityId === analysis.microMarket.id)}
                  onClick={() => setSelectedMarket(
                    selectedMarket?.microMarket.id === analysis.microMarket.id ? null : analysis
                  )}
                  onToggleWatch={() => handleToggleWatch(analysis)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="space-y-4">
          {selectedAnalysis ? (
            <MarketDetailPanel
              analysis={selectedAnalysis}
              onNavigate={navigate}
              isWatched={watchlist.some(w => w.cityId === selectedAnalysis.microMarket.id)}
              onToggleWatch={() => handleToggleWatch(selectedAnalysis)}
            />
          ) : (
            <div className="premium-card p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-luxury-gold-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Select a Market</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Click any market on the left to see its full Gravity Analysis — 
                including signal breakdowns, predicted appreciation, 
                optimal entry timing, and capital flow predictions.
              </p>
              <div className="divider-gold my-4" />
              <div className="grid grid-cols-2 gap-2 text-left">
                {Object.values(categoryMeta).slice(0, 4).map(meta => (
                  <div key={meta.label} className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/50">
                    <span className="text-base">{meta.icon}</span>
                    <div>
                      <p className="text-[9px] text-gray-500">{meta.label}</p>
                      <p className="text-[9px] text-gray-600">{Math.round(meta.weight * 100)}% weight</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Rankings Table */}
      <div className="premium-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">📊 Full Gravity Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 pr-4 font-medium">Rank</th>
                <th className="text-left py-2 pr-4 font-medium">Market</th>
                <th className="text-left py-2 pr-4 font-medium">Country</th>
                <th className="text-right py-2 pr-4 font-medium">Gravity Score</th>
                <th className="text-right py-2 pr-4 font-medium">Predicted App.</th>
                <th className="text-right py-2 pr-4 font-medium">Risk</th>
                <th className="text-right py-2 pr-4 font-medium">Entry Window</th>
                <th className="text-right py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rankings.topMarkets.map((a, i) => (
                <tr
                  key={a.microMarket.id}
                  className={cn(
                    'border-b border-gray-800/50 hover:bg-white/5 cursor-pointer transition-colors',
                    selectedMarket?.microMarket.id === a.microMarket.id && 'bg-luxury-gold-500/5'
                  )}
                  onClick={() => setSelectedMarket(a)}
                >
                  <td className="py-2.5 pr-4">
                    <span className={cn(
                      'font-bold',
                      i === 0 ? 'text-luxury-gold-400' : 'text-gray-400'
                    )}>#{i + 1}</span>
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-white">{a.microMarket.name}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{a.microMarket.countryFlag} {a.microMarket.countryName}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className={cn(
                      'font-bold',
                      a.overallScore >= 85 ? 'text-luxury-gold-400' :
                      a.overallScore >= 75 ? 'text-emerald-400' :
                      'text-amber-400'
                    )}>{a.overallScore}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-emerald-400 font-medium">
                    +{a.predictedAppreciation}%
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-medium',
                      a.microMarket.riskLevel === 'low' ? 'bg-emerald-500/15 text-emerald-400' :
                      a.microMarket.riskLevel === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    )}>
                      {a.microMarket.riskLevel}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-gray-400">{a.microMarket.optimalEntryWindow}</td>
                  <td className="py-2.5 text-right">
                    <span className={cn(
                      'text-[9px] font-medium',
                      a.isUndervalued ? 'text-emerald-400' : 'text-gray-500'
                    )}>
                      {a.optimalAction.split(' — ')[0]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How It Works */}
      <div className="premium-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">⚡ How Gravity Scoring Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {Object.values(categoryMeta).map((meta) => (
            <div key={meta.label} className="glass-card p-3 text-center">
              <span className="text-2xl block mb-1">{meta.icon}</span>
              <p className="text-[10px] font-semibold text-white mb-1">{meta.label}</p>
              <p className="text-[9px] text-gray-500 mb-1">{Math.round(meta.weight * 100)}% of score</p>
              <p className="text-[8px] text-gray-600 leading-tight">{meta.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MARKET CARD COMPONENT
// ============================================================

function MarketCard({ analysis, rank, isSelected, isWatched, onClick, onToggleWatch }: {
  analysis: GravityAnalysis;
  rank: number;
  isSelected: boolean;
  isWatched: boolean;
  onClick: () => void;
  onToggleWatch: () => void;
}) {
  const { microMarket: m } = analysis;
  const scoreColor = analysis.overallScore >= 85 ? 'text-luxury-gold-400' :
    analysis.overallScore >= 75 ? 'text-emerald-400' :
    analysis.overallScore >= 60 ? 'text-blue-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.02 }}
      onClick={onClick}
      className={cn(
        'premium-card p-4 cursor-pointer transition-all',
        isSelected ? 'border-luxury-gold-500/30 ring-1 ring-luxury-gold-500/20' : 'hover:border-gray-700/50'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Rank badge */}
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
            rank === 1 ? 'bg-luxury-gold-500/20 text-luxury-gold-400' :
            rank <= 3 ? 'bg-amber-500/10 text-amber-400' :
            'bg-gray-800 text-gray-500'
          )}>
            #{rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-white truncate">{m.name}</h3>
              <span className="text-xs">{m.countryFlag}</span>
              {analysis.isUndervalued && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[8px] font-medium text-emerald-400 border border-emerald-500/20">
                  UNDERVALUED
                </span>
              )}
              {isWatched && (
                <Eye className="w-3 h-3 text-luxury-gold-400" />
              )}
            </div>
            <p className="text-[10px] text-gray-500">{m.countryName} · {m.countryCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Watch button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWatch(); }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isWatched ? 'text-luxury-gold-400 hover:bg-luxury-gold-500/10' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
            )}
            title={isWatched ? 'Unwatch market' : 'Watch market'}
          >
            {isWatched ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Gravity Score */}
          <div className="text-center">
            <p className={cn('text-lg font-bold', scoreColor)}>{analysis.overallScore}</p>
            <p className="text-[8px] text-gray-600">GRAVITY</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          {/* Predicted Appreciation */}
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">+{analysis.predictedAppreciation}%</p>
            <p className="text-[8px] text-gray-600">PREDICTED</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          {/* Risk */}
          <div className="text-center">
            <p className={cn(
              'text-sm font-bold',
              m.riskLevel === 'low' ? 'text-emerald-400' :
              m.riskLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
            )}>
              {m.riskLevel === 'low' ? '✓' : m.riskLevel === 'medium' ? '~' : '!'}
            </p>
            <p className="text-[8px] text-gray-600">{m.riskLevel.toUpperCase()}</p>
          </div>
        </div>

        {/* Expand indicator */}
        <ArrowRight className={cn(
          'w-4 h-4 transition-transform',
          isSelected ? 'rotate-90 text-luxury-gold-400' : 'text-gray-600'
        )} />
      </div>

      {/* Signal preview (compact) */}
      <div className="mt-2 flex items-center gap-2 text-[8px] text-gray-600">
        {analysis.categoryScores.slice(0, 5).map(cat => (
          <span key={cat.category} className="flex items-center gap-0.5">
            <span>{cat.icon}</span>
            <span>{cat.score}</span>
          </span>
        ))}
        <span className="ml-auto text-[8px] text-gray-600">
          {analysis.reasoning[0]?.slice(0, 60)}...
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================
// MARKET DETAIL PANEL
// ============================================================

function MarketDetailPanel({ analysis, onNavigate, isWatched, onToggleWatch }: {
  analysis: GravityAnalysis;
  onNavigate: (path: string) => void;
  isWatched: boolean;
  onToggleWatch: () => void;
}) {
  const { microMarket: m, categoryScores } = analysis;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{m.countryFlag}</span>
            <h2 className="text-lg font-bold text-white font-display">{m.name}</h2>
          </div>
          <button
            onClick={onToggleWatch}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors',
              isWatched
                ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
            )}
          >
            {isWatched ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isWatched ? 'Watching' : 'Watch'}
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mb-3">{m.countryName} · {m.countryCode}</p>

        {/* Big Gravity Score */}
        <div className="text-center py-4">
          <div className={cn(
            'inline-flex items-center justify-center w-20 h-20 rounded-full border-4 text-3xl font-bold',
            analysis.overallScore >= 85 ? 'border-luxury-gold-500 text-luxury-gold-400' :
            analysis.overallScore >= 75 ? 'border-emerald-500 text-emerald-400' :
            analysis.overallScore >= 60 ? 'border-blue-500 text-blue-400' :
            'border-gray-600 text-gray-400'
          )}>
            {analysis.overallScore}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Gravity Score</p>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Predicted Appreciation', value: `+${analysis.predictedAppreciation}%`, color: 'text-emerald-400' },
            { label: 'Current Price Trend', value: `${m.priceTrend > 0 ? '+' : ''}${m.priceTrend}%`, color: m.priceTrend > 0 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Entry Window', value: m.optimalEntryWindow, color: 'text-luxury-gold-400' },
            { label: 'Risk Level', value: m.riskLevel.toUpperCase(), color: m.riskLevel === 'low' ? 'text-emerald-400' : m.riskLevel === 'medium' ? 'text-amber-400' : 'text-red-400' },
          ].map(metric => (
            <div key={metric.label} className="glass-card p-2 text-center">
              <p className={cn('text-xs font-bold', metric.color)}>{metric.value}</p>
              <p className="text-[8px] text-gray-500">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className={cn(
          'p-3 rounded-lg text-xs font-medium text-center',
          analysis.optimalAction.startsWith('BUY') ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
          analysis.optimalAction.startsWith('MONITOR') ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
          'bg-blue-500/15 text-blue-400 border border-blue-500/20'
        )}>
          {analysis.optimalAction}
        </div>
      </div>

      {/* Category Scores */}
      <div className="premium-card p-4">
        <h3 className="text-[10px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">Signal Categories</h3>
        <div className="space-y-3">
          {categoryScores.map(cat => (
            <CategoryScoreBar key={cat.category} cat={cat} />
          ))}
        </div>
      </div>

      {/* Signals */}
      <div className="premium-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Detected Signals ({m.signals.length})
          </h3>
          <span className={cn(
            'text-[8px] px-1.5 py-0.5 rounded font-medium',
            m.signals.filter(s => s.direction === 'positive').length > m.signals.length * 0.5
              ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          )}>
            {m.signals.filter(s => s.direction === 'positive').length} positive
          </span>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {m.signals.map(sig => (
            <div key={sig.id} className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white font-medium leading-tight">{sig.label}</p>
                  <p className="text-[8px] text-gray-500 mt-0.5 leading-tight">{sig.detail.slice(0, 120)}...</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={cn(
                    'text-xs font-bold',
                    sig.direction === 'positive' ? 'text-emerald-400' :
                    sig.direction === 'negative' ? 'text-red-400' : 'text-gray-400'
                  )}>
                    {sig.normalizedScore}
                  </span>
                  <span className="text-[7px] text-gray-600">score</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="premium-card p-4">
        <h3 className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">AI Reasoning</h3>
        <div className="space-y-1.5">
          {analysis.reasoning.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <Info className="w-3 h-3 text-luxury-gold-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-300 leading-tight">{r}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate(`/global-map?city=${m.cityId}`)}
          className="btn-primary flex-1"
        >
          <Globe className="w-3.5 h-3.5" />
          View on Globe
        </button>
        <button
          onClick={() => onNavigate(`/opportunities?city=${m.cityId}`)}
          className="btn-outline flex-1"
        >
          <Zap className="w-3.5 h-3.5" />
          Opportunities
        </button>
      </div>
    </div>
  );
}

// ============================================================
// CATEGORY SCORE BAR
// ============================================================

function CategoryScoreBar({ cat }: { cat: GravityCategoryScore }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{cat.icon}</span>
          <span className="text-[10px] text-gray-300">{cat.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-[10px] font-bold',
            cat.score >= 70 ? 'text-luxury-gold-400' :
            cat.score >= 50 ? 'text-emerald-400' : 'text-gray-400'
          )}>{cat.score}</span>
          <span className="text-[8px] text-gray-600">/100</span>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            cat.score >= 70 ? 'bg-gradient-to-r from-amber-500 to-luxury-gold-500' :
            cat.score >= 50 ? 'bg-gradient-to-r from-blue-500 to-emerald-400' :
            'bg-gray-600'
          )}
          style={{ width: `${cat.score}%` }}
        />
      </div>
      <p className="text-[8px] text-gray-600 mt-0.5">
        {cat.signalCount} signals · {Math.round(cat.weight * 100)}% weight · {cat.topSignal.slice(0, 50)}...
      </p>
    </div>
  );
}
