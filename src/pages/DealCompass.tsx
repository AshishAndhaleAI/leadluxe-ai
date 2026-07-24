// ============================================================
// TerraNexus AI — Deal Compass
// A unique visual tool that helps users navigate global markets
// with AI-driven recommendations. This is NOT a traditional
// dashboard — it's an intelligence navigation system.
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Compass, MapPin, TrendingUp, TrendingDown, Zap, Target,
  Globe, ChevronRight, Sparkles, Eye, Star,
  BarChart3, Building2, Layers, CheckCircle, SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES } from '../lib/global-data';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { RadarChart, ComparisonTable } from '../components/charts/RadarChart';
import type { RadarMetric, RadarDataPoint } from '../components/charts/RadarChart';

type CompassMode = 'hot-markets' | 'emerging' | 'undervalued' | 'high-growth';
type SortKey = 'confidence' | 'growth' | 'value' | 'opportunities';

const CHART_COLORS = ['#d4a030', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b'];

interface MarketIntelligence {
  countryCode: string;
  countryName: string;
  flag: string;
  cities: typeof CITIES[string];
  avgConfidence: number;
  avgGrowth: number;
  totalOpportunities: number;
  avgPricePerSqft: number;
  totalValue: number;
  foreignDemand: number;
  investorInterest: number;
  primarySegment: string;
  tags: Set<string>;
  opportunityDensity: number;
  marketScore: number;
  trend: 'rising' | 'stable' | 'declining';
}

export function DealCompass() {
  const navigate = useNavigate();
  const { opportunities } = useOpportunityEngine();
  const [mode, setMode] = useState<CompassMode>('hot-markets');
  const [sortBy, setSortBy] = useState<SortKey>('confidence');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  // Build market intelligence from global data
  const markets = useMemo((): MarketIntelligence[] => {
    return COUNTRIES
      .filter(c => c.active)
      .map(country => {
        const countryCities = CITIES[country.code] || [];
        if (countryCities.length === 0) return null;

        const avgConf = countryCities.reduce((s, c) => s + c.confidence, 0) / countryCities.length;
        const avgGrowth = countryCities.reduce((s, c) => s + c.priceTrend, 0) / countryCities.length;
        const totalOpps = countryCities.reduce((s, c) => s + c.activeProjects, 0);
        const avgPpsqft = countryCities.reduce((s, c) => s + c.pricePerSqft, 0) / countryCities.length;
        const foreignDemand = countryCities.reduce((s, c) => s + c.foreignDemand, 0) / countryCities.length;
        const investorInterest = countryCities.reduce((s, c) => s + c.investorInterest, 0) / countryCities.length;
        const totalValue = countryCities.reduce((s, c) => s + c.pricePerSqft * c.activeProjects * 1000, 0);

        const tags = new Set<string>();
        countryCities.forEach(c => c.tags.forEach(t => tags.add(t)));

        const luxuryCount = countryCities.filter(c => c.tags.includes('luxury')).length;
        const primarySegment = luxuryCount > countryCities.length / 3
          ? 'Luxury'
          : countryCities.some(c => c.tags.includes('commercial'))
            ? 'Commercial'
            : countryCities.some(c => c.tags.includes('affordable'))
              ? 'Affordable Housing'
              : 'Mixed';

        // Calculate opportunity density (higher = more deals per city)
        const oppDensity = Math.round((totalOpps / Math.max(countryCities.length, 1)) * 10) / 10;

        // Overall market score
        const score = Math.round(
          avgConf * 0.35 +
          avgGrowth * 2.5 +
          foreignDemand * 0.15 +
          investorInterest * 0.15 +
          oppDensity * 0.1
        );

        const trend: 'rising' | 'stable' | 'declining' =
          avgGrowth > 8 ? 'rising' : avgGrowth > 3 ? 'stable' : 'declining';

        return {
          countryCode: country.code,
          countryName: country.name,
          flag: country.flag,
          cities: countryCities,
          avgConfidence: Math.round(avgConf),
          avgGrowth: Math.round(avgGrowth * 10) / 10,
          totalOpportunities: totalOpps,
          avgPricePerSqft: Math.round(avgPpsqft),
          totalValue,
          foreignDemand: Math.round(foreignDemand),
          investorInterest: Math.round(investorInterest),
          primarySegment,
          tags,
          opportunityDensity: oppDensity,
          marketScore: Math.min(score, 100),
          trend,
        };
      })
      .filter((m): m is MarketIntelligence => m !== null);
  }, []);

  // Filter and sort based on mode
  const filteredMarkets = useMemo(() => {
    let list = [...markets];

    switch (mode) {
      case 'hot-markets':
        list = list.filter(m => m.marketScore >= 75);
        break;
      case 'emerging':
        list = list.filter(m => m.avgGrowth > 8 && m.avgPricePerSqft < 500);
        break;
      case 'undervalued':
        list = list.filter(m => m.avgGrowth > 5 && m.avgConfidence > 70 && m.avgPricePerSqft < 1000);
        break;
      case 'high-growth':
        list = list.filter(m => m.avgGrowth > 10);
        break;
    }

    switch (sortBy) {
      case 'confidence':
        list.sort((a, b) => b.avgConfidence - a.avgConfidence);
        break;
      case 'growth':
        list.sort((a, b) => b.avgGrowth - a.avgGrowth);
        break;
      case 'value':
        list.sort((a, b) => b.totalValue - a.totalValue);
        break;
      case 'opportunities':
        list.sort((a, b) => b.totalOpportunities - a.totalOpportunities);
        break;
    }

    return list;
  }, [markets, mode, sortBy]);

  // Comparison data
  const compareMetrics: RadarMetric[] = [
    { key: 'confidence', label: 'Confidence', maxValue: 100 },
    { key: 'growth', label: 'Growth %', maxValue: 25 },
    { key: 'foreignDemand', label: 'Foreign Demand', maxValue: 100 },
    { key: 'investorInterest', label: 'Investor Interest', maxValue: 100 },
    { key: 'marketScore', label: 'Market Score', maxValue: 100 },
  ];

  const compareDataPoints: RadarDataPoint[] = useMemo(() => {
    const result: RadarDataPoint[] = [];
    const codes = Array.from(selectedForCompare);
    for (let ci = 0; ci < codes.length; ci++) {
      const code = codes[ci];
      const market = filteredMarkets.find(m => m.countryCode === code);
      if (!market) continue;
      result.push({
        id: market.countryCode,
        label: `${market.flag} ${market.countryName}`,
        color: CHART_COLORS[ci % CHART_COLORS.length],
        values: {
          confidence: market.avgConfidence,
          growth: market.avgGrowth,
          foreignDemand: market.foreignDemand,
          investorInterest: market.investorInterest,
          marketScore: market.marketScore,
        },
      });
    }
    return result;
  }, [selectedForCompare, filteredMarkets]);

  const toggleCompare = (countryCode: string) => {
    setSelectedForCompare(prev => {
      const next = new Set(prev);
      if (next.has(countryCode)) {
        next.delete(countryCode);
      } else if (next.size < 5) {
        next.add(countryCode);
      }
      return next;
    });
  };

  const selectAllInView = () => {
    setSelectedForCompare(new Set(filteredMarkets.map(m => m.countryCode).slice(0, 5)));
  };

  const clearCompare = () => {
    setSelectedForCompare(new Set());
  };

  const removeFromCompare = (code: string) => {
    setSelectedForCompare(prev => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  };

  // Stats summary
  const stats = useMemo(() => ({
    totalCountries: filteredMarkets.length,
    totalOpportunities: filteredMarkets.reduce((s, m) => s + m.totalOpportunities, 0),
    avgConfidence: filteredMarkets.length > 0
      ? Math.round(filteredMarkets.reduce((s, m) => s + m.marketScore, 0) / filteredMarkets.length)
      : 0,
    topGrowth: filteredMarkets.length > 0
      ? Math.max(...filteredMarkets.map(m => m.avgGrowth))
      : 0,
  }), [filteredMarkets]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-luxury-gold-500/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-luxury-gold-400" />
            </div>
            <h1 className="text-xl font-bold text-white font-display">Deal Compass</h1>
            <span className="px-2 py-0.5 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-[9px] font-medium text-luxury-gold-400">
              {markets.length} Markets
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            AI-powered global market intelligence. Navigate {markets.length} countries and{' '}
            {markets.reduce((s, m) => s + m.cities.length, 0)} cities to find your next deal.
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-luxury-surface border border-luxury-border">
        {([
          { key: 'hot-markets', label: 'Hot Markets', icon: Zap, desc: 'Top performing' },
          { key: 'emerging', label: 'Emerging', icon: Sparkles, desc: 'Up & coming' },
          { key: 'undervalued', label: 'Undervalued', icon: Target, desc: 'Hidden gems' },
          { key: 'high-growth', label: 'High Growth', icon: TrendingUp, desc: 'Fastest rising' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all',
              mode === tab.key
                ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border border-luxury-gold-500/20 shadow-gold'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className="text-[9px] text-gray-600 hidden sm:inline">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Compare Mode Toggle */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          {isComparing && selectedForCompare.size >= 2 && (
            <span className="text-[10px] text-gray-500">
              {selectedForCompare.size} of 5 selected
            </span>
          )}
          <button
            onClick={() => {
              setIsComparing(!isComparing);
              if (isComparing) clearCompare();
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all border',
              isComparing
                ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/30'
                : 'text-gray-500 hover:text-gray-300 border-transparent hover:border-gray-800'
            )}
          >
            <SlidersHorizontal className="w-3 h-3" />
            {isComparing ? 'Exit Compare' : 'Compare Markets'}
          </button>
        </div>
      </div>

      {/* Comparison Panel */}
      {isComparing && selectedForCompare.size >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          className="premium-card p-6 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Market Comparison</h3>
              <span className="text-[9px] text-gray-600">
                {selectedForCompare.size} markets · Hover chart for values
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllInView}
                className="text-[9px] text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Select Top 5 in View
              </button>
              <button
                onClick={clearCompare}
                className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="flex justify-center">
              <RadarChart
                metrics={compareMetrics}
                dataPoints={compareDataPoints}
                size={380}
              />
            </div>

            {/* Comparison Table */}
            <div>
              <ComparisonTable
                metrics={compareMetrics}
                dataPoints={compareDataPoints}
                onRemove={removeFromCompare}
              />

              <div className="mt-4 grid grid-cols-2 gap-2">
                {compareDataPoints.map(dp => {
                  const market = filteredMarkets.find(m => m.countryCode === dp.id);
                  const avgScore = Object.values(dp.values).reduce((s, v) => s + v, 0) / Object.values(dp.values).length;
                  return (
                    <div
                      key={dp.id}
                      className="glass-card p-3 text-center border-luxury-gold-500/10"
                    >
                      <p className="text-xs font-medium text-white">{dp.label}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: dp.color }}>
                        {Math.round(avgScore)}
                      </p>
                      <p className="text-[9px] text-gray-600">Avg Score</p>
                      {market && (
                        <p className="text-[9px] text-gray-600 mt-1">
                          {market.primarySegment} · ₹{market.avgPricePerSqft >= 1000
                            ? `${(market.avgPricePerSqft / 1000).toFixed(1)}K`
                            : market.avgPricePerSqft}/sqft
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Markets in View', value: stats.totalCountries, icon: Globe, color: 'text-luxury-gold-400' },
          { label: 'Active Opportunities', value: stats.totalOpportunities, icon: Target, color: 'text-emerald-400' },
          { label: 'Avg Market Score', value: `${stats.avgConfidence}/100`, icon: Star, color: 'text-amber-400' },
          { label: 'Top Growth Rate', value: `+${stats.topGrowth}%`, icon: TrendingUp, color: 'text-blue-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Sort & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider mr-2">Sort by</span>
          {([
            { key: 'confidence', label: 'Confidence' },
            { key: 'growth', label: 'Growth' },
            { key: 'value', label: 'Value' },
            { key: 'opportunities', label: 'Opps' },
          ] as const).map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
                sortBy === opt.key
                  ? 'bg-luxury-gold-500/15 text-luxury-gold-400'
                  : 'text-gray-600 hover:text-gray-400'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-600">
          {filteredMarkets.length} of {markets.length} markets
        </span>
      </div>

      {/* Market Cards */}
      <div className="grid gap-3">
        {filteredMarkets.map((market, i) => {
          const isSelected = selectedForCompare.has(market.countryCode);
          return (
          <motion.div
            key={market.countryCode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className={cn(
              'premium-card p-5 group transition-all',
              isComparing ? 'cursor-pointer' : 'cursor-pointer',
              isSelected && 'border-luxury-gold-500/50 ring-1 ring-luxury-gold-500/30',
              !isComparing && selectedCountry === market.countryCode && 'border-luxury-gold-500/40'
            )}
            onClick={() => {
              if (isComparing) {
                toggleCompare(market.countryCode);
              } else {
                setSelectedCountry(
                  selectedCountry === market.countryCode ? null : market.countryCode
                );
              }
            }}
          >
            {/* Main Row */}
            <div className="flex items-start gap-4">
              {/* Selection Checkbox (compare mode) */}
              {isComparing && (
                <div className="flex items-center justify-center mt-1">
                  <div className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-luxury-gold-500 border-luxury-gold-500 shadow-gold'
                      : 'border-gray-700 hover:border-gray-500'
                  )}>
                    {isSelected && <CheckCircle className="w-4 h-4 text-black" />}
                  </div>
                </div>
              )}

              {/* Flag + Country */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <span className="text-3xl">{market.flag}</span>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-luxury-gold-300 transition-colors">
                    {market.countryName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-600">{market.cities.length} cities</span>
                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                    <span className="text-[10px] text-gray-600">{market.primarySegment}</span>
                  </div>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 gap-3">
                {/* Market Score */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-luxury-gold-500/30 mb-1">
                    <span className={cn(
                      'text-sm font-bold',
                      market.marketScore >= 80 ? 'text-emerald-400' :
                      market.marketScore >= 60 ? 'text-luxury-gold-400' : 'text-amber-400'
                    )}>
                      {market.marketScore}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-600">Score</p>
                </div>

                {/* Growth */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className={cn(
                      'w-4 h-4',
                      market.trend === 'rising' ? 'text-emerald-400' :
                      market.trend === 'stable' ? 'text-amber-400' : 'text-red-400'
                    )} />
                    <span className={cn(
                      'text-sm font-bold',
                      market.trend === 'rising' ? 'text-emerald-400' :
                      market.trend === 'stable' ? 'text-amber-400' : 'text-red-400'
                    )}>
                      +{market.avgGrowth}%
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-600">YoY Growth</p>
                </div>

                {/* Confidence */}
                <div className="hidden sm:block text-center">
                  <p className="text-sm font-bold text-white">{market.avgConfidence}%</p>
                  <p className="text-[9px] text-gray-600">Confidence</p>
                </div>

                {/* Opportunities */}
                <div className="text-center">
                  <p className="text-sm font-bold text-luxury-gold-400">{market.totalOpportunities}</p>
                  <p className="text-[9px] text-gray-600">Projects</p>
                </div>

                {/* Avg Price */}
                <div className="hidden sm:block text-center">
                  <p className="text-sm font-bold text-white">
                    {market.avgPricePerSqft >= 1000
                      ? `${(market.avgPricePerSqft / 1000).toFixed(1)}K`
                      : market.avgPricePerSqft}
                  </p>
                  <p className="text-[9px] text-gray-600">Avg /sqft</p>
                </div>

                {/* Investor Interest */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">{market.investorInterest}%</span>
                  </div>
                  <p className="text-[9px] text-gray-600">Interest</p>
                </div>
              </div>

              {/* Expand indicator */}
              <ChevronRight className={cn(
                'w-4 h-4 text-gray-600 transition-transform mt-2 shrink-0',
                selectedCountry === market.countryCode && 'rotate-90'
              )} />
            </div>

            {/* Expanded City Details */}
            <AnimatePresence>
              {selectedCountry === market.countryCode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="divider-gold mt-4 mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {market.cities.slice(0, 9).map(city => (
                      <div
                        key={city.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/deal-room');
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group/city"
                      >
                        <MapPin className="w-3.5 h-3.5 text-luxury-gold-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate group-hover/city:text-luxury-gold-300 transition-colors">
                            {city.name}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] text-gray-600 mt-0.5">
                            <span className="text-emerald-400">+{city.priceTrend}%</span>
                            <span>·</span>
                            <span>{city.activeProjects} projects</span>
                            <span>·</span>
                            <span className="text-amber-400">{city.confidence}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-medium text-luxury-gold-400">
                            ₹{city.pricePerSqft >= 1000
                              ? `${city.pricePerSqft / 1000}K`
                              : city.pricePerSqft}/sqft
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick stats for this country */}
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="glass-card p-3 text-center">
                      <p className="text-[9px] text-gray-600 mb-1">Foreign Demand</p>
                      <p className="text-sm font-bold text-emerald-400">{market.foreignDemand}%</p>
                    </div>
                    <div className="glass-card p-3 text-center">
                      <p className="text-[9px] text-gray-600 mb-1">Opp Density</p>
                      <p className="text-sm font-bold text-white">{market.opportunityDensity}/city</p>
                    </div>
                    <div className="glass-card p-3 text-center">
                      <p className="text-[9px] text-gray-600 mb-1">Segment</p>
                      <p className="text-xs font-bold text-luxury-gold-400 truncate">{market.primarySegment}</p>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/deal-room');
                      }}
                      className="glass-card p-3 text-center cursor-pointer hover:border-luxury-gold-500/30 transition-colors group/action"
                    >
                      <span className="text-xs text-luxury-gold-400 group-hover/action:underline">Browse Deals →</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="premium-card p-6 text-center">
        <p className="text-sm text-gray-400 mb-3">
          Ready to explore specific opportunities? Use the <span className="text-luxury-gold-400 font-semibold">AI Property Matchmaker</span> or browse the <span className="text-luxury-gold-400 font-semibold">Deal Room</span>.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate('/match')} className="btn-primary text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Matchmaker
          </button>
          <button onClick={() => navigate('/deal-room')} className="btn-outline text-xs">
            <Building2 className="w-3.5 h-3.5" />
            Deal Room
          </button>
          <button onClick={() => navigate('/gravity')} className="btn-outline text-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            Gravity Engine
          </button>
        </div>
      </div>
    </motion.div>
  );
}
