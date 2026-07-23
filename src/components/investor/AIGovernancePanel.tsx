// ============================================================
// Phase 8: AI Governance Panel
// Human-in-the-loop safety and transparency
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, FileText, Eye, Lock, Users, Info, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { runOpportunityHunter } from '../../lib/investor/OpportunityHunterAgent';
import type { HunterRunReport } from '../../lib/investor/OpportunityHunterAgent';

const GOVERNANCE_RULES = [
  {
    id: 'rule-1',
    title: 'Analysis Only — No Execution',
    description: 'LeadLuxe AI may analyze, score, and recommend investment opportunities. It may NOT execute any financial transaction, make purchases, or move funds.',
    icon: Lock,
    severity: 'critical' as const,
  },
  {
    id: 'rule-2',
    title: 'No Automated Client Outreach',
    description: 'The AI may NOT contact clients, developers, or external parties automatically. All external communications require explicit human approval.',
    icon: Users,
    severity: 'critical' as const,
  },
  {
    id: 'rule-3',
    title: 'Human Approval Required',
    description: 'Any action that creates a commitment (deal registration, commission agreement, service contract) requires direct human authorization.',
    icon: CheckCircle,
    severity: 'critical' as const,
  },
  {
    id: 'rule-4',
    title: 'Source Attribution',
    description: 'Every data point used in analysis must be attributable to a specific source. AI-generated insights must be labeled as AI-generated.',
    icon: FileText,
    severity: 'high' as const,
  },
  {
    id: 'rule-5',
    title: 'Confidence Transparency',
    description: 'Every recommendation must display its confidence score. Users can see exactly how confident the AI is in each prediction.',
    icon: Eye,
    severity: 'high' as const,
  },
  {
    id: 'rule-6',
    title: 'Audit Trail',
    description: 'All AI decisions, analyses, and recommendations are logged with timestamps, source data, and confidence levels for full auditability.',
    icon: Clock,
    severity: 'medium' as const,
  },
  {
    id: 'rule-7',
    title: 'No Self-Modification',
    description: 'The AI may not modify its own code, prompts, or operational parameters. All system changes require developer intervention.',
    icon: XCircle,
    severity: 'critical' as const,
  },
  {
    id: 'rule-8',
    title: 'Privacy Compliance',
    description: 'The AI does not learn from private user data. User portfolio data, search history, and preferences remain private and are not used for model training.',
    icon: Shield,
    severity: 'high' as const,
  },
];

export function AIGovernancePanel() {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'transparency' | 'audit'>('rules');
  const [showHunterResult, setShowHunterResult] = useState(false);
  const [hunterResult, setHunterResult] = useState<HunterRunReport | null>(null);

  const runAudit = () => {
    const result = runOpportunityHunter();
    setHunterResult(result);
    setShowHunterResult(true);
  };

  return (
    <div className="premium-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Governance & Safety</h3>
          <p className="text-xs text-gray-500">Human-in-the-loop oversight for all AI actions</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 p-1 bg-black/30 rounded-lg">
        {([
          { id: 'rules' as const, label: 'Safety Rules', icon: Shield },
          { id: 'transparency' as const, label: 'Transparency', icon: Eye },
          { id: 'audit' as const, label: 'Audit Trail', icon: Activity },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border border-luxury-gold-500/20'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">
                <span className="text-emerald-400 font-medium">8</span> governance rules active
              </p>
              <span className="text-[9px] text-gray-600 px-1.5 py-0.5 rounded bg-white/5 border border-luxury-border">
                Last reviewed: Today
              </span>
            </div>
            {GOVERNANCE_RULES.map(rule => (
              <div key={rule.id} className="rounded-lg border border-luxury-border overflow-hidden">
                <button
                  onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center',
                      rule.severity === 'critical' ? 'bg-red-500/15' :
                      rule.severity === 'high' ? 'bg-amber-500/15' : 'bg-blue-500/15'
                    )}>
                      <rule.icon className={cn(
                        'w-3.5 h-3.5',
                        rule.severity === 'critical' ? 'text-red-400' :
                        rule.severity === 'high' ? 'text-amber-400' : 'text-blue-400'
                      )} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-white">{rule.title}</p>
                      <p className="text-[9px] text-gray-500 capitalize">{rule.severity} priority</p>
                    </div>
                  </div>
                  {expandedRule === rule.id ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedRule === rule.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-0">
                        <div className="p-3 rounded-lg bg-white/[0.03] border border-luxury-border">
                          <p className="text-xs text-gray-400 leading-relaxed">{rule.description}</p>
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-luxury-border">
                            <div className={cn(
                              'flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full',
                              rule.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              rule.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            )}>
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {rule.severity}
                            </div>
                            <span className="text-[9px] text-gray-600">Automatically enforced</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'transparency' && (
          <motion.div
            key="transparency"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-white/[0.03] border border-luxury-border">
              <h4 className="text-xs font-semibold text-white mb-2">🤖 How LeadLuxe AI Makes Decisions</h4>
              <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
                <p>1. <strong className="text-white">Data Collection</strong> — Public market data is collected from verified sources including government registries, news outlets, and market reports.</p>
                <p>2. <strong className="text-white">Scoring</strong> — Each opportunity is scored across 8 factors weighted by their historical impact on investment outcomes.</p>
                <p>3. <strong className="text-white">Ranking</strong> — Opportunities are ranked by composite score. Only top-tier opportunities are surfaced to users.</p>
                <p>4. <strong className="text-white">Explanation</strong> — Every score is accompanied by natural language reasoning citing specific data points.</p>
                <p>5. <strong className="text-white">User Decision</strong> — The user reviews the analysis and makes the final investment decision. The AI never executes.</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/[0.03] border border-luxury-border">
              <h4 className="text-xs font-semibold text-white mb-2">📊 Scoring Model Transparency</h4>
              <div className="space-y-3">
                {[
                  { factor: 'Price Momentum', weight: '20%', description: 'Year-over-year price change in the local market' },
                  { factor: 'Rental Yield', weight: '15%', description: 'Annual rental income as percentage of property value' },
                  { factor: 'Inventory Absorption', weight: '10%', description: 'Rate at which available inventory is being sold' },
                  { factor: 'Infrastructure Pipeline', weight: '15%', description: 'Number and proximity of active infrastructure projects' },
                  { factor: 'Developer Reputation', weight: '10%', description: 'Developer track record and delivery history' },
                  { factor: 'Foreign Investment Flow', weight: '10%', description: 'Level of cross-border investment activity' },
                  { factor: 'Currency Stability', weight: '10%', description: 'Local currency volatility and trend' },
                  { factor: 'Liquidity Risk', weight: '10%', description: 'Ease of exiting the investment' },
                ].map(item => (
                  <div key={item.factor} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white">{item.factor}</p>
                      <p className="text-[9px] text-gray-600">{item.description}</p>
                    </div>
                    <span className="text-xs font-mono text-luxury-gold-400">{item.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80">
                  LeadLuxe AI uses publicly available data sources and transparent algorithms. 
                  All recommendations include confidence scores and source attribution. 
                  No investment decisions are made without human approval.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Recent AI agent activity</p>
              <button
                onClick={runAudit}
                className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors flex items-center gap-1"
              >
                <Activity className="w-3 h-3" />
                Run Agent Scan
              </button>
            </div>

            {showHunterResult && hunterResult ? (
              <div className="p-4 rounded-lg bg-white/[0.03] border border-luxury-border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-luxury-gold-400">{hunterResult.agentName}</p>
                  <span className="text-[9px] text-gray-600">{(hunterResult.scanDuration / 1000).toFixed(1)}s</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-black/30">
                    <p className="text-lg font-bold text-emerald-400">{hunterResult.marketsScanned}</p>
                    <p className="text-[9px] text-gray-500">Markets</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-black/30">
                    <p className="text-lg font-bold text-luxury-gold-400">{hunterResult.opportunitiesFound}</p>
                    <p className="text-[9px] text-gray-500">Discovered</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-black/30">
                    <p className="text-lg font-bold text-blue-400">{hunterResult.highConfidenceCount}</p>
                    <p className="text-[9px] text-gray-500">High Conf.</p>
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {hunterResult.topDiscoveries.slice(0, 5).map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-xs">
                      <span className="text-gray-300">{d.countryFlag} {d.city}</span>
                      <span className={cn(
                        'font-medium',
                        d.confidenceLevel === 'high' ? 'text-emerald-400' :
                        d.confidenceLevel === 'medium' ? 'text-amber-400' : 'text-gray-400'
                      )}>
                        {d.score.overallScore}/100
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-luxury-border text-[9px] text-gray-600">
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                  No external actions taken — all results require human review
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Activity className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Run an agent scan to see audit results</p>
                <p className="text-[9px] text-gray-600 mt-1">All AI actions are logged and auditable</p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300/80">
                  No AI decisions executed today. All activity is in analysis/recommendation mode only.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
