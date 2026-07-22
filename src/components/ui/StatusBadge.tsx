import { cn } from '../../lib/utils';
import type { LeadStatus } from '../../types';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../../types';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        LEAD_STATUS_COLORS[status],
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        {
          'bg-blue-400': status === 'new',
          'bg-purple-400': status === 'contacted',
          'bg-emerald-400': status === 'qualified',
          'bg-amber-400': status === 'site_visit',
          'bg-orange-400': status === 'negotiation',
          'bg-yellow-400': status === 'booked',
          'bg-red-400': status === 'lost',
        }
      )} />
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
