import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, Target, IndianRupee, Building2,
  Trophy, Zap, Activity, ArrowRight, Percent, Globe, Bot,
  ChevronRight, Users, Clock, Rocket, Layers, AlertTriangle,
  BarChart3, MapPin, DollarSign
} from 'lucide-react';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { KPICard } from '../components/ui/KPICard';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { ConfidenceIndicator } from '../components/ai/ConfidenceIndicator';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn, formatRelativeTime } from '../lib/utils';
import { DEAL_STAGE_LABELS, DEAL_STAGE_COLORS, PRIORITY_COLORS } from '../types';
import { KPICardSkeleton } from '../components/ui/SkeletonLoader';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const navigate = useNavigate();
  const {
    dashboardMetrics: metrics,
    developers,
    opportunities,
    signals,
    systemStatus,
    loading,
  } = useOpportunityEngine();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div><div className="skeleton h-6 w-48 mb-2" /><div className="skeleton h-4 w-32" /></div>
          <div className="skeleton h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const topOpps = metrics.topOpportunities.slice(0, 5);
  const recentSignals = metrics.recentSignals.slice(0, 6);
  const stageData = metrics.opportunitiesByStage;

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
            <h1 className="text-xl font-semibold text-white">AI Deal Intelligence</h1>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {metrics.activeDealsCount} live deals
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {metrics.todayOpportunities} new this week · {metrics.criticalSignals} critical signals
          </p>
        </div>
        <button onClick={() => navigate('/opportunities')} className="btn-primary">
          <Zap className="w-4 h-4" />
          View All Opportunities
        </button>
      </motion.div>

      {/* KPI Row 1 — Core Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <KPICard title="Today's Opps" value={<AnimatedCounter value={metrics.todayOpportunities} />}
          icon={<Zap className="w-4 h-4" />} subtitle="This week" trend={{ value: 12, isPositive: true }} />
        <KPICard title="High Confidence" value={<AnimatedCounter value={metrics.highConfidenceDeals} />}
          icon={<Sparkles className="w-4 h-4" />} subtitle="80%+ score" trend={{ value: 8, isPositive: true }} />
        <KPICard title="Pipeline Value" value={formatIndianCurrency(metrics.totalPipelineValue)}
          icon={<IndianRupee className="w-4 h-4" />} subtitle="Active deals" trend={{ value: 15, isPositive: true }} />
        <KPICard title="Expected Commission" value={formatCommission(metrics.expectedCommission)}
          icon={<Percent className="w-4 h-4" />} subtitle="3% success fee" />
        <KPICard title="New Activity" value={<AnimatedCounter value={metrics.newBuilderActivity} />}
          icon={<Users className="w-4 h-4" />} subtitle="New developers" />
        <KPICard title="Avg Confidence" value={<AnimatedCounter value={metrics.avgConfidence} suffix="%" />}
          icon={<Target className="w-4 h-4" />} subtitle="Across all deals" />
        <KPICard title="Upcoming Launches" value={<AnimatedCounter value={metrics.upcomingLaunches} />}
          icon={<Rocket className="w-4 h-4" />} subtitle="New projects" />
        <KPICard title="Closed Commission" value={formatCommission(metrics.closedCommission)}
          icon={<Trophy className="w-4 h-4" />} subtitle="Realized" />
      </motion.div>

      {/* KPI Row 2 — Distribution */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority Distribution */}
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-luxury-gold-400" />
            <h3 className="text-sm font-semibold text-white">Opportunity Distribution</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {metrics.opportunitiesByPriority.map(item => {
              const pct = metrics.activeDealsCount > 0
                ? Math.round((item.count / metrics.activeDealsCount) * 100) : 0;
              return (
                <div key={item.priority} className="text-center">
                  <div className={cn(
                    'text-lg font-bold', item.priority === 'critical'
                      ? 'text-red-400' : item.priority === 'high'
                      ? 'text-amber-400' : item.priority === 'medium'
                      ? 'text-blue-400' : 'text-gray-400'
                  )}>
                    <AnimatedCounter value={item.count} />
                  </div>
                  <p className={cn(
                    'text-[10px] mt-0.5 capitalize',
                    item.priority === 'critical' ? 'text-red-400/70' :
                    item.priority === 'high' ? 'text-amber-400/70' :
                    item.priority === 'medium' ? 'text-blue-400/70' : 'text-gray-500'
                  )}>{item.priority}</p>
                  <div className="h-1 rounded-full bg-gray-800 mt-1.5 overflow-hidden">
                    <div className={cn(
                      'h-full rounded-full', item.priority === 'critical'
                        ? 'bg-red-500' : item.priority === 'high'
                        ? 'bg-amber-500' : item.priority === 'medium'
                        ? 'bg-blue-500' : 'bg-gray-600'
                    )} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deal Stages */}
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-luxury-gold-400" />
            <h3 className="text-sm font-semibold text-white">Deal Pipeline</h3>
          </div>
          <div className="space-y-2">
            {stageData.map(item => {
              const pct = metrics.activeDealsCount > 0
                ? Math.round((item.count / metrics.activeDealsCount) * 100) : 0;
              return (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">
                    {DEAL_STAGE_LABELS[item.stage as keyof typeof DEAL_STAGE_LABELS] || item.stage}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500',
                        DEAL_STAGE_COLORS[item.stage as keyof typeof DEAL_STAGE_COLORS]?.split(' ')[0] || 'bg-gray-600'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Top Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Top AI Opportunities</h3>
            </div>
            <button onClick={() => navigate('/opportunities')}
              className="flex items-center gap-1 text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {topOpps.map((opp, i) => {
            const dev = developers.find(d => d.id === opp.developer_id);
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/opportunity/${opp.id}`)}
                className="premium-card p-4 cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <ConfidenceIndicator score={opp.confidence_score} size="sm" showLabel={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-white group-hover:text-luxury-gold-300 transition-colors truncate">
                        {dev?.name || opp.title}
                      </h3>
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border',
                        PRIORITY_COLORS[opp.priority]
                      )}>
                        {opp.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{opp.title}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-luxury-gold-400 font-medium">{formatIndianCurrency(opp.estimated_value)}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-emerald-400 font-medium">{formatCommission(opp.estimated_commission)}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-gray-400">{dev?.city || 'N/A'}</span>
                    </div>
                    {opp.reasoning.length > 0 && (
                      <p className="text-[10px] text-gray-600 mt-1.5 line-clamp-1">{opp.reasoning[0]}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-2" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Opportunity Highlight */}
          {metrics.highestValueOpportunity && (
            <div className="premium-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Highest Value Deal</h3>
              </div>
              <div className="text-center mb-4">
                <ConfidenceIndicator
                  score={metrics.highestValueOpportunity.confidence_score}
                  size="lg"
                />
              </div>
              <div className="text-center space-y-1 mb-4">
                <p className="text-base font-bold text-white">
                  {developers.find(d => d.id === metrics.highestValueOpportunity!.developer_id)?.name || 'Developer'}
                </p>
                <p className="text-xs text-gray-500">{metrics.highestValueOpportunity.title}</p>
                <div className="flex items-center justify-center gap-4 text-xs mt-2">
                  <span className="text-luxury-gold-400 font-semibold">
                    {formatIndianCurrency(metrics.highestValueOpportunity.estimated_value)}
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCommission(metrics.highestValueOpportunity.estimated_commission)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/opportunity/${metrics.highestValueOpportunity!.id}`)}
                className="btn-primary w-full"
              >
                View Deal Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Recent Signals */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Recent Signals</h3>
            </div>
            <div className="space-y-2">
              {recentSignals.map((signal, i) => (
                <div key={signal.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    signal.impact_level === 'critical' ? 'bg-red-400' :
                    signal.impact_level === 'high' ? 'bg-amber-400' : 'bg-blue-400'
                  )} />
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">{signal.title}</p>
                    <p className="text-[10px] text-gray-500">{signal.source}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/signals')}
                className="flex items-center gap-1 text-xs text-luxury-gold-400 hover:text-luxury-gold-300 mt-2 transition-colors">
                View All Signals <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Market Overview */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Market Overview</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Active Developers</span>
                <span className="text-white font-medium">{developers.filter(d => d.is_tracked).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Projects</span>
                <span className="text-white font-medium">{metrics.recentlyUpdatedProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Signals</span>
                <span className="text-white font-medium">{signals.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Opportunities</span>
                <span className="text-white font-medium">{opportunities.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Conversion Rate</span>
                <span className="text-emerald-400 font-medium">
                  {opportunities.length > 0
                    ? Math.round((opportunities.filter(o => o.deal_stage === 'closed_won').length / opportunities.length) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">AI Actions</h3>
            <div className="space-y-2">
              {[
                { icon: Bot, label: 'AI Deal Coach', desc: 'Get deal guidance', path: '/coach', color: 'text-luxury-gold-400' },
                { icon: Globe, label: 'Buying Signals Feed', desc: 'Real-time market intelligence', path: '/signals', color: 'text-emerald-400' },
                { icon: Building2, label: 'Developer Intelligence', desc: 'Track builder profiles', path: '/competitors', color: 'text-blue-400' },
                { icon: TrendingUp, label: 'Revenue Forecasts', desc: 'Commission projections', path: '/forecasts', color: 'text-amber-400' },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <action.icon className={cn('w-4 h-4', action.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Insight Banner */}
      <motion.div variants={itemVariants}
        className="glass-card p-4 border border-luxury-gold-500/10 bg-gradient-to-r from-luxury-gold-500/5 to-transparent">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-1">AI Insight</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-luxury-gold-400">{metrics.highConfidenceDeals} high-confidence opportunities</strong> detected across {developers.filter(d => d.is_tracked).length} tracked developers.
              Total pipeline value: <strong className="text-luxury-gold-400">{formatIndianCurrency(metrics.totalPipelineValue)}</strong>.
              Expected commission at 3%: <strong className="text-emerald-400">{formatCommission(metrics.expectedCommission)}</strong>.                {metrics.highestValueOpportunity && (
                <> Top deal: <strong className="text-white">{developers.find(d => d.id === metrics.highestValueOpportunity!.developer_id)?.name}</strong> — {formatIndianCurrency(metrics.highestValueOpportunity!.estimated_value)}.</>
              )}
              <button onClick={() => navigate('/opportunities')}
                className="text-luxury-gold-400 hover:text-luxury-gold-300 ml-1 underline">
                View all <ArrowRight className="w-3 h-3 inline" />
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
