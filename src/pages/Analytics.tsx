import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, IndianRupee, Users, Calendar,
  Download, Target, ArrowUp, Sparkles,
  Building2, Activity
} from 'lucide-react';
import { KPICard } from '../components/ui/KPICard';
import { ConversionChart } from '../components/analytics/ConversionChart';
import { useDashboard } from '../hooks/useDashboard';
import { formatIndianCurrency, formatPercentage } from '../lib/format';
import { cn } from '../lib/utils';
import type { LeadStatus } from '../types';

export function Analytics() {
  const { metrics, loading } = useDashboard();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const analytics = useMemo(() => ({
    totalLeads: metrics.totalLeads,
    qualified: metrics.qualifiedLeads,
    booked: metrics.bookings,
    lost: metrics.totalLeads - metrics.qualifiedLeads,
    pipelineValue: metrics.pipelineValue,
    avgScore: Math.round(
      metrics.totalLeads > 0
        ? metrics.hotLeadsList.reduce((s, l) => s + l.score, 0) / Math.max(metrics.hotLeadsList.length, 1)
        : 0
    ),
    conversionRate: metrics.conversionRate,
    qualificationRate: metrics.totalLeads > 0 ? (metrics.qualifiedLeads / metrics.totalLeads) * 100 : 0,
    visitBookingRate: metrics.siteVisits > 0 ? (metrics.bookings / metrics.siteVisits) * 100 : 0,
    leadsByStatus: metrics.leadsByStatus,
    monthlyData: metrics.monthlyTrend,
  }), [metrics]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-xl" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Analytics & Reports</h2>
            <p className="text-sm text-gray-500">Pipeline insights and revenue performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-luxury-gray rounded-lg p-0.5">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  dateRange === range ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="btn-outline !px-3 !py-1.5">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Pipeline Value"
          value={formatIndianCurrency(analytics.pipelineValue)}
          icon={<IndianRupee className="w-5 h-5" />}
          subtitle="Active pipeline"
        />
        <KPICard
          title="Conversion Rate"
          value={formatPercentage(analytics.conversionRate)}
          icon={<Target className="w-5 h-5" />}
          subtitle="Lead to booking"
          trend={{ value: 2.3, isPositive: true }}
        />
        <KPICard
          title="Avg Lead Score"
          value={`${analytics.avgScore}/100`}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Quality metric"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Qualification Rate"
          value={formatPercentage(analytics.qualificationRate)}
          icon={<Users className="w-5 h-5" />}
          subtitle="Lead to qualified"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="premium-card p-5">
          <ConversionChart data={analytics.leadsByStatus} />
        </div>

        {/* Revenue Projection */}
        <div className="premium-card p-5">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Revenue Projection</h3>
            <div className="flex items-end gap-2 h-48">
              {analytics.monthlyData.map((item, i) => {
                const maxVal = Math.max(...analytics.monthlyData.map((m) => Math.max(m.leads, m.bookings)), 1);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full" style={{ height: '160px' }}>
                      <div className="absolute bottom-0 left-1 right-1 rounded-t-md bg-luxury-gold-500/20 transition-all duration-500"
                        style={{ height: `${(item.leads / maxVal) * 100}%` }}>
                        <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-luxury-gold-500/40"
                          style={{ height: `${Math.min((item.leads / maxVal) * 100, 100)}%` }} />
                      </div>
                      <div className="absolute bottom-0 left-1.5 right-1.5 rounded-t-md bg-emerald-500/60 transition-all duration-500"
                        style={{ height: `${(item.bookings / maxVal) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-luxury-gold-500/40" />
                <span>Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
                <span>Bookings</span>
              </div>
              <span>Conv: <span className="text-emerald-400">{formatPercentage(analytics.conversionRate)}</span></span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="premium-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-gray-500">Visit to Booking</p>
              </div>
              <p className="text-2xl font-bold text-white">{formatPercentage(analytics.visitBookingRate)}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> +5.2% vs last month
              </p>
            </div>
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-500">Qualified Leads</p>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.qualified}</p>
              <p className="text-xs text-gray-500 mt-1">of {analytics.totalLeads} total</p>
            </div>
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-luxury-gold-400" />
                <p className="text-xs text-gray-500">Total Bookings</p>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.booked}</p>
              <p className="text-xs text-luxury-gold-400 mt-1">{formatIndianCurrency(analytics.pipelineValue)} pipeline</p>
            </div>
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-gray-500">Lost Leads</p>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.lost}</p>
              <p className="text-xs text-red-400 mt-1">
                {analytics.totalLeads > 0 ? formatPercentage((analytics.lost / analytics.totalLeads) * 100) : '0%'} loss rate
              </p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-luxury-gold-400" />
            <h3 className="text-sm font-semibold text-white">AI Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/20">
              <p className="text-sm text-luxury-gold-400 font-medium">📈 Conversion Opportunity</p>
              <p className="text-xs text-gray-400 mt-1">
                Your qualified leads have a {formatPercentage(analytics.visitBookingRate)} visit-to-booking rate.
                Focus on moving more leads to site visits.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-blue-400 font-medium">🎯 Lead Quality Improving</p>
              <p className="text-xs text-gray-400 mt-1">
                Average lead score is {analytics.avgScore}/100. Leads from WhatsApp and referrals score 20% higher.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm text-emerald-400 font-medium">📊 Revenue Projection</p>
              <p className="text-xs text-gray-400 mt-1">
                Current pipeline value of {formatIndianCurrency(analytics.pipelineValue)} with {formatPercentage(analytics.conversionRate)} expected conversion rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
