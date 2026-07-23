// ============================================================
// LeadLuxe AI — Investment Gravity Engine Page
// The world's first predictive capital flow intelligence system
// Shows where institutional money is heading before it arrives
// ============================================================

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Globe, MapPin, Zap, Activity,
  Shield, Target, ArrowRight, Sparkles, AlertTriangle, Info,
  Building2, Layers, Crosshair, Star, Search, Bell, Eye, EyeOff,
  BarChart3, CheckSquare, Square, X, IndianRupee, Percent, Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CITIES } from '../lib/global-data';

import { computeGravityRankings, getCategoryMeta } from '../lib/gravity/engine';
import { computeGravityScore } from '../lib/gravity/gravityScore';
import type { GravityAnalysis, GravityCategoryScore } from '../lib/gravity/types';
import type { CommissionPotential } from '../lib/gravity/commissionPotential';
import type { ClosingProbability } from '../lib/gravity/closingProbability';
import type { GravityScoreResult } from '../lib/gravity/gravityScore';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from '../lib/gravity/alerts';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// ============================================================
// RADAR CHART COLORS
// ============================================================

const COMPARE_COLORS = [
  { stroke: '#D4AF37', fill: '#D4AF3720', label: 'Gold' },
  { stroke: '#34D399', fill: '#34D39920', label: 'Emerald' },
  { stroke: '#60A5FA', fill: '#60A5FA20', label: 'Blue' },
  { stroke: '#A78BFA', fill: '#A78BFA20', label: 'Purple' },
  { stroke: '#FB7185', fill: '#FB718520', label: 'Rose' },
  { stroke: '#22D3EE', fill: '#22D3EE20', label: 'Cyan' },
];

// ============================================================
// HELPER — polar to Cartesian
// ============================================================

function polarToCartesian(
  cx: number, cy: number, radius: number, angleDeg: number,
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

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
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [gravityScores, setGravityScores] = useState<Map<string, GravityScoreResult>>(new Map());

  // Simulate a brief loading state for a premium feel
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const rankings = useMemo(() => computeGravityRankings(), []);
  const categoryMeta = useMemo(() => getCategoryMeta(), []);

  // Compute gravity scores for ALL ranked markets (top, emerging, undervalued, momentum)
  useEffect(() => {
    if (!rankings || isLoading) return;
    const allMarkets = [
      ...rankings.topMarkets,
      ...rankings.emergingMarkets,
      ...rankings.undervaluedMarkets,
      ...rankings.highestMomentum,
    ];
    const seen = new Set<string>();
    const scores = new Map<string, GravityScoreResult>();
    
    for (const analysis of allMarkets) {
      if (seen.has(analysis.microMarket.id)) continue;
      seen.add(analysis.microMarket.id);
      
      const m = analysis.microMarket;
      // Look up real city tags from the CITIES array
      const cityData = CITIES[m.countryCode]?.find(c => c.id === m.id);
      const tags = cityData?.tags || [];
      
      const result = computeGravityScore({
        id: m.id,
        name: m.name,
        countryCode: m.countryCode,
        pricePerSqft: m.pricePerSqft,
        priceTrend: m.priceTrend,
        absorptionRate: m.absorptionRate,
        averageRoi: m.averageRoi,
        foreignDemand: m.foreignDemand,
        investorInterest: m.investorInterest,
        activeProjects: m.activeProjects,
        upcomingLaunches: m.upcomingLaunches,
        confidence: m.confidence,
        tags,
        latitude: m.latitude,
        longitude: m.longitude,
      });
      scores.set(m.id, result);
    }
    setGravityScores(scores);
  }, [rankings, isLoading]);

  const handleToggleWatch = useCallback((analysis: GravityAnalysis) => {
    if (watchlist.some(w => w.cityId === analysis.microMarket.id)) {
      setWatchlist(removeFromWatchlist(analysis.microMarket.id));
    } else {
      setWatchlist(addToWatchlist(analysis));
    }
  }, [watchlist]);

  const handleToggleCompare = useCallback((id: string) => {
    setSelectedForCompare(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 6) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleClearCompare = useCallback(() => {
    setSelectedForCompare(new Set());
  }, []);

  // Build array of compared analyses from the full rankings
  const comparedAnalyses = useMemo(() => {
    const all = [
      ...rankings.topMarkets,
      ...rankings.emergingMarkets,
      ...rankings.undervaluedMarkets,
      ...rankings.highestMomentum,
    ];
    const seen = new Set<string>();
    const unique = all.filter(a => {
      if (seen.has(a.microMarket.id)) return false;
      seen.add(a.microMarket.id);
      return true;
    });
    return unique.filter(a => selectedForCompare.has(a.microMarket.id));
  }, [rankings, selectedForCompare]);

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

  // Check if all markets in the current category are already selected (up to 6)
  const allSelectedInCategory = useMemo(() => {
    const categoryIds = categorySource.slice(0, 6).map(a => a.microMarket.id);
    return categoryIds.every(id => selectedForCompare.has(id));
  }, [categorySource, selectedForCompare]);

  const handleSelectAllFromCategory = useCallback(() => {
    const ids = categorySource.map(a => a.microMarket.id).slice(0, 6);
    setSelectedForCompare(prev => {
      const next = new Set(prev);
      ids.forEach(id => {
        if (next.size < 6) next.add(id);
      });
      return next;
    });
  }, [categorySource]);

  const handleDeselectAllFromCategory = useCallback(() => {
    const ids = new Set(categorySource.map(a => a.microMarket.id));
    setSelectedForCompare(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, [categorySource]);

  const selectedAnalysis = useMemo(() => {
    if (!selectedMarket) return null;
    return selectedMarket;
  }, [selectedMarket]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-72" />
            <div className="skeleton h-4 w-96" />
          </div>
          <div className="skeleton h-8 w-40" />
        </div>
        {/* KPI skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="premium-card p-4">
              <div className="skeleton h-5 w-24 mb-3" />
              <div className="skeleton h-8 w-16 mb-2" />
              <div className="skeleton h-3 w-32" />
            </div>
          ))}
        </div>
        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="premium-card p-4">
                <div className="skeleton h-14 w-full" />
              </div>
            ))}
          </div>
          <div className="premium-card p-5">
            <div className="skeleton h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-luxury-gold-400" />
            </div>
            <h1 className="text-xl font-bold text-white font-display">Gravity Engine</h1>
            <span className="px-2 py-0.5 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-[9px] font-medium text-luxury-gold-400">
              BETA
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Predictive capital flow intelligence — analyzes 8 weighted signal components 
            across {rankings.totalMarkets} micro-markets to predict where institutional value 
            will flow before traditional signals appear.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
        {/* Select All / Deselect All button — only visible in compare mode */}
        {compareMode && (
          <div className="w-px h-5 bg-gray-800 mx-1" />
        )}
        {compareMode && (
          <button
            onClick={allSelectedInCategory ? handleDeselectAllFromCategory : handleSelectAllFromCategory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {allSelectedInCategory ? (
              <><X className="w-3 h-3" /> Deselect All</>
            ) : (
              <><CheckSquare className="w-3 h-3 text-luxury-gold-400" /> Select All</>
            )}
          </button>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Market Rankings */}
        <div className={cn('space-y-4', comparedAnalyses.length >= 2 ? 'lg:col-span-1' : 'lg:col-span-2')}>
          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
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
            <div className="w-px h-6 bg-gray-800" />
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) handleClearCompare();
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors',
                compareMode
                  ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {compareMode ? 'Exit Compare' : 'Compare'}
              {selectedForCompare.size > 0 && compareMode && (
                <span className="w-4 h-4 rounded-full bg-luxury-gold-500 text-[8px] font-bold text-black flex items-center justify-center">
                  {selectedForCompare.size}
                </span>
              )}
            </button>
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
                  compareMode={compareMode}
                  isCompared={selectedForCompare.has(analysis.microMarket.id)}
                  compareColor={comparedAnalyses.findIndex(a => a.microMarket.id === analysis.microMarket.id)}
                  onClick={() => setSelectedMarket(
                    selectedMarket?.microMarket.id === analysis.microMarket.id ? null : analysis
                  )}
                  onToggleWatch={() => handleToggleWatch(analysis)}
                  onToggleCompare={() => handleToggleCompare(analysis.microMarket.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Detail Panel or Comparison Panel */}
        <div className="space-y-4">
          {comparedAnalyses.length >= 2 && compareMode ? (
            <ComparePanel
              analyses={comparedAnalyses}
              onClear={handleClearCompare}
              onRemove={(id) => handleToggleCompare(id)}
              onNavigate={navigate}
              isWatched={(id) => watchlist.some(w => w.cityId === id)}
              onToggleWatch={(analysis) => handleToggleWatch(analysis)}
            />
          ) : selectedAnalysis ? (
            <MarketDetailPanel
              analysis={selectedAnalysis}
              gravityResult={gravityScores.get(selectedAnalysis.microMarket.id)}
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
    </ErrorBoundary>
  );
}

// ============================================================
// MARKET CARD COMPONENT
// ============================================================

function MarketCard({ analysis, rank, isSelected, isWatched, compareMode, isCompared, compareColor, onClick, onToggleWatch, onToggleCompare }: {
  analysis: GravityAnalysis;
  rank: number;
  isSelected: boolean;
  isWatched: boolean;
  compareMode: boolean;
  isCompared: boolean;
  compareColor: number;
  onClick: () => void;
  onToggleWatch: () => void;
  onToggleCompare: () => void;
}) {
  const { microMarket: m } = analysis;
  const scoreColor = analysis.overallScore >= 85 ? 'text-luxury-gold-400' :
    analysis.overallScore >= 75 ? 'text-emerald-400' :
    analysis.overallScore >= 60 ? 'text-blue-400' : 'text-gray-400';

  const colorIndex = compareColor >= 0 && compareColor < COMPARE_COLORS.length ? compareColor : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.02 }}
      onClick={compareMode ? undefined : onClick}
      className={cn(
        'premium-card p-4 transition-all',
        compareMode ? '' : 'cursor-pointer',
        isSelected ? 'border-luxury-gold-500/30 ring-1 ring-luxury-gold-500/20' : 'hover:border-gray-700/50',
        isCompared && compareMode && 'ring-1'
      )}
      style={isCompared && compareMode ? {
        borderColor: COMPARE_COLORS[colorIndex].stroke + '50',
        '--tw-ring-color': COMPARE_COLORS[colorIndex].stroke,
      } as React.CSSProperties : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Compare checkbox */}
          {compareMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
              className="mt-1 shrink-0"
            >
              {isCompared ? (
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ backgroundColor: COMPARE_COLORS[colorIndex].stroke }}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-black" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded border border-gray-600 flex items-center justify-center hover:border-gray-400">
                  <Square className="w-3.5 h-3.5 text-gray-500" />
                </div>
              )}
            </button>
          )}

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
          {!compareMode && (
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
          )}

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
        {!compareMode && (
          <ArrowRight className={cn(
            'w-4 h-4 transition-transform',
            isSelected ? 'rotate-90 text-luxury-gold-400' : 'text-gray-600'
          )} />
        )}
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

function MarketDetailPanel({ analysis, gravityResult, onNavigate, isWatched, onToggleWatch }: {
  analysis: GravityAnalysis;
  gravityResult?: GravityScoreResult;
  onNavigate: (path: string) => void;
  isWatched: boolean;
  onToggleWatch: () => void;
}) {
  const { microMarket: m, categoryScores } = analysis;
  const commission = gravityResult?.commissionPotential;
  const closingProb = gravityResult?.closingProbability;

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

      {/* Key Drivers — Infrastructure + Demand Momentum */}
      {gravityResult && (
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-3.5 h-3.5 text-luxury-gold-400" />
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Key Drivers</h3>
          </div>
          <div className="space-y-2">
            {/* Infrastructure Projects */}
            {gravityResult.infrastructureImpact.keyInfrastructure.length > 0 && (
              <div>
                <p className="text-[8px] text-gray-600 mb-1 uppercase tracking-wider">Infrastructure</p>
                <div className="space-y-1">
                  {gravityResult.infrastructureImpact.keyInfrastructure.slice(0, 3).map((proj, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1" />
                      <p className="text-[9px] text-gray-300 leading-relaxed">{proj}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Demand Momentum Drivers */}
            {gravityResult.demandMomentum.keyDrivers.length > 0 && (
              <div>
                <p className="text-[8px] text-gray-600 mb-1 mt-2 uppercase tracking-wider">Market Momentum</p>
                <div className="space-y-1">
                  {gravityResult.demandMomentum.keyDrivers.slice(0, 3).map((driver, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-luxury-gold-400 mt-1" />
                      <p className="text-[9px] text-gray-300 leading-relaxed">{driver}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Infrastructure Impact Score */}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-800">
              <div className="text-center">
                <p className="text-sm font-bold text-luxury-gold-400">{gravityResult.infrastructureImpact.overallImpactScore}</p>
                <p className="text-[7px] text-gray-600">Infra Impact</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-emerald-400">+{gravityResult.infrastructureImpact.estimatedValueAcceleration}%</p>
                <p className="text-[7px] text-gray-600">Value Boost</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">{gravityResult.demandMomentum.demandSupplyRatio.toFixed(1)}x</p>
                <p className="text-[7px] text-gray-600">D/S Ratio</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-amber-400">{gravityResult.demandMomentum.weeksUntilInventoryDepletion}w</p>
                <p className="text-[7px] text-gray-600">Inventory Life</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Prediction */}
      {commission && (
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <IndianRupee className="w-3.5 h-3.5 text-luxury-gold-400" />
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Commission Prediction</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-card p-2 text-center">
              <p className="text-xs font-bold text-emerald-400">{commission.formatted}</p>
              <p className="text-[7px] text-gray-600">Est. Deal Value</p>
            </div>
            <div className="glass-card p-2 text-center">
              <p className="text-xs font-bold text-luxury-gold-400">{commission.expectedFormatted}</p>
              <p className="text-[7px] text-gray-600">Expected Commission</p>
            </div>
            <div className="glass-card p-2 text-center">
              <p className="text-xs font-bold text-white">{commission.dealProbability}%</p>
              <p className="text-[7px] text-gray-600">Deal Probability</p>
            </div>
            <div className="glass-card p-2 text-center">
              <p className="text-xs font-bold text-amber-400">{commission.totalFormatted}</p>
              <p className="text-[7px] text-gray-600">Total Addressable</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[8px] text-gray-600">
            <span>Rate: {commission.commissionRate * 100}%</span>
            <span>Market depth: {commission.marketDepth.toLocaleString()} units</span>
            <span className={cn(
              'px-1 py-0.5 rounded',
              commission.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
              commission.confidence === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-gray-800 text-gray-500'
            )}>{commission.confidence} confidence</span>
          </div>
        </div>
      )}

      {/* Closing Probability */}
      {closingProb && (
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Percent className="w-3.5 h-3.5 text-luxury-gold-400" />
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Closing Probability</h3>
          </div>
          <div className="flex items-center justify-center mb-3">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke={closingProb.probability30d >= 50 ? '#34D399' : closingProb.probability30d >= 30 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(closingProb.probability30d / 100) * 213.6} 213.6`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{closingProb.probability30d}%</span>
              </div>
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex items-center gap-2 text-[9px] text-gray-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>30 days: {closingProb.probability30d}%</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-gray-500">
                <div className="w-2 h-2 rounded-full bg-luxury-gold-500" />
                <span>90 days: {closingProb.probability90d}%</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-gray-500">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>180 days: {closingProb.probability180d}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-gray-600">
            <Clock className="w-3 h-3" />
            <span>Est. close: ~{closingProb.estimatedDaysToClose} days</span>
            <span className="mx-1">·</span>
            <span>90% CI: {closingProb.confidenceInterval[0]}%–{closingProb.confidenceInterval[1]}%</span>
          </div>
        </div>
      )}

      {/* Enhanced AI Reasoning */}
      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-3.5 h-3.5 text-luxury-gold-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">AI Reasoning</h3>
        </div>
        <div className="space-y-1.5">
          {gravityResult?.reasoning.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-luxury-gold-400 mt-1.5 shrink-0" />
              <p className="text-[9px] text-gray-300 leading-relaxed">{r}</p>
            </div>
          ))}
          {!gravityResult && analysis.reasoning.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-luxury-gold-400 mt-1.5 shrink-0" />
              <p className="text-[9px] text-gray-300 leading-relaxed">{r}</p>
            </div>
          ))}
        </div>
        {/* Closing recommendation */}
        {closingProb && (
          <div className={cn(
            'mt-3 p-2.5 rounded-lg border text-[9px]',
            closingProb.probability30d >= 50
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : closingProb.probability30d >= 30
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          )}>
            {closingProb.recommendation}
          </div>
        )}
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

// ============================================================
// COMPARE PANEL — shows radar chart overlay + side-by-side metrics
// ============================================================

function ComparePanel({ analyses, onClear, onRemove, onNavigate, isWatched, onToggleWatch }: {
  analyses: GravityAnalysis[];
  onClear: () => void;
  onRemove: (id: string) => void;
  onNavigate: (path: string) => void;
  isWatched: (id: string) => boolean;
  onToggleWatch: (analysis: GravityAnalysis) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="premium-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-luxury-gold-400" />
            <h2 className="text-sm font-bold text-white">Market Comparison</h2>
            <span className="px-1.5 py-0.5 rounded bg-luxury-gold-500/10 text-[9px] font-medium text-luxury-gold-400">
              {analyses.length} selected
            </span>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        </div>

        {/* Radar Chart */}
        <div className="flex justify-center">
          <RadarChartSVG analyses={analyses} />
        </div>
      </div>

      {/* Legend */}
      <div className="premium-card p-4">
        <h3 className="text-[10px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">Selected Markets</h3>
        <div className="space-y-2">
          {analyses.map((a, i) => {
            const color = COMPARE_COLORS[i % COMPARE_COLORS.length];
            return (
              <div key={a.microMarket.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.stroke }} />
                  <span className="text-xs text-white font-medium">{a.microMarket.name}</span>
                  <span className="text-[10px] text-gray-500">{a.microMarket.countryFlag}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-bold',
                    a.overallScore >= 85 ? 'text-luxury-gold-400' :
                    a.overallScore >= 75 ? 'text-emerald-400' : 'text-amber-400'
                  )}>{a.overallScore}</span>
                  <button
                    onClick={() => onRemove(a.microMarket.id)}
                    className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Category Scores */}
      <div className="premium-card p-4">
        <h3 className="text-[10px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">Category Scores</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-1.5 pr-3 font-medium">Category</th>
                {analyses.map((a, i) => {
                  const color = COMPARE_COLORS[i % COMPARE_COLORS.length];
                  return (
                    <th key={a.microMarket.id} className="text-center py-1.5 px-2 font-medium">
                      <span style={{ color: color.stroke }}>{a.microMarket.name}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {analyses[0]?.categoryScores.map((cat, catIdx) => (
                <tr key={cat.category} className="border-b border-gray-800/30">
                  <td className="py-1.5 pr-3 text-gray-300">
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </td>
                  {analyses.map((a, i) => {
                    const score = a.categoryScores[catIdx]?.score ?? 0;
                    return (
                      <td key={a.microMarket.id} className="text-center py-1.5 px-2">
                        <span className={cn(
                          'font-bold',
                          score >= 70 ? 'text-luxury-gold-400' :
                          score >= 50 ? 'text-emerald-400' : 'text-gray-400'
                        )}>{score}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Gravity score row */}
              <tr className="border-t border-gray-700">
                <td className="py-1.5 pr-3 font-semibold text-white">Gravity Score</td>
                {analyses.map((a, i) => (
                  <td key={a.microMarket.id} className="text-center py-1.5 px-2">
                    <span className={cn(
                      'font-bold',
                      a.overallScore >= 85 ? 'text-luxury-gold-400' :
                      a.overallScore >= 75 ? 'text-emerald-400' : 'text-amber-400'
                    )}>{a.overallScore}</span>
                  </td>
                ))}
              </tr>
              {/* Predicted appreciation row */}
              <tr className="border-b border-gray-800/30">
                <td className="py-1.5 pr-3 font-semibold text-white">Predicted App.</td>
                {analyses.map((a, i) => (
                  <td key={a.microMarket.id} className="text-center py-1.5 px-2 font-bold text-emerald-400">
                    +{a.predictedAppreciation}%
                  </td>
                ))}
              </tr>
              {/* Risk level row */}
              <tr>
                <td className="py-1.5 pr-3 font-semibold text-white">Risk</td>
                {analyses.map((a, i) => (
                  <td key={a.microMarket.id} className="text-center py-1.5 px-2">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-medium',
                      a.microMarket.riskLevel === 'low' ? 'bg-emerald-500/15 text-emerald-400' :
                      a.microMarket.riskLevel === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    )}>
                      {a.microMarket.riskLevel.toUpperCase()}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions per market */}
      <div className="premium-card p-4">
        <h3 className="text-[10px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">Actions</h3>
        <div className="space-y-2">
          {analyses.map((a, i) => {
            const color = COMPARE_COLORS[i % COMPARE_COLORS.length];
            return (
              <div key={a.microMarket.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.stroke }} />
                  <span className="text-xs text-white">{a.microMarket.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleWatch(a)}
                    className={cn(
                      'px-2 py-1 rounded text-[9px] font-medium transition-colors',
                      isWatched(a.microMarket.id)
                        ? 'bg-luxury-gold-500/20 text-luxury-gold-400'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    )}
                  >
                    {isWatched(a.microMarket.id) ? 'Watching' : 'Watch'}
                  </button>
                  <button
                    onClick={() => onNavigate(`/opportunities?city=${a.microMarket.id}`)}
                    className="px-2 py-1 rounded bg-gray-800 text-[9px] font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Opportunities
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SVG RADAR CHART — overlays multiple markets on 5 category axes
// ============================================================

function RadarChartSVG({ analyses }: { analyses: GravityAnalysis[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 100;
  const levels = 5;

  const categories = analyses[0]?.categoryScores ?? [];
  const numAxes = categories.length; // 5
  const angleStep = 360 / numAxes;

  // Build grid rings (10, 20, 30, ... 100)
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const radius = ((i + 1) / levels) * maxRadius;
    const points = Array.from({ length: numAxes + 1 }, (_, j) => {
      const { x, y } = polarToCartesian(cx, cy, radius, j * angleStep);
      return `${x},${y}`;
    }).join(' ');
    return { radius, points, label: Math.round(((i + 1) / levels) * 100) };
  });

  // Axis lines from center to edge
  const axes = Array.from({ length: numAxes }, (_, i) => {
    const angle = i * angleStep;
    const end = polarToCartesian(cx, cy, maxRadius, angle);
    const labelPos = polarToCartesian(cx, cy, maxRadius + 18, angle);
    return { angle, end, labelPos, category: categories[i] };
  });

  // Market polygons
  const polygons = analyses.map((analysis, marketIdx) => {
    const color = COMPARE_COLORS[marketIdx % COMPARE_COLORS.length];
    const points = categories.map((_, catIdx) => {
      const score = analysis.categoryScores[catIdx]?.score ?? 0;
      const radius = (score / 100) * maxRadius;
      const angle = catIdx * angleStep;
      const { x, y } = polarToCartesian(cx, cy, radius, angle);
      return { x, y, score };
    });
    const pointStr = points.map(p => `${p.x},${p.y}`).join(' ');
    return { color, points, pointStr };
  });

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid rings */}
        {gridRings.map((ring, i) => (
          <polygon
            key={i}
            points={ring.points}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        ))}

        {/* Grid labels */}
        {gridRings.filter((_, i) => i === levels - 1 || i === 0).map((ring, i) => (
          <text
            key={i}
            x={cx + 4}
            y={cy - ring.radius + 3}
            fill="rgba(255,255,255,0.15)"
            fontSize="7"
            fontFamily="monospace"
          >
            {ring.label}
          </text>
        ))}

        {/* Axis lines */}
        {axes.map((axis, i) => (
          <g key={i}>
            <line
              x1={cx}
              y1={cy}
              x2={axis.end.x}
              y2={axis.end.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.5"
            />
            <text
              x={axis.labelPos.x}
              y={axis.labelPos.y}
              fill="rgba(255,255,255,0.35)"
              fontSize="8"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="system-ui"
            >
              {axis.category.icon}
            </text>
          </g>
        ))}

        {/* Market polygons */}
        {polygons.map((poly, i) => (
          <g key={i}>
            {/* Fill */}
            <polygon
              points={poly.pointStr}
              fill={poly.color.fill}
              stroke="none"
            />
            {/* Stroke */}
            <polygon
              points={poly.pointStr}
              fill="none"
              stroke={poly.color.stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Data points */}
            {poly.points.map((pt, j) => (
              <circle
                key={j}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill={poly.color.stroke}
                stroke="#111"
                strokeWidth="1"
              />
            ))}
          </g>
        ))}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="1.5" fill="rgba(255,255,255,0.15)" />
      </svg>
    </div>
  );
}
