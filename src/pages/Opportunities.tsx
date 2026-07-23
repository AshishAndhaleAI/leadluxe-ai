import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Search, ArrowUpDown, Sparkles, Building2, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { ConfidenceIndicator } from '../components/ai/ConfidenceIndicator';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';
import { PRIORITY_COLORS } from '../types';

const LOADING_STEPS = [
  { icon: Loader2, text: 'Initializing AI intelligence scanner…' },
  { icon: Globe, text: 'Scanning 100+ global cities for property data…' },
  { icon: Building2, text: 'Analyzing developer portfolios and project pipelines…' },
  { icon: Zap, text: 'Scoring and ranking verified investment opportunities…' },
  { icon: CheckCircle2, text: 'Rendering live opportunities for your market…' },
];

export function Opportunities() {
  const navigate = useNavigate();
  const { opportunities, loading } = useOpportunityEngine();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'confidence' | 'value'>('confidence');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Animate through loading steps
  useEffect(() => {
    if (!loading) { setLoadingStepIndex(LOADING_STEPS.length); return; }
    const interval = setInterval(() => {
      setLoadingStepIndex(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const filtered = useMemo(() => {
    let list = [...opportunities].filter(o => o.is_active);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(o => o.title.toLowerCase().includes(s));
    }
    list.sort((a, b) => sortBy === 'confidence'
      ? b.confidence_score - a.confidence_score
      : b.estimated_value - a.estimated_value);
    return list;
  }, [opportunities, search, sortBy]);

  // Compute pipeline stats from real data
  const pipelineStats = useMemo(() => {
    const active = filtered;
    const totalPipeline = active.reduce((s, o) => s + o.estimated_value, 0);
    const totalCommission = active.reduce((s, o) => s + o.estimated_commission, 0);
    const countries = new Set(active.map(o => o.title?.split('—')[1]?.trim() || ''));
    return { totalPipeline, totalCommission, countries: countries.size };
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with live stats */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            {loading ? 'Initializing Scanner…' : `${filtered.length} Verified Opportunities`}
          </h2>
          <p className="text-sm text-gray-500">
            {loading ? 'Connecting to knowledge graph…' : `${pipelineStats.countries} markets · ${formatIndianCurrency(pipelineStats.totalPipeline)} pipeline · ${formatCommission(pipelineStats.totalCommission)} potential commission`}
          </p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search opportunities by city, developer, or project…" className="input-glass pl-10" />
        </div>
        <div className="flex border border-luxury-border rounded-lg overflow-hidden">
          {(['confidence', 'value'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={cn('px-3 py-2 text-xs font-medium transition-colors',
                sortBy === s ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white')}>
              <ArrowUpDown className="w-3 h-3 inline mr-1" />{s === 'confidence' ? 'Confidence' : 'Value'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State with Progress Steps */}
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
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 shrink-0" />
                  )}
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
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Awaiting Intelligence Data</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            The autonomous intelligence system is actively gathering and analyzing public data sources.
            Opportunities will appear here as signals are collected and processed.
          </p>
        </div>
      )}

      {/* Opportunity Cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((opp, i) => (
              <motion.div
                key={opp.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/opportunity/${opp.id}`)}
                className="premium-card p-4 cursor-pointer group hover:border-luxury-gold-500/40 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <ConfidenceIndicator score={opp.confidence_score} size="sm" showLabel={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-white group-hover:text-luxury-gold-300 transition-colors truncate">{opp.title}</h3>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border', PRIORITY_COLORS[opp.priority])}>{opp.priority}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1 line-clamp-1">{opp.summary}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-luxury-gold-400 font-medium">{formatIndianCurrency(opp.estimated_value)}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-emerald-400 font-medium">{formatCommission(opp.estimated_commission)}</span>
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
