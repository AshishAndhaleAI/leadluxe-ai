import { useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Zap, Sparkles, ChevronRight,
  Activity, ArrowRight, Play, Eye, Globe
} from 'lucide-react';
import { BuildingExperience } from '../components/experience/BuildingScene';
import { ScrollProgressBar } from '../components/experience/FloorSection';
import {
  useScrollController, useHologramData, CHAPTERS, getHologramDataForChapter
} from '../experience/ExperienceScene';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES } from '../lib/global-data';

export function Experience() {
  const navigate = useNavigate();
  const { progress, currentChapter, containerRef } = useScrollController();
  const hologramData = useHologramData();
  const { dashboardMetrics, opportunities, signals, systemStatus } = useOpportunityEngine();

  const currentChapterData = CHAPTERS[currentChapter];
  const hologramPanel = getHologramDataForChapter(currentChapter, hologramData);

  const hotCities = useMemo(() => {
    const allCities: any[] = [];
    Object.values(CITIES).forEach((arr: any) => {
      if (Array.isArray(arr)) arr.forEach((c: any) => allCities.push(c));
    });
    return allCities
      .filter((c: any) => c.investorInterest >= 75 || c.confidence >= 85)
      .sort((a: any, b: any) => b.confidence - a.confidence)
      .slice(0, 3);
  }, []);

  const activeOpps = opportunities.filter(o => o.is_active);

  return (
    <div className="relative min-h-[500vh] bg-luxury-black">
      {/* 3D Background — fixed, fills viewport */}
      <div className="fixed inset-0 z-0">
        <BuildingExperience progress={progress} />
      </div>

      {/* Overlay gradient for readability */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-luxury-black/40 via-transparent to-luxury-black/60" />

      {/* Top HUD */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white">LeadLuxe</p>
            <p className="text-[9px] text-luxury-gold-400 font-medium">AI Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-medium">AI Active</span>
          </div>
        </div>
      </div>

      {/* Chapter Label */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <motion.div
          key={currentChapter}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-1 rounded-full bg-luxury-black/60 border border-luxury-gold-500/20 text-[10px] text-luxury-gold-400 font-medium"
        >
          {currentChapterData?.icon} {currentChapterData?.label}
        </motion.div>
      </div>

      {/* Right scroll progress bar */}
      <ScrollProgressBar progress={progress} />

      {/* ===== Cinematic Content Sections (scrollable overlays) ===== */}
      <div ref={containerRef} className="relative min-h-[500vh]">
        {/* Section 1: Welcome / Pipeline Stats — Chapter 0: Global Flyover */}
        <section className="relative z-10 min-h-screen flex items-center pt-20 pb-32">
          <div className="max-w-5xl mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold-500/30 bg-luxury-black/60 backdrop-blur-sm mb-6">
                <Activity className="w-3 h-3 text-luxury-gold-400" />
                <span className="text-[10px] font-medium text-luxury-gold-400">
                  Commission Model · 3% on closed deals only
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 font-display">
                Real Estate Intelligence
              </h1>
              <p className="text-lg text-gray-400 mb-8">
                AI has discovered{' '}
                <strong className="text-luxury-gold-400">{activeOpps.length} opportunities</strong>{' '}
                across global markets today.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Pipeline Value', value: formatIndianCurrency(dashboardMetrics.totalPipelineValue), icon: Building2 },
                  { label: 'Commission', value: formatCommission(dashboardMetrics.expectedCommission), icon: Zap },
                  { label: 'Active Deals', value: dashboardMetrics.activeDealsCount, icon: Sparkles },
                  { label: 'Avg Confidence', value: `${dashboardMetrics.avgConfidence}%`, icon: Activity },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-3 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
                    <stat.icon className="w-4 h-4 text-luxury-gold-400 mb-1" />
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[9px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Chapter 0 Hologram Overlay */}
              <div className="mt-8 p-4 glass-card border border-luxury-gold-500/20">
                <p className="text-xs font-semibold text-luxury-gold-400 mb-3">🌍 {hologramPanel.title}</p>
                <div className="grid grid-cols-3 gap-3">
                  {hologramPanel.metrics.map((m, i) => (
                    <div key={i} className="text-center">
                      <p className="text-lg font-bold text-white">{m.value}</p>
                      <p className="text-[9px] text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Priority Opportunities — Chapter 1-2: City Approach */}
        <section className="relative z-10 min-h-screen flex items-center pb-32">
          <div className="max-w-5xl mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-luxury-gold-400" />
                  <h2 className="text-xl font-bold text-white font-display">Priority Opportunities</h2>
                </div>
                <button onClick={() => navigate('/opportunities')} className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {activeOpps.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 4).map((opp, i) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => navigate(`/opportunity/${opp.id}`)}
                    className="glass-card p-4 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10 cursor-pointer group hover:border-luxury-gold-500/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Confidence ring */}
                      <div className="relative w-9 h-9 shrink-0 mt-0.5">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1f2937" strokeWidth="2" />
                          <circle cx="18" cy="18" r="15.5" fill="none" 
                            stroke={opp.confidence_score >= 85 ? '#22c55e' : '#f59e0b'}
                            strokeWidth="2" strokeDasharray={`${opp.confidence_score}, 100`} 
                            strokeLinecap="round" transform="rotate(-90 18 18)" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
                          {opp.confidence_score}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-luxury-gold-300 transition-colors truncate">
                          {opp.title?.split('—')[0]?.trim() || 'Opportunity'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span className="text-luxury-gold-400">{formatIndianCurrency(opp.estimated_value)}</span>
                          <span>·</span>
                          <span className="text-emerald-400">{formatCommission(opp.estimated_commission)}</span>
                          <span>·</span>
                          <span>{opp.confidence_score}% confidence</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chapter 1-2 Hologram */}
              <div className="mt-8 p-4 glass-card border border-luxury-gold-500/20">
                <p className="text-xs font-semibold text-luxury-gold-400 mb-3">🏙️ {currentChapter >= 1 ? getHologramDataForChapter(Math.min(currentChapter, 2), hologramData).title : 'City Intelligence'}</p>
                <div className="grid grid-cols-3 gap-3">
                  {getHologramDataForChapter(Math.min(currentChapter, 2), hologramData).metrics.map((m, i) => (
                    <div key={i} className="text-center">
                      <p className="text-lg font-bold text-white">{m.value}</p>
                      <p className="text-[9px] text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      {/* Section 3: Global Market Snapshot */}
      <section className="relative z-10 min-h-screen flex items-center pb-32">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-luxury-gold-400" />
                <h2 className="text-xl font-bold text-white font-display">Global Markets</h2>
              </div>
              <button onClick={() => navigate('/global-map')} className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 flex items-center gap-1">
                Explore Map <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {hotCities.map((city: any, i) => {
                const country = COUNTRIES.find(c => c.code === city.countryCode);
                return (
                  <div key={city.id} className="glass-card p-4 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{country?.flag || '🌍'}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{city.name}</p>
                        <p className="text-[9px] text-gray-500">{country?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-medium">+{city.priceTrend}%</span>
                      <span className="text-gray-500">{city.confidence}% confidence</span>
                    </div>
                    <div className="mt-1 text-[9px] text-gray-600">{city.activeProjects} active projects</div>
                  </div>
                );
              })}
            </div>

            {/* Signals Feed */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-3 h-3 text-luxury-gold-400" />
                <h3 className="text-xs font-semibold text-white">Live Intelligence Feed</h3>
              </div>
              <div className="space-y-1.5">
                {signals.slice(0, 4).map((signal, i) => (
                  <div key={signal.id} className="flex items-center gap-2 p-2 rounded-lg bg-luxury-black/30 backdrop-blur-sm border border-gray-800/50">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      signal.impact_level === 'critical' || signal.impact_level === 'high' ? 'bg-emerald-400' : 'bg-amber-400'
                    )} />
                    <p className="text-[10px] text-gray-300 flex-1 truncate">{signal.title}</p>
                    <span className="text-[8px] text-gray-600">{signal.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4: CTA + Commission */}
      <section className="relative z-10 min-h-screen flex items-center pb-20">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="glass-card p-8 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/20 max-w-2xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl bg-luxury-gold-500/20 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-luxury-gold-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display">
                We Win When You Win
              </h2>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                No monthly subscription. Only 3% commission on property deals closed through our platform.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {[
                  { deal: '₹50 L', commission: '₹1.5 L' },
                  { deal: '₹1.2 Cr', commission: '₹3.6 L' },
                  { deal: '₹2.5 Cr', commission: '₹7.5 L' },
                  { deal: '₹5 Cr', commission: '₹15 L' },
                ].map((ex, i) => (
                  <div key={i} className="glass-card p-2 text-center border border-luxury-gold-500/10">
                    <p className="text-[10px] text-gray-500">Deal: {ex.deal}</p>
                    <p className="text-xs font-bold text-luxury-gold-400">{ex.commission}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => navigate('/match')} className="btn-primary">
                  <Sparkles className="w-4 h-4" />
                  AI Property Matchmaker
                </button>
                <button onClick={() => navigate('/global-map')} className="btn-outline">
                  <Globe className="w-4 h-4" />
                  Global Market Map
                </button>
              </div>
            </div>

            <div className="text-center mt-8 text-[10px] text-gray-600">
              <p>AI System: {systemStatus?.totalRuns || 0} cycles · {systemStatus?.totalSignalsCollected || 0} signals collected · {systemStatus?.graphSummary?.nodeCount || 0} entities in knowledge graph</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </div>
  );
}
