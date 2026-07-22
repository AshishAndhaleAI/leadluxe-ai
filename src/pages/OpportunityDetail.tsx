import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Building2, MapPin, IndianRupee, Calendar,
  Target, Trophy, Percent, Sparkles, Bot, ChevronRight,
  ExternalLink, Clock, TrendingUp, Lightbulb, CheckCircle,
  MessageSquare, Download, Share2, Star
} from 'lucide-react';
import { ConfidenceIndicator } from '../components/ai/ConfidenceIndicator';
import { DealTimeline } from '../components/ai/DealTimeline';
import { BuyingSignalCard } from '../components/ai/BuyingSignalCard';
import { DEMO_OPPORTUNITIES } from '../components/ai/demoData';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { formatDateTime, cn } from '../lib/utils';
import { DEAL_STAGE_LABELS, DEAL_STAGE_COLORS } from '../types';
import type { DealStage } from '../types';

export function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'strategy'>('overview');

  const opportunity = useMemo(() =>
    DEMO_OPPORTUNITIES.find(o => o.id === id),
    [id]
  );

  if (!opportunity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <Building2 className="w-12 h-12 text-gray-700 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Opportunity Not Found</h3>
        <p className="text-sm text-gray-500 mb-4">This deal opportunity doesn't exist.</p>
        <button onClick={() => navigate('/opportunities')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </button>
      </div>
    );
  }

  const stages = ['discovered', 'qualifying', 'proposal', 'negotiation', 'closing', 'closed_won'] as const;
  const prospectCommission = opportunity.expectedCommission;
  const topReasons = opportunity.reasons;
  const topActions = opportunity.recommendedActions;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back */}
      <button onClick={() => navigate('/opportunities')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Opportunities
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="premium-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-luxury-gold-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{opportunity.builderName}</h1>
                  <p className="text-sm text-gray-500">{opportunity.projectName}</p>
                </div>
              </div>
              <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border', (DEAL_STAGE_COLORS as Record<string, string>)[opportunity.dealStage])}>
                {(DEAL_STAGE_LABELS as Record<string, string>)[opportunity.dealStage]}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { icon: MapPin, label: 'Location', value: `${opportunity.location}, ${opportunity.city}` },
                { icon: IndianRupee, label: 'Estimated Value', value: formatIndianCurrency(opportunity.estimatedValue) },
                { icon: Percent, label: 'Commission (3%)', value: formatCommission(prospectCommission), color: 'text-emerald-400' },
                { icon: Calendar, label: 'Updated', value: formatDateTime(opportunity.updatedAt) },
                { icon: Trophy, label: 'Confidence Score', value: `${opportunity.confidenceScore}%` },
                { icon: Sparkles, label: 'Signals', value: `${opportunity.signals.length} signals detected` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-luxury-gray/50 border border-luxury-border">
                  <item.icon className="w-4 h-4 text-luxury-gold-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className={cn('text-sm text-white font-medium truncate', item.color)}>{String(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence Factors */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Confidence Factors</h3>
              <div className="space-y-2">
                {opportunity.confidenceFactors.map((factor, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">{factor.label}</span>
                        <span className={cn(
                          'font-semibold',
                          factor.score >= 85 ? 'text-emerald-400' :
                          factor.score >= 70 ? 'text-amber-400' : 'text-red-400'
                        )}>{factor.score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            factor.score >= 85 ? 'bg-emerald-500' :
                            factor.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-600 mt-0.5">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="premium-card">
            <div className="flex border-b border-luxury-border">
              {([
                { key: 'overview', label: 'AI Analysis', icon: Bot },
                { key: 'signals', label: 'Buying Signals', icon: TrendingUp },
                { key: 'strategy', label: 'Strategy', icon: Target },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 text-xs font-medium transition-all border-b-2',
                    activeTab === tab.key
                      ? 'text-luxury-gold-400 border-luxury-gold-500'
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Why This Opportunity?</h3>
                  <ul className="space-y-3">
                    {topReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <Sparkles className="w-4 h-4 text-luxury-gold-400 mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-sm font-semibold text-white mt-6">AI-Generated Insights</h3>
                  <div className="glass-card p-4 border border-luxury-gold-500/10">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {opportunity.builderName} shows <strong className="text-luxury-gold-400">{opportunity.confidenceScore}% confidence</strong> based on budget alignment,
                      urgency signals, and engagement patterns. The buyer's profile matches premium inventory in {opportunity.location}.
                      {opportunity.dealStage === 'closing' && ' Recommend prioritizing closing within 7 days.'}
                      {opportunity.dealStage === 'negotiation' && ' Currently in negotiation — focus on value-add proposals.'}
                      {opportunity.dealStage === 'qualifying' && ' Qualify further with a site visit this week.'}
                    </p>
                  </div>

                  {opportunity.dealStage === 'closed_won' && (
                    <div className="glass-card p-4 border border-emerald-500/20 bg-emerald-500/5">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-400">Deal Closed Successfully</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Commission of {formatCommission(opportunity.expectedCommission)} realized. 
                            Request testimonial and referrals from this builder.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'signals' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white mb-3">Detected Buying Signals</h3>
                  {opportunity.signals.map((signal, i) => (
                    <BuyingSignalCard key={signal.id} signal={signal} index={i} />
                  ))}
                </div>
              )}

              {activeTab === 'strategy' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Recommended Actions</h3>
                  <ul className="space-y-3">
                    {topActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <Target className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-sm font-semibold text-white mt-6">Deal Timeline</h3>
                  <DealTimeline
                    currentStage={opportunity.dealStage as any}
                    stages={stages as any}
                    estimatedValue={opportunity.estimatedValue}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Confidence Score */}
          <div className="premium-card p-6 text-center">
            <h3 className="text-sm font-semibold text-white mb-4">AI Confidence Score</h3>
            <div className="flex justify-center mb-4">
              <ConfidenceIndicator score={opportunity.confidenceScore} size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="glass-card p-2.5">
                <p className="text-lg font-bold text-luxury-gold-400">
                  {formatIndianCurrency(opportunity.estimatedValue)}
                </p>
                <p className="text-[10px] text-gray-500">Deal Value</p>
              </div>
              <div className="glass-card p-2.5">
                <p className="text-lg font-bold text-emerald-400">
                  {formatCommission(prospectCommission)}
                </p>
                <p className="text-[10px] text-gray-500">Commission</p>
              </div>
            </div>
          </div>

          {/* Deal Timeline */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">Deal Progress</h3>
            </div>
            <DealTimeline
              currentStage={opportunity.dealStage as any}
              stages={stages as any}
            />
          </div>

          {/* Quick Actions */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ask AI Deal Coach</p>
                  <p className="text-xs text-gray-500">Get strategy guidance</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Download className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Export Report</p>
                  <p className="text-xs text-gray-500">PDF summary</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Share Opportunity</p>
                  <p className="text-xs text-gray-500">Invite team to view</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
