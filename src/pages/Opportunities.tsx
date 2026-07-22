import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Search, SlidersHorizontal, Sparkles, Filter,
  ArrowUpDown, ChevronDown, Eye, Building2
} from 'lucide-react';
import { DealOpportunityCard } from '../components/ai/DealOpportunityCard';
import { DEMO_OPPORTUNITIES } from '../components/ai/demoData';
import { cn } from '../lib/utils';
import type { DealStage } from '../types';
import { DEAL_STAGE_LABELS } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export function Opportunities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<DealStage | 'all'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'value' | 'date'>('confidence');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...DEMO_OPPORTUNITIES];

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(o =>
        o.builderName.toLowerCase().includes(s) ||
        o.projectName.toLowerCase().includes(s) ||
        o.location.toLowerCase().includes(s) ||
        o.city.toLowerCase().includes(s)
      );
    }

    if (stageFilter !== 'all') {
      list = list.filter(o => o.dealStage === stageFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'confidence') return b.confidenceScore - a.confidenceScore;
      if (sortBy === 'value') return b.estimatedValue - a.estimatedValue;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [search, stageFilter, sortBy]);

  const stages: (DealStage | 'all')[] = ['all', 'discovered', 'qualifying', 'proposal', 'negotiation', 'closing', 'closed_won'];

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
            <Zap className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Deal Opportunities</h2>
            <p className="text-sm text-gray-500">
              {filtered.length} opportunities found · AI confidence scored
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities..."
            className="input-glass pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Stage Filter */}
          <div className="flex items-center border border-luxury-border rounded-lg overflow-hidden">
            {stages.slice(0, 4).map(stage => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={cn(
                  'px-3 py-2 text-xs font-medium transition-colors',
                  stageFilter === stage ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white'
                )}
              >
                {stage === 'all' ? 'All' : DEAL_STAGE_LABELS[stage]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline !px-3 !py-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline text-xs ml-1">
                {sortBy === 'confidence' ? 'Confidence' : sortBy === 'value' ? 'Value' : 'Date'}
              </span>
            </button>
            {showFilters && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-luxury-border bg-luxury-dark shadow-xl z-50 animate-slide-in-right">
                  {(['confidence', 'value', 'date'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setShowFilters(false); }}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2.5 text-sm transition-colors',
                        sortBy === opt ? 'text-luxury-gold-400 bg-luxury-gold-500/10' : 'text-gray-400 hover:text-white'
                      )}
                    >
                      {opt === 'confidence' ? '🔬 Confidence' : opt === 'value' ? '💰 Value' : '📅 Date'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Opportunity Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-luxury-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-luxury-gold-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No opportunities found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map((opp, i) => (
            <DealOpportunityCard
              key={opp.id}
              opportunity={opp}
              index={i}
              onClick={() => navigate(`/opportunity/${opp.id}`)}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
