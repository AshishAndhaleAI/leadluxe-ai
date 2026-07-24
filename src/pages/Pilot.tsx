// ============================================================
// LeadLuxe AI — Pilot Program Page (/pilot)
// 30-Day AI Deal Flow Pilot offering
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Check, ArrowRight, Building2, CalendarIcon,
  BarChart3, Bell, Bot, FileText, Target, ChevronRight,
  Star, Shield, Send
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEOHelmet } from '../components/seo/SEOHelmet';

const pilotIncludes = [
  { icon: BarChart3, text: 'City intelligence dashboard with live market metrics' },
  { icon: Bell, text: 'Daily opportunity alerts matched to your portfolio' },
  { icon: Bot, text: 'AI Investor Twin configured for your company' },
  { icon: FileText, text: 'Evidence-backed weekly investment briefs' },
  { icon: Target, text: 'Personalized deal-flow matching engine' },
  { icon: CalendarIcon, text: 'Weekly strategy review with our intelligence team' },
];

const pilotExpectations = [
  'Access to one of your active projects for anonymized benchmarking',
  'Two 30-minute feedback sessions during the pilot',
  'Permission to create an anonymized case study upon completion',
];

export function Pilot() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ company: '', email: '', name: '', market: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.email) return;
    setSubmitting(true);
    try {
      if (supabase) {
        await supabase.from('enterprise_leads').insert({
          company_name: form.company,
          email: form.email,
          market: form.market,
          interest_type: 'pilot',
          message: `Pilot program interest from ${form.name || form.company}`,
          status: 'new',
          source: 'pilot_page',
        });
      }
      setSubmitted(true);
    } catch {} finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Pilot Application Received</h1>
          <p className="text-sm text-gray-400 mb-6">We'll reach out within 24 hours to set up your 30-Day Pilot.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <SEOHelmet
        title="30-Day AI Deal Flow Pilot — LeadLuxe AI"
        description="Experience LeadLuxe AI with your actual portfolio. Get personalized intelligence, opportunity matching, and weekly strategy briefs — at no cost for 30 days. No commitment required."
        url="https://leadluxe-ai.vercel.app/pilot"
        canonical="https://leadluxe-ai.vercel.app/pilot"
      />
      <div className="min-h-screen bg-luxury-black">
        {/* Hero */}
        <section className="relative pt-24 pb-12 px-4">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold-500/30 bg-luxury-gold-500/10 mb-6">
                <Star className="w-4 h-4 text-luxury-gold-400" />
                <span className="text-[10px] font-medium text-luxury-gold-400">Limited Availability</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 font-display">
                30-Day <span className="text-gradient-gold">AI Deal Flow Pilot</span>
              </h1>
              <p className="text-base text-gray-400 max-w-xl mx-auto">
                Experience LeadLuxe AI with your actual portfolio. Get personalized intelligence,
                opportunity matching, and weekly strategy briefs — at no cost for 30 days.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Left: What you get */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">What the Pilot Includes</h2>
              <div className="space-y-3">
                {pilotIncludes.map((item, i) => (
                  <motion.div
                    key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-luxury-black/40 border border-gray-800/50"
                  >
                    <item.icon className="w-4 h-4 text-luxury-gold-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <h2 className="text-lg font-bold text-white mt-8 mb-4">What We Request</h2>
              <div className="space-y-2">
                {pilotExpectations.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <ArrowRight className="w-3 h-3 text-luxury-gold-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10">
                <p className="text-xs text-luxury-gold-400 font-medium">No commitment required.</p>
                <p className="text-[10px] text-gray-500 mt-1">If LeadLuxe doesn't deliver measurable value in 30 days, you owe nothing. No invoices, no follow-up calls.</p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="glass-card p-6 border-luxury-gold-500/20 bg-luxury-black/60">
              <h3 className="text-sm font-bold text-white mb-4">Apply for the Pilot</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] text-gray-500 mb-1 block">Company Name</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="input-glass w-full text-xs py-2" placeholder="Your company" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1 block">Your Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-glass w-full text-xs py-2" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1 block">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-glass w-full text-xs py-2" placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-1 block">Primary Market</label>
                  <input type="text" value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })}
                    className="input-glass w-full text-xs py-2" placeholder="e.g. Pune, India" />
                </div>
                <button type="submit" disabled={submitting}
                  className="btn-primary w-full justify-center">
                  {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Apply for Pilot</>}
                </button>
                <p className="text-[8px] text-gray-600 text-center">We'll respond within 24 hours to set up your pilot.</p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
