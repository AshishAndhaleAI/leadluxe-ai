import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, Percent, TrendingUp, CheckCircle,
  Clock, ArrowUpRight, Download, Building2, Calendar,
  Zap, Target, Activity, Calculator
} from 'lucide-react';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';
import type { Opportunity } from '../types';

const COMMISSION_RATE = 0.03;

export function CommissionDashboard() {
  const { opportunities, dashboardMetrics, loading } = useOpportunityEngine();
  const [viewFilter, setViewFilter] = useState<'all' | 'high' | 'closed'>('all');

  const commissionData = useMemo(() => {
    const active = opportunities.filter(o => o.is_active);
    const highConfidence = active.filter(o => o.confidence_score >= 80);
    const closed = active.filter(o => o.deal_stage === 'closed_won');

    const totalCommission = active.reduce((s, o) => s + o.estimated_commission, 0);
    const closedCommission = closed.reduce((s, o) => s + o.estimated_commission, 0);
    const pipelineCommission = totalCommission - closedCommission;

    return {
      totalCommission,
      closedCommission,
      pipelineCommission,
      totalActive: active.length,
      highConfidence: highConfidence.length,
      closed: closed.length,
      avgCommission: active.length > 0 ? totalCommission / active.length : 0,
    };
  }, [opportunities]);

  const displayedOpps = useMemo(() => {
    let filtered = [...opportunities].filter(o => o.is_active);
    if (viewFilter === 'high') filtered = filtered.filter(o => o.confidence_score >= 80);
    if (viewFilter === 'closed') filtered = filtered.filter(o => o.deal_stage === 'closed_won');
    return filtered.sort((a, b) => b.estimated_commission - a.estimated_commission);
  }, [opportunities, viewFilter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Percent className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Commission Dashboard</h2>
          <p className="text-sm text-gray-500">Track deal commissions and revenue — you only pay when you close</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Potential Commission',
            value: formatCommission(commissionData.totalCommission),
            icon: IndianRupee,
            trend: `${commissionData.totalActive} active deals`,
            color: 'text-luxury-gold-400',
          },
          {
            label: 'Pipeline Commission',
            value: formatCommission(commissionData.pipelineCommission),
            icon: Target,
            trend: `${commissionData.totalActive - commissionData.closed} deals in pipeline`,
            color: 'text-blue-400',
          },
          {
            label: 'Closed Commission',
            value: formatCommission(commissionData.closedCommission),
            icon: CheckCircle,
            trend: `${commissionData.closed} deals closed`,
            color: 'text-emerald-400',
          },
          {
            label: 'Avg Commission/Deal',
            value: formatCommission(Math.round(commissionData.avgCommission)),
            icon: Activity,
            trend: `3% of deal value`,
            color: 'text-amber-400',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-[9px] text-gray-600 mt-1">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Commission Calculator */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Commission Calculator</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { deal: 5000000, label: '₹50 L' },
            { deal: 8000000, label: '₹80 L' },
            { deal: 12000000, label: '₹1.2 Cr' },
            { deal: 25000000, label: '₹2.5 Cr' },
          ].map((ex, i) => (
            <div key={i} className="glass-card p-3 text-center border border-luxury-gold-500/10">
              <p className="text-[10px] text-gray-500 mb-1">Deal: {ex.label}</p>
              <p className="text-base font-bold text-luxury-gold-400">
                {formatCommission(ex.deal * COMMISSION_RATE)}
              </p>
              <p className="text-[9px] text-gray-600">at {COMMISSION_RATE * 100}% commission</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deals Table */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-luxury-gold-400" />
            <h3 className="text-sm font-semibold text-white">Deal Opportunities</h3>
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'high', 'closed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setViewFilter(f)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all',
                  viewFilter === f
                    ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border border-luxury-gold-500/20'
                    : 'text-gray-500 hover:text-white bg-transparent border border-transparent'
                )}
              >
                {f === 'all' ? 'All Deals' : f === 'high' ? 'High Confidence' : 'Closed'}
              </button>
            ))}
          </div>
        </div>

        {displayedOpps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500">No deals found</p>
            <p className="text-xs text-gray-600 mt-1">Opportunities will appear here when the AI detects them.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedOpps.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg bg-luxury-gray/30 border border-luxury-border hover:border-luxury-gold-500/20 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    opp.confidence_score >= 85 ? 'bg-emerald-400' :
                    opp.confidence_score >= 70 ? 'bg-amber-400' : 'bg-blue-400'
                  )} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {opp.title?.split('—')[0]?.trim() || 'Opportunity'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                      <span>{formatIndianCurrency(opp.estimated_value)}</span>
                      <span>·</span>
                      <span className="text-luxury-gold-400">{formatCommission(opp.estimated_commission)}</span>
                      <span>·</span>
                      <span>{opp.confidence_score}% confidence</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                    opp.confidence_score >= 85 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    opp.confidence_score >= 70 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  )}>
                    {formatCommission(opp.estimated_commission)}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Model Summary */}
      <div className="glass-card p-4 border border-luxury-gold-500/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4 text-luxury-gold-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white mb-1">Commission Model Summary</p>
            <p className="text-[11px] text-gray-500">
              TerraNexus charges a <strong className="text-luxury-gold-400">3% success fee</strong> only when a deal closes.
              No monthly subscription. No upfront payment. If a deal doesn't close, you pay nothing.
              All commission amounts above are estimates based on current opportunity values.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


