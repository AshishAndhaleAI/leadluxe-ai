import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Calendar, Building2, IndianRupee,
  Target, Activity, UserPlus, Clock, ArrowRight, Zap,
  BarChart3, Sparkles, Percent, Trophy
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { KPICard } from '../components/ui/KPICard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LeadScoreIndicator } from '../components/ui/LeadScoreIndicator';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { KPICardSkeleton, TableSkeleton, ChartSkeleton } from '../components/ui/SkeletonLoader';
import { formatIndianCurrency, formatPercentage, formatCommission } from '../lib/format';
import { formatRelativeTime, cn } from '../lib/utils';
import type { LeadStatus } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { metrics, loading } = useDashboard();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-6 w-48 mb-2" />
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="skeleton h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <div className="space-y-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time lead performance metrics · {metrics.totalLeads} total leads
          </p>
        </div>
        <button
          onClick={() => navigate('/leads')}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          Add New Lead
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <KPICard
          title="Pipeline Value"
          value={formatIndianCurrency(metrics.pipelineValue)}
          icon={<IndianRupee className="w-5 h-5" />}
          subtitle="Active pipeline"
          trend={{ value: 18, isPositive: true }}
        />
        <KPICard
          title="Potential Commission"
          value={formatCommission(metrics.potentialCommission)}
          icon={<Percent className="w-5 h-5" />}
          subtitle="3% of active pipeline"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Closed Deals"
          value={<AnimatedCounter value={metrics.closedDeals} />}
          icon={<Trophy className="w-5 h-5" />}
          subtitle="Total bookings"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Commission Earned"
          value={formatCommission(metrics.commissionEarned)}
          icon={<IndianRupee className="w-5 h-5" />}
          subtitle="3% on closed deals"
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Avg Deal Size"
          value={metrics.averageDealSize > 0 ? formatIndianCurrency(metrics.averageDealSize) : '—'}
          icon={<Building2 className="w-5 h-5" />}
          subtitle="Per closed deal"
        />
        <KPICard
          title="Site Visits"
          value={<AnimatedCounter value={metrics.siteVisits} />}
          icon={<Calendar className="w-5 h-5" />}
          subtitle="Scheduled site visits"
          trend={{ value: 15, isPositive: true }}
          onClick={() => navigate('/calendar')}
        />
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Trends */}
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-sm font-semibold text-white">Monthly Trends</h3>
              </div>
              <span className="text-xs text-luxury-gold-400">
                Commission: {formatCommission(metrics.commissionEarned)}
              </span>
            </div>

            <div className="flex items-end gap-2 h-40">
              {metrics.monthlyTrend.map((item, i) => {
                const maxLeads = Math.max(...metrics.monthlyTrend.map((m) => m.leads), 1);
                const maxBookings = Math.max(...metrics.monthlyTrend.map((m) => m.bookings), 1);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="relative w-full" style={{ height: '120px' }}>
                      <div
                        className="absolute bottom-0 left-1.5 right-1.5 rounded-t-md bg-luxury-gold-500/20 transition-all duration-500"
                        style={{ height: `${(item.leads / maxLeads) * 100}%` }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t-md bg-luxury-gold-500/40"
                          style={{ height: `${Math.min((item.leads / maxLeads) * 100, 100)}%` }}
                        />
                      </div>
                      <div
                        className="absolute bottom-0 left-1.5 right-1.5 rounded-t-md bg-emerald-500/60 transition-all duration-500"
                        style={{ height: `${(item.bookings / maxBookings) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500">{item.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-luxury-border">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-luxury-gold-500/40" />
                <span className="text-xs text-gray-400">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
                <span className="text-xs text-gray-400">Bookings</span>
              </div>
              <span className="text-xs text-gray-600">
                Conv: <span className="text-emerald-400">{formatPercentage(metrics.conversionRate)}</span>
              </span>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-sm font-semibold text-white">Recent Leads</h3>
              </div>
              <button
                onClick={() => navigate('/leads')}
                className="flex items-center gap-1 text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors"
              >
                View All
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {metrics.recentLeads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/lead/${lead.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-luxury-gold-500/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-luxury-gold-400">
                        {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-luxury-gold-300 transition-colors">
                        {lead.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatRelativeTime(lead.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={lead.status} />
                    <LeadScoreIndicator score={lead.score} size="sm" showLabel={false} />
                  </div>
                </motion.div>
              ))}
              {metrics.recentLeads.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No leads yet</p>
                  <p className="text-xs text-gray-600 mt-1">Start by capturing your first lead</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Hot Leads */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Hot Leads</h3>
              <span className="text-xs text-gray-500 ml-auto">{metrics.hotLeads} leads</span>
            </div>

            <div className="space-y-3">
              {metrics.hotLeadsList.map((lead) => {
                const estCommission = (lead.budget || 0) * 0.03;
                return (
                  <div
                    key={lead.id}
                    onClick={() => navigate(`/lead/${lead.id}`)}
                    className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      <LeadScoreIndicator score={lead.score} size="sm" showLabel={false} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{lead.preferred_location || 'No location'}</span>
                      <span className="text-luxury-gold-400">
                        {lead.budget ? formatIndianCurrency(lead.budget) : '-'}
                      </span>
                    </div>
                    {estCommission > 0 && (
                      <p className="text-[10px] text-emerald-500/70 mt-1">
                        Est. commission: {formatCommission(estCommission)}
                      </p>
                    )}
                  </div>
                );
              })}
              {metrics.hotLeadsList.length === 0 && (
                <div className="text-center py-6">
                  <Zap className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hot leads yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Lead Distribution */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Lead Distribution</h3>
            </div>

            <div className="space-y-2.5">
              {metrics.leadsByStatus.map((item) => {
                const pct = metrics.totalLeads > 0 ? (item.count / metrics.totalLeads) * 100 : 0;
                const barColor: Record<string, string> = {
                  new: 'bg-blue-500', contacted: 'bg-purple-500', qualified: 'bg-emerald-500',
                  site_visit: 'bg-amber-500', negotiation: 'bg-orange-500',
                  booked: 'bg-luxury-gold-500', lost: 'bg-red-500',
                };
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <StatusBadge status={item.status} />
                      <span className="text-gray-400">{item.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-luxury-gray overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', barColor[item.status])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/leads')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center group-hover:bg-luxury-gold-500/30 transition-colors">
                  <UserPlus className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Add New Lead</p>
                  <p className="text-xs text-gray-500">Capture a lead manually</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/calendar')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Schedule Visit</p>
                  <p className="text-xs text-gray-500">Arrange a site visit</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">View Reports</p>
                  <p className="text-xs text-gray-500">Analytics & insights</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
