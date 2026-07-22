import { useState, useEffect, useMemo } from 'react';
import { supabase, subscribeToInserts, subscribeToUpdates } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Lead, LeadStatus, LeadSource } from '../types';

export interface DashboardMetrics {
  totalLeads: number;
  hotLeads: number;
  qualifiedLeads: number;
  siteVisits: number;
  bookings: number;
  conversionRate: number;
  projectedRevenue: number;
  pipelineValue: number;
  newLeadsToday: number;
  leadsByStatus: { status: LeadStatus; count: number }[];
  leadsBySource: { source: LeadSource; count: number }[];
  monthlyTrend: { month: string; leads: number; bookings: number }[];
  recentLeads: Lead[];
  hotLeadsList: Lead[];
}

export function useDashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all leads
  useEffect(() => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setLeads(data as Lead[]);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Real-time inserts
  useEffect(() => {
    if (!user) return;
    const channel = subscribeToInserts<Lead>('leads', (newLead) => {
      setLeads((prev) => [newLead, ...prev]);
    });
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = subscribeToUpdates<Lead>('leads', (updatedLead) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
      );
    });
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const metrics = useMemo((): DashboardMetrics => {
    const totalLeads = leads.length;
    const hotLeads = leads.filter((l) => l.score >= 70).length;
    const qualifiedLeads = leads.filter((l) =>
      ['qualified', 'site_visit', 'negotiation', 'booked'].includes(l.status)
    ).length;
    const siteVisits = leads.filter((l) => l.status === 'site_visit').length;
    const bookings = leads.filter((l) => l.status === 'booked').length;
    const conversionRate = totalLeads > 0 ? (bookings / totalLeads) * 100 : 0;
    const projectedRevenue = leads
      .filter((l) => ['negotiation', 'booked', 'qualified'].includes(l.status))
      .reduce((sum, l) => sum + (l.budget || 0), 0);
    const pipelineValue = leads
      .filter((l) => !['booked', 'lost'].includes(l.status))
      .reduce((sum, l) => sum + (l.budget || 0), 0);

    const today = new Date().toDateString();
    const newLeadsToday = leads.filter(
      (l) => new Date(l.created_at).toDateString() === today
    ).length;

    const leadsByStatus: { status: LeadStatus; count: number }[] = [
      'new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'booked', 'lost',
    ].map((s) => ({
      status: s as LeadStatus,
      count: leads.filter((l) => l.status === s).length,
    }));

    const leadsBySource: { source: LeadSource; count: number }[] = [
      'website', 'whatsapp', 'referral', 'social_media', 'email', 'phone', 'other',
    ].map((s) => ({
      source: s as LeadSource,
      count: leads.filter((l) => l.source === s).length,
    }));

    // Monthly trend
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('default', { month: 'short', year: '2-digit' });
    }).reverse();

    const monthlyTrend = last6Months.map((month) => {
      const monthLeads = leads.filter((l) => {
        const d = new Date(l.created_at);
        return d.toLocaleString('default', { month: 'short', year: '2-digit' }) === month;
      });
      return {
        month,
        leads: monthLeads.length,
        bookings: monthLeads.filter((l) => l.status === 'booked').length,
      };
    });

    const recentLeads = [...leads]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const hotLeadsList = [...leads]
      .filter((l) => l.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      totalLeads, hotLeads, qualifiedLeads, siteVisits, bookings,
      conversionRate, projectedRevenue, pipelineValue, newLeadsToday,
      leadsByStatus, leadsBySource, monthlyTrend, recentLeads, hotLeadsList,
    };
  }, [leads]);

  return { metrics, loading };
}
