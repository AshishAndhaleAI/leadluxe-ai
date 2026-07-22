import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MousePointerClick, Globe, MessageSquare, IndianRupee, FileText,
  Calendar, UserCheck, Handshake, CheckCircle, Award, Sparkles
} from 'lucide-react';
import type { LeadEvent, LeadEventType } from '../../types';
import { LEAD_EVENT_LABELS } from '../../types';
import { formatRelativeTime } from '../../lib/utils';
import { cn } from '../../lib/utils';

const EVENT_ICONS: Record<LeadEventType, React.ReactNode> = {
  ad_click: <MousePointerClick className="w-4 h-4" />,
  website_visit: <Globe className="w-4 h-4" />,
  chat_started: <MessageSquare className="w-4 h-4" />,
  budget_qualified: <IndianRupee className="w-4 h-4" />,
  brochure_sent: <FileText className="w-4 h-4" />,
  site_visit_booked: <Calendar className="w-4 h-4" />,
  agent_assigned: <UserCheck className="w-4 h-4" />,
  negotiation_started: <Handshake className="w-4 h-4" />,
  booking_confirmed: <CheckCircle className="w-4 h-4" />,
  deal_closed: <Award className="w-4 h-4" />,
  whatsapp_sent: <MessageSquare className="w-4 h-4" />,
  email_sent: <MessageSquare className="w-4 h-4" />,
  call_made: <UserCheck className="w-4 h-4" />,
  note_added: <FileText className="w-4 h-4" />,
  status_changed: <Sparkles className="w-4 h-4" />,
};

const EVENT_COLORS: Record<LeadEventType, string> = {
  ad_click: 'bg-blue-500 text-blue-400',
  website_visit: 'bg-indigo-500 text-indigo-400',
  chat_started: 'bg-emerald-500 text-emerald-400',
  budget_qualified: 'bg-luxury-gold-500 text-luxury-gold-400',
  brochure_sent: 'bg-purple-500 text-purple-400',
  site_visit_booked: 'bg-amber-500 text-amber-400',
  agent_assigned: 'bg-cyan-500 text-cyan-400',
  negotiation_started: 'bg-orange-500 text-orange-400',
  booking_confirmed: 'bg-emerald-500 text-emerald-400',
  deal_closed: 'bg-luxury-gold-500 text-luxury-gold-400',
  whatsapp_sent: 'bg-green-500 text-green-400',
  email_sent: 'bg-blue-500 text-blue-400',
  call_made: 'bg-violet-500 text-violet-400',
  note_added: 'bg-gray-500 text-gray-400',
  status_changed: 'bg-pink-500 text-pink-400',
};

interface LeadJourneyTimelineProps {
  events: LeadEvent[];
  loading?: boolean;
}

function TimelineEvent({ event, index, isLast }: { event: LeadEvent; index: number; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      className="relative flex gap-4 pb-6 last:pb-0"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-[1px] bg-gradient-to-b from-luxury-gold-500/30 to-transparent" />
      )}

      {/* Icon circle */}
      <div
        className={cn(
          'relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 border border-current/20',
          EVENT_COLORS[event.event_type] || 'bg-gray-600 text-gray-400'
        )}
      >
        <div className="[&>svg]:w-3.5 [&>svg]:h-3.5">
          {EVENT_ICONS[event.event_type] || <Sparkles className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-white">
            {event.event_label || LEAD_EVENT_LABELS[event.event_type] || event.event_type}
          </p>
          <span className="text-[10px] text-gray-600 whitespace-nowrap shrink-0">
            {formatRelativeTime(event.created_at)}
          </span>
        </div>
        {event.event_description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {event.event_description}
          </p>
        )}
        {event.metadata && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {Object.entries(event.metadata).map(([key, val]) => (
              <span
                key={key}
                className="text-[10px] px-2 py-0.5 rounded-full bg-luxury-gray text-gray-500 border border-luxury-border"
              >
                {key}: {String(val)}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function LeadJourneyTimeline({ events, loading }: LeadJourneyTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-luxury-gray" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-luxury-gray rounded w-3/4" />
              <div className="h-3 bg-luxury-gray rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-luxury-gold-500/10 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-luxury-gold-400" />
        </div>
        <p className="text-sm text-gray-500">No journey events yet</p>
        <p className="text-xs text-gray-600 mt-1">
          Events will appear here as the lead progresses through the pipeline
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {events.map((event, index) => (
        <TimelineEvent
          key={event.id}
          event={event}
          index={index}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
}
