import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Search, Globe, Filter, Clock,
  Newspaper, Activity, Zap, Sparkles
} from 'lucide-react';
import { BuyingSignalCard } from '../components/ai/BuyingSignalCard';
import { DEMO_SIGNALS } from '../components/ai/demoData';
import { cn } from '../lib/utils';
import type { SignalType } from '../types';
import { SIGNAL_TYPE_LABELS } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

export function Signals() {
  const [search, setSearch] = useState('');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = useMemo(() => {
    let list = [...DEMO_SIGNALS];

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(sig =>
        sig.title.toLowerCase().includes(s) ||
        sig.description.toLowerCase().includes(s) ||
        sig.source.toLowerCase().includes(s)
      );
    }

    if (impactFilter !== 'all') {
      list = list.filter(sig => sig.impact === impactFilter);
    }

    return list.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [search, impactFilter]);

  const highImpact = DEMO_SIGNALS.filter(s => s.impact === 'high').length;
  const newThisWeek = DEMO_SIGNALS.filter(s => {
    const d = new Date(s.date);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Buying Signals</h2>
            <p className="text-sm text-gray-500">Real-time market intelligence · {DEMO_SIGNALS.length} signals tracked</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{highImpact}</p>
              <p className="text-xs text-gray-500">High Impact Signals</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{newThisWeek}</p>
              <p className="text-xs text-gray-500">New This Week</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-luxury-gold-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{DEMO_SIGNALS.length}</p>
              <p className="text-xs text-gray-500">Total Sources</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search signals..."
            className="input-glass pl-10"
          />
        </div>

        <div className="flex items-center border border-luxury-border rounded-lg overflow-hidden">
          {(['all', 'high', 'medium', 'low'] as const).map(impact => (
            <button
              key={impact}
              onClick={() => setImpactFilter(impact)}
              className={cn(
                'px-3 py-2 text-xs font-medium transition-colors',
                impactFilter === impact ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white'
              )}
            >
              {impact === 'all' ? 'All' : impact.charAt(0).toUpperCase() + impact.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Cards */}
      <div className="space-y-3">
        {filtered.map((signal, i) => (
          <BuyingSignalCard key={signal.id} signal={signal} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No signals found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
