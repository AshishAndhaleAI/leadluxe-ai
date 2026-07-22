import { useState } from 'react';
import { Users, Plus, LayoutGrid, List, Download, RefreshCw } from 'lucide-react';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadPipeline } from '../components/leads/LeadPipeline';
import { LeadForm } from '../components/leads/LeadForm';
import { useLeads } from '../hooks/useLeads';
import { useNotifications } from '../context/NotificationContext';
import { cn } from '../lib/utils';
import type { Lead, LeadStatus } from '../types';

export function Leads() {
  const { leads, loading, createLead, updateLead, error } = useLeads();
  const { addNotification } = useNotifications();
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  const handleCreateLead = async (data: Partial<Lead>) => {
    const newLead = await createLead(data);
    if (newLead) {
      setShowNewLeadForm(false);
      addNotification({
        user_id: newLead.user_id,
        title: 'New Lead Created 📋',
        message: `${newLead.name} — Score ${newLead.score}/100`,
        type: 'success',
        related_entity_type: 'lead',
        related_entity_id: newLead.id,
      });
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await updateLead(id, { status });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Lead Management</h2>
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${leads.length} total leads`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-luxury-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'table' ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'pipeline' ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button className="btn-outline !px-3 !py-2">
            <RefreshCw className="w-4 h-4" />
          </button>

          <button className="btn-outline !px-3 !py-2">
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowNewLeadForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <LeadTable leads={leads} loading={loading} onStatusChange={handleStatusChange} />
      ) : (
        <LeadPipeline leads={leads} onStatusChange={handleStatusChange} />
      )}

      {/* New Lead Form Modal */}
      {showNewLeadForm && (
        <LeadForm onSubmit={handleCreateLead} onClose={() => setShowNewLeadForm(false)} isModal />
      )}
    </div>
  );
}
