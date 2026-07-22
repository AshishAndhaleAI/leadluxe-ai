import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, Mail, MapPin, IndianRupee, Calendar,
  MessageSquare, Send, User, Bot, Clock, Edit2,
  Trash2, MoreHorizontal, ExternalLink, Building2, Sparkles,
  ChevronDown, History
} from 'lucide-react';
import { supabase, subscribeToInserts } from '../lib/supabase';
import { useLeads } from '../hooks/useLeads';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LeadScoreIndicator } from '../components/ui/LeadScoreIndicator';
import { LeadJourneyTimeline } from '../components/leads/LeadJourneyTimeline';
import { LeadDetailSkeleton } from '../components/ui/SkeletonLoader';
import { getLeadCategory } from '../lib/ai-scoring';
import { formatIndianCurrency } from '../lib/format';
import { formatDateTime, formatRelativeTime, cn } from '../lib/utils';
import type { LeadStatus, Message, LeadEvent } from '../types';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '../types';

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLeadById, updateLead, deleteLead } = useLeads();

  const [activeTab, setActiveTab] = useState<'conversation' | 'timeline' | 'notes'>('conversation');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  const lead = useMemo(() => getLeadById(id || ''), [id, getLeadById]);

  // Fetch messages & events
  useEffect(() => {
    if (!id) return;

    // Fetch conversation messages
    supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]?.messages) {
          setMessages(data[0].messages as Message[]);
        }
        setMessagesLoading(false);
      });

    // Fetch lead journey events
    supabase
      .from('lead_events')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEvents(data as LeadEvent[]);
        setEventsLoading(false);
      });
  }, [id]);

  // Real-time: new messages
  useEffect(() => {
    if (!id) return;
    const channel = subscribeToInserts<Message>('messages', (newMsg) => {
      if (newMsg.conversation_id === id) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <Building2 className="w-12 h-12 text-gray-700 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Lead Not Found</h3>
        <p className="text-sm text-gray-500 mb-4">The lead you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/leads')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </button>
      </div>
    );
  }

  const category = getLeadCategory(lead.score);
  const allStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'booked', 'lost'];

  const handleStatusChange = async (status: LeadStatus) => {
    await updateLead(lead.id, { status });

    // Log event
    await supabase.from('lead_events').insert({
      lead_id: lead.id,
      event_type: 'status_changed',
      event_label: `Status → ${LEAD_STATUS_LABELS[status]}`,
      event_description: `Lead moved to ${LEAD_STATUS_LABELS[status]}`,
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Get or create conversation
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .eq('lead_id', lead.id)
      .limit(1);

    let convId = convs?.[0]?.id;
    if (!convId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ lead_id: lead.id, source: 'website' })
        .select()
        .single();
      convId = newConv?.id;
    }

    if (convId) {
      await supabase.from('messages').insert({
        conversation_id: convId,
        sender_type: 'agent',
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(lead.id);
      navigate('/leads');
    }
  };

  if (messagesLoading && eventsLoading && !lead) {
    return <LeadDetailSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back */}
      <button onClick={() => navigate('/leads')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="premium-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-luxury-gold-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-luxury-gold-400">
                    {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{lead.name}</h1>
                  <p className="text-sm text-gray-500">{LEAD_SOURCE_LABELS[lead.source]}</p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setShowActions(!showActions)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showActions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-luxury-border bg-luxury-dark shadow-xl z-50 animate-slide-in-right">
                      <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors rounded-t-xl">
                        <Trash2 className="w-4 h-4" />
                        Delete Lead
                      </button>
                      <button className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 transition-colors rounded-b-xl">
                        <ExternalLink className="w-4 h-4" />
                        Export Data
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: Mail, label: 'Email', value: lead.email || 'Not provided' },
                { icon: MapPin, label: 'Location', value: lead.preferred_location || 'Not specified' },
                { icon: IndianRupee, label: 'Budget', value: lead.budget ? formatIndianCurrency(lead.budget) : 'Not specified' },
                { icon: Calendar, label: 'Timeline', value: lead.visit_timeline || 'Not specified' },
                { icon: Building2, label: 'Property', value: lead.property_type || 'Not specified' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-luxury-gray/50 border border-luxury-border">
                  <item.icon className="w-4 h-4 text-luxury-gold-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm text-white font-medium truncate">{String(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Update */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {allStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      lead.status === status
                        ? 'border-luxury-gold-500/50 bg-luxury-gold-500/20 text-luxury-gold-400'
                        : 'border-luxury-border text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    )}
                  >
                    {LEAD_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="premium-card">
            <div className="flex border-b border-luxury-border">
              {([
                { key: 'conversation', label: 'Conversation', icon: MessageSquare },
                { key: 'timeline', label: 'Timeline', icon: History },
                { key: 'notes', label: 'Notes', icon: Edit2 },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
                    activeTab === tab.key ? 'text-luxury-gold-400' : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  <tab.icon className="w-4 h-4 inline mr-1.5" />
                  {tab.label}
                  {activeTab === tab.key && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-luxury-gold-500" />}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'conversation' && (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
                    {messages.map((msg) => (
                      <div key={msg.id} className={cn('flex gap-2.5', msg.sender_type === 'lead' ? 'justify-start' : 'justify-end')}>
                        {msg.sender_type === 'lead' && (
                          <div className="w-7 h-7 rounded-full bg-luxury-gray flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        )}
                        <div className={cn(
                          'max-w-[75%] px-4 py-2.5 rounded-xl text-sm leading-relaxed',
                          msg.sender_type === 'lead' ? 'bg-luxury-gray text-gray-200 rounded-tl-sm' :
                          msg.sender_type === 'ai_bot' ? 'bg-luxury-gold-500/10 text-luxury-gold-300 border border-luxury-gold-500/20 rounded-tr-sm' :
                          msg.sender_type === 'system' ? 'bg-luxury-gray/30 text-gray-400 text-xs italic rounded-tr-sm' :
                          'bg-luxury-gold-500/20 text-white rounded-tr-sm'
                        )}>
                          {msg.sender_type === 'ai_bot' && <Bot className="w-3 h-3 inline mr-1" />}
                          {msg.content}
                          <p className="text-[10px] text-gray-600 mt-1">{formatRelativeTime(msg.created_at)}</p>
                        </div>
                        {msg.sender_type !== 'lead' && (
                          <div className="w-7 h-7 rounded-full bg-luxury-gold-500/20 flex items-center justify-center shrink-0">
                            {msg.sender_type === 'ai_bot' ? <Bot className="w-3.5 h-3.5 text-luxury-gold-400" /> :
                             msg.sender_type === 'system' ? <Clock className="w-3.5 h-3.5 text-gray-400" /> :
                             <User className="w-3.5 h-3.5 text-luxury-gold-400" />}
                          </div>
                        )}
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center py-8">
                        <MessageSquare className="w-8 h-8 text-gray-700 mb-2" />
                        <p className="text-sm text-gray-500">No messages yet</p>
                        <p className="text-xs text-gray-600">Start a conversation with this lead</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-luxury-border">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="input-glass flex-1"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-primary !px-3"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <LeadJourneyTimeline events={events} loading={eventsLoading} />
              )}

              {activeTab === 'notes' && (
                <textarea
                  defaultValue={lead.notes || ''}
                  placeholder="Add notes about this lead..."
                  rows={8}
                  className="input-glass w-full resize-none"
                  onBlur={(e) => updateLead(lead.id, { notes: e.target.value })}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Score */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">AI Lead Score</h3>
            </div>
            <div className="flex justify-center mb-4">
              <LeadScoreIndicator score={lead.score} size="lg" />
            </div>
            <div className="text-center mb-4">
              <span className={cn('text-xs font-medium px-3 py-1 rounded-full', category.color)}>
                {category.label}
              </span>
              <p className="text-xs text-gray-500 mt-2">{category.priority}</p>
            </div>
            {lead.score_factors && (
              <div className="space-y-2 pt-3 border-t border-luxury-border">
                <p className="text-xs font-medium text-gray-500">Scoring Factors</p>
                {Object.entries(lead.score_factors).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-white font-medium">{typeof value === 'number' ? value : String(value).slice(0, 20)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Activity</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <p>Created: {formatDateTime(lead.created_at)}</p>
              {lead.last_contacted_at && <p>Last Contact: {formatRelativeTime(lead.last_contacted_at)}</p>}
              <p>Updated: {formatRelativeTime(lead.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
