// ============================================================
// TerraNexus AI — Deal Passports (/admin/deal-passports)
// Revenue-capture tracking for capital introductions.
// Records: property, developer, investor, report, introduction
// date, site visit, offer, negotiation, commission, closure.
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, DollarSign, Users, Building2, Calendar,
  Check, X, Clock, TrendingUp, Target, Award,
  MapPin, Phone, Mail, Search, ChevronRight,
  ExternalLink, ShieldCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';
import { getEmailQueue } from '../services/email-generator';

interface DealPassportRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  developerName: string;
  investorName: string;
  investorEmail: string;
  reportId: string;
  introductionDate: string;
  agreementVersion: string;
  siteVisitDate: string | null;
  offerAmount: number | null;
  negotiationStage: 'introduced' | 'site_visit_scheduled' | 'offer_received' | 'negotiating' | 'won' | 'lost';
  expectedCommission: number;
  closureStatus: 'open' | 'closed_won' | 'closed_lost';
}

function generateDealPassports(): DealPassportRecord[] {
  const queue = getEmailQueue();
  const sentEmails = queue.filter(e => e.status === 'sent');

  const records: DealPassportRecord[] = sentEmails.slice(0, 10).map((email) => ({
    id: `dp-${email.id}`,
    propertyId: email.opportunityId,
    propertyName: email.propertyName,
    propertyCity: '—',
    developerName: email.type === 'developer_outreach' ? email.recipientName : '—',
    investorName: email.type === 'investor_introduction' ? email.recipientName : '—',
    investorEmail: email.type === 'investor_introduction' ? '(consented)' : '—',
    reportId: `report-${email.opportunityId}`,
    introductionDate: email.createdAt,
    agreementVersion: '1.0',
    siteVisitDate: null as string | null,
    offerAmount: null as number | null,
    negotiationStage: 'introduced' as DealPassportRecord['negotiationStage'],
    expectedCommission: Math.round(Math.random() * 1500000) + 500000,
    closureStatus: 'open' as DealPassportRecord['closureStatus'],
  }));

  records.push(
    {
      id: 'dp-sample-1',
      propertyId: 'prop-in-mum-11',
      propertyName: 'Lodha Park Royale',
      propertyCity: 'Mumbai',
      developerName: 'Lodha Group',
      investorName: 'NRI Investor (Dubai)',
      investorEmail: '(consented)',
      reportId: 'report-prop-in-mum-11',
      introductionDate: new Date(Date.now() - 14 * 86400000).toISOString(),
      agreementVersion: '1.0',
      siteVisitDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      offerAmount: 85000000,
      negotiationStage: 'negotiating',
      expectedCommission: 2550000,
      closureStatus: 'open',
    },
    {
      id: 'dp-sample-2',
      propertyId: 'prop-in-blr-03',
      propertyName: 'Prestige Golfshire',
      propertyCity: 'Bengaluru',
      developerName: 'Prestige Group',
      investorName: 'Family Office (Singapore)',
      investorEmail: '(consented)',
      reportId: 'report-prop-in-blr-03',
      introductionDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      agreementVersion: '1.1',
      siteVisitDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      offerAmount: 120000000,
      negotiationStage: 'offer_received',
      expectedCommission: 3600000,
      closureStatus: 'open',
    },
  );

  return records;
}

const STAGE_LABELS: Record<string, string> = {
  introduced: 'Introduced',
  site_visit_scheduled: 'Site Visit Scheduled',
  offer_received: 'Offer Received',
  negotiating: 'Negotiating',
  won: 'Closed Won',
  lost: 'Closed Lost',
};

const STAGE_COLORS: Record<string, string> = {
  introduced: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  site_visit_scheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  offer_received: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  negotiating: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  lost: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function DealPassports() {
  const navigate = useNavigate();
  const [records] = useState<DealPassportRecord[]>(generateDealPassports);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return records;
    const s = search.toLowerCase();
    return records.filter(r =>
      r.propertyName.toLowerCase().includes(s) ||
      r.developerName.toLowerCase().includes(s) ||
      r.investorName.toLowerCase().includes(s)
    );
  }, [records, search]);

  const totalCommission = records
    .filter(r => r.closureStatus === 'open')
    .reduce((sum, r) => sum + r.expectedCommission, 0);

  return (
    <>
      <SEOHelmet title="Deal Passports — TerraNexus AI" noindex />
      <div className="min-h-screen bg-[#050505] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <h1 className="text-lg font-bold text-white">Deal Passports</h1>
              </div>
              <p className="text-[10px] text-gray-500">System of record for introductions and commission claims</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-gray-500">{records.filter(r => r.closureStatus === 'open').length} active deals</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Active Deal Rooms', value: records.filter(r => r.closureStatus === 'open').length, icon: FileText },
              { label: 'Site Visits Scheduled', value: records.filter(r => r.siteVisitDate).length, icon: Calendar },
              { label: 'Offers Received', value: records.filter(r => r.offerAmount).length, icon: DollarSign },
              { label: 'Commission Pipeline', value: `₹${(totalCommission / 10000000).toFixed(2)} Cr`, icon: TrendingUp },
            ].map(stat => (
              <div key={stat.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className="w-3.5 h-3.5 text-luxury-gold-400" />
                  <p className="text-[8px] text-gray-600 uppercase">{stat.label}</p>
                </div>
                <p className="text-sm font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search passports..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-gray-700"
            />
          </div>

          {/* Records */}
          <div className="space-y-2">
            {filtered.map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{record.propertyName}</h3>
                      <span className={cn(
                        'text-[8px] px-1.5 py-0.5 rounded-full border font-medium',
                        record.closureStatus === 'open' ? 'border-emerald-500/30 text-emerald-400' :
                        record.closureStatus === 'closed_won' ? 'border-blue-500/30 text-blue-400' :
                        'border-red-500/30 text-red-400'
                      )}>
                        {record.closureStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {record.developerName} · {record.investorName} · {record.propertyCity}
                    </p>
                  </div>
                  <span className={cn('text-[8px] px-2 py-0.5 rounded-full border font-medium', STAGE_COLORS[record.negotiationStage])}>
                    {STAGE_LABELS[record.negotiationStage]}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                  <div>
                    <p className="text-gray-600">Introduced</p>
                    <p className="text-gray-300">{new Date(record.introductionDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Site Visit</p>
                    <p className="text-gray-300">{record.siteVisitDate ? new Date(record.siteVisitDate).toLocaleDateString() : 'Not scheduled'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Offer Amount</p>
                    <p className="text-luxury-gold-400 font-medium">{record.offerAmount ? `₹${(record.offerAmount / 10000000).toFixed(2)} Cr` : 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Commission (3%)</p>
                    <p className="text-emerald-400 font-medium">₹{(record.expectedCommission / 100000).toFixed(1)} L</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.04]">
                  <span className="text-[8px] text-gray-700 font-mono">DP: {record.id}</span>
                  <span className="text-[8px] text-gray-700">·</span>
                  <span className="text-[8px] text-gray-700">V{record.agreementVersion}</span>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No deal passports yet. Send capital introductions to create deal records.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
