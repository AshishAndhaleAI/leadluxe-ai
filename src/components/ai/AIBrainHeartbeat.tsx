import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Brain, Cpu, Globe, Zap, Database, 
  TrendingUp, AlertCircle, CheckCircle, Clock 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { autonomousIntelligence } from '../../lib/core/AutonomousIntelligence';

interface AIBrainHeartbeatProps {
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function AIBrainHeartbeat({ expanded = false, onToggle, className }: AIBrainHeartbeatProps) {
  const [status, setStatus] = useState<any>(null);
  const [pulse, setPulse] = useState<'idle' | 'active' | 'error'>('idle');

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const s = autonomousIntelligence.getStatus();
        setStatus(s);
        setPulse(s.status === 'running' ? 'active' : s.status === 'error' ? 'error' : 'idle');
      } catch {
        setPulse('idle');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 group',
          pulse === 'active' 
            ? 'bg-emerald-500/10 border-emerald-500/25' 
            : pulse === 'error'
            ? 'bg-red-500/10 border-red-500/25'
            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
        )}
      >
        {/* Pulse animation */}
        <span className="relative flex h-3 w-3">
          <span 
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pulse === 'active' ? 'bg-emerald-400' : pulse === 'error' ? 'bg-red-400' : 'bg-gray-500'
            )} 
          />
          <span 
            className={cn(
              'relative inline-flex rounded-full h-3 w-3',
              pulse === 'active' ? 'bg-emerald-400' : pulse === 'error' ? 'bg-red-400' : 'bg-gray-500'
            )} 
          />
        </span>

        <div className="text-left">
          <p className={cn(
            'text-xs font-semibold',
            pulse === 'active' ? 'text-emerald-400' : pulse === 'error' ? 'text-red-400' : 'text-gray-400'
          )}>
            {pulse === 'active' ? 'AI Processing' : pulse === 'error' ? 'AI Error' : 'AI Idle'}
          </p>
          {status && (
            <p className="text-[9px] text-gray-600">
              {status.totalRuns || 0} cycles · {status.totalSignalsCollected || 0} signals
            </p>
          )}
        </div>

        {expanded && (
          <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" />
        )}
      </button>

      <AnimatePresence>
        {expanded && status && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 glass-card p-3 space-y-2 border border-luxury-gold-500/10"
          >
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Activity className="w-3 h-3" />
                <span>Cycles: <strong className="text-white">{status.totalRuns}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Globe className="w-3 h-3" />
                <span>Signals: <strong className="text-white">{status.totalSignalsCollected}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Database className="w-3 h-3" />
                <span>Graph: <strong className="text-white">{status.graphSummary?.nodeCount || 0}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Brain className="w-3 h-3" />
                <span>Accuracy: <strong className="text-white">{status.memoryStats?.overallAccuracy || 0}%</strong></span>
              </div>
            </div>

            {status.agents && (
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">Agents</p>
                <div className="grid grid-cols-2 gap-1">
                  {status.agents.slice(0, 6).map((agent: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-[9px] text-gray-500">
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        agent.status === 'idle' ? 'bg-emerald-400' : agent.status === 'working' ? 'bg-amber-400' : 'bg-red-400'
                      )} />
                      <span className="truncate">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
