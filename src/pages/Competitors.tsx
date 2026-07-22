import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, TrendingUp, Users } from 'lucide-react';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { cn } from '../lib/utils';

export function Competitors() {
  const { developers, loading } = useOpportunityEngine();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return developers;
    const s = search.toLowerCase();
    return developers.filter(d => d.name.toLowerCase().includes(s) || d.city?.toLowerCase().includes(s));
  }, [developers, search]);

  const avgGrowth = useMemo(() => {
    const withGrowth = developers.filter(d => d.growth_rate);
    return withGrowth.length > 0
      ? Math.round(withGrowth.reduce((s, d) => s + (d.growth_rate || 0), 0) / withGrowth.length)
      : 0;
  }, [developers]);

  const totalHiring = useMemo(() => developers.reduce((s, d) => s + d.hiring_count, 0), [developers]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{loading ? 'Loading...' : `${developers.length} Tracked Developers`}</h2>
          <p className="text-sm text-gray-500">From public intelligence sources</p>
        </div>
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..." className="input-glass pl-10 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tracked Developers</p>
          <p className="text-2xl font-bold text-white">{loading ? '...' : developers.length}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Growth Rate</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-400">{loading ? '...' : `${avgGrowth}%`}</p>
          </div>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Hiring</p>
          <div className="flex items-center gap-1">
            <Users className="w-5 h-5 text-emerald-400" />
            <p className="text-2xl font-bold text-white">{loading ? '...' : totalHiring}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="premium-card p-5"><div className="skeleton h-32 w-full" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No Developers Tracked Yet</h3>
          <p className="text-sm text-gray-500">Developer profiles will appear as the autonomous intelligence system discovers them from public sources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((dev, i) => (
            <motion.div key={dev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="premium-card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/15 flex items-center justify-center text-lg">🏗️</div>
                <div>
                  <h3 className="text-base font-semibold text-white">{dev.name}</h3>
                  <p className="text-xs text-gray-500">{dev.city}, {dev.state}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="glass-card p-2 text-center"><p className="text-sm font-bold text-white">{dev.total_projects}</p><p className="text-[10px] text-gray-500">Projects</p></div>
                <div className="glass-card p-2 text-center"><p className="text-sm font-bold text-white">{dev.active_projects}</p><p className="text-[10px] text-gray-500">Active</p></div>
                <div className="glass-card p-2 text-center"><p className="text-sm font-bold text-emerald-400">{dev.growth_rate ? `${dev.growth_rate}%` : '-'}</p><p className="text-[10px] text-gray-500">Growth</p></div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dev.strengths?.slice(0, 2).map((s, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
