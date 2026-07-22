import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeadCard } from './LeadCard';
import type { Lead, LeadStatus } from '../../types';
import { LEAD_STATUS_LABELS } from '../../types';
import { cn } from '../../lib/utils';

interface LeadPipelineProps {
  leads: Lead[];
  onStatusChange?: (id: string, status: LeadStatus) => void;
}

const PIPELINE_STAGES: LeadStatus[] = ['new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'booked', 'lost'];

export function LeadPipeline({ leads, onStatusChange }: LeadPipelineProps) {
  const navigate = useNavigate();
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  const getLeadsForStage = (status: LeadStatus) =>
    leads.filter((l) => l.status === status);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    if (draggedLead && onStatusChange) {
      onStatusChange(draggedLead, targetStatus);
    }
    setDraggedLead(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = getLeadsForStage(stage);
        const stageColors = {
          new: 'border-blue-500/30 bg-blue-500/5',
          contacted: 'border-purple-500/30 bg-purple-500/5',
          qualified: 'border-emerald-500/30 bg-emerald-500/5',
          site_visit: 'border-amber-500/30 bg-amber-500/5',
          negotiation: 'border-orange-500/30 bg-orange-500/5',
          booked: 'border-luxury-gold-500/30 bg-luxury-gold-500/5',
          lost: 'border-red-500/30 bg-red-500/5',
        };

        return (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
            className={cn(
              'flex-shrink-0 w-64 rounded-xl border',
              stageColors[stage],
              'transition-colors duration-200'
            )}
          >
            {/* Stage Header */}
            <div className="px-3 py-3 border-b border-inherit">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{LEAD_STATUS_LABELS[stage]}</h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>
            </div>

            {/* Lead Cards */}
            <div className="p-2.5 space-y-2 min-h-[120px] max-h-[600px] overflow-y-auto">
              {stageLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={() => navigate(`/lead/${lead.id}`)}
                  onDragStart={handleDragStart}
                />
              ))}
              {stageLeads.length === 0 && (
                <div className="flex items-center justify-center h-20">
                  <p className="text-xs text-gray-600">Drop leads here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
