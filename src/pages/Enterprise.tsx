// ============================================================
// LeadLuxe AI — Enterprise / Partnerships Page (/enterprise)
// Acquisition interest funnel, partnership request, deal flow
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowRight, Check, Globe, Zap, Shield,
  Bot, BarChart3, Layers, Sparkles, ChevronRight,
  Send, Star, TrendingUp, Users
} from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';

const benefits = [
  { icon: Layers, title: 'Data & Intelligence Stack', desc: 'Access 120+ cities, 25 countries, AI opportunity engine, capital flow analysis, and infrastructure signals.' },
  { icon: Bot, title: 'Digital Twin Experience', desc: 'Personalized 3D building walkthrough with live market intelligence overlays tailored to your portfolio.' },
  { icon: BarChart3, title: 'AI Opportunity Engine', desc: 'Continuous scanning and scoring of global real estate opportunities with evidence-backed recommendations.' },
  { icon: Shield, title: 'White-Label & API Options', desc: 'Deploy LeadLuxe intelligence under your brand. Full API access for custom integrations.' },
];

const interestOptions = [
  { value: 'pilot', label: '30-Day Pilot' },
  { value: 'partnership', label: 'Strategic Partnership' },
  { value: 'white_label', label: 'White-Label / OEM' },
  { value: 'acquisition_conversation', label: 'Acquisition Conversation' },
  { value: 'demo', label: 'Live Demo' },
];

const markets = [
  'India', 'UAE', 'United Kingdom', 'United States', 'Singapore',
  'Saudi Arabia', 'Japan', 'Germany', 'France', 'Australia',
  'Canada', 'Thailand', 'Vietnam', 'Brazil', 'Multiple',
];

export function Enterprise() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    role: '',
    email: '',
    market: '',
    deal_volume: '',
    interest: 'pilot',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.email) {
      setError('Company name and email are required');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      if (supabase) {
        await supabase.from('enterprise_leads').insert({
          company_name: formData.company_name,
          website: formData.website,
          role: formData.role,
          email: formData.email,
          market: formData.market,
          monthly_deal_volume: formData.deal_volume,
          interest_type: formData.interest,
          message: formData.message,
          source: 'website',
          status: 'new',
        });
      }
      trackEvent('enterprise_page_view', {
        interest: formData.interest,
        company: formData.company_name,
        market: formData.market,
      });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Thank You</h1>
          <p className="text-sm text-gray-400 mb-6">
            We've received your inquiry and will respond within 24 hours.
            Our team will prepare a tailored overview of the LeadLuxe platform
            for your specific market and use case.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/')} className="btn-outline">
              Back to Home
            </button>
            <button onClick={() => navigate('/')} className="btn-primary">
              <Sparkles className="w-4 h-4" />
              Book a Demo
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <SEOHelmet
        title="Enterprise — AI Intelligence Layer for Global Real Estate Deal Flow"
        description="LeadLuxe analyzes infrastructure signals, capital flows, developer activity, and investor behavior to identify high-probability real estate opportunities. Partnership, white-label, and acquisition inquiries."
        url="https://leadluxe-ai.vercel.app/enterprise"
        canonical="https://leadluxe-ai.vercel.app/enterprise"
      />
      <div className="min-h-screen bg-luxury-black">
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold-500/30 bg-luxury-gold-500/10 mb-6">
              <Building2 className="w-4 h-4 text-luxury-gold-400" />
              <span className="text-[10px] font-medium text-luxury-gold-400">Enterprise Intelligence Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-display">
              AI Intelligence Layer for{' '}
              <span className="text-gradient-gold">Global Real Estate Deal Flow</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              LeadLuxe analyzes infrastructure signals, capital flows, developer activity, and investor behavior
              to identify high-probability real estate opportunities before traditional portals surface them.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
              {[
                { label: 'Global Cities', value: '120+' },
                { label: 'Data Sources', value: '50+' },
                { label: 'AI Evidence Engine', value: 'Live' },
                { label: 'Twin Matching', value: 'Active' },
                { label: 'Commission Model', value: '3%' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-2 text-center border-luxury-gold-500/10">
                  <p className="text-xs font-bold text-luxury-gold-400">{stat.value}</p>
                  <p className="text-[8px] text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Partner - 2 column layout */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Left: Benefits */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 font-display">Why Platforms Partner With LeadLuxe</h2>
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 border-luxury-gold-500/10 hover:border-luxury-gold-500/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <benefit.icon className="w-4 h-4 text-luxury-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{benefit.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{benefit.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Form */}
          <div className="glass-card p-6 border-luxury-gold-500/20 bg-luxury-black/60">
            <h3 className="text-base font-bold text-white mb-1">Strategic Partnership Request</h3>
            <p className="text-[10px] text-gray-500 mb-6">Fill this form and our team will respond within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-medium mb-1 block">Company Name *</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="input-glass w-full text-xs py-2"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-medium mb-1 block">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="input-glass w-full text-xs py-2"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-medium mb-1 block">Your Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-glass w-full text-xs py-2"
                    placeholder="CEO, Sales Head, etc."
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-medium mb-1 block">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-glass w-full text-xs py-2"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-medium mb-1 block">Primary Market</label>
                  <select
                    value={formData.market}
                    onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                    className="input-glass w-full text-xs py-2"
                  >
                    <option value="">Select market</option>
                    {markets.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-medium mb-1 block">Monthly Deal Volume</label>
                  <select
                    value={formData.deal_volume}
                    onChange={(e) => setFormData({ ...formData, deal_volume: e.target.value })}
                    className="input-glass w-full text-xs py-2"
                  >
                    <option value="">Select volume</option>
                    <option value="1-10">1-10 deals/mo</option>
                    <option value="10-50">10-50 deals/mo</option>
                    <option value="50-200">50-200 deals/mo</option>
                    <option value="200+">200+ deals/mo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-medium mb-1 block">Interested In</label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, interest: opt.value })}
                      className={cn(
                        'text-[9px] px-2.5 py-1 rounded-full border transition-all',
                        formData.interest === opt.value
                          ? 'border-luxury-gold-400 bg-luxury-gold-500/10 text-luxury-gold-400'
                          : 'border-gray-800 text-gray-500 hover:border-gray-700'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-medium mb-1 block">Message (optional)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-glass w-full text-xs py-2 min-h-[60px] resize-none"
                  placeholder="Tell us about your use case..."
                />
              </div>

              {error && (
                <p className="text-[10px] text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Acquisition CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-luxury-gold-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-3 font-display">
              Explore Acquisition or Strategic Investment
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-lg mx-auto">
              LeadLuxe AI has built a proprietary global real estate intelligence platform
              covering 120+ cities, 25 countries, with an AI opportunity engine, evidence-backed
              recommendations, and a commission-based revenue model.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setFormData({ ...formData, interest: 'acquisition_conversation' });
                  document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-primary"
              >
                <TrendingUp className="w-4 h-4" />
                Start Acquisition Conversation
              </button>
              <button onClick={() => navigate('/pilot')} className="btn-outline">
                <Users className="w-4 h-4" />
                Explore Pilot Program
              </button>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
    </>
  );
}
