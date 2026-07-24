// ============================================================
// LeadLuxe AI — Admin Outreach Queue (/admin/outreach)
// Human-in-the-loop approval for capital introduction emails.
// Shows: opportunity, developer/investor matches, email previews,
// source citations, confidence score. Actions: Approve, Edit,
// Reject, Schedule. No email sent without approval.
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Check, X, Eye, Clock, AlertCircle,
  Send, ChevronRight, FileText, Users, Building2,
  Shield, ExternalLink, Search, Filter, Edit3,
  Calendar, Zap, Award, ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';
import { getEmailQueue, updateEmailStatus, getComplianceFooter, type EmailDraft } from '../services/email-generator';

export function AdminOutreach() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<EmailDraft[]>(getEmailQueue);
  const [selectedEmail, setSelectedEmail] = useState<EmailDraft | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'approved' | 'sent'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...queue];
    if (filter !== 'all') list = list.filter(e => e.status === filter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(e =>
        e.subject.toLowerCase().includes(s) ||
        e.recipientName.toLowerCase().includes(s) ||
        e.propertyName.toLowerCase().includes(s)
      );
    }
    return list;
  }, [queue, filter, search]);

  const handleApprove = (id: string) => {
    updateEmailStatus(id, 'approved');
    setQueue(getEmailQueue());
  };

  const handleReject = (id: string) => {
    updateEmailStatus(id, 'rejected');
    setQueue(getEmailQueue());
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleMarkSent = (id: string) => {
    updateEmailStatus(id, 'sent');
    setQueue(getEmailQueue());
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const stats = useMemo(() => ({
    draft: queue.filter(e => e.status === 'draft').length,
    approved: queue.filter(e => e.status === 'approved').length,
    sent: queue.filter(e => e.status === 'sent').length,
    total: queue.length,
  }), [queue]);

  return (
    <>
      <SEOHelmet title="Capital Introduction — Admin Outreach" noindex />
      <div className="min-h-screen bg-[#050505] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <h1 className="text-lg font-bold text-white">Capital Introduction Queue</h1>
              </div>
              <p className="text-[10px] text-gray-500">Review, approve, and send personalized introductions</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                stats.draft > 0 ? 'bg-amber-500 animate-pulse' : 'bg-gray-700'
              )} />
              <span className="text-[9px] font-mono text-gray-500">
                {stats.draft} pending · {stats.approved} approved · {stats.sent} sent
              </span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { label: 'Total Drafts', value: stats.total, color: 'text-white' },
              { label: 'Pending Approval', value: stats.draft, color: 'text-amber-400' },
              { label: 'Approved', value: stats.approved, color: 'text-emerald-400' },
              { label: 'Sent', value: stats.sent, color: 'text-blue-400' },
            ].map(stat => (
              <div key={stat.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
                <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
                <p className="text-[8px] text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search emails..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-gray-700"
              />
            </div>
            <div className="flex border border-white/[0.06] rounded-lg overflow-hidden">
              {(['all', 'draft', 'approved', 'sent'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 text-[10px] font-medium transition-colors',
                    filter === f ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white'
                  )}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Email Queue */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* List */}
            <div className="space-y-1.5">
              {filtered.map(email => (
                <motion.button
                  key={email.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    selectedEmail?.id === email.id
                      ? 'bg-luxury-gold-500/10 border-luxury-gold-500/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      email.status === 'draft' ? 'bg-amber-400' :
                      email.status === 'approved' ? 'bg-emerald-400' :
                      email.status === 'sent' ? 'bg-blue-400' : 'bg-gray-600'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-white truncate">{email.subject}</p>
                        <span className={cn(
                          'text-[8px] px-1.5 py-0.5 rounded-full border font-medium',
                          email.status === 'draft' ? 'border-amber-500/30 text-amber-400' :
                          email.status === 'approved' ? 'border-emerald-500/30 text-emerald-400' :
                          email.status === 'sent' ? 'border-blue-500/30 text-blue-400' :
                          'border-gray-600/30 text-gray-500'
                        )}>
                          {email.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">
                        {email.type === 'developer_outreach' ? '📋 ' : '👤 '}
                        {email.recipientName} · {email.propertyName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {email.status === 'draft' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleApprove(email.id); }}
                            className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleReject(email.id); }}
                            className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      {email.status === 'approved' && (
                        <button onClick={(e) => { e.stopPropagation(); handleMarkSent(email.id); }}
                          className="p-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No emails in queue. Run the capital introduction workflow to generate drafts.</p>
                  <button onClick={() => navigate('/founder')} className="btn-arch text-[10px] mt-3">
                    Go to Founder Dashboard
                  </button>
                </div>
              )}
            </div>

            {/* Preview */}
            {selectedEmail && (
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-white">Email Preview</h3>
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      'text-[8px] px-1.5 py-0.5 rounded-full border font-medium',
                      selectedEmail.status === 'draft' ? 'border-amber-500/30 text-amber-400' :
                      selectedEmail.status === 'approved' ? 'border-emerald-500/30 text-emerald-400' : 'border-blue-500/30 text-blue-400'
                    )}>
                      {selectedEmail.confidenceScore}% confidence
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/[0.03]">
                    <p className="text-[9px] text-gray-600">Subject</p>
                    <p className="text-xs text-white font-medium">{selectedEmail.subject}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.03] max-h-64 overflow-y-auto">
                    <p className="text-[9px] text-gray-600 mb-1">Body</p>
                    <pre className="text-[10px] text-gray-300 font-sans whitespace-pre-wrap leading-relaxed">{selectedEmail.body}</pre>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[9px] text-amber-400 font-medium mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Source Citations
                    </p>
                    <ul className="space-y-0.5">
                      {selectedEmail.sourceCitations.map((cite, i) => (
                        <li key={i} className="text-[9px] text-gray-500 flex items-start gap-1">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          {cite}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedEmail.status === 'draft' && (
                      <>
                        <button onClick={() => handleApprove(selectedEmail.id)}
                          className="btn-arch-filled text-[10px] flex-1 justify-center"
                        >
                          <Check className="w-3 h-3" /> Approve & Queue
                        </button>
                        <button onClick={() => handleReject(selectedEmail.id)}
                          className="btn-arch text-[10px] justify-center"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}
                    {selectedEmail.status === 'approved' && (
                      <button onClick={() => handleMarkSent(selectedEmail.id)}
                        className="btn-arch-filled text-[10px] flex-1 justify-center"
                      >
                        <Send className="w-3 h-3" /> Mark as Sent
                      </button>
                    )}
                  </div>

                  <p className="text-[7px] text-gray-700 leading-relaxed">
                    {getComplianceFooter()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
