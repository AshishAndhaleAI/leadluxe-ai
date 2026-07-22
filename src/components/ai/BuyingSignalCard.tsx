import { motion } from 'framer-motion';
import {
  FileText, Landmark, Building2, Users, Banknote, Rocket,
  Handshake, Expand, TrendingUp, Newspaper, FileCheck, HardHat,
  ExternalLink, Clock, Trophy
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import type { Signal } from '../../types';

interface BuyingSignalCardProps {
  signal: Signal;
  index?: number;
}

const SIGNAL_ICONS: Record<string, typeof FileText> = {
  rera_filing: FileText,
  government_approval: Landmark,
  land_acquisition: Building2,
  builder_hiring: Users,
  funding_raised: Banknote,
  project_launch: Rocket,
  partnership: Handshake,
  expansion: Expand,
  market_trend: TrendingUp,
  news_coverage: Newspaper,
  permit_issued: FileCheck,
  construction_start: HardHat,
  price_change: TrendingUp,
  management_change: Users,
  legal_update: FileCheck,
  award_recognition: Trophy,
};

const IMPACT_COLORS = {
  critical: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  high: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  informational: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

const IMPACT_GLOWS: Record<string, string> = {
  critical: 'shadow-emerald-500/15',
  high: 'shadow-emerald-500/10',
  medium: 'shadow-amber-500/10',
  low: 'shadow-gray-500/5',
  informational: 'shadow-gray-500/5',
};

export function BuyingSignalCard({ signal, index = 0 }: BuyingSignalCardProps) {
  const Icon = SIGNAL_ICONS[signal.signal_type] || Newspaper;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'premium-card p-4 relative overflow-hidden group',
        IMPACT_GLOWS[signal.impact_level] || 'shadow-gray-500/5'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          signal.impact_level === 'critical' || signal.impact_level === 'high' ? 'bg-emerald-500/15' :
          signal.impact_level === 'medium' ? 'bg-amber-500/15' : 'bg-gray-500/15'
        )}>
          <Icon className={cn(
            'w-5 h-5',
            signal.impact_level === 'critical' || signal.impact_level === 'high' ? 'text-emerald-400' :
            signal.impact_level === 'medium' ? 'text-amber-400' : 'text-gray-400'
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-white truncate">{signal.title}</h4>
            <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border', IMPACT_COLORS[signal.impact_level] || IMPACT_COLORS.medium)}>
              {signal.impact_level}
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed mb-2">{signal.description}</p>

          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-luxury-gold-400 font-medium">{signal.source || 'Unknown'}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(signal.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1">
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  signal.relevance_score >= 80 ? 'bg-emerald-400' :
                  signal.relevance_score >= 60 ? 'bg-amber-400' : 'bg-gray-400'
                )} />
                <span className="text-gray-600">Rel: {signal.relevance_score}%</span>
              </div>
              {signal.source_url && (
                <a href={signal.source_url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
