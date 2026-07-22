import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DealStage } from '../../types';
import { DEAL_STAGE_LABELS } from '../../types';

interface DealTimelineProps {
  currentStage: DealStage;
  stages: DealStage[];
  estimatedValue?: number;
  className?: string;
}

const STAGE_ORDER: DealStage[] = [
  'discovered', 'qualifying', 'proposal', 'negotiation', 'closing', 'closed_won',
];

export function DealTimeline({ currentStage, stages, className }: DealTimelineProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className={cn('space-y-2', className)}>
      {STAGE_ORDER.map((stage, i) => {
        const isCompleted = stages.indexOf(stage) < stages.indexOf(currentStage) || currentIndex > i;
        const isCurrent = stage === currentStage;
        const isAvailable = stages.includes(stage);

        return (
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-lg transition-all',
              isCurrent
                ? 'bg-luxury-gold-500/10 border border-luxury-gold-500/20'
                : isCompleted
                ? 'bg-emerald-500/5 border border-emerald-500/10'
                : 'bg-transparent border border-transparent opacity-40'
            )}
          >
            {/* Stage indicator */}
            <div className="relative flex items-center justify-center">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : isCurrent ? (
                <div className="relative">
                  <Circle className="w-5 h-5 text-luxury-gold-400" />
                  <div className="absolute inset-0 border-2 border-luxury-gold-400 rounded-full animate-ping opacity-30" />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-gray-600" />
              )}
              {/* Connector line */}
              {i < STAGE_ORDER.length - 1 && (
                <div className={cn(
                  'absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-3',
                  isCompleted ? 'bg-emerald-500/50' : 'bg-gray-800'
                )} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                isCurrent ? 'text-luxury-gold-400' :
                isCompleted ? 'text-emerald-400' : 'text-gray-500'
              )}>
                {DEAL_STAGE_LABELS[stage]}
              </p>
              {isCurrent && (
                <p className="text-[10px] text-gray-500 mt-0.5">Current stage</p>
              )}
            </div>

            {isCurrent && (
              <span className="text-[10px] text-luxury-gold-400 font-medium animate-pulse px-2 py-0.5 rounded-full bg-luxury-gold-500/10">
                Active
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
