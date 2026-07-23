import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Search, ArrowUpDown, Sparkles, Building2, Globe, Loader2, CheckCircle2, Filter, X } from 'lucide-react';
import { useSupabaseOpportunities, computePipelineStats, type OpportunityFilters, type OpportunityRecord, DEFAULT_FILTERS } from '../lib/intelligence/supabaseOpportunityEngine';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';

const LOADING_STEPS = [
  { icon: Loader2, text: 'Initializing AI intelligence scanner…' },
  { icon: Globe, text: 'Scanning 100+ global cities for property data…' },
  { icon: Building2, text: 'Analyzing developer portfolios and project pipelines…' },
  { icon: Zap, text: 'Scoring and ranking verified investment opportunities…' },
  { icon: CheckCircle2, text: 'Rendering live opportunities for your market…' },
];

export function Opportunities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<OpportunityFilters['sortBy']>('confidence');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const filters: OpportunityFilters = useMemo(() => ({
    search,
    sortBy,
    sortDir,
    minConfidence: 0,
    countries: [],
    propertyTypes: [],
  }), [search, sortBy, sortDir]);

  const { opportunities, loading } = useSupabaseOpportunities(filters);

  // Animate loading steps
  useEffect(() => {
    if (!loading) { setLoadingStepIndex(LOADING_STEPS.length); return; }
    const interval = setInterval(() => {
      setLoadingStepIndex(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  // Pipeline stats from real data
  const pipelineStats = useMemo(() => computePipelineStats(opportunities), [opportunities]);

  const handleSortToggle = useCallback((field: OpportunityFilters['sortBy']) => {
    setSortBy(prev => {
      if (prev === field) {
        setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        return prev;
      }
      setSortDir('desc');
      return field;
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with live stats */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            {loading ? 'Initializing Scanner…' : `${pipelineStats.total} Verified Opportunities`}
          </h2>
          <p className="text-sm text-gray-500">
            {loading ? 'Connecting to data sources…' : 
              `${pipelineStats.countries} countries · ${formatIndianCurrency(pipelineStats.totalPipeline)} pipeline · ` +
              `$${pipelineStats.totalCommission.toLocaleString()} commission · ${pipelineStats.avgConfidence}% avg confidence`}
          </p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by city, country, developer…" className="input-glass pl-10" />
        </div>
        <div className="flex border border-luxury-border rounded-lg overflow-hidden">
          {(['confidence', 'value', 'commission', 'market_score'] as const).map(s => (
            <button key={s} onClick={() => handleSortToggle(s)}
              className={cn('px-3 py-2 text-xs font-medium transition-colors',
                sortBy === s ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white')}>
              <ArrowUpDown className="w-3 h-3 inline mr-1" />
              {s === 'market_score' ? 'Market' : s.charAt(0).toUpperCase() + s.slice(1)}
              {sortBy === s && (sortDir === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="premium-card p-8 text-center">
          <div className="space-y-4 max-w-md mx-auto">
            {LOADING_STEPS.slice(0, loadingStepIndex + 1).map((step, i) => {
              const isActive = i === loadingStepIndex;
              const isDone = i < loadingStepIndex;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex items-center gap-3 text-sm transition-colors',
                    isDone && 'text-emerald-400',
                    isActive && 'text-luxury-gold-400',
                    !isActive && !isDone && 'text-gray-600'
                  )}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : 
                   isActive ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> :
                   <div className="w-4 h-4 shrink-0" />}
                  <span>{step.text}</span>
                </motion.div>
              );
            })}
            <div className="pt-4">
              <div className="w-full bg-luxury-border rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-luxury-gold-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && opportunities.length === 0 && (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Awaiting Intelligence Data</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            The opportunity engine is actively analyzing global real estate markets.
            Verified opportunities will appear here once market conditions meet the discovery threshold.
          </p>
        </div>
      )}

      {/* Opportunity Cards */}
      {!loading && opportunities.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {opportunities.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/opportunity/${opp.id}`)}
                className="premium-card p-4 cursor-pointer group hover:border-luxury-gold-500/40 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Confidence Ring */}
                  <div className="relative w-10 h-10 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1f2937" strokeWidth="2" />
                      <circle cx="18" cy="18" r="15.5" fill="none" 
                        stroke={opp.confidence_score >= 85 ? '#22c55e' : opp.confidence_score >= 75 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="2" strokeDasharray={`${opp.confidence_score}, 100`} 
                        strokeLinecap="round" transform="rotate(-90 18 18)" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                      {opp.confidence_score}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-white group-hover:text-luxury-gold-300 transition-colors truncate">
                        {opp.title}
                      </h3>
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border',
                        opp.priority === 'critical' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                        opp.priority === 'high' ? 'border-luxury-gold-500/30 bg-luxury-gold-500/10 text-luxury-gold-400' :
                        'border-gray-700 bg-gray-800 text-gray-400'
                      )}>
                        {opp.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                      {opp.developer_name} · {opp.city_name}, {opp.country_name}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-luxury-gold-400 font-medium">
                        {formatIndianCurrency(opp.property_value)}
                      </span>
                      <span className="text-gray-600">·</span>
                      <span className="text-emerald-400 font-medium">
                        ${opp.commission_usd.toLocaleString()} commission
                      </span>
                      <span className="text-gray-600">·</span>
                      <span className="text-blue-400">
                        Market {opp.market_score}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
