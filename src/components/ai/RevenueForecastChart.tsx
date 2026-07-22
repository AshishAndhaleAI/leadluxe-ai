import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatIndianCurrency, formatCommission } from '../../lib/format';
import type { RevenueForecast } from '../../types';

interface RevenueForecastChartProps {
  forecasts: RevenueForecast[];
  className?: string;
}

export function RevenueForecastChart({ forecasts, className }: RevenueForecastChartProps) {
  if (forecasts.length === 0) return null;

  const maxCommission = Math.max(
    ...forecasts.map(f => f.optimisticCommission),
    1
  );

  const totalExpected = forecasts.reduce((s, f) => s + f.expectedCommission, 0);
  const totalProbable = forecasts.reduce((s, f) => s + f.probableCommission, 0);
  const totalOptimistic = forecasts.reduce((s, f) => s + f.optimisticCommission, 0);

  const getTrendIcon = (expected: number, probable: number) => {
    if (probable > expected) return TrendingUp;
    if (probable < expected) return TrendingDown;
    return Minus;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Expected', value: totalExpected, color: 'text-blue-400' },
          { label: 'Probable', value: totalProbable, color: 'text-amber-400' },
          { label: 'Optimistic', value: totalOptimistic, color: 'text-emerald-400' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
            <p className={cn('text-sm font-bold', item.color)}>{formatCommission(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Chart bars */}
      <div className="space-y-2">
        {forecasts.map((forecast, i) => {
          const TrendIcon = getTrendIcon(forecast.expectedCommission, forecast.probableCommission);
          const expectedH = (forecast.expectedCommission / maxCommission) * 100;
          const probableH = (forecast.probableCommission / maxCommission) * 100;
          const optimisticH = (forecast.optimisticCommission / maxCommission) * 100;

          return (
            <motion.div
              key={forecast.month}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{forecast.month}</span>
                <TrendIcon className={cn(
                  'w-4 h-4',
                  forecast.probableCommission > forecast.expectedCommission ? 'text-emerald-400' :
                  forecast.probableCommission < forecast.expectedCommission ? 'text-red-400' : 'text-gray-400'
                )} />
              </div>

              <div className="flex items-end gap-1 h-10 mb-2">
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex justify-center gap-0.5">
                    <div
                      className="w-3 rounded-t-sm bg-blue-500/60 transition-all"
                      style={{ height: `${expectedH}%` }}
                    />
                    <div
                      className="w-3 rounded-t-sm bg-amber-500/60 transition-all"
                      style={{ height: `${probableH}%` }}
                    />
                    <div
                      className="w-3 rounded-t-sm bg-emerald-500/60 transition-all"
                      style={{ height: `${optimisticH}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-500">
                  {forecast.deals.length} deal{forecast.deals.length !== 1 ? 's' : ''} in pipeline
                </span>
                <span className="text-luxury-gold-400 font-medium">
                  {formatCommission(forecast.probableCommission)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
