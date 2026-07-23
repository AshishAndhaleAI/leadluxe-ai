import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Globe, Activity,
  Sparkles, Target, MapPin,
  ChevronRight, Brain, Cpu,
  IndianRupee, Percent
} from 'lucide-react';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES, getHotCities, formatGlobalCurrency } from '../lib/global-data';
import { MarketPulse } from '../components/dashboard/MarketPulse';
import { AIBrainHeartbeat } from '../components/ai/AIBrainHeartbeat';
import { ConfidenceIndicator } from '../components/ai/ConfidenceIndicator';
import { KPICard } from '../components/ui/KPICard';
import { PRIORITY_COLORS } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { dashboardMetrics, opportunities, signals, loading, developers, systemStatus } = useOpportunityEngine();
  const [showAiStatus, setShowAiStatus] = useState(false);

  const hotCities = useMemo(() => getHotCities().slice(0, 4), []);
  const activeOpps = useMemo(() => opportunities.filter(o => o.is_active), [opportunities]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Live Market Pulse Ticker */}
      <motion.div variants={itemVariants}>
        <MarketPulse />
      </motion.div>

      {/* Header Row */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Deal Intelligence</h2>
            <p className="text-sm text-gray-500">
              {loading ? 'Initializing...' : `${activeOpps.length} active opportunities · ${signals.length} signals today`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AIBrainHeartbeat expanded={showAiStatus} onToggle={() => setShowAiStatus(!showAiStatus)} />
          <button onClick={() => navigate('/opportunities')} className="btn-primary text-xs px-3 py-2">
            <Zap className="w-3 h-3" />
            View Opportunities
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="premium-card p-5"><div className="skeleton h-24 w-full" /></div>
          ))}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Active Opportunities"
            value={dashboardMetrics.todayOpportunities}
            icon={<Zap className="w-5 h-5" />}
            subtitle={`${dashboardMetrics.highConfidenceDeals} high confidence`}
            trend={{ value: 12, isPositive: true }}
          />
          <KPICard
            title="Pipeline Value"
            value={formatIndianCurrency(dashboardMetrics.totalPipelineValue)}
            icon={<IndianRupee className="w-5 h-5" />}
            subtitle={`${dashboardMetrics.activeDealsCount} deals in pipeline`}
          />
          <KPICard
            title="Expected Commission"
            value={formatCommission(dashboardMetrics.expectedCommission)}
            icon={<Percent className="w-5 h-5" />}
            subtitle="3% on all active deals"
            trend={{ value: dashboardMetrics.avgConfidence, isPositive: true }}
          />
          <KPICard
            title="AI Confidence"
            value={`${dashboardMetrics.avgConfidence}%`}
            icon={<Brain className="w-5 h-5" />}
            subtitle={`${dashboardMetrics.criticalSignals} critical signals`}
            trend={{ value: dashboardMetrics.avgConfidence > 70 ? 8 : -3, isPositive: dashboardMetrics.avgConfidence > 70 }}
          />
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunities Pipeline */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          {/* Top Opportunities */}
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-sm font-semibold text-white">Priority Opportunities</h3>
              </div>
              <button onClick={() => navigate('/opportunities')} className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-16 w-full" />
                ))}
              </div>
            ) : dashboardMetrics.topOpportunities.length === 0 ? (
              <div className="py-8 text-center">
                <Sparkles className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Intelligence gathering in progress</p>
                <p className="text-xs text-gray-600 mt-1">Opportunities appear as signals are collected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardMetrics.topOpportunities.slice(0, 5).map((opp, i) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/opportunity/${opp.id}`)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <ConfidenceIndicator score={opp.confidence_score} size="sm" showLabel={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate group-hover:text-luxury-gold-300 transition-colors">
                          {opp.title?.split('—')[0]?.trim() || 'Opportunity'}
                        </p>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', PRIORITY_COLORS[opp.priority])}>
                          {opp.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span className="text-luxury-gold-400 font-medium">{formatIndianCurrency(opp.estimated_value)}</span>
                        <span>·</span>
                        <span className="text-emerald-400">{formatCommission(opp.estimated_commission)}</span>
                        <span>·</span>
                        <span>{opp.confidence_score}% confidence</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Signals */}
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-sm font-semibold text-white">Live Intelligence Feed</h3>
              </div>
              <button onClick={() => navigate('/signals')} className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors flex items-center gap-1">
                All signals <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-12 w-full" />
                ))}
              </div>
            ) : signals.length === 0 ? (
              <div className="py-8 text-center">
                <Activity className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Monitoring public sources</p>
                <p className="text-xs text-gray-600 mt-1">Start RSS proxy with: npm run server</p>
              </div>
            ) : (
              <div className="space-y-2">
                {signals.slice(0, 6).map((signal, i) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      signal.impact_level === 'critical' || signal.impact_level === 'high' ? 'bg-emerald-400' :
                      signal.impact_level === 'medium' ? 'bg-amber-400' : 'bg-gray-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 truncate">{signal.title}</p>
                      <div className="flex items-center gap-2 text-[9px] text-gray-600 mt-0.5">
                        <span className="text-luxury-gold-400/70">{signal.source || 'Unknown'}</span>
                        <span>·</span>
                        <span>{signal.relevance_score}% relevance</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Hot Markets */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">🔥 Hot Markets</h3>
            </div>
            <div className="space-y-2">
              {hotCities.map((city, i) => {
                const country = COUNTRIES.find(c => c.code === city.countryCode);
                return (
                  <motion.div
                    key={city.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate('/global-map')}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country?.flag || '🌍'}</span>
                      <div>
                        <p className="text-xs font-medium text-white group-hover:text-luxury-gold-300 transition-colors">{city.name}</p>
                        <p className="text-[9px] text-gray-500">{country?.name} · {city.activeProjects} projects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">+{city.priceTrend}%</p>
                      <p className="text-[9px] text-gray-600">{city.confidence}% conf</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <button
              onClick={() => navigate('/global-map')}
              className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-luxury-gold-400 hover:text-luxury-gold-300 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Explore Global Market <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Pipeline Stage Summary */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Pipeline Stages</h3>
            </div>
            {dashboardMetrics.opportunitiesByStage.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No deals in pipeline yet</p>
            ) : (
              <div className="space-y-2">
                {dashboardMetrics.opportunitiesByStage.map((stage, i) => (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 capitalize">{stage.stage.replace('_', ' ')}</span>
                      <span className="text-white font-medium">{stage.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.count / Math.max(...dashboardMetrics.opportunitiesByStage.map(s => s.count), 1)) * 100}%` }}
                        className={cn(
                          'h-full rounded-full',
                          stage.stage === 'closed_won' ? 'bg-emerald-500' :
                          stage.stage === 'negotiation' ? 'bg-amber-500' :
                          stage.stage === 'qualifying' ? 'bg-blue-500' : 'bg-gray-600'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-4 border border-luxury-gold-500/10">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-xs font-semibold text-white">AI Recommendations</h3>
            </div>
            <div className="space-y-2">
              {activeOpps.length > 0 && (
                <button
                  onClick={() => navigate(`/opportunity/${activeOpps.sort((a, b) => b.confidence_score - a.confidence_score)[0]?.id}`)}
                  className="w-full text-left p-2 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 hover:bg-luxury-gold-500/20 transition-colors"
                >
                  <p className="text-[10px] text-luxury-gold-400 font-medium">Top Priority</p>
                  <p className="text-xs text-white truncate mt-0.5">
                    {activeOpps.sort((a, b) => b.confidence_score - a.confidence_score)[0]?.title?.split('—')[0]?.trim() || 'Review top opportunity'}
                  </p>
                </button>
              )}
              <button
                onClick={() => navigate('/match')}
                className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <p className="text-[10px] text-emerald-400 font-medium">Find New Deals</p>
                <p className="text-xs text-gray-400 mt-0.5">Use AI Property Matchmaker</p>
              </button>
            </div>
          </div>

          {/* AI System Status */}
          {systemStatus && (
            <div className="glass-card p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-3 h-3 text-gray-500" />
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI System</p>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px] text-gray-600">
                <span>Cycles: {systemStatus.totalRuns || 0}</span>
                <span>Signals: {systemStatus.totalSignalsCollected || 0}</span>
                <span>Graph: {systemStatus.graphSummary?.nodeCount || 0} nodes</span>
                <span>Accuracy: {systemStatus.memoryStats?.overallAccuracy || 0}%</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
