import { cn } from '../../lib/utils';
import type { LeadStatus } from '../../types';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../../types';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
  size?: 'sm' | 'md';
}

const STATUS_DOT_CLASSES: Record<LeadStatus, string> = {
  new: 'bg-blue-400',
  contacted: 'bg-purple-400',
  qualified: 'bg-emerald-400',
  site_visit: 'bg-amber-400',
  negotiation: 'bg-orange-400',
  booked: 'bg-yellow-400',
  lost: 'bg-red-400',
};

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
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', STATUS_DOT_CLASSES[status])} />
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
