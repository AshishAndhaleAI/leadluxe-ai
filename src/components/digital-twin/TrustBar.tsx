// ============================================================
// LeadLuxe AI — Trust Bar
// Sticky data provenance summary shown at the top of the
// Digital Twin property research workspace.
// ============================================================

import { Shield, CheckCircle, Clock, FileText, MapPin, Database } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TrustBarProps {
  verifiedDataPercent: number;
  lastVerified: string;
  evidenceCount: number;
  governmentSources: number;
  mapAccuracy: number;
  className?: string;
}

export function TrustBar({
  verifiedDataPercent,
  lastVerified,
  evidenceCount,
  governmentSources,
  mapAccuracy,
  className,
}: TrustBarProps) {
  const items = [
    { label: 'Verified Data', value: `${verifiedDataPercent}%`, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Last Verified', value: lastVerified, icon: Clock, color: 'text-luxury-gold-400' },
    { label: 'Evidence Docs', value: evidenceCount.toString(), icon: FileText, color: 'text-blue-400' },
    { label: 'Gov Sources', value: governmentSources.toString(), icon: Database, color: 'text-purple-400' },
    { label: 'Map Accuracy', value: `${mapAccuracy}%`, icon: MapPin, color: 'text-emerald-400' },
  ];

  return (
    <div className={cn('w-full bg-gray-900/90 backdrop-blur-lg border-b border-luxury-border/50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-1.5 text-[9px] text-luxury-gold-400 font-medium shrink-0 mr-4">
            <Shield className="w-3 h-3" />
            <span>Trust Score</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                <item.icon className={cn('w-3 h-3', item.color)} />
                <span className="text-[9px] font-medium text-white">{item.value}</span>
                <span className="text-[8px] text-gray-500 hidden sm:inline">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 ml-4 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] text-gray-600">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
