// ============================================================
// LeadLuxe AI — CRM Pipeline (/admin/crm)
// Internal deal-flow tracking with pipeline stages.
// Uses localStorage for demo — connect Supabase for production.
// Admin-only route.
// ============================================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Phone, Mail, Calendar, Building2,
  ChevronRight, Search, ArrowRight,
  Check, X, Clock, MessageSquare, TrendingUp,
  DollarSign, UserPlus, Star, FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';

const PIPELINE_STAGES = [
  { id: 'new', label: 'New Lead', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'contacted', label: 'Contacted', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'demo_scheduled', label: 'Demo Scheduled', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'demo_completed', label: 'Demo Completed', color: 'bg-luxury-gold-500/20 text-luxury-gold-400 border-luxury-gold-500/30' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'won', label: 'Won', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const STAGE_ICONS: Record<string, any> = {
  new: UserPlus, contacted: MessageSquare, demo_scheduled: Calendar,
  demo_completed: Check, proposal_sent: FileText,
  negotiation: TrendingUp, won: Star, lost: X,
};

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  type: 'developer' | 'investor' | 'nri' | 'enterprise';
  stage: string;
  city: string;
  ticketSize: string;
  notes: string;
  nextAction: string;
  nextActionDate: string;
  createdAt: string;
}

// ⚠️ Demo data — replace with live Supabase records before production use.
// Company names are illustrative examples of the types of leads expected.
const DEMO_LEADS: Lead[] = [
  { id: '1', name: '—', company: 'Premium Developer A (Mumbai)', email: '—', phone: '—', source: 'developer_portal', type: 'developer', stage: 'demo_scheduled', city: 'Mumbai', ticketSize: '₹100Cr+', notes: 'Interested in NRI pipeline for upcoming premium project', nextAction: 'Send demo link', nextActionDate: '2026-07-25', createdAt: '2026-07-20' },
  { id: '2', name: '—', company: 'Developer B (NCR)', email: '—', phone: '—', source: 'cold_email', type: 'developer', stage: 'contacted', city: 'Gurugram', ticketSize: '₹50-100Cr', notes: 'Following up after initial email', nextAction: 'Call for demo scheduling', nextActionDate: '2026-07-26', createdAt: '2026-07-22' },
  { id: '3', name: '—', company: 'NRI Family Office (Singapore)', email: '—', phone: '—', source: 'nri_portal', type: 'nri', stage: 'new', city: 'Singapore', ticketSize: '₹5-10Cr', notes: 'Looking for premium Indian residential', nextAction: 'Send India opportunity report', nextActionDate: '2026-07-24', createdAt: '2026-07-23' },
  { id: '4', name: '—', company: 'Institutional Developer C (NCR)', email: '—', phone: '—', source: 'enterprise', type: 'developer', stage: 'negotiation', city: 'Delhi NCR', ticketSize: '₹200Cr+', notes: 'Pilot discussion underway. Terms in review.', nextAction: 'Send revised proposal', nextActionDate: '2026-07-28', createdAt: '2026-07-15' },
  { id: '5', name: '—', company: 'Developer D (Bengaluru)', email: '—', phone: '—', source: 'referral', type: 'developer', stage: 'proposal_sent', city: 'Bengaluru', ticketSize: '₹50-100Cr', notes: 'Proposal sent for multi-project partnership', nextAction: 'Follow up on proposal', nextActionDate: '2026-07-27', createdAt: '2026-07-18' },
  { id: '6', name: '—', company: 'NRI Investor (Dubai)', email: '—', phone: '—', source: 'nri_portal', type: 'nri', stage: 'demo_completed', city: 'Dubai', ticketSize: '₹2-5Cr', notes: 'Demo completed. Interested in Hyderabad and Pune.', nextAction: 'Send curated property list', nextActionDate: '2026-07-25', createdAt: '2026-07-19' },
  { id: '7', name: '—', company: 'Premium Developer E (Mumbai)', email: '—', phone: '—', source: 'developer_portal', type: 'developer', stage: 'new', city: 'Mumbai', ticketSize: '₹100Cr+', notes: 'Applied through developer portal', nextAction: 'Initial qualification call', nextActionDate: '2026-07-26', createdAt: '2026-07-23' },
  { id: '8', name: '—', company: 'Developer F (Bengaluru)', email: '—', phone: '—', source: 'cold_email', type: 'developer', stage: 'contacted', city: 'Bengaluru', ticketSize: '₹50-100Cr', notes: 'Received email, interested in demo', nextAction: 'Schedule demo', nextActionDate: '2026-07-27', createdAt: '2026-07-21' },
];

export function CRMPipeline() {
  const navigate = useNavigate();
  const [leads] = useState<Lead[]>(DEMO_LEADS);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    let list = [...leads];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(l => l.name.toLowerCase().includes(s) || l.company.toLowerCase().includes(s) || l.city.toLowerCase().includes(s));
    }
    if (stageFilter !== 'all') list = list.filter(l => l.stage === stageFilter);
    return list;
  }, [leads, search, stageFilter]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => { counts[l.stage] = (counts[l.stage] || 0) + 1; });
    return counts;
  }, [leads]);

  const pipelineValue = leads
    .filter(l => l.stage !== 'lost')
    .reduce((sum, l) => {
      const v = parseInt(l.ticketSize.replace(/[^0-9]/g, '')) || 0;
      return sum + v;
    }, 0);

  return (
    <>
      <SEOHelmet title="CRM Pipeline — LeadLuxe AI" noindex />
      <div className="min-h-screen bg-[#050505] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <h1 className="text-lg font-bold text-white">CRM Pipeline</h1>
              </div>
              <p className="text-[10px] text-gray-500">{leads.length} leads · ₹{pipelineValue.toLocaleString()}Cr estimated pipeline</p>
            </div>
            <button
              onClick={() => navigate('/admin/revenue')}
              className="btn-arch text-[10px]"
            >
              Revenue Dashboard
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Pipeline stats */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-6">
            {PIPELINE_STAGES.map(stage => (
              <button
                key={stage.id}
                onClick={() => setStageFilter(stageFilter === stage.id ? 'all' : stage.id)}
                className={cn(
                  'p-2 rounded-lg border text-center transition-all',
                  stageFilter === stage.id ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.04] hover:border-white/10',
                )}
              >
                <p className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full inline-block border mb-0.5', stage.color)}>
                  {stageCounts[stage.id] || 0}
                </p>
                <p className="text-[7px] text-gray-500 leading-tight">{stage.label}</p>
              </button>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-gray-700 focus:border-luxury-gold-500/30 transition-colors"
              />
            </div>
            <span className="text-[9px] text-gray-600">{filteredLeads.length} of {leads.length} leads</span>
          </div>

          {/* Leads list */}
          <div className="space-y-1.5">
            {filteredLeads.map(lead => (
              <motion.button
                key={lead.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  selectedLead?.id === lead.id
                    ? 'bg-luxury-gold-500/10 border-luxury-gold-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-luxury-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-white truncate">{lead.name}</p>
                      <span className={cn('text-[8px] px-1.5 py-0.5 rounded-full border font-medium', PIPELINE_STAGES.find(s => s.id === lead.stage)?.color)}>
                        {PIPELINE_STAGES.find(s => s.id === lead.stage)?.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{lead.company} · {lead.city} · {lead.ticketSize}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-600">
                    <span className="hidden sm:inline">{lead.source}</span>
                    <span>·</span>
                    <span>{lead.type}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {selectedLead?.id === lead.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/[0.06]"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="text-gray-300">{lead.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="text-gray-300">{lead.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Next Action</p>
                        <p className="text-luxury-gold-400">{lead.nextAction}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Due Date</p>
                        <p className="text-gray-300">{lead.nextActionDate}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-[9px] text-gray-600">Notes</p>
                      <p className="text-[10px] text-gray-400">{lead.notes}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <a href={`mailto:${lead.email}`} className="btn-ghost text-[9px] px-2 py-1">
                        <Mail className="w-3 h-3" /> Email
                      </a>
                      <a href={`tel:${lead.phone}`} className="btn-ghost text-[9px] px-2 py-1">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No leads match your filters</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
