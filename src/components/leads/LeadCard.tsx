import { Mail, MapPin, IndianRupee, Calendar } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { LeadScoreIndicator } from '../ui/LeadScoreIndicator';
import { formatRelativeTime } from '../../lib/utils';
import { formatIndianCurrency } from '../../lib/format';
import type { Lead } from '../../types';
import { LEAD_SOURCE_LABELS } from '../../types';
import { cn } from '../../lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, leadId: string) => void;
}

export function LeadCard({ lead, onClick, onDragStart }: LeadCardProps) {
  return (
    <div
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, lead.id)}
      className={cn(
        'group rounded-lg border border-gray-800 bg-gray-900/90 p-3.5 cursor-pointer',
        'transition-all duration-200 hover:border-luxury-gold-500/30 hover:bg-gray-800/80',
        'hover:shadow-lg hover:shadow-luxury-gold-500/5'
      )}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <h4 className="font-semibold text-sm text-white group-hover:text-luxury-gold-300 transition-colors">
            {lead.name}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">{LEAD_SOURCE_LABELS[lead.source]}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="space-y-1.5 mb-3">
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail className="w-3 h-3 text-gray-600" />
            <span>{lead.email}</span>
          </div>
        )}
        {lead.preferred_location && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3 h-3 text-gray-600" />
            <span>{lead.preferred_location}</span>
          </div>
        )}
        {lead.budget && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <IndianRupee className="w-3 h-3 text-gray-600" />
            <span>{formatIndianCurrency(lead.budget)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <div className="text-[10px] text-gray-600 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatRelativeTime(lead.created_at)}
        </div>
        <LeadScoreIndicator score={lead.score} size="sm" showLabel={false} />
      </div>
    </div>
  );
}
