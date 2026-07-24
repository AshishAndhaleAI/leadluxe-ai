// ============================================================
// LeadLuxe AI — Developer Acquisition Portal (/developers)
// Convinces verified Indian developers to partner with LeadLuxe
// to reach AI-qualified domestic and NRI investors.
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowRight, Check, Shield, Globe,
  ChevronRight, Star, TrendingUp,
  Users, DollarSign, MapPin, Award, Send, BarChart3,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';
import { COUNTRIES, CITIES } from '../lib/global-data';

const indiaData = {
  cities: CITIES.IN?.length || 27,
  projects: CITIES.IN?.reduce((s, c) => s + c.activeProjects, 0) || 0,
  avgConfidence: CITIES.IN?.length ? Math.round(CITIES.IN.reduce((s, c) => s + c.confidence, 0) / CITIES.IN.length) : 88,
};

const BENEFITS = [
  {
    icon: Users, title: 'Qualified Capital, Not Traffic',
    desc: 'Every investor is AI-assessed for budget, timeline, and intent before introduction. No unqualified leads, no wasted sales cycles.',
  },
  {
    icon: BarChart3, title: 'Real-Time Market Intelligence',
    desc: 'Your projects appear alongside live infrastructure signals, price trend data, and absorption analytics — giving investors data-driven confidence.',
  },
  {
    icon: Shield, title: 'RERA-Aligned Verification',
    desc: 'All project data is verified against government registries. Investors trust what they can independently verify.',
  },
  {
    icon: Globe, title: 'NRI & Cross-Border Capital',
    desc: 'Tap into the $125B NRI remittance market. LeadLuxe targets investors in UAE, Singapore, UK, USA, Canada, and Australia.',
  },
  {
    icon: Award, title: 'AI Developer Score',
    desc: 'Your delivery track record, compliance history, and project quality generate a transparent AI Trust Score — visible to qualified investors.',
  },
  {
    icon: DollarSign, title: 'Performance-Based Commission',
    desc: 'Success fee only when a deal closes. No upfront listing fees. No advertising costs. Pure performance-based partnership.',
  },
];

const APPLICATION_STEPS = [
  { step: '01', title: 'Submit Company Profile', desc: 'Company name, CIN, RERA registration, website, LinkedIn.' },
  { step: '02', title: 'Upload Project Details', desc: 'Project name, RERA number, construction stage, ticket size, target buyer profile.' },
  { step: '03', title: 'AI Verification', desc: 'Our engine validates MCA records, RERA status, and domain ownership automatically.' },
  { step: '04', title: 'Go Live', desc: 'Your projects appear to qualified investors with verified data, evidence, and AI scoring.' },
];

const SCORE_FACTORS = [
  { label: 'Delivery Track Record', weight: 20, icon: Building2 },
  { label: 'RERA Compliance', weight: 15, icon: Shield },
  { label: 'Financial Disclosures', weight: 15, icon: BarChart3 },
  { label: 'Construction Progress', weight: 15, icon: TrendingUp },
  { label: 'Market Absorption', weight: 15, icon: Users },
  { label: 'Buyer Sentiment', weight: 10, icon: Star },
  { label: 'Infrastructure Alignment', weight: 10, icon: MapPin },
];

export function Developers() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company: '', cin: '', rera: '', city: '', website: '', linkedin: '',
    project: '', stage: '', ticket: '', target: '', email: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.email) return;
    // Store to localStorage for now
    const leads = JSON.parse(localStorage.getItem('leadluxe-developer-leads') || '[]');
    leads.unshift({ ...formData, timestamp: new Date().toISOString() });
    localStorage.setItem('leadluxe-developer-leads', JSON.stringify(leads));
    setSubmitted(true);
  };

  return (
    <>
      <SEOHelmet
        title="Developers — Reach Qualified Capital with AI-Powered Intelligence"
        description="LeadLuxe AI connects verified Indian developers with AI-qualified domestic and NRI investors through source-backed market intelligence, RERA-aligned verification, and transaction-ready Deal Rooms."
        url="https://leadluxe-ai.vercel.app/developers"
        canonical="https://leadluxe-ai.vercel.app/developers"
      />
      <div className="min-h-screen bg-[#050505]">
      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-gold-500/[0.02] to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold-500/30 bg-luxury-gold-500/10 mb-6">
              <Building2 className="w-4 h-4 text-luxury-gold-400" />
              <span className="text-[10px] font-medium text-luxury-gold-400">Developer Partnership Platform</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 font-display">
              Reach{' '}
              <span className="text-gradient-gold">Qualified Capital</span>
              , Not Just Website Traffic
            </h1>
            <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              LeadLuxe AI connects verified Indian developers with AI-qualified domestic and NRI investors 
              through source-backed market intelligence and transaction-ready Deal Rooms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="btn-arch-filled group text-sm tracking-[0.12em]"
              >
                Apply as Developer Partner
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/demo')}
                className="btn-arch text-xs tracking-[0.12em]"
              >
                Request Intelligence Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Strip ────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: `${indiaData.cities}`, label: 'Indian Cities Covered', icon: MapPin },
            { value: `${indiaData.projects}+`, label: 'Projects Indexed', icon: Building2 },
            { value: `${indiaData.avgConfidence}%`, label: 'AI Data Confidence', icon: Award },
            { value: '3%', label: 'Performance Fee', icon: DollarSign },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              <p className="text-2xl font-bold text-luxury-gold-400 font-display">{stat.value}</p>
              <p className="text-[9px] text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Benefits ───────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center font-display">
            Why Developers Choose LeadLuxe
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-luxury-gold-500/20 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 flex items-center justify-center mb-3 group-hover:bg-luxury-gold-500/20 transition-colors">
                  <benefit.icon className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{benefit.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Developer Score ─────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#050505] border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
                Transparent Scoring
              </span>
              <h2 className="text-2xl font-bold text-white mb-4 font-display">
                AI Developer Trust Score
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Every developer partner receives a transparent AI Trust Score based on 
                publicly verifiable data. This score is visible to qualified investors and 
                helps them make informed decisions.
              </p>
              <div className="space-y-2">
                {SCORE_FACTORS.map((factor) => (
                  <div key={factor.label} className="flex items-center gap-2">
                    <factor.icon className="w-3 h-3 text-luxury-gold-400/60" />
                    <span className="text-[10px] text-gray-400 flex-1">{factor.label}</span>
                    <div className="w-24 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-luxury-gold-500"
                        style={{ width: `${factor.weight}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-600 w-8 text-right">{factor.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-[10px] text-gray-500 mb-4">Example Score Breakdown</p>
              <div className="w-28 h-28 rounded-full border-4 border-luxury-gold-500/30 flex items-center justify-center mx-auto mb-4">
                <div>
                  <p className="text-3xl font-bold text-luxury-gold-400 font-display">86</p>
                  <p className="text-[8px] text-gray-500">/100</p>
                </div>
              </div>
              <div className="space-y-1 text-[10px] text-left">
                {[
                  { label: 'Delivery Reliability', value: '92/100', color: 'text-emerald-400' },
                  { label: 'Compliance Rating', value: '88/100', color: 'text-emerald-400' },
                  { label: 'Capital Readiness', value: '82/100', color: 'text-luxury-gold-400' },
                  { label: 'NRI Appeal Index', value: '78/100', color: 'text-blue-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={cn('font-medium', row.color)}>{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-gray-600 mt-4 border-t border-white/[0.04] pt-3">
                Score derived from: RERA compliance, delivery history, financial disclosures, construction progress, market absorption, buyer sentiment, and infrastructure alignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Application Process ────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center font-display">
            Become a Developer Partner
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {APPLICATION_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <span className="text-2xl font-bold text-luxury-gold-500/30 font-display">{step.step}</span>
                <h3 className="text-sm font-semibold text-white mt-2 mb-1">{step.title}</h3>
                <p className="text-[10px] text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Application Form (shown after CTA click) */}
          {showForm && !submitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              <h3 className="text-sm font-bold text-white mb-4">Developer Partner Application</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1 block">Company Name *</label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700" placeholder="Legal name" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1 block">CIN Number</label>
                    <input type="text" value={formData.cin} onChange={(e) => setFormData({...formData, cin: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700" placeholder="L12345MH2020PLC123456" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1 block">RERA Registration</label>
                    <input type="text" value={formData.rera} onChange={(e) => setFormData({...formData, rera: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700" placeholder="RERA number" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1 block">Headquarters City</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700" placeholder="Mumbai, Pune, etc." />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1 block">Website</label>
                    <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700" placeholder="https://" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1 block">Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700" placeholder="partner@company.com" />
                  </div>
                </div>

                <div className="border-t border-white/[0.04] pt-4">
                  <p className="text-[9px] text-gray-500 mb-3">Project Information (optional for initial application)</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-gray-500 mb-1 block">Project Name</label>
                      <input type="text" value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700" />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 mb-1 block">Construction Stage</label>
                      <select value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white">
                        <option value="">Select stage</option>
                        <option value="pre_launch">Pre-Launch</option>
                        <option value="under_construction">Under Construction</option>
                        <option value="ready">Ready to Move</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 mb-1 block">Ticket Size Range</label>
                      <select value={formData.ticket} onChange={(e) => setFormData({...formData, ticket: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white">
                        <option value="">Select range</option>
                        <option value="50L-2Cr">₹50L – ₹2Cr</option>
                        <option value="2Cr-5Cr">₹2Cr – ₹5Cr</option>
                        <option value="5Cr-10Cr">₹5Cr – ₹10Cr</option>
                        <option value="10Cr+">₹10Cr+</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 mb-1 block">Target Buyer</label>
                      <input type="text" value={formData.target} onChange={(e) => setFormData({...formData, target: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700" placeholder="NRI / Domestic / Both" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-arch-filled w-full justify-center text-sm tracking-[0.12em]">
                  <Send className="w-4 h-4" />
                  Submit Application
                </button>
                <p className="text-[8px] text-gray-600 text-center">Our team will review and respond within 48 hours.</p>
              </form>
            </motion.div>
          )}

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center p-8"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Application Received</h3>
              <p className="text-sm text-gray-400 mb-4">
                Thank you for applying. Our partnerships team will review your application 
                and respond within 48 hours with the next steps.
              </p>
              <button onClick={() => navigate('/')} className="btn-arch text-xs">
                Back to Home
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── Verification Footprint ─────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03] bg-[#050505]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
            Verification Footprint
          </span>
          <h2 className="text-2xl font-bold text-white mb-6 font-display">
            Real Infrastructure, Real Data
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto mb-8">
            Every number below represents a real data source, verified record, or connected system. 
            No fabricated metrics, no inflated counts.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { value: `${indiaData.projects}+`, label: 'RERA Records Indexed', desc: 'Government-registered projects' },
              { value: `${indiaData.cities}`, label: 'Cities Covered', desc: 'Tier-1 & Tier-2 Indian markets' },
              { value: '25+', label: 'Verified Developers', desc: 'Public & private companies' },
              { value: '27', label: 'Infrastructure Datasets', desc: 'Metro, NHAI, planning portals' },
              { value: '6', label: 'Research Sources', desc: 'JLL, CBRE, Knight Frank, Savills, Colliers, RBI' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <p className="text-xl font-bold text-luxury-gold-400 font-display">{item.value}</p>
                <p className="text-[10px] text-white font-medium mt-1">{item.label}</p>
                <p className="text-[8px] text-gray-600 mt-0.5">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ──────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4 font-display">
            Ready to Partner?
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-lg mx-auto">
            Join India's first AI-powered real estate introduction platform. 
            Reach qualified capital, showcase your projects with verified data, 
            and close deals faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="btn-arch-filled group text-sm tracking-[0.12em]"
            >
              Apply Now
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/enterprise')}
              className="btn-arch text-xs tracking-[0.12em]"
            >
              Enterprise Inquiry
            </button>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
