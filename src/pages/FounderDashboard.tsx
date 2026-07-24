// ============================================================
// LeadLuxe AI — Founder Dashboard (/founder)
// Private admin command center for daily operations.
// Shows today's leads, demos, highest-intent investors,
// developers needing follow-up, report hotspots, revenue forecast.
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Users, Calendar, DollarSign, Building2,
  Bell, Target, Clock, ArrowRight, Mail, Phone,
  BarChart3, Globe, MapPin, Zap, Award, AlertCircle,
  ChevronRight, Activity, Download, ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';

const TODAY_TASKS = [
  { id: 1, task: 'Send demo link to Ashish Sharma (Lodha Group)', priority: 'high', due: 'Today', type: 'demo' },
  { id: 2, task: 'Call Priya Patel (DLF) for follow-up', priority: 'high', due: 'Today', type: 'call' },
  { id: 3, task: 'Send India report to Rahul Mehta (Singapore NRI)', priority: 'medium', due: 'Today', type: 'email' },
  { id: 4, task: 'Review Vikram Singh (Emaar) proposal terms', priority: 'high', due: 'Tomorrow', type: 'review' },
  { id: 5, task: 'Prepare pipeline report for weekly review', priority: 'medium', due: 'Tomorrow', type: 'report' },
];

const WEEK_DEMOS = [
  { day: 'Mon', count: 2 },
  { day: 'Tue', count: 3 },
  { day: 'Wed', count: 1 },
  { day: 'Thu', count: 4 },
  { day: 'Fri', count: 2 },
  { day: 'Sat', count: 0 },
  { day: 'Sun', count: 0 },
];

export function FounderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'today' | 'pipeline' | 'insights'>('today');

  // Simulated metrics from localStorage
  const developerLeads = JSON.parse(localStorage.getItem('leadluxe-developer-leads') || '[]');
  const nriSignups = JSON.parse(localStorage.getItem('leadluxe-nri-signups') || '[]');
  const totalLeads = developerLeads.length + nriSignups.length;

  const pipelineValue = developerLeads.length * 50000000 + nriSignups.length * 20000000;
  const commissionPipeline = pipelineValue * 0.03;

  return (
    <>
      <SEOHelmet title="Founder Dashboard — LeadLuxe AI" noindex />
      <div className="min-h-screen bg-[#050505] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                  <Award className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <h1 className="text-lg font-bold text-white">Founder Command Center</h1>
              </div>
              <p className="text-[10px] text-gray-500">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-mono">Live</span>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
            {[
              { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-400' },
              { label: 'Developer Apps', value: developerLeads.length, icon: Building2, color: 'text-luxury-gold-400' },
              { label: 'NRI Signups', value: nriSignups.length, icon: Globe, color: 'text-emerald-400' },
              { label: 'Pipeline Value', value: `₹${(pipelineValue / 10000000).toFixed(1)}Cr`, icon: DollarSign, color: 'text-luxury-gold-400' },
              { label: 'Commission (3%)', value: `₹${(commissionPipeline / 10000000).toFixed(2)}Cr`, icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Demos This Week', value: WEEK_DEMOS.reduce((s, d) => s + d.count, 0), icon: Calendar, color: 'text-purple-400' },
              { label: 'Tasks Due Today', value: TODAY_TASKS.filter(t => t.priority === 'high').length, icon: Bell, color: 'text-red-400' },
            ].map((stat, i) => (
              <div key={stat.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className={cn('w-3 h-3', stat.color)} />
                  <p className="text-[8px] text-gray-600 uppercase tracking-wider">{stat.label}</p>
                </div>
                <p className="text-sm font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-4 border-b border-white/[0.06] pb-1">
            {(['today', 'pipeline', 'insights'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1.5 text-[10px] font-medium rounded-t-lg transition-colors',
                  activeTab === tab ? 'text-luxury-gold-400 border-b-2 border-luxury-gold-500' : 'text-gray-500 hover:text-gray-300'
                )}
              >
                {tab === 'today' ? "Today's View" : tab === 'pipeline' ? 'Pipeline Overview' : 'Market Insights'}
              </button>
            ))}
          </div>

          {activeTab === 'today' && (
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Today's Tasks */}
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <h2 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-luxury-gold-400" />
                  Tasks Due
                </h2>
                <div className="space-y-2">
                  {TODAY_TASKS.map(task => (
                    <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                        task.priority === 'high' ? 'bg-red-400' : 'bg-amber-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-300">{task.task}</p>
                        <p className="text-[8px] text-gray-600 mt-0.5">{task.due} · {task.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo Schedule */}
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <h2 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-luxury-gold-400" />
                  Demo Schedule — This Week
                </h2>
                <div className="flex items-end gap-2 h-24">
                  {WEEK_DEMOS.map(day => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-luxury-gold-500/30"
                        style={{ height: `${(day.count / 4) * 100}%`, minHeight: day.count > 0 ? '12px' : '4px' }}
                      />
                      <span className="text-[7px] text-gray-600">{day.day}</span>
                      <span className="text-[8px] text-white font-medium">{day.count}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/book-demo')}
                  className="mt-3 w-full btn-ghost text-[9px] py-1.5"
                >
                  <Calendar className="w-3 h-3" /> Book New Demo
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <h2 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-luxury-gold-400" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'CRM Pipeline', action: () => navigate('/admin/crm'), icon: Users },
                    { label: 'Revenue Dashboard', action: () => navigate('/admin/revenue'), icon: DollarSign },
                    { label: 'Acquisition View', action: () => navigate('/admin/acquisition'), icon: TrendingUp },
                    { label: 'Send Outreach', action: () => window.open('mailto:?subject=LeadLuxe%20AI%20Partnership', '_blank'), icon: Mail },
                  ].map(item => (
                    <button key={item.label} onClick={item.action}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <item.icon className="w-3.5 h-3.5 text-luxury-gold-400 shrink-0" />
                      <span className="text-[9px] text-gray-300">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Leads */}
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <h2 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-luxury-gold-400" />
                  Recent Signups
                </h2>
                <div className="space-y-2">
                  {developerLeads.slice(0, 3).map((lead: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                      <Building2 className="w-3 h-3 text-luxury-gold-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-300 truncate">{lead.company || 'Unknown'}</p>
                        <p className="text-[8px] text-gray-600">{lead.city || '—'} · {new Date(lead.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {developerLeads.length === 0 && <p className="text-[9px] text-gray-600">No developer signups yet. Start outreach from the CRM pipeline.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-xs font-semibold text-white mb-4">Pipeline Overview</h2>
              <p className="text-[10px] text-gray-500 mb-4">
                Connect Supabase tables for live pipeline data. Currently showing demo data.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Estimated Pipeline', value: `₹${(pipelineValue / 10000000).toFixed(1)} Cr`, icon: DollarSign },
                  { label: 'Commission Pipeline', value: `₹${(commissionPipeline / 10000000).toFixed(2)} Cr`, icon: TrendingUp },
                  { label: 'Avg Deal Size', value: '₹5.0 Cr', icon: Target },
                  { label: 'Conversion Rate', value: '—', icon: Activity },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10">
                    <stat.icon className="w-4 h-4 text-luxury-gold-400 mb-1" />
                    <p className="text-sm font-bold text-white">{stat.value}</p>
                    <p className="text-[8px] text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <p className="text-[9px] text-amber-400/70">
                  Connect real data sources (Supabase deals, intro agreements, commission records) to populate this dashboard with live metrics.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-xs font-semibold text-white mb-4">Market Insights</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { city: 'Mumbai', demand: 'High', growth: '+12.4%', nriInterest: 'Very High', projects: 142 },
                  { city: 'Bengaluru', demand: 'High', growth: '+14.8%', nriInterest: 'High', projects: 156 },
                  { city: 'Hyderabad', demand: 'Very High', growth: '+18.2%', nriInterest: 'Very High', projects: 112 },
                  { city: 'Pune', demand: 'High', growth: '+11.6%', nriInterest: 'High', projects: 98 },
                  { city: 'Delhi NCR', demand: 'Medium', growth: '+7.2%', nriInterest: 'Medium', projects: 89 },
                  { city: 'Chennai', demand: 'Medium', growth: '+9.5%', nriInterest: 'Medium', projects: 76 },
                ].map(city => (
                  <div key={city.city} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-white">{city.city}</p>
                      <span className={cn(
                        'text-[8px] px-1.5 py-0.5 rounded-full',
                        city.demand === 'Very High' ? 'bg-emerald-500/10 text-emerald-400' :
                        city.demand === 'High' ? 'bg-luxury-gold-500/10 text-luxury-gold-400' :
                        'bg-amber-500/10 text-amber-400'
                      )}>{city.demand}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[9px] text-gray-500">
                      <span>Growth: <span className="text-emerald-400">{city.growth}</span></span>
                      <span>NRI: <span className="text-luxury-gold-400">{city.nriInterest}</span></span>
                      <span>{city.projects} projects</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Forecast */}
          <div className="mt-4 p-4 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white mb-1">90-Day Revenue Forecast</h2>
                <p className="text-[10px] text-gray-400 mb-3">
                  Based on current pipeline of {totalLeads} leads with an estimated conversion rate of 15-20%.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[8px] text-gray-600 uppercase">Conservative</p>
                    <p className="text-base font-bold text-luxury-gold-400">₹{((pipelineValue * 0.15 * 0.03) / 10000000).toFixed(2)} Cr</p>
                    <p className="text-[8px] text-gray-600">15% conversion</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-600 uppercase">Target</p>
                    <p className="text-base font-bold text-white">₹{((pipelineValue * 0.20 * 0.03) / 10000000).toFixed(2)} Cr</p>
                    <p className="text-[8px] text-gray-600">20% conversion</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-600 uppercase">Optimistic</p>
                    <p className="text-base font-bold text-emerald-400">₹{((pipelineValue * 0.30 * 0.03) / 10000000).toFixed(2)} Cr</p>
                    <p className="text-[8px] text-gray-600">30% conversion</p>
                  </div>
                </div>
                <p className="text-[8px] text-gray-700 mt-3">
                  Revenue based on 3% success fee on closed deal value. Connect live Supabase data for accurate forecasting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
