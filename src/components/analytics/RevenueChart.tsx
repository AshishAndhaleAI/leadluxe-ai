import { useMemo } from 'react';
import { TrendingUp, IndianRupee } from 'lucide-react';
import { formatIndianCurrency } from '../../lib/format';

interface RevenueData {
  month: string;
  leads: number;
  bookings: number;
  revenue?: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  projectedRevenue: number;
}

export function RevenueChart({ data, projectedRevenue }: RevenueChartProps) {
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => Math.max(d.leads, d.bookings)), 1),
    [data]
  );

  const totalLeads = useMemo(() => data.reduce((sum, d) => sum + d.leads, 0), [data]);
  const totalBookings = useMemo(() => data.reduce((sum, d) => sum + d.bookings, 0), [data]);
  const conversionRate = totalLeads > 0 ? (totalBookings / totalLeads) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-800">
          <p className="text-xs text-gray-400 mb-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            Total Leads
          </p>
          <p className="text-lg font-bold text-white">{totalLeads}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-800">
          <p className="text-xs text-gray-400 mb-1">
            <IndianRupee className="w-3 h-3 inline mr-1" />
            Projected Revenue
          </p>
          <p className="text-lg font-bold text-luxury-gold-400">{formatIndianCurrency(projectedRevenue)}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative h-48 flex items-end gap-2">
        {data.map((item, index) => {
          const leadHeight = maxValue > 0 ? (item.leads / maxValue) * 100 : 0;
          const bookingHeight = maxValue > 0 ? (item.bookings / maxValue) * 100 : 0;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative" style={{ height: '160px' }}>
                {/* Lead bar */}
                <div
                  className="absolute bottom-0 left-1 right-1 rounded-t-md bg-luxury-gold-500/20 transition-all duration-500"
                  style={{ height: `${leadHeight}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-luxury-gold-500/40 transition-all duration-500"
                    style={{ height: `${Math.min(leadHeight, 100)}%` }}
                  />
                </div>
                {/* Booking bar */}
                <div
                  className="absolute bottom-0 left-1.5 right-1.5 rounded-t-md bg-emerald-500/60 transition-all duration-500"
                  style={{ height: `${bookingHeight}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 truncate w-full text-center">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-luxury-gold-500/40" />
          <span className="text-xs text-gray-400">Leads</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/60" />
          <span className="text-xs text-gray-400">Bookings</span>
        </div>
        <div className="text-xs text-gray-500">
          Conversion: <span className="text-emerald-400 font-medium">{conversionRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
