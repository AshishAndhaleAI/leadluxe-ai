import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, Target, IndianRupee, Users, Building2,
  Trophy, Zap, Activity, ArrowRight, Percent, Globe, Bot,
  Bell, ChevronRight
} from 'lucide-react';
import { KPICard } from '../components/ui/KPICard';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { ConfidenceIndicator } from '../components/ai/ConfidenceIndicator';
import { DealOpportunityCard } from '../components/ai/DealOpportunityCard';
import { RevenueForecastChart } from '../components/ai/RevenueForecastChart';
import { DEMO_OPPORTUNITIES, DEMO_FORECASTS } from '../components/ai/demoData';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const activeDeals = DEMO_OPPORTUNITIES.filter(o => o.dealStage !== 'closed_won' && o.dealStage !== 'closed_lost');
    const closedWon = DEMO_OPPORTUNITIES.filter(o => o.dealStage === 'closed_won');
    const totalPipeline = activeDeals.reduce((s, d) => s + d.estimatedValue, 0);
    const totalCommission = activeDeals.reduce((s, d) => s + d.expectedCommission, 0);
    const closedCommission = closedWon.reduce((s, d) => s + d.expectedCommission, 0);
    const highConfidence = activeDeals.filter(d => d.confidenceScore >= 85).length;
    const signalsToday = DEMO_OPPORTUNITIES.flatMap(o => o.signals).filter(s => {
      const d = new Date(s.date);
      return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      totalPipeline,
      totalCommission,
      closedCommission,
      highConfidence,
      activeDeals: activeDeals.length,
      closedDeals: closedWon.length,
      avgConfidence: Math.round(activeDeals.reduce((s, d) => s + d.confidenceScore, 0) / Math.max(activeDeals.length, 1)),
      signalsToday,
      topDeal: activeDeals.sort((a, b) => b.confidenceScore - a.confidenceScore)[0],
    };
  }, []);

  const topOpportunities = useMemo(() =>
    [...DEMO_OPPORTUNITIES]
      .filter(o => o.dealStage !== 'closed_won')
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 4),
  []);

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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              AI Monitoring
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {metrics.activeDeals} active opportunities · {metrics.signalsToday} new signals this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/opportunities')}
            className="btn-primary"
          >
            <Zap className="w-4 h-4" />
            View All Opportunities
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard
          title="Pipeline Value"
          value={formatIndianCurrency(metrics.totalPipeline)}
          icon={<IndianRupee className="w-5 h-5" />}
          subtitle="Active deal pipeline"
          trend={{ value: 18, isPositive: true }}
        />
        <KPICard
          title="Expected Commission"
          value={formatCommission(metrics.totalCommission)}
          icon={<Percent className="w-5 h-5" />}
          subtitle="3% on active pipeline"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="High Confidence"
          value={<AnimatedCounter value={metrics.highConfidence} />}
          icon={<Sparkles className="w-5 h-5" />}
          subtitle="Deals with 85%+ score"
          trend={{ value: 25, isPositive: true }}
        />
        <KPICard
          title="Closed Commission"
          value={formatCommission(metrics.closedCommission)}
          icon={<Trophy className="w-5 h-5" />}
          subtitle="Commission realized"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Avg Confidence"
          value={<AnimatedCounter value={metrics.avgConfidence} suffix="%" />}
          icon={<Target className="w-5 h-5" />}
          subtitle="Across all deals"
        />
        <KPICard
          title="Closed Deals"
          value={<AnimatedCounter value={metrics.closedDeals} />}
          icon={<Trophy className="w-5 h-5" />}
          subtitle="Total closed"
          trend={{ value: 100, isPositive: true }}
        />
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Top Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">AI-Powered Deal Opportunities</h3>
            </div>
            <button
              onClick={() => navigate('/opportunities')}
              className="flex items-center gap-1 text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {topOpportunities.map((opp, i) => (
            <DealOpportunityCard
              key={opp.id}
              opportunity={opp}
              index={i}
              onClick={() => navigate(`/opportunity/${opp.id}`)}
            />
          ))}

          {/* AI Insight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 border border-luxury-gold-500/10 bg-gradient-to-r from-luxury-gold-500/5 to-transparent"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">AI Insight</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-luxury-gold-400">Balewadi Heights</strong> has the highest confidence score (96%) in your pipeline.
                  The buyer recently sold a technology venture for ₹50 Cr — cash deal with no financing contingency.
                  <button onClick={() => navigate('/opportunity/opp-003')} className="text-luxury-gold-400 hover:text-luxury-gold-300 ml-1 underline">
                    View details <ArrowRight className="w-3 h-3 inline" />
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right — Forecasts & Activity */}
        <div className="space-y-6">
          {/* Revenue Forecast */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Revenue Forecast</h3>
            </div>
            <RevenueForecastChart forecasts={DEMO_FORECASTS.slice(0, 4)} />
          </div>

          {/* Top Deal Highlight */}
          {metrics.topDeal && (
            <div className="premium-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Top Opportunity</h3>
              </div>
              <div className="text-center mb-4">
                <ConfidenceIndicator score={metrics.topDeal.confidenceScore} size="lg" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-base font-bold text-white">{metrics.topDeal.builderName}</p>
                <p className="text-sm text-gray-500">{metrics.topDeal.projectName}</p>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <span className="text-luxury-gold-400 font-semibold">{formatIndianCurrency(metrics.topDeal.estimatedValue)}</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-emerald-400 font-semibold">{formatCommission(metrics.topDeal.expectedCommission)} commission</span>
                </div>
                <button
                  onClick={() => navigate(`/opportunity/${metrics.topDeal.id}`)}
                  className="btn-primary w-full mt-3"
                >
                  View Deal Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">AI Actions</h3>
            <div className="space-y-2">
              {[
                { icon: Bot, label: 'AI Deal Coach', desc: 'Get deal guidance', path: '/coach', color: 'text-luxury-gold-400' },
                { icon: Globe, label: 'Buying Signals Feed', desc: 'Real-time market signals', path: '/signals', color: 'text-emerald-400' },
                { icon: Building2, label: 'Competitor Intel', desc: 'Track builder activity', path: '/competitors', color: 'text-blue-400' },
                { icon: TrendingUp, label: 'Revenue Forecasts', desc: 'Commission projections', path: '/forecasts', color: 'text-amber-400' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors group"
                >
                  <div className={cn('w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors')}>
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
    </motion.div>
  );
}
