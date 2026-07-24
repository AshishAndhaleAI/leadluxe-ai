// ============================================================
// LeadLuxe AI — Book a Demo (/book-demo)
// Scheduling page with contact form and availability
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Check, Send, ArrowRight, Globe, Building2, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEOHelmet } from '../components/seo/SEOHelmet';

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const OBJECTIVES = [
  { value: 'sell_inventory', label: 'Sell Inventory' },
  { value: 'nri_outreach', label: 'NRI Outreach' },
  { value: 'investor_roadshow', label: 'Investor Roadshow' },
  { value: 'market_intelligence', label: 'Market Intelligence' },
  { value: 'joint_development', label: 'Joint Development' },
  { value: 'capital_raise', label: 'Capital Raise' },
];

const CITIES_LIST = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai',
  'Kolkata', 'Ahmedabad', 'Gurugram', 'Noida', 'Dubai', 'London',
  'Singapore', 'New York', 'Other',
];

export function BookDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', role: '', city: '', website: '', objective: 'sell_inventory',
    date: '', time: '', timezone: 'IST',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.date) return;
    setSubmitting(true);
    try {
      if (supabase) {
        await supabase.from('demo_bookings').insert({
          contact_name: form.name,
          contact_email: form.email,
          contact_phone: form.phone,
          company_name: form.company,
          role: form.role,
          city: form.city,
          website: form.website,
          objective: form.objective,
          preferred_date: form.date,
          preferred_time: form.time,
          timezone: form.timezone,
          source: 'website',
          status: 'requested',
        });
      }
      setSubmitted(true);
    } catch {} finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Demo Requested</h1>
          <p className="text-sm text-gray-400 mb-6">We'll confirm your slot within 2 hours. Check your email for the calendar invite.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <SEOHelmet
        title="Book a Live Demo — LeadLuxe AI"
        description="Schedule a 30-minute walkthrough of the LeadLuxe AI platform. See live market intelligence, verified property data, and the Deal Room system in action."
        url="https://leadluxe-ai.vercel.app/book-demo"
        canonical="https://leadluxe-ai.vercel.app/book-demo"
      />
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg glass-card p-6 sm:p-8 border-luxury-gold-500/20 bg-luxury-black/60 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-luxury-gold-500/20 border border-luxury-gold-500/20 flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6 text-luxury-gold-400" />
            </div>
            <h1 className="text-lg font-bold text-white font-display">
              See How LeadLuxe Finds Verified Capital-Ready Buyers
            </h1>
            <p className="text-[10px] text-gray-500 mt-1">Book a 20-minute live demo of the AI walkthrough, source verification system, Deal Room, and investor qualification engine.</p>
          </div>

          {/* Progress */}
          <div className="flex gap-1 mb-6">
            {[0, 1, 2].map((s) => (
              <div key={s} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-luxury-gold-400' : 'bg-gray-800'}`} />
            ))}
          </div>

          {step === 0 ? (
            <div className="space-y-4">
              <p className="text-[10px] text-gray-500 mb-3">Tell us about yourself</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 mb-1 block">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-glass w-full text-xs py-2" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-1 block">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-glass w-full text-xs py-2" placeholder="you@company.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 mb-1 block">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-glass w-full text-xs py-2" placeholder="+91..." />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-1 block">Company</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="input-glass w-full text-xs py-2" placeholder="Your company" />
                </div>
              </div>
              <button onClick={() => setStep(1)} disabled={!form.name || !form.email}
                className="btn-primary w-full justify-center mt-2">
                <ArrowRight className="w-4 h-4" /> Continue
              </button>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <p className="text-[10px] text-gray-500 mb-3">About your business</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 mb-1 block">Your Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input-glass w-full text-xs py-2" placeholder="CEO, Sales Head, etc." />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-1 block">Website</label>
                  <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="input-glass w-full text-xs py-2" placeholder="https://" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-1 block">Primary Market / City</label>
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-glass w-full text-xs py-2">
                  <option value="">Select your market</option>
                  {CITIES_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-1 block">Primary Objective</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {OBJECTIVES.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setForm({ ...form, objective: opt.value })}
                      className={`text-[9px] px-2 py-1.5 rounded-lg border transition-all text-left ${
                        form.objective === opt.value
                          ? 'border-luxury-gold-400 bg-luxury-gold-500/10 text-luxury-gold-400'
                          : 'border-gray-800 text-gray-500 hover:border-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(0)} className="btn-outline flex-1 text-[10px]">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center text-[10px]">
                  <ArrowRight className="w-3 h-3" /> Select Time
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] text-gray-500 mb-3">Choose your preferred time</p>
              <div>
                <label className="text-[9px] text-gray-500 mb-1 block">Date *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-glass w-full text-xs py-2" />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-1 block">Preferred Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button key={slot} onClick={() => setForm({ ...form, time: slot })}
                      className={`text-[10px] py-2 rounded-lg border transition-all ${
                        form.time === slot
                          ? 'border-luxury-gold-400 bg-luxury-gold-500/10 text-luxury-gold-400'
                          : 'border-gray-800 text-gray-500 hover:border-gray-700'
                      }`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-gray-600">
                <Globe className="w-3 h-3" />
                <span>Timezone: IST (UTC+5:30)</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 text-[10px]">Back</button>
                <button onClick={handleSubmit} disabled={submitting || !form.date}
                  className="btn-primary flex-1 justify-center text-[10px]">
                  {submitting ? 'Booking...' : <><CalendarIcon className="w-3 h-3" /> Confirm Booking</>}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
