import { useMemo } from 'react';
import { cn } from '../../lib/utils';
import type { LeadStatus } from '../../types';
import { LEAD_STATUS_LABELS } from '../../types';

interface ConversionChartProps {
  data: { status: LeadStatus; count: number }[];
}

const PIPELINE_ORDER: LeadStatus[] = ['new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'booked'];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-purple-500',
  qualified: 'bg-emerald-500',
  site_visit: 'bg-amber-500',
  negotiation: 'bg-orange-500',
  booked: 'bg-luxury-gold-500',
  lost: 'bg-red-500',
};

export function ConversionChart({ data }: ConversionChartProps) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Lead Conversion Funnel</h3>
      <div className="space-y-2.5">
        {PIPELINE_ORDER.map((status) => {
          const item = data.find((d) => d.status === status);
          const count = item?.count || 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const previousItem = PIPELINE_ORDER[PIPELINE_ORDER.indexOf(status) - 1];
          const previousCount = previousItem
            ? data.find((d) => d.status === previousItem)?.count || 0
            : count;
          const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;

          return (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">{LEAD_STATUS_LABELS[status]}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">{count}</span>
                  {previousItem && (
                    <span className="text-gray-600 text-[10px] w-12 text-right">
                      {conversionRate.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-6 rounded-lg bg-gray-800/50 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-lg transition-all duration-700 ease-out',
                    STATUS_COLORS[status]
                  )}
                  style={{ width: `${percentage}%`, opacity: 0.8 }}
                />
                {percentage > 20 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                    {count} leads ({percentage.toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
