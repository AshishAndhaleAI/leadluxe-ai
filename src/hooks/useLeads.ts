import { useState, useEffect } from 'react';
import { supabase, subscribeToInserts, subscribeToUpdates } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateLeadScore } from '../lib/ai-scoring';
import { useNotifications } from '../context/NotificationContext';
import { triggerWhatsAppWorkflow } from '../lib/whatsapp';
import type { Lead, LeadStatus, LeadSource } from '../types';

export interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  minScore?: number;
  maxScore?: number;
  dateFrom?: string;
  dateTo?: string;
}

interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  createLead: (lead: Partial<Lead>) => Promise<Lead | null>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<boolean>;
  deleteLead: (id: string) => Promise<boolean>;
  getLeadById: (id: string) => Lead | undefined;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  filterLeads: (filters: LeadFilters) => Lead[];
  refreshLeads: () => Promise<void>;
}

export function useLeads(): UseLeadsReturn {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }
    fetchLeads();
  }, [user]);

  // Real-time: new leads
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToInserts<Lead>('leads', (newLead) => {
      setLeads((prev) => [newLead, ...prev]);

      // Auto-notify for new leads
      if (newLead.user_id === user.id) {
        addNotification({
          user_id: user.id,
          title: `New Lead: ${newLead.name} 🎯`,
          message: `Score: ${newLead.score}/100 — ${newLead.source}`,
          type: 'lead',
          related_entity_type: 'lead',
          related_entity_id: newLead.id,
        });
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Real-time: lead updates
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToUpdates<Lead>('leads', (updatedLead) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
      );
    });

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function fetchLeads() {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else if (data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  }

  async function createLead(leadData: Partial<Lead>): Promise<Lead | null> {
    if (!user) return null;

    // Calculate AI score
    const { score, factors, details, recommendations } = calculateLeadScore(leadData);

    const { data, error: err } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        budget: leadData.budget,
        preferred_location: leadData.preferred_location,
        property_type: leadData.property_type,
        visit_timeline: leadData.visit_timeline,
        source: leadData.source || 'website',
        score,
        score_factors: { factors, details, recommendations },
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      return null;
    }

    const newLead = data as Lead;

    // Log lead event
    await supabase.from('lead_events').insert({
      lead_id: newLead.id,
      event_type: leadData.source === 'whatsapp' ? 'chat_started' : 'website_visit',
      event_label: 'Lead Captured',
      event_description: `New lead from ${leadData.source || 'website'} — Score: ${score}/100`,
    });

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: `New Lead Captured: ${newLead.name}`,
      message: `AI Score: ${score}/100 — ${details.join(', ')}`,
      type: 'lead',
      related_entity_type: 'lead',
      related_entity_id: newLead.id,
    });

    // Trigger WhatsApp automation if service is configured
    triggerWhatsAppWorkflow(newLead).catch(() => {});

    return newLead;
  }

  async function updateLead(id: string, updates: Partial<Lead>): Promise<boolean> {
    const { error: err } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (err) {
      setError(err.message);
      return false;
    }

    // Log status change
    if (updates.status) {
      await supabase.from('lead_events').insert({
        lead_id: id,
        event_type: 'status_changed',
        event_label: `Status → ${updates.status}`,
        event_description: `Lead status updated to ${updates.status}`,
      });
    }

    return true;
  }

  async function deleteLead(id: string): Promise<boolean> {
    const { error: err } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  }

  function getLeadById(id: string): Lead | undefined {
    return leads.find((l) => l.id === id);
  }

  function getLeadsByStatus(status: LeadStatus): Lead[] {
    return leads.filter((l) => l.status === status);
  }

  function filterLeads(filters: LeadFilters): Lead[] {
    return leads.filter((lead) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!lead.name.toLowerCase().includes(s) &&
            !lead.phone.includes(s) &&
            !lead.email?.toLowerCase().includes(s) &&
            !lead.preferred_location?.toLowerCase().includes(s)) {
          return false;
        }
      }
      if (filters.status && lead.status !== filters.status) return false;
      if (filters.source && lead.source !== filters.source) return false;
      if (filters.minScore !== undefined && lead.score < filters.minScore) return false;
      if (filters.maxScore !== undefined && lead.score > filters.maxScore) return false;
      if (filters.dateFrom && new Date(lead.created_at) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(lead.created_at) > new Date(filters.dateTo)) return false;
      return true;
    });
  }

  async function refreshLeads() {
    await fetchLeads();
  }

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    getLeadById,
    getLeadsByStatus,
    filterLeads,
    refreshLeads,
  };
}
