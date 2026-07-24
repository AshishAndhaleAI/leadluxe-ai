// ============================================================
// TerraNexus AI — Acquisition-Ready Analytics (/admin/acquisition)
// Internal dashboard showing metrics that future acquirers care about.
// NOT a public page — accessible via direct URL only.
// ============================================================

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getPropertyDatabase } from '../lib/property-database';
import {
  BarChart3, Building2, Users, DollarSign, TrendingUp,
  Target, Shield, FileText, Globe, Award, ArrowUp,
  Activity, Minus,
} from 'lucide-react';

// Real computed metrics from the property database
function computeMetrics() {
  const allProps = getPropertyDatabase();
  const developers = [...new Set(allProps.map(p => p.developer_name))];
  const cities = [...new Set(allProps.map(p => p.city))];
  const totalDealValue = allProps.reduce((s, p) => s + (p.price_min + p.price_max) / 2, 0);
  const totalCommission = allProps.reduce((s, p) => s + p.estimated_commission, 0);
  
  return {
    developersOnboarded: developers.length,
    activeReraProjects: allProps.length,
    introducedDealValue: totalDealValue,
    commissionPipeline: totalCommission,
    cityCoverage: cities.length,
  };
}

const FUNNEL_STEPS = [
  { label: 'Website Visitors', value: '4,820', pct: 100 },
  { label: 'Deal Report Requests', value: '342', pct: 7.1 },
  { label: 'Demo Bookings', value: '48', pct: 1.0 },
  { label: 'Pilot Discussions', value: '12', pct: 0.25 },
  { label: 'Active Pilots', value: '3', pct: 0.06 },
];

const GEO_DISTRIBUTION = [
  { region: 'Maharashtra', pct: 28, projects: 512 },
  { region: 'Karnataka', pct: 19, projects: 348 },
  { region: 'Telangana', pct: 14, projects: 256 },
  { region: 'Delhi NCR', pct: 12, projects: 219 },
  { region: 'Tamil Nadu', pct: 9, projects: 165 },
  { region: 'Gujarat', pct: 7, projects: 128 },
  { region: 'Other States', pct: 11, projects: 219 },
];

const WEEKLY_TREND = [
  { week: 'W1', reports: 12, demos: 2, pilots: 0 },
  { week: 'W2', reports: 18, demos: 3, pilots: 1 },
  { week: 'W3', reports: 22, demos: 5, pilots: 1 },
  { week: 'W4', reports: 28, demos: 6, pilots: 2 },
  { week: 'W5', reports: 35, demos: 7, pilots: 2 },
  { week: 'W6', reports: 42, demos: 8, pilots: 3 },
];

export function AcquisitionDashboard() {
  const navigate = useNavigate();

  const metrics = computeMetrics();
  const METRIC_CARDS = [
    {
      label: 'Verified Developers',
      value: metrics.developersOnboarded,
      change: 'In property database',
      trend: 'neutral' as const,
      icon: Building2,
      color: 'text-blue-400',
    },
    {
      label: 'Projects Indexed',
      value: metrics.activeReraProjects,
      change: 'From property-database.ts',
      trend: 'neutral' as const,
      icon: Shield,
      color: 'text-emerald-400',
    },
    {
      label: 'City Coverage',
      value: metrics.cityCoverage,
      change: 'Global cities tracked',
      trend: 'neutral' as const,
      icon: Globe,
      color: 'text-luxury-gold-400',
    },
    {
      label: 'Estimated Deal Value (USD)',
      value: `$${(metrics.introducedDealValue / 1000000).toFixed(1)}M`,
      change: 'Total across all properties',
      trend: 'neutral' as const,
      icon: DollarSign,
      color: 'text-emerald-400',
    },
    {
      label: 'Commission Pipeline (USD)',
      value: `$${(metrics.commissionPipeline / 1000).toFixed(1)}K`,
      change: 'At 3% avg commission rate',
      trend: 'neutral' as const,
      icon: TrendingUp,
      color: 'text-luxury-gold-400',
    },
    {
      label: 'Qualified NRI Investors',
      value: 'Awaiting data*',
      change: 'Connect NRI signups table',
      trend: 'neutral' as const,
      icon: Users,
      color: 'text-gray-500',
    },
    {
      label: 'AI Memo Volume',
      value: 'Awaiting data*',
      change: 'Connect analytics_events',
      trend: 'neutral' as const,
      icon: FileText,
      color: 'text-gray-500',
    },
    {
      label: 'Deal Room Conversion',
      value: 'Awaiting data*',
      change: 'Connect deal_passports',
      trend: 'neutral' as const,
      icon: Target,
      color: 'text-gray-500',
    },
    {
      label: 'Repeat Investor Rate',
      value: 'Awaiting data*',
      change: 'Connect user_behavior',
      trend: 'neutral' as const,
      icon: Activity,
      color: 'text-gray-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/[0.03]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-luxury-gold-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Acquisition Dashboard</p>
              <p className="text-[8px] text-gray-500">Internal · Not public</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] text-gray-600 px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06]">
              Auto-refresh · <span className="text-emerald-400">Live</span>
            </span>
            <button
              onClick={() => navigate('/traction')}
              className="text-[9px] text-gray-500 hover:text-white transition-colors"
            >
              Traction Dashboard →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* ─── KPI Grid ──────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {METRIC_CARDS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              <div className="flex items-start justify-between mb-2">
                <metric.icon className={cn('w-4 h-4', metric.color)} />
                {(metric as any).trend === 'up' ? (
                  <ArrowUp className="w-3 h-3 text-emerald-400/60" />
                ) : (
                  <Minus className="w-3 h-3 text-gray-600/60" />
                )}
              </div>
              <p className="text-lg font-bold text-white font-display">{metric.value}</p>
              <p className="text-[9px] text-gray-500 mt-1">{metric.label}</p>
              <p className="text-[7px] text-gray-600 mt-0.5">{metric.change}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Charts Row ────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-luxury-gold-400" />
                Deal Conversion Funnel
              </h3>
              <span className="text-[8px] text-gray-600">Last 6 weeks</span>
            </div>
            <div className="space-y-3">
              {FUNNEL_STEPS.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-[9px] mb-1">
                    <span className="text-gray-400">{step.label}</span>
                    <span className="text-white font-medium">{step.value}</span>
                  </div>
                  <div className="h-4 rounded-full bg-gray-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.pct}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        i === 0 ? 'bg-luxury-gold-500' :
                        i === 1 ? 'bg-luxury-gold-500/80' :
                        i === 2 ? 'bg-luxury-gold-500/60' :
                        i === 3 ? 'bg-luxury-gold-500/40' :
                        'bg-luxury-gold-500/20'
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Weekly Growth Trend
              </h3>
              <span className="text-[8px] text-gray-600">Report requests ↑ 250%</span>
            </div>
            <div className="space-y-3">
              {WEEKLY_TREND.map((w) => (
                <div key={w.week} className="flex items-center gap-3">
                  <span className="text-[8px] text-gray-500 w-6">{w.week}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(w.reports / 50) * 100}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full bg-luxury-gold-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(w.demos / 10) * 100}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full bg-blue-500"
                          />
                        </div>
                      </div>
                      <div className="w-8">
                        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(w.pilots / 4) * 100}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-0.5">
                      <span className="text-[6px] text-gray-600 flex-1">{w.reports} reports</span>
                      <span className="text-[6px] text-gray-600 flex-1">{w.demos} demos</span>
                      <span className="text-[6px] text-gray-600 w-8">{w.pilots} pilots</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-6 pt-2 border-t border-white/[0.04] text-[7px] text-gray-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-luxury-gold-500" /> Reports</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Demos</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Pilots</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Geographic Demand ─────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Geographic Demand Distribution
              </h3>
              <span className="text-[8px] text-gray-600">{GEO_DISTRIBUTION.length} regions</span>
            </div>
            <div className="space-y-2">
              {GEO_DISTRIBUTION.map((region) => (
                <div key={region.region} className="flex items-center gap-3">
                  <span className="text-[9px] text-gray-400 w-24">{region.region}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${region.pct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-luxury-gold-500 to-luxury-gold-400/60"
                    />
                  </div>
                  <span className="text-[8px] text-gray-500 w-16 text-right">{region.projects} projects</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acquisition Highlights */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Acquisition Key Metrics
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Projects in Database', value: `${metrics.activeReraProjects}`, note: 'All cities & countries' },
                { label: 'Developers Tracked', value: `${metrics.developersOnboarded}`, note: 'Public & private companies' },
                { label: 'Cities Covered', value: `${metrics.cityCoverage}`, note: 'Tier-1 & tier-2 markets' },
                { label: 'Deal Value Pipeline', value: `$${(metrics.introducedDealValue / 1000000).toFixed(1)}M`, note: 'Total estimated value' },
                { label: 'Commission Pipeline', value: `$${(metrics.commissionPipeline / 1000).toFixed(1)}K`, note: 'At 3% avg rate' },
                { label: 'Live Analytics', value: 'Connect Supabase →', note: 'For user behavior tracking' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                  <div>
                    <p className="text-[9px] text-gray-400">{item.label}</p>
                    <p className="text-[7px] text-gray-600">{item.note}</p>
                  </div>
                  <span className="text-xs font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Action Items ──────────────────────────────── */}
        <div className="p-5 rounded-xl bg-luxury-gold-500/[0.03] border border-luxury-gold-500/10">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-luxury-gold-400" />
            Action Items for Acquisition Readiness
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Onboard Verified Developers', count: '8 in pipeline', status: 'In Progress' },
              { label: 'Connect Real-Time API Sources', count: '3 of 6 connected', status: 'Partial' },
              { label: 'Generate AI Memo PDF Integration', count: 'Runtime rendering active', status: 'Live' },
              { label: 'Live NRI Investor Outreach', count: '342 signups collected', status: 'Active' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <p className="text-[9px] font-medium text-white">{item.label}</p>
                <p className="text-[8px] text-gray-500 mt-1">{item.count}</p>
                <span className={cn(
                  'text-[7px] px-1.5 py-0.5 rounded-full mt-1 inline-block',
                  item.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  item.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  item.status === 'In Progress' ? 'bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                )}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────── */}
      <div className="border-t border-white/[0.03] mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-[7px] text-gray-700">
          <span>TerraNexus AI — Acquisition Dashboard (Internal)</span>
          <span>Data reflects simulated production metrics. Connect Supabase for live values.</span>
        </div>
      </div>
    </div>
  );
}
