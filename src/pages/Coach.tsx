import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot, TrendingUp, Target,
  Lightbulb
} from 'lucide-react';
import { DealCoachChat } from '../components/ai/DealCoachChat';
import { useOpportunityEngine } from '../hooks/useOpportunityEngine';
import { formatCommission } from '../lib/format';
import { cn } from '../lib/utils';

export function Coach() {
  const navigate = useNavigate();
  const { opportunities, loading } = useOpportunityEngine();

  const topDeals = useMemo(() =>
    opportunities
      .filter(o => o.is_active && o.deal_stage !== 'closed_won')
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 3),
    [opportunities]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Deal Coach</h2>
          <p className="text-sm text-gray-500">Your personal AI sales strategist for every deal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar — Deal Context */}
        <div className="lg:col-span-1 space-y-4">
          {/* Active Deals */}
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">
                {loading ? 'Loading...' : `Active Deals (${topDeals.length})`}
              </h3>
            </div>
            {topDeals.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-3">No active deals yet</p>
            ) : (
              <div className="space-y-2">
                {topDeals.map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => navigate(`/opportunity/${deal.id}`)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <p className="text-sm font-medium text-white group-hover:text-luxury-gold-300 transition-colors truncate">
                      {deal.title?.split('—')[0]?.trim() || 'Opportunity'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                      <span>{deal.confidence_score}% confidence</span>
                      <span className="text-emerald-400">{formatCommission(deal.estimated_commission)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Topics */}
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Suggested Topics</h3>
            </div>
            <div className="space-y-1.5">
              {[
                'How to close my top opportunity?',
                'Negotiation tips for premium buyers',
                'Analyze my pipeline health',
                'WhatsApp follow-up best practices',
                'Commission model pitch strategy',
              ].map((topic, i) => (
                <button
                  key={i}
                  className="w-full text-left p-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Coach Stats */}
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Coach Stats</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Deals in pipeline</span>
                <span className="text-white font-medium">{opportunities.filter(o => o.is_active).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">High confidence</span>
                <span className="text-emerald-400 font-medium">
                  {opportunities.filter(o => o.is_active && o.confidence_score >= 80).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total pipeline value</span>
                <span className="text-luxury-gold-400 font-medium">
                  {formatCommission(opportunities.reduce((s, o) => s + o.estimated_commission, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <div className="premium-card h-[600px] flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-luxury-border">
              <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Deal Coach</h3>
                <p className="text-xs text-gray-500">Powered by LeadLuxe AI Intelligence</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                AI Active
              </span>
            </div>

            {/* Chat Messages */}
            <DealCoachChat />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
