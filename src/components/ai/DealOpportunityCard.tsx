import { motion } from 'framer-motion';
import { Building2, MapPin, IndianRupee, TrendingUp, Sparkles, ArrowRight, Target } from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import { formatIndianCurrency, formatCommission } from '../../lib/format';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import type { DealOpportunity } from '../../types';
import { DEAL_STAGE_LABELS, DEAL_STAGE_COLORS } from '../../types';

interface DealOpportunityCardProps {
  opportunity: DealOpportunity;
  onClick?: () => void;
  index?: number;
}

export function DealOpportunityCard({ opportunity, onClick, index = 0 }: DealOpportunityCardProps) {
  const topReason = opportunity.reasons[0];
  const topAction = opportunity.recommendedActions[0];
  const highSignals = opportunity.signals.filter(s => s.impact === 'high').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      className="premium-card p-5 cursor-pointer group relative overflow-hidden"
    >
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/15 flex items-center justify-center group-hover:bg-luxury-gold-500/25 transition-colors">
            <Building2 className="w-6 h-6 text-luxury-gold-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-luxury-gold-300 transition-colors">
              {opportunity.builderName}
            </h3>
            <p className="text-sm text-gray-500">{opportunity.projectName}</p>
          </div>
        </div>
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', DEAL_STAGE_COLORS[opportunity.dealStage])}>
          {DEAL_STAGE_LABELS[opportunity.dealStage]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {opportunity.location}, {opportunity.city}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <IndianRupee className="w-3 h-3" />
            <span className="text-white font-semibold">{formatIndianCurrency(opportunity.estimatedValue)}</span> est. value
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Target className="w-3 h-3" />
            <span className="text-emerald-400 font-semibold">{formatCommission(opportunity.expectedCommission)}</span> commission
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Sparkles className="w-3 h-3 text-luxury-gold-400" />
            <span>{highSignals} high-impact signals</span>
          </div>
        </div>
      </div>

      {/* Confidence + Reasons */}
      <div className="flex items-start gap-4 mb-4">
        <ConfidenceIndicator score={opportunity.confidenceScore} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-1 font-medium">AI Analysis</p>
          <p className="text-sm text-gray-300 leading-relaxed">{topReason}</p>
          {topAction && (
            <div className="flex items-start gap-1.5 mt-2 text-xs text-luxury-gold-400">
              <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{topAction}</span>
            </div>
          )}
        </div>
      </div>

      {/* Signals */}
      {opportunity.signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opportunity.signals.slice(0, 3).map((signal, i) => (
            <span
              key={signal.id}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium',
                signal.impact === 'high'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : signal.impact === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              )}
            >
              <span className={cn('w-1 h-1 rounded-full', signal.impact === 'high' ? 'bg-emerald-400' : signal.impact === 'medium' ? 'bg-amber-400' : 'bg-gray-400')} />
              {signal.title}
            </span>
          ))}
          {opportunity.signals.length > 3 && (
            <span className="text-[10px] text-gray-500 px-1">+{opportunity.signals.length - 3} more</span>
          )}
        </div>
      )}

      <div className="absolute bottom-3 right-3 text-[10px] text-gray-600">
        {formatRelativeTime(opportunity.createdAt)}
      </div>
    </motion.div>
  );
}
