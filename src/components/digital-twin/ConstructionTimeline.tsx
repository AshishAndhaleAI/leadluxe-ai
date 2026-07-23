// ============================================================
// LeadLuxe AI — Construction Timeline Tab
// Layer 5 of the Digital Twin workspace.
// Shows milestone tracking with dates, satellite comparison,
// and schedule delay analysis.
// ============================================================

import { Clock, CheckCircle, AlertTriangle, Construction, Calendar, Target, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ConstructionMilestone, SourceProvenance } from '../../types/digital-twin';
import type { VerificationBadge } from '../../types/digital-twin';

interface ConstructionTimelineProps {
  milestones: ConstructionMilestone[];
  overallProgress: number;
  scheduleConfidence: number;
  contractorName?: string;
  contractorRiskScore?: number;
  provenance: SourceProvenance;
}

function MilestoneCard({ milestone }: { milestone: ConstructionMilestone }) {
  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Completed' },
    in_progress: { icon: Construction, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'In Progress' },
    pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-900/40', border: 'border-gray-800', label: 'Pending' },
    delayed: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Delayed' },
  }[milestone.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn('p-4 rounded-xl border', statusConfig.bg, statusConfig.border)}>
      <div className="flex items-start gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', statusConfig.bg)}>
          <StatusIcon className={cn('w-4 h-4', statusConfig.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-semibold text-white">{milestone.milestone}</h4>
            <span className={cn('text-[8px] px-1.5 py-0.5 rounded-full font-medium border', statusConfig.color, statusConfig.bg, statusConfig.border)}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-[9px] text-gray-500 leading-relaxed mb-2">{milestone.description}</p>
          <div className="flex items-center gap-3 text-[8px] text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              <span>Planned: {milestone.plannedDate}</span>
            </div>
            {milestone.actualDate && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-emerald-400">Actual: {milestone.actualDate}</span>
              </div>
            )}
            {milestone.delayDays && milestone.delayDays > 0 && (
              <div className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>{milestone.delayDays}d delay</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {milestone.evidence.length > 0 ? (
              milestone.evidence.map((ev, i) => (
                <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer"
                  className="text-[7px] text-luxury-gold-400 underline underline-offset-2 hover:text-luxury-gold-300">
                  {ev.title}
                </a>
              ))
            ) : (
              <span className="text-[7px] text-gray-700 italic">No evidence uploaded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConstructionTimeline({ milestones, overallProgress, scheduleConfidence, contractorName, contractorRiskScore, provenance }: ConstructionTimelineProps) {
  const riskColor = contractorRiskScore !== undefined
    ? contractorRiskScore < 30 ? 'text-emerald-400' : contractorRiskScore < 60 ? 'text-amber-400' : 'text-red-400'
    : 'text-gray-500';

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const delayedCount = milestones.filter(m => m.status === 'delayed').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Overall Progress</p>
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#1a1a1a" strokeWidth="4" />
              <circle cx="32" cy="32" r="28" fill="none" stroke={overallProgress >= 70 ? '#34D399' : overallProgress >= 40 ? '#F59E0B' : '#EF4444'} strokeWidth="4" strokeDasharray={`${(overallProgress / 100) * 176} 176`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{overallProgress}%</span>
          </div>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Schedule Confidence</p>
          <p className="text-2xl font-bold text-white">{scheduleConfidence}%</p>
          <p className="text-[8px] text-gray-600 mt-1">
            {scheduleConfidence >= 70 ? 'On track' : scheduleConfidence >= 40 ? 'Moderate risk' : 'High risk'}
          </p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Milestones</p>
          <p className="text-2xl font-bold text-white">{completedCount}/{milestones.length}</p>
          <p className="text-[8px] text-emerald-400 mt-1">Completed</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Contractor Risk</p>
          <p className={cn('text-2xl font-bold', riskColor)}>{contractorRiskScore !== undefined ? contractorRiskScore : 'N/A'}</p>
          <p className="text-[8px] text-gray-600 mt-1">{contractorName || 'Not verified'}</p>
        </div>
      </div>

      {/* Delay Warning */}
      {delayedCount > 0 && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-xs font-medium text-red-400">{delayedCount} milestone{delayedCount > 1 ? 's' : ''} delayed</p>
            <p className="text-[8px] text-red-400/70">Conduct a site inspection to verify actual progress.</p>
          </div>
        </div>
      )}

      {/* Contractor Info */}
      {contractorName && (
        <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-luxury-gold-400" />
            <div>
              <p className="text-[10px] text-gray-500">Main Contractor</p>
              <p className="text-xs font-medium text-white">{contractorName}</p>
            </div>
          </div>
          {contractorRiskScore !== undefined && (
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium',
              contractorRiskScore < 30 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              contractorRiskScore < 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            )}>
              Risk: {contractorRiskScore}
            </span>
          )}
        </div>
      )}

      {/* Milestone Timeline */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Construction className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Construction Milestones</h3>
        </div>
        <div className="space-y-3 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-px before:bg-gray-800">
          {milestones.map((m, i) => (
            <MilestoneCard key={i} milestone={m} />
          ))}
        </div>
      </div>

      {/* Source */}
      <div className="p-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
        <span className="text-[8px] text-gray-600">
          Data sourced from {provenance.sourceName} · {provenance.verificationStatus} · {provenance.fetchedAt}
        </span>
      </div>
    </div>
  );
}
