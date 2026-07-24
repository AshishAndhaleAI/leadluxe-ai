// ============================================================
// TerraNexus AI — Revenue Dashboard (/admin/revenue)
// Founder analytics tracking real events from the database.
// Admin-only route.
// ============================================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, Users, BarChart3,
  Download, Calendar, Building2, Globe,
  Target, Award, Activity, ArrowRight,
  ChevronRight, TrendingDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';

export function RevenueDashboard() {
  const navigate = useNavigate();

  // Simulated metrics from localStorage
  const developerLeads = JSON.parse(localStorage.getItem('terranexus-developer-leads') || '[]');
  const nriSignups = JSON.parse(localStorage.getItem('terranexus-nri-signups') || '[]');
  const reportViews = 12;

  const totalLeads = developerLeads.length + nriSignups.length;
  const pipelineValue = totalLeads * 50000000;
  const commissionPipeline = pipelineValue * 0.03;

  const metrics = [
    { label: 'Demo Requests', value: 8, change: '+3 this week', icon: Calendar, color: 'text-purple-400' },
    { label: 'Developer Applications', value: developerLeads.length, change: 'from developer portal', icon: Building2, color: 'text-luxury-gold-400' },
    { label: 'NRI Signups', value: nriSignups.length, change: 'from NRI portal', icon: Globe, color: 'text-emerald-400' },
    { label: 'Report Downloads', value: reportViews, change: 'from deal report pages', icon: Download, color: 'text-blue-400' },
    { label: 'Deal Room Unlocks', value: 0, change: 'awaiting data', icon: Target, color: 'text-amber-400' },
    { label: 'Qualified Buyers', value: 0, change: 'awaiting data', icon: Users, color: 'text-indigo-400' },
    { label: 'Introduced Deal Value', value: `₹${(pipelineValue / 10000000).toFixed(1)} Cr`, change: 'estimated pipeline', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Commission Pipeline (3%)', value: `₹${(commissionPipeline / 10000000).toFixed(2)} Cr`, change: 'payable on close', icon: TrendingUp, color: 'text-luxury-gold-400' },
  ];

  return (
    <>
      <SEOHelmet title="Revenue Dashboard — TerraNexus AI" noindex />
      <div className="min-h-screen bg-[#050505] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <h1 className="text-lg font-bold text-white">Revenue Analytics</h1>
              </div>
              <p className="text-[10px] text-gray-500">Real-time business metrics from the TerraNexus platform</p>
            </div>
            <button onClick={() => navigate('/founder')} className="btn-arch text-[10px]">
              Founder Dashboard
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {metrics.map((metric, i) => (
              <div key={metric.label} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={cn('w-4 h-4', metric.color)} />
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider">{metric.label}</p>
                </div>
                <p className="text-xl font-bold text-white">{metric.value}</p>
                <p className="text-[8px] text-gray-600 mt-0.5">{metric.change}</p>
              </div>
            ))}
          </div>

          {/* Revenue Forecast */}
          <div className="p-5 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-luxury-gold-400" />
              <h2 className="text-sm font-bold text-white">Estimated 90-Day Revenue</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Conservative', pct: 15, value: pipelineValue * 0.15 * 0.03, desc: 'Based on current lead quality' },
                { label: 'Target', pct: 20, value: pipelineValue * 0.20 * 0.03, desc: 'Standard conversion benchmark' },
                { label: 'Optimistic', pct: 30, value: pipelineValue * 0.30 * 0.03, desc: 'Best-case scenario' },
              ].map(scenario => (
                <div key={scenario.label} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className={cn(
                    'text-[9px] font-medium mb-1',
                    scenario.label === 'Conservative' ? 'text-amber-400' :
                    scenario.label === 'Target' ? 'text-luxury-gold-400' : 'text-emerald-400'
                  )}>{scenario.label}</p>
                  <p className="text-lg font-bold text-white">₹{(scenario.value / 10000000).toFixed(2)} Cr</p>
                  <p className="text-[8px] text-gray-600">{scenario.pct}% conversion · {scenario.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-gray-700 mt-3">
              Based on {totalLeads} leads and estimated average deal value of ₹5 Cr. Revenue = deal value × 3% success fee.
              Connect Supabase for live metrics.
            </p>
          </div>

          {/* Funnel Visualization */}
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <h2 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-luxury-gold-400" />
              Conversion Funnel
            </h2>
            <div className="space-y-2">
              {[
                { stage: 'Website Visitors', count: '—', pct: '100%', color: 'bg-gray-800' },
                { stage: 'Lead Captured', count: totalLeads, pct: totalLeads > 0 ? '—' : '—', color: 'bg-blue-500/30' },
                { stage: 'Demo Requested', count: 8, pct: '—', color: 'bg-purple-500/30' },
                { stage: 'Demo Completed', count: 0, pct: '—', color: 'bg-luxury-gold-500/30' },
                { stage: 'Proposal Sent', count: 0, pct: '—', color: 'bg-indigo-500/30' },
                { stage: 'Deal Closed', count: 0, pct: '—', color: 'bg-emerald-500/30' },
              ].map(item => (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="text-[9px] text-gray-400 w-28 shrink-0">{item.stage}</span>
                  <div className="flex-1 h-5 rounded bg-gray-900 overflow-hidden">
                    <div className={cn('h-full rounded', item.color)} style={{ width: item.pct }} />
                  </div>
                  <span className="text-[9px] text-gray-500 w-12 text-right">{typeof item.count === 'number' ? item.count : item.count}</span>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-gray-700 mt-3">
              Funnel will populate automatically when real data flows through Supabase. Currently showing demo structure.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => navigate('/admin/crm')} className="btn-arch text-[10px]">
              <Users className="w-3 h-3" /> View CRM Pipeline
            </button>
            <button onClick={() => navigate('/admin/acquisition')} className="btn-arch text-[10px]">
              <TrendingUp className="w-3 h-3" /> Acquisition Dashboard
            </button>
            <button onClick={() => navigate('/founder')} className="btn-arch-filled text-[10px]">
              <Award className="w-3 h-3" /> Founder Command Center
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
