import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Search, Clock, Zap, Activity } from 'lucide-react';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { cn, formatRelativeTime } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';

export function Signals() {
  const { signals, loading } = useOpportunityEngine();
  const [search, setSearch] = useState('');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = useMemo(() => {
    let list = [...signals];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(sig => sig.title.toLowerCase().includes(s) || sig.source?.toLowerCase().includes(s));
    }
    if (impactFilter !== 'all') list = list.filter(s => s.impact_level === impactFilter);
    return list;
  }, [signals, search, impactFilter]);

  const highImpact = signals.filter(s => s.impact_level === 'high' || s.impact_level === 'critical').length;

  return (
    <>
      <SEOHelmet
        title="AI Signals — Real-Time Market Intelligence"
        description="Live market signals from public sources — interest rate changes, infrastructure announcements, FDI spikes, and luxury transaction anomalies across global real estate markets."
      />
      <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Globe className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Signals</h2>
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${signals.length} signals from public sources`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Zap className="w-5 h-5 text-emerald-400" /></div>
            <div><p className="text-xl font-bold text-white">{highImpact}</p><p className="text-xs text-gray-500">High Impact</p></div>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-400" /></div>
            <div><p className="text-xl font-bold text-white">{signals.length}</p><p className="text-xs text-gray-500">Total Signals</p></div>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center"><Globe className="w-5 h-5 text-luxury-gold-400" /></div>
            <div><p className="text-xl font-bold text-white">{new Set(signals.map(s => s.source)).size}</p><p className="text-xs text-gray-500">Sources</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search signals..." className="input-glass pl-10" />
        </div>
        <div className="flex border border-luxury-border rounded-lg overflow-hidden">
          {(['all', 'high', 'medium', 'low'] as const).map(impact => (
            <button key={impact} onClick={() => setImpactFilter(impact)}
              className={cn('px-3 py-2 text-xs font-medium transition-colors',
                impactFilter === impact ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white')}>
              {impact === 'all' ? 'All' : impact.charAt(0).toUpperCase() + impact.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="premium-card p-4"><div className="skeleton h-16 w-full" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Monitoring Public Sources</h3>
          <p className="text-sm text-gray-500">Signals from Google News and RERA portals will appear here as they are discovered.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((signal, i) => (
            <motion.div key={signal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="premium-card p-4">
              <div className="flex items-start gap-3">
                <div className={cn('w-1.5 h-1.5 rounded-full mt-2 shrink-0',
                  signal.impact_level === 'critical' || signal.impact_level === 'high' ? 'bg-emerald-400' : 'bg-amber-400')} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{signal.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{signal.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1.5">
                    <span className="text-luxury-gold-400">{signal.source}</span>
                    <span>{formatRelativeTime(signal.created_at)}</span>
                    <span>Rel: {signal.relevance_score}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}      </div>
    </>
  );
}
