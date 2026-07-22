import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, IndianRupee, Users, Calendar,
  Download, Target, ArrowUp, Sparkles,
  Building2, Activity, Percent, Trophy
} from 'lucide-react';
import { KPICard } from '../components/ui/KPICard';
import { ConversionChart } from '../components/analytics/ConversionChart';
import { useDashboard } from '../hooks/useDashboard';
import { formatIndianCurrency, formatPercentage, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';
import type { LeadStatus } from '../types';

export function Analytics() {
  const { metrics, loading } = useDashboard();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const analytics = useMemo(() => ({
    totalLeads: metrics.totalLeads,
    qualified: metrics.qualifiedLeads,
    siteVisits: metrics.siteVisits,
    booked: metrics.bookings,
    lost: metrics.totalLeads - metrics.qualifiedLeads,
    pipelineValue: metrics.pipelineValue,
    potentialCommission: metrics.potentialCommission,
    commissionEarned: metrics.commissionEarned,
    closedDeals: metrics.closedDeals,
    averageDealSize: metrics.averageDealSize,
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
          title="Potential Commission"
          value={formatCommission(analytics.potentialCommission)}
          icon={<Percent className="w-5 h-5" />}
          subtitle="3% success fee"
        />
        <KPICard
          title="Commission Earned"
          value={formatCommission(analytics.commissionEarned)}
          icon={<IndianRupee className="w-5 h-5" />}
          subtitle="On closed deals"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Avg Deal Size"
          value={analytics.averageDealSize > 0 ? formatIndianCurrency(analytics.averageDealSize) : '—'}
          icon={<Building2 className="w-5 h-5" />}
          subtitle="Per closed booking"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="premium-card p-5">
          <ConversionChart data={analytics.leadsByStatus} />
        </div>

        {/* Commission by Month / Pipeline */}
        <div className="premium-card p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-sm font-semibold text-white">Commission & Pipeline</h3>
              </div>
              <span className="text-xs text-luxury-gold-400">Total: {formatCommission(analytics.potentialCommission + analytics.commissionEarned)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-luxury-gray/30 border border-luxury-border">
                <p className="text-[10px] text-gray-500">Pipeline Value</p>
                <p className="text-base font-bold text-white">{formatIndianCurrency(analytics.pipelineValue)}</p>
                <p className="text-[10px] text-luxury-gold-400">Potential: {formatCommission(analytics.potentialCommission)}</p>
              </div>
              <div className="p-3 rounded-lg bg-luxury-gray/30 border border-luxury-border">
                <p className="text-[10px] text-gray-500">Commission Realized</p>
                <p className="text-base font-bold text-emerald-400">{formatCommission(analytics.commissionEarned)}</p>
                <p className="text-[10px] text-gray-500">On {analytics.closedDeals} deals</p>
              </div>
              <div className="p-3 rounded-lg bg-luxury-gray/30 border border-luxury-border">
                <p className="text-[10px] text-gray-500">Avg Deal Size</p>
                <p className="text-base font-bold text-white">{analytics.averageDealSize > 0 ? formatIndianCurrency(analytics.averageDealSize) : '—'}</p>
                <p className="text-[10px] text-emerald-400">Avg commission: {analytics.averageDealSize > 0 ? formatCommission(analytics.averageDealSize * 0.03) : '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-luxury-gray/30 border border-luxury-border">
                <p className="text-[10px] text-gray-500">Visit→Booking Rate</p>
                <p className="text-base font-bold text-white">{formatPercentage(analytics.visitBookingRate)}</p>
                <p className="text-[10px] text-gray-500">Conversion efficiency</p>
              </div>
            </div>

            {/* Commission by month bar chart */}
            <div>
              <p className="text-xs text-gray-500 mb-3">Commission by Month</p>
              <div className="flex items-end gap-2 h-32">
                {analytics.monthlyData.map((item, i) => {
                  // Estimate commission from each month's bookings (each booking assumed ~₹1Cr avg)
                  const monthlyCommission = item.bookings * 10000000 * 0.03;
                  const maxComm = Math.max(...analytics.monthlyData.map((m) => m.bookings * 10000000 * 0.03), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="relative w-full" style={{ height: '100px' }}>
                        <div className="absolute bottom-0 left-1.5 right-1.5 rounded-t-md"
                          style={{
                            height: monthlyCommission > 0 ? `${(monthlyCommission / maxComm) * 100}%` : '4px',
                            background: monthlyCommission > 0 
                              ? 'linear-gradient(to top, rgba(212, 160, 48, 0.6), rgba(212, 160, 48, 0.2))'
                              : 'rgba(255,255,255,0.03)'
                          }} 
                        />
                      </div>
                      <span className="text-[9px] text-gray-600">{item.month}</span>
                      {monthlyCommission > 0 && (
                        <span className="text-[8px] text-luxury-gold-400/70">{formatCommission(monthlyCommission)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="premium-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            <div className="relative h-12 bg-luxury-gray/30 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <span className="text-xs text-gray-500">Lead → Qualified</span>
                <span className="text-xs font-medium text-white">{formatPercentage(analytics.qualificationRate)}</span>
              </div>
              <div className="h-full rounded-lg bg-emerald-500/30" style={{ width: `${Math.min(analytics.qualificationRate, 100)}%` }} />
            </div>
            <div className="relative h-12 bg-luxury-gray/30 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <span className="text-xs text-gray-500">Qualified → Site Visit</span>
                <span className="text-xs font-medium text-white">{formatPercentage(analytics.siteVisits > 0 ? (analytics.booked / analytics.siteVisits) * 100 : 0)}</span>
              </div>
              <div className="h-full rounded-lg bg-amber-500/30" style={{ width: `${Math.min(analytics.siteVisits > 0 ? (analytics.booked / analytics.siteVisits) * 100 : 0, 100)}%` }} />
            </div>
            <div className="relative h-12 bg-luxury-gray/30 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <span className="text-xs text-gray-500">Site Visit → Booking</span>
                <span className="text-xs font-medium text-white">{formatPercentage(analytics.visitBookingRate)}</span>
              </div>
              <div className="h-full rounded-lg bg-luxury-gold-500/30" style={{ width: `${Math.min(analytics.visitBookingRate, 100)}%` }} />
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Overall Conversion</span>
                <span className="text-sm font-bold text-emerald-400">{formatPercentage(analytics.conversionRate)}</span>
              </div>
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
                <Percent className="w-4 h-4 text-luxury-gold-400" />
                <p className="text-xs text-gray-500">Commission Rate</p>
              </div>
              <p className="text-2xl font-bold text-white">3%</p>
              <p className="text-xs text-luxury-gold-400 mt-1">Success fee on closed deals</p>
            </div>
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-luxury-gold-400" />
                <p className="text-xs text-gray-500">Closed Deals</p>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.closedDeals}</p>
              <p className="text-xs text-luxury-gold-400 mt-1">Commission: {formatCommission(analytics.commissionEarned)}</p>
            </div>
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-gray-500">Qualified Leads</p>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.qualified}</p>
              <p className="text-xs text-gray-500 mt-1">of {analytics.totalLeads} total</p>
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
              <p className="text-sm text-luxury-gold-400 font-medium">📈 Commission Opportunity</p>
              <p className="text-xs text-gray-400 mt-1">
                Your active pipeline of {formatIndianCurrency(analytics.pipelineValue)} could earn {formatCommission(analytics.potentialCommission)} in success fees at 3%.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-blue-400 font-medium">🎯 Lead Quality Improving</p>
              <p className="text-xs text-gray-400 mt-1">
                Average lead score is {analytics.avgScore}/100. Higher quality scores correlate with larger deal sizes.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm text-emerald-400 font-medium">💰 Zero Risk Revenue</p>
              <p className="text-xs text-gray-400 mt-1">
                With {formatCommission(analytics.commissionEarned)} already earned from {analytics.closedDeals} closed deals — paid only after booking confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
