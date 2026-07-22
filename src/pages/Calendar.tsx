import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLeads } from '../hooks/useLeads';
import { CalendarView } from '../components/calendar/CalendarView';
import type { SiteVisit, Lead } from '../types';
import { cn } from '../lib/utils';

export function CalendarPage() {
  const { leads } = useLeads();
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [selectedLead, setSelectedLead] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitNotes, setVisitNotes] = useState('');

  // Fetch real site visits from Supabase
  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('site_visits')
        .select('*, lead:leads(*)')
        .order('scheduled_date', { ascending: true });
      if (data) setVisits(data as unknown as SiteVisit[]);
      setLoading(false);
    };
    fetchVisits();
  }, []);

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !visitDate || !visitTime) return;

    await supabase.from('site_visits').insert({
      lead_id: selectedLead,
      scheduled_date: visitDate,
      scheduled_time: visitTime,
      notes: visitNotes || undefined,
      status: 'scheduled',
    });

    // Refresh
    const { data } = await supabase
      .from('site_visits')
      .select('*, lead:leads(*)')
      .order('scheduled_date', { ascending: true });
    if (data) setVisits(data as unknown as SiteVisit[]);

    setShowNewVisit(false);
    setSelectedLead('');
    setVisitDate('');
    setVisitTime('');
    setVisitNotes('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Site Visit Calendar</h2>
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${visits.length} upcoming visits`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewVisit(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Schedule Visit
        </button>
      </div>

      {/* Calendar */}
      <CalendarView visits={visits} />

      {/* New Visit Modal */}
      {showNewVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-luxury-border bg-luxury-dark p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-white mb-6">Schedule Site Visit</h3>
            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Select Lead</label>
                <select
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                  required
                  className="select-glass"
                >
                  <option value="">Choose a lead...</option>
                  {leads.filter((l) => !['booked', 'lost'].includes(l.status)).map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} — {lead.preferred_location || 'No location'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
                  <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required className="input-glass" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Time</label>
                  <input type="time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)} required className="input-glass" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes</label>
                <textarea
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special requirements or instructions..."
                  className="input-glass resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-primary">
                  <CalendarIcon className="w-4 h-4" />
                  Schedule Visit
                </button>
                <button type="button" onClick={() => setShowNewVisit(false)} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
