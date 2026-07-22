import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Search, ArrowUpDown, Sparkles } from 'lucide-react';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { ConfidenceIndicator } from '../components/ai/ConfidenceIndicator';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';
import { PRIORITY_COLORS } from '../types';

export function Opportunities() {
  const navigate = useNavigate();
  const { opportunities, loading } = useOpportunityEngine();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'confidence' | 'value'>('confidence');

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            {loading ? 'Loading...' : `${filtered.length} Opportunities`}
          </h2>
          <p className="text-sm text-gray-500">Discovered by autonomous intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search opportunities..." className="input-glass pl-10" />
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

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="premium-card p-5"><div className="skeleton h-20 w-full" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Awaiting Intelligence Data</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            The autonomous intelligence system is actively gathering and analyzing public data sources.
            Opportunities will appear here as signals are collected and processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((opp, i) => (
            <motion.div
              key={opp.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/opportunity/${opp.id}`)}
              className="premium-card p-4 cursor-pointer group"
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
        </div>
      )}
    </div>
  );
}
