import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle, XCircle, Clock, Activity, AlertTriangle, Play, RefreshCw, ArrowRight, Zap, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { orchestrateAllAgents, AGENTS } from '../lib/neural';
import type { OrchestrationRun, AgentRunResult } from '../lib/neural';
import { cn } from '../lib/utils';

export function AgentConsole() {
  const [run, setRun] = useState<OrchestrationRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const handleRunAgents = async () => {
    setIsRunning(true);
    // Simulate async run
    await new Promise(r => setTimeout(r, 600));
    const result = orchestrateAllAgents();
    setRun(result);
    setIsRunning(false);
  };

  const agentStatusIcons = (status: AgentRunResult['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'pending_approval': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Agent Console</h2>
            <p className="text-sm text-gray-500">10 specialized agents analyzing global capital markets</p>
          </div>
        </div>
        <button
          onClick={handleRunAgents}
          disabled={isRunning}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
            isRunning
              ? 'bg-luxury-gold-500/10 text-luxury-gold-400/50 cursor-not-allowed'
              : 'bg-luxury-gold-500/20 text-luxury-gold-400 hover:bg-luxury-gold-500/30 border border-luxury-gold-500/30'
          )}
        >
          {isRunning ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running Agents...</>
          ) : (
            <><Play className="w-3.5 h-3.5" /> Run All Agents</>
          )}
        </button>
      </div>

      {run ? (
        <>
          {/* Run Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Agents', value: run.agentsRun, icon: Cpu, color: 'text-white' },
              { label: 'Completed', value: run.agentsCompleted, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'Failed', value: run.agentsFailed, icon: XCircle, color: run.agentsFailed > 0 ? 'text-red-400' : 'text-gray-500' },
              { label: 'Pending Approval', value: run.pendingApproval, icon: AlertTriangle, color: run.pendingApproval > 0 ? 'text-amber-400' : 'text-gray-500' },
              { label: 'Status', value: run.status.toUpperCase(), icon: Activity, color: run.status === 'completed' ? 'text-emerald-400' : 'text-red-400' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="premium-card p-3 text-center"
              >
                <stat.icon className={cn('w-4 h-4 mx-auto mb-1', stat.color)} />
                <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
                <p className="text-[9px] text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Agent Results */}
          <div className="space-y-2">
            {run.results.map((result, i) => {
              const agent = AGENTS.find(a => a.name === result.agentName);
              const isExpanded = expandedAgent === result.agentName;
              return (
                <motion.div
                  key={result.agentName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'premium-card overflow-hidden',
                    result.status === 'failed' ? 'border-red-500/20' :
                    result.status === 'pending_approval' ? 'border-amber-500/20' : ''
                  )}
                >
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : result.agentName)}
                    className="w-full flex items-center gap-3 p-3.5 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <span className="text-sm">{agent?.icon || '🤖'}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-white">{result.agentLabel}</p>
                        <span className="text-[8px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
                          {agent?.category}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-500 mt-0.5">{agent?.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {agentStatusIcons(result.status)}
                      <span className={cn(
                        'text-[10px] font-medium',
                        result.status === 'completed' ? 'text-emerald-400' :
                        result.status === 'failed' ? 'text-red-400' :
                        'text-amber-400'
                      )}>
                        {result.confidence}%
                      </span>
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 pt-0 space-y-2">
                        <div className="p-3 rounded-lg bg-black/30 border border-luxury-border space-y-2">
                          <div>
                            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Reasoning</p>
                            <p className="text-xs text-gray-300 leading-relaxed">{result.reasoningSummary}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-gray-600">
                            <span>{result.dataSources.join(', ')}</span>
                          </div>
                          {result.requiresHumanApproval && (
                            <div className="flex items-center gap-1.5 p-1.5 rounded bg-amber-500/10 text-[9px] text-amber-400">
                              <AlertTriangle className="w-3 h-3" />
                              Requires human approval before external action
                            </div>
                          )}
                        </div>

                        {/* Output details */}
                        {Object.keys(result.output).length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(result.output).filter(([key]) => !['recommendation'].includes(key)).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="p-2 rounded bg-black/30">
                                <p className="text-[8px] text-gray-600 uppercase tracking-wider mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-[10px] text-gray-300 line-clamp-2">
                                  {Array.isArray(value) ? value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '') : String(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Recommendation */}
                        {result.output.recommendation && (
                          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-luxury-gold-500/5">
                            <Zap className="w-3 h-3 text-luxury-gold-400 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-gray-300">{result.output.recommendation}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="premium-card p-12 text-center">
          <Cpu className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Agent Console Ready</h3>
          <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6">
            Click "Run All Agents" to orchestrate all 10 AI agents. Each agent specializes in a different aspect of global capital market analysis — from macroeconomics and currency risk to developer forensics and commission strategy.
          </p>
          <button onClick={handleRunAgents} className="btn-primary text-xs">
            <Play className="w-3.5 h-3.5" /> Run All Agents
          </button>
        </div>
      )}
    </motion.div>
  );
}
