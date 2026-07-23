// ============================================================
// LeadLuxe AI — AI Twin Dashboard (/twin)
// 
// The user's personal command center. Shows:
//   - Top 5 matching opportunities
//   - Today's market changes
//   - Commission opportunities
//   - Risk alerts
//   - AI Watchlist
//   - Portfolio drift
//   - Recommended actions
// ============================================================

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain, TrendingUp, TrendingDown, Zap, AlertTriangle,
  Sparkles, Target, Eye, DollarSign, BarChart3, Activity,
  ChevronRight, Globe, Shield, Clock, Star, Bell,
  Plus, Settings, RefreshCw, ArrowRight
} from 'lucide-react';
import { useInvestorTwin } from '../hooks/useInvestorTwin';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { useAuth } from '../context/AuthContext';
import { formatIndianCurrency } from '../lib/format';
import { cn } from '../lib/utils';
import { OnboardingWizard } from '../components/twin/OnboardingWizard';

// ============================================================
// CONFIDENCE RING COMPONENT
// ============================================================
function ConfidenceRing({ score, size = 48 }: { score: number; size?: number }) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700"
      />
      <text
        x="50%" y="50%" textAnchor="middle" dy="0.35em"
        fill="white" fontSize={size * 0.22} fontWeight="bold"
      >
        {score}
      </text>
    </svg>
  );
}

// ============================================================
// MATCH CARD
// ============================================================
function MatchCard({
  match,
  index,
  onView,
  onSave,
}: {
  match: any;
  index: number;
  onView: () => void;
  onSave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-4 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10 cursor-pointer group hover:border-luxury-gold-500/30 transition-all"
      onClick={onView}
    >
      <div className="flex items-start gap-4">
        <ConfidenceRing score={match.riskAdjustedScore} size={48} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-luxury-gold-300 transition-colors truncate">
                {match.opportunityTitle}
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Score: {match.matchScore} → {match.riskAdjustedScore} (risk-adjusted)
              </p>
            </div>
            <span className={cn(
              'text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 mt-0.5',
              match.riskAdjustedScore >= 85 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              match.riskAdjustedScore >= 70 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-red-500/10 text-red-400 border border-red-500/20'
            )}>
              {match.riskAdjustedScore >= 85 ? 'Hot Match' : match.riskAdjustedScore >= 70 ? 'Warm' : 'Below Threshold'}
            </span>
          </div>

          {/* Matched on tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {match.matchedOn.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/10">
                {tag}
              </span>
            ))}
            {match.invalidatedBy.length > 0 && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/10">
                {match.invalidatedBy[0]}
              </span>
            )}
          </div>

          {/* Reasoning preview */}
          <p className="text-[10px] text-gray-500 mt-2 line-clamp-2">
            {match.reasoning}
          </p>

          {/* Bottom row */}
          <div className="flex items-center gap-3 mt-2 text-[9px]">
            {match.commissionEstimate > 0 && (
              <span className="text-luxury-gold-400 font-medium">
                Commission: {formatIndianCurrency(match.commissionEstimate)}
              </span>
            )}
            <span className={cn(
              'flex items-center gap-1',
              match.upside && !match.upside.includes('No significant') ? 'text-emerald-400' : 'text-gray-500'
            )}>
              <TrendingUp className="w-2.5 h-2.5" />
              {match.upside?.slice(0, 30) || 'Stable'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// ALERT CARD
// ============================================================
function AlertCard({
  alert,
  onDismiss,
}: {
  alert: any;
  onDismiss: () => void;
}) {
  const priorityColors = {
    1: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    2: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    3: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    4: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-3 rounded-lg border backdrop-blur-sm',
        priorityColors[alert.priority as keyof typeof priorityColors] || priorityColors[4]
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold">{alert.title}</span>
            <span className="text-[8px] opacity-50">P{alert.priority}</span>
          </div>
          <p className="text-[9px] mt-0.5 opacity-70">{alert.description?.slice(0, 100)}</p>
          {alert.matchScore && (
            <p className="text-[9px] mt-1 font-medium">Match: {alert.matchScore}/100</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="text-[8px] px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// STAT CARD
// ============================================================
function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  trend?: string;
  color?: string;
}) {
  return (
    <div className="glass-card p-4 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-gray-500">{label}</p>
          <p className={cn('text-xl font-bold text-white mt-1', color)}>{value}</p>
          {trend && (
            <p className="text-[9px] text-emerald-400 mt-1">+{trend} from last scan</p>
          )}
        </div>
        <div className="w-9 h-9 rounded-xl bg-luxury-gold-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-luxury-gold-400" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export function TwinDashboard() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const { profile, matches, alerts, scanning, lastScanAt, summary, createTwin, dismissAlert, logBehavior } = useInvestorTwin();
  const { opportunities } = useOpportunityEngine();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'alerts' | 'watchlist'>('matches');

  // Check if user needs to create their twin
  useEffect(() => {
    if (user && !user.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [user]);

  const marketChanges = useMemo(() => {
    const high = matches.filter((m) => m.riskAdjustedScore >= 85).length;
    const rising = matches.filter((m) => m.riskAdjustedScore >= 70 && m.riskAdjustedScore < 85).length;
    return { high, rising, total: matches.length };
  }, [matches]);

  const handleTwinCreated = async (twinProfile: any) => {
    const result = await createTwin(twinProfile);
    if (!result.error) {
      setShowOnboarding(false);
      if (user) {
        await completeOnboarding();
      }
    }
  };

  // If twin is being created, show wizard
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <OnboardingWizard
          onComplete={handleTwinCreated}
          onSkip={() => setShowOnboarding(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== Header ===== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luxury-gold-500/20 to-luxury-gold-500/5 border border-luxury-gold-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-display">AI Investor Twin</h1>
                <p className="text-[10px] text-gray-500">
                  {profile.country} · {profile.city} · {formatIndianCurrency(profile.budgetMin)}–{formatIndianCurrency(profile.budgetMax)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scanning && (
              <div className="flex items-center gap-1.5 text-[9px] text-luxury-gold-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Scanning...
              </div>
            )}
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-luxury-gold-400 hover:bg-luxury-gold-500/20 transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3 h-3" />
              Edit Twin
            </button>
          </div>
        </div>

        {/* ===== AI Status Bar ===== */}
        <div className="flex items-center gap-3 text-[9px] text-gray-600">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            Twin Active
          </span>
          <span>·</span>
          <span>Last scan: {lastScanAt ? new Date(lastScanAt).toLocaleString() : 'Never'}</span>
          <span>·</span>
          <span>{summary.totalMatched} opportunities analyzed</span>
          <span>·</span>
          <span>Avg match score: {summary.avgScore}/100</span>
        </div>

        {/* ===== KPI Cards ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Top Matches"
            value={String(marketChanges.high)}
            icon={Target}
            trend={String(marketChanges.rising)}
            color="text-luxury-gold-400"
          />
          <StatCard
            label="Total Matched"
            value={String(marketChanges.total)}
            icon={Sparkles}
            trend={String(opportunities.length)}
            color="text-emerald-400"
          />
          <StatCard
            label="Portfolio Value"
            value={formatIndianCurrency(summary.portfolioValue)}
            icon={DollarSign}
            color="text-white"
          />
          <StatCard
            label="Total Commission"
            value={formatIndianCurrency(summary.totalCommission)}
            icon={Zap}
            color="text-luxury-gold-400"
          />
          <StatCard
            label="Avg Match Score"
            value={`${summary.avgScore}/100`}
            icon={BarChart3}
            color={summary.avgScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}
          />
          <StatCard
            label="Unread Alerts"
            value={String(alerts.length)}
            icon={Bell}
            trend={String(alerts.filter(a => a.priority <= 2).length) + ' urgent'}
            color={alerts.some(a => a.priority === 1) ? 'text-emerald-400' : 'text-gray-400'}
          />
        </div>

        {/* ===== Main Content ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left + Center Column: Top Matches + Market Changes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-gray-800 pb-1">
              {(['matches', 'alerts', 'watchlist'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-1.5 text-[10px] font-medium rounded-t-lg transition-colors',
                    activeTab === tab
                      ? 'text-luxury-gold-400 border-b-2 border-luxury-gold-400'
                      : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  {tab === 'matches' ? 'Top Matches' : tab === 'alerts' ? 'Alerts' : 'Watchlist'}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => navigate('/opportunities')}
                className="text-[9px] text-luxury-gold-400 hover:text-luxury-gold-300 flex items-center gap-1"
              >
                Browse All <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'matches' && (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {summary.topMatches.length > 0 ? (
                    summary.topMatches.map((match, i) => (
                      <MatchCard
                        key={match.opportunityId}
                        match={match}
                        index={i}
                        onView={() => {
                          logBehavior('viewed_match', match.opportunityId);
                          navigate(`/opportunity/${match.opportunityId}`);
                        }}
                        onSave={() => logBehavior('saved_match', match.opportunityId)}
                      />
                    ))
                  ) : (
                    <div className="glass-card p-8 text-center backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
                      <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-1">No matching opportunities yet</p>
                      <p className="text-[10px] text-gray-600">Your twin is scanning global markets. Check back soon or browse all opportunities.</p>
                      <button
                        onClick={() => navigate('/opportunities')}
                        className="mt-4 text-[10px] px-3 py-1.5 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-luxury-gold-400"
                      >
                        Browse Opportunities
                      </button>
                    </div>
                  )}

                  {/* Market Changes mini-section */}
                  {marketChanges.high > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-luxury-gold-400" />
                        Markets That Changed Today
                      </h3>
                      <div className="space-y-1.5">
                        {matches.filter(m => m.riskAdjustedScore >= 85).slice(0, 3).map((m, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-luxury-black/30 border border-gray-800/50">
                            <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-[10px] text-gray-300 flex-1 truncate">{m.opportunityTitle}</span>
                            <span className="text-[9px] text-luxury-gold-400">{m.riskAdjustedScore}/100</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'alerts' && (
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {alerts.length > 0 ? (
                    alerts.slice(0, 10).map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={() => dismissAlert(alert.id)}
                      />
                    ))
                  ) : (
                    <div className="glass-card p-8 text-center backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
                      <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No alerts</p>
                      <p className="text-[10px] text-gray-600">You'll be notified when the twin finds high-value matches</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'watchlist' && (
                <motion.div
                  key="watchlist"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="glass-card p-8 text-center backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
                    <Eye className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Watchlist tracking coming soon</p>
                    <p className="text-[10px] text-gray-600">Save opportunities to build your personal watchlist</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Alerts + Recommended Actions */}
          <div className="space-y-4">
            {/* Twin Profile Card */}
            <div className="glass-card p-4 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
              <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="w-3 h-3 text-luxury-gold-400" />
                Twin Profile
              </h3>
              <div className="space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Country</span>
                  <span className="text-white">{profile.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">City</span>
                  <span className="text-white">{profile.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Budget</span>
                  <span className="text-white">{formatIndianCurrency(profile.budgetMin)} – {formatIndianCurrency(profile.budgetMax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Goal</span>
                  <span className="text-white capitalize">{profile.investmentGoal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Risk</span>
                  <span className="text-white capitalize">{profile.riskTolerance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Holding</span>
                  <span className="text-white">{profile.holdingPeriodYears} years</span>
                </div>
              </div>
            </div>

            {/* Top P1/P2 Alerts */}
            {alerts.filter(a => a.priority <= 2).length > 0 && (
              <div className="glass-card p-4 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
                <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <Bell className="w-3 h-3 text-luxury-gold-400" />
                  Priority Alerts
                </h3>
                <div className="space-y-2">
                  {alerts.filter(a => a.priority <= 2).slice(0, 3).map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            <div className="glass-card p-4 backdrop-blur-md bg-luxury-black/40 border border-luxury-gold-500/10">
              <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                <Star className="w-3 h-3 text-luxury-gold-400" />
                Recommended Actions
              </h3>
              <div className="space-y-2">
                {matches.length > 0 && (
                  <button
                    onClick={() => navigate(`/opportunity/${matches[0]?.opportunityId}`)}
                    className="w-full text-left p-2 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10 hover:bg-luxury-gold-500/10 transition-colors"
                  >
                    <p className="text-[10px] font-medium text-luxury-gold-400">Review Top Match</p>
                    <p className="text-[8px] text-gray-500 mt-0.5">View your highest-ranked opportunity</p>
                  </button>
                )}
                <button
                  onClick={() => navigate('/global-map')}
                  className="w-full text-left p-2 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10 hover:bg-luxury-gold-500/10 transition-colors"
                >
                  <p className="text-[10px] font-medium text-luxury-gold-400">Explore Global Map</p>
                  <p className="text-[8px] text-gray-500 mt-0.5">Discover new markets matching your profile</p>
                </button>
                <button
                  onClick={() => navigate('/gravity')}
                  className="w-full text-left p-2 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10 hover:bg-luxury-gold-500/10 transition-colors"
                >
                  <p className="text-[10px] font-medium text-luxury-gold-400">Run Gravity Scan</p>
                  <p className="text-[8px] text-gray-500 mt-0.5">Update market gravity scores for your city</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Footer / Twin Status ===== */}
        <div className="border-t border-gray-800 pt-4 mt-8">
          <div className="flex items-center justify-between text-[9px] text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AI Twin is monitoring {opportunities.length} opportunities across all markets</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Next scan: auto</span>
              <button
                onClick={() => {}}
                className="text-luxury-gold-400 hover:text-luxury-gold-300"
              >
                Run Scan Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
