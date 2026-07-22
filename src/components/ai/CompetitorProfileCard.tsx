import { motion } from 'framer-motion';
import {
  Building2, MapPin, TrendingUp, Users, Home, Star,
  Briefcase, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import { formatIndianCurrency } from '../../lib/format';
import type { CompetitorProfile } from '../../types';

interface CompetitorProfileCardProps {
  competitor: CompetitorProfile;
  index?: number;
  onClick?: () => void;
}

export function CompetitorProfileCard({ competitor, index = 0, onClick }: CompetitorProfileCardProps) {
  const projectsSummary = `${competitor.totalProjects} total · ${competitor.activeProjects} active`;
  const growthIcon = competitor.growthRate > 0 ? TrendingUp : competitor.growthRate < 0 ? TrendingUp : Minus;
  const GrowthIcon = growthIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="premium-card p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/15 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {competitor.logo}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-luxury-gold-300 transition-colors">
              {competitor.name}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {competitor.headquarters} · Est. {competitor.foundedYear}
            </p>
          </div>
        </div>
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
          competitor.pricing === 'luxury' ? 'border-luxury-gold-500/30 bg-luxury-gold-500/10 text-luxury-gold-400' :
          competitor.pricing === 'premium' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' :
          competitor.pricing === 'mid_range' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
          'border-gray-500/30 bg-gray-500/10 text-gray-400'
        )}>
          {competitor.pricing === 'luxury' ? '👑 Luxury' :
           competitor.pricing === 'premium' ? '💎 Premium' :
           competitor.pricing === 'mid_range' ? '🏠 Mid-Range' : '🏗️ Budget'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="glass-card p-2.5 text-center">
          <p className="text-lg font-bold text-white">{competitor.totalProjects}</p>
          <p className="text-[10px] text-gray-500">Projects</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <p className="text-lg font-bold text-white">{competitor.totalUnitsDelivered.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500">Units</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <GrowthIcon className={cn(
              'w-4 h-4',
              competitor.growthRate > 0 ? 'text-emerald-400' :
              competitor.growthRate < 0 ? 'text-red-400' : 'text-gray-400'
            )} />
            <p className="text-lg font-bold text-white">{Math.abs(competitor.growthRate)}%</p>
          </div>
          <p className="text-[10px] text-gray-500">Growth</p>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="space-y-2 mb-3">
        {competitor.strengths.slice(0, 2).map((s, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <Star className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
            <span className="text-gray-400">{s}</span>
          </div>
        ))}
        {competitor.weaknesses.slice(0, 1).map((w, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
            <span className="text-gray-500">{w}</span>
          </div>
        ))}
      </div>

      {/* Hiring & Activity */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-luxury-border">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span className={cn(
            competitor.hiringTrend === 'increasing' ? 'text-emerald-400' :
            competitor.hiringTrend === 'decreasing' ? 'text-red-400' : 'text-gray-400'
          )}>
            {competitor.hiringCount} openings
          </span>
        </div>
        <span className="text-gray-600">Updated {formatRelativeTime(competitor.createdAt)}</span>
      </div>
    </motion.div>
  );
}
