import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: ReactNode | string | number;
  subtitle?: string | ReactNode;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function KPICard({ title, value, subtitle, icon, trend, className, onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'premium-card p-5 group cursor-pointer',
        className
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-gray-400 tracking-wide uppercase">{title}</p>
          <div className="p-2.5 rounded-lg bg-luxury-gold-500/10 text-luxury-gold-400 group-hover:bg-luxury-gold-500/20 transition-colors duration-300">
            {icon}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
          {subtitle && (
            <div className="text-xs text-gray-500">{subtitle}</div>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1.5 mt-2 text-xs font-medium',
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}% {trend.isPositive ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
