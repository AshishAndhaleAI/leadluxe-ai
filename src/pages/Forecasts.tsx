import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, IndianRupee, Target, Calendar, ArrowRight,
  ChevronRight, Trophy, Sparkles, Percent
} from 'lucide-react';
import { RevenueForecastChart } from '../components/ai/RevenueForecastChart';
import { DEMO_FORECASTS, DEMO_OPPORTUNITIES } from '../components/ai/demoData';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { KPICard } from '../components/ui/KPICard';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export function Forecasts() {
  const navigate = useNavigate();

  const { totalExpected, totalProbable, totalOptimistic, yearlyProjection } = useMemo(() => {
    const te = DEMO_FORECASTS.reduce((s, f) => s + f.expectedCommission, 0);
    const tp = DEMO_FORECASTS.reduce((s, f) => s + f.probableCommission, 0);
    const to = DEMO_FORECASTS.reduce((s, f) => s + f.optimisticCommission, 0);
    const yp = tp * 2; // rough annual from 6-month projection
    return { totalExpected: te, totalProbable: tp, totalOptimistic: to, yearlyProjection: yp };
  }, []);

  const pipelineDeals = useMemo(() =>
    DEMO_OPPORTUNITIES.filter(o => o.dealStage !== 'closed_won' && o.dealStage !== 'closed_lost'),
  []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Revenue Forecasts</h2>
          <p className="text-sm text-gray-500">Commission projections based on AI confidence scoring</p>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Expected Commission"
          value={formatCommission(totalExpected)}
          icon={<Target className="w-5 h-5" />}
          subtitle="6-month projection"
        />
        <KPICard
          title="Probable Commission"
          value={formatCommission(totalProbable)}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Weighted by confidence"
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Optimistic Target"
          value={formatCommission(totalOptimistic)}
          icon={<Sparkles className="w-5 h-5" />}
          subtitle="Best-case scenario"
          trend={{ value: 15, isPositive: true }}
        />
        <KPICard
          title="Annual Run Rate"
          value={formatCommission(yearlyProjection)}
          icon={<IndianRupee className="w-5 h-5" />}
          subtitle="Projected yearly commission"
        />
      </motion.div>

      {/* Charts & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Forecast Chart */}
        <div className="lg:col-span-2">
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-sm font-semibold text-white">Monthly Commission Forecast</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/60" /> Expected</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/60" /> Probable</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/60" /> Optimistic</span>
              </div>
            </div>
            <RevenueForecastChart forecasts={DEMO_FORECASTS} />
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="space-y-4">
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Pipeline Deals</h3>
            </div>
            <div className="space-y-2">
              {pipelineDeals.sort((a, b) => b.confidenceScore - a.confidenceScore).map((deal, i) => (
                <div
                  key={deal.id}
                  onClick={() => navigate(`/opportunity/${deal.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate group-hover:text-luxury-gold-300 transition-colors">
                      {deal.builderName}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{deal.projectName}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-xs font-semibold text-emerald-400">{formatCommission(deal.expectedCommission)}</p>
                    <p className="text-[10px] text-gray-600">{deal.confidenceScore}% confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Revenue Breakdown</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Expected', value: totalExpected, pct: 100, color: 'bg-blue-500' },
                { label: 'Probable', value: totalProbable, pct: (totalProbable / totalExpected) * 100, color: 'bg-amber-500' },
                { label: 'Optimistic', value: totalOptimistic, pct: (totalOptimistic / totalExpected) * 100, color: 'bg-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium">{formatCommission(item.value)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', item.color)}
                      style={{ width: `${Math.min(item.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="glass-card p-4 border border-luxury-gold-500/10">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-luxury-gold-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white mb-1">AI Recommendation</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Focus on closing <strong className="text-luxury-gold-400">Balewadi Heights</strong> (96% confidence, ₹6.3 L commission) 
                  and <strong className="text-luxury-gold-400">VTP Baner</strong> (94% confidence, ₹3.75 L commission) this month 
                  to achieve 85% of your Q3 target.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
