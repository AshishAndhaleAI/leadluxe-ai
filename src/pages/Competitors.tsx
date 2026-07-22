import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Search, MapPin, TrendingUp, Users, Briefcase,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Star
} from 'lucide-react';
import { CompetitorProfileCard } from '../components/ai/CompetitorProfileCard';
import { DEMO_COMPETITORS } from '../components/ai/demoData';
import { cn } from '../lib/utils';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { formatIndianCurrency } from '../lib/format';
import type { CompetitorProfile } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export function Competitors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedComp, setSelectedComp] = useState<CompetitorProfile | null>(null);

  const filtered = useMemo(() => {
    if (!search) return DEMO_COMPETITORS;
    const s = search.toLowerCase();
    return DEMO_COMPETITORS.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.headquarters.toLowerCase().includes(s)
    );
  }, [search]);

  const avgGrowth = useMemo(() =>
    Math.round(DEMO_COMPETITORS.reduce((s, c) => s + c.growthRate, 0) / DEMO_COMPETITORS.length),
  []);

  const totalHiring = useMemo(() =>
    DEMO_COMPETITORS.reduce((s, c) => s + c.hiringCount, 0),
  []);

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
            <Building2 className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Competitor Intelligence</h2>
            <p className="text-sm text-gray-500">{DEMO_COMPETITORS.length} tracked builders</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search competitors..."
            className="input-glass pl-10 w-64"
          />
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tracked Builders</p>
          <p className="text-2xl font-bold text-white">{DEMO_COMPETITORS.length}</p>
          <p className="text-xs text-gray-600 mt-1">Top players in active markets</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="premium-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Growth Rate</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-400"><AnimatedCounter value={avgGrowth} suffix="%" /></p>
          </div>
          <p className="text-xs text-gray-600 mt-1">Year over year</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Industry Hiring</p>
          <div className="flex items-center gap-1">
            <Users className="w-5 h-5 text-emerald-400" />
            <p className="text-2xl font-bold text-white"><AnimatedCounter value={totalHiring} /></p>
          </div>
          <p className="text-xs text-gray-600 mt-1">Open positions across firms</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="premium-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Projects</p>
          <p className="text-2xl font-bold text-white">
            <AnimatedCounter value={DEMO_COMPETITORS.reduce((s, c) => s + c.totalProjects, 0)} />
          </p>
          <p className="text-xs text-gray-600 mt-1">Across all tracked builders</p>
        </motion.div>
      </div>

      {/* Competitor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((comp, i) => (
          <CompetitorProfileCard
            key={comp.id}
            competitor={comp}
            index={i}
            onClick={() => setSelectedComp(selectedComp?.id === comp.id ? null : comp)}
          />
        ))}
      </div>

      {/* Detailed View */}
      {selectedComp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedComp.logo}</span>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedComp.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedComp.headquarters} · Est. {selectedComp.foundedYear}
                </p>
              </div>
            </div>
            <span className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
              selectedComp.pricing === 'luxury' ? 'border-luxury-gold-500/30 bg-luxury-gold-500/10 text-luxury-gold-400' :
              selectedComp.pricing === 'premium' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' :
              'border-blue-500/30 bg-blue-500/10 text-blue-400'
            )}>
              {selectedComp.pricing === 'luxury' ? '👑 Luxury' : selectedComp.pricing === 'premium' ? '💎 Premium' : '🏠 Mid-Range'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Projects</h4>
              {selectedComp.projects.map((p, i) => (
                <div key={i} className="glass-card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded',
                      p.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400' :
                      p.status === 'completed' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    )}>{p.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{p.location} · {p.type} · {p.units} units</p>
                  <p className="text-xs text-luxury-gold-400 mt-1">{formatIndianCurrency(p.totalValue)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Strengths</h4>
                <ul className="space-y-1.5">
                  {selectedComp.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <Star className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Weaknesses</h4>
                <ul className="space-y-1.5">
                  {selectedComp.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedComp.expansionPlans && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Expansion Plans</h4>
                  <ul className="space-y-1.5">
                    {selectedComp.expansionPlans.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <ArrowUpRight className="w-3 h-3 text-luxury-gold-400 mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
