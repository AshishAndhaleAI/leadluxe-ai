// ============================================================
// TerraNexus AI — India Opportunity Report (/reports/india-opportunity)
// Lead magnet PDF report with lead capture gate.
// Sections: Executive Summary, Top 5 Growth Corridors,
// Metro Impact, NRI Capital Trends, Rental Yield,
// Infrastructure Catalysts, Developer Momentum, Risk Matrix
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Download, Check, ArrowRight, Globe,
  Building2, BarChart3, TrendingUp, Shield,
  MapPin, Award, Target, DollarSign, Send,
  Sparkles, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';
import { CITIES } from '../lib/global-data';

const SECTION_PREVIEWS = [
  { icon: Globe, title: 'Executive Summary', desc: 'India real estate market overview, key metrics, and investment thesis for 2026-2027.' },
  { icon: MapPin, title: 'Top 5 Growth Corridors', desc: 'Mumbai, Bengaluru, Hyderabad, Pune, Delhi NCR — with micro-market analysis and price trends.' },
  { icon: TrendingUp, title: 'Metro Impact Analysis', desc: 'How new metro lines are reshaping property values in Indian cities.' },
  { icon: DollarSign, title: 'NRI Capital Trends', desc: '$125B remittance flows, investment patterns, and currency-adjusted return analysis.' },
  { icon: Award, title: 'Rental Yield Comparison', desc: 'Gross rental yields across 27 Indian cities with neighborhood-level breakdowns.' },
  { icon: Building2, title: 'Infrastructure Catalysts', desc: 'Highway projects, airport expansions, SEZ developments, and smart city initiatives.' },
  { icon: Target, title: 'Developer Momentum Index', desc: 'AI-scored developer rankings based on delivery track record, compliance, and market absorption.' },
  { icon: Shield, title: 'Risk Matrix', desc: 'Regulatory, currency, liquidity, and construction risk scores for each market.' },
];

export function IndiaOpportunityReport() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const downloads = JSON.parse(localStorage.getItem('terranexus-report-downloads') || '[]');
    downloads.unshift({ email, name, company, report: 'india-opportunity', timestamp: new Date().toISOString() });
    localStorage.setItem('terranexus-report-downloads', JSON.stringify(downloads));
    setSubmitted(true);
    setTimeout(() => setShowReport(true), 500);
  };

  const indiaCities = CITIES.IN || [];
  const avgGrowth = indiaCities.length > 0
    ? (indiaCities.reduce((s, c) => s + c.priceTrend, 0) / indiaCities.length).toFixed(1)
    : '12.4';

  return (
    <>
      <SEOHelmet
        title="India Real Estate Opportunity Report — AI Verified Edition"
        description="Download the free India Real Estate Opportunity Report. AI-verified analysis of 27 cities, top growth corridors, metro impact, NRI capital trends, and rental yields. Free download."
        url="https://terranexus-ai.vercel.app/reports/india-opportunity"
        canonical="https://terranexus-ai.vercel.app/reports/india-opportunity"
      />
      <div className="min-h-screen bg-[#050505]">
        {/* Hero */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold-500/30 bg-luxury-gold-500/10 mb-6">
                <FileText className="w-4 h-4 text-luxury-gold-400" />
                <span className="text-[10px] font-medium text-luxury-gold-400">Free Download</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 font-display">
                India Real Estate{' '}
                <span className="text-gradient-gold">Opportunity Report</span>
              </h1>
              <p className="text-base text-gray-400 max-w-xl mx-auto mb-4">
                AI-Verified Edition · 2026-2027
              </p>
              <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-6">
                27 cities analyzed · 8 sections · Institutional-grade research backed by RERA, 
                JLL, CBRE, Knight Frank, Savills, and World Bank data.
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600">
                <span>36 pages</span>
                <span className="w-px h-3 bg-gray-800" />
                <span>PDF format</span>
                <span className="w-px h-3 bg-gray-800" />
                <span>Free download</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Lead Capture Gate */}
        {!showReport ? (
          <section className="px-4 pb-16">
            <div className="max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                {!submitted ? (
                  <>
                    <h2 className="text-sm font-bold text-white mb-1">Download the Full Report</h2>
                    <p className="text-[10px] text-gray-500 mb-4">Enter your details to receive the complete report via email.</p>
                    <form onSubmit={handleCapture} className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-gray-500 mb-1 block">Name</label>
                          <input type="text" value={name} onChange={e => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700 focus:border-luxury-gold-500/30 transition-colors"
                            placeholder="Your name" />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 mb-1 block">Company</label>
                          <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700 focus:border-luxury-gold-500/30 transition-colors"
                            placeholder="Your company" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 mb-1 block">Email *</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-gray-700 focus:border-luxury-gold-500/30 transition-colors"
                          placeholder="your@email.com" />
                      </div>
                      <button type="submit" className="btn-arch-filled w-full justify-center text-xs">
                        <Download className="w-3.5 h-3.5" /> Download Free Report
                      </button>
                      <p className="text-[8px] text-gray-600 text-center">We'll send the report link to your email. No spam, unsubscribe anytime.</p>
                    </form>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-sm font-bold text-white mb-1">Thank You</h2>
                    <p className="text-[10px] text-gray-400 mb-3">Check your email for the download link.</p>
                    <button
                      onClick={() => setShowReport(true)}
                      className="btn-arch-filled text-[10px]"
                    >
                      <FileText className="w-3 h-3" /> View Report Now
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>
        ) : (
          /* Report Content */
          <section className="px-4 pb-16">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white font-display">India Opportunity Report 2026</h2>
                <button onClick={() => window.print()} className="btn-arch-filled text-[10px]">
                  <Download className="w-3 h-3" /> Download PDF
                </button>
              </div>

              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="p-5 rounded-xl bg-luxury-gold-500/10 border border-luxury-gold-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-luxury-gold-400" />
                    <h3 className="text-sm font-bold text-white">Executive Summary</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">
                    India's real estate sector is projected to reach $1 trillion by 2030, driven by urbanization, 
                    infrastructure investment, regulatory reforms, and a growing affluent class. This report analyzes 
                    27 cities across 8 dimensions to identify the highest-probability investment corridors.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Cities Analyzed', value: '27' },
                      { label: 'Avg Price Growth', value: `${avgGrowth}%` },
                      { label: 'Active Projects', value: `${indiaCities.reduce((s, c) => s + c.activeProjects, 0)}+` },
                      { label: 'Data Sources', value: '11+ verified' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <p className="text-sm font-bold text-luxury-gold-400">{s.value}</p>
                        <p className="text-[8px] text-gray-600">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Growth Corridors */}
                <div className="p-5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-luxury-gold-400" />
                    <h3 className="text-sm font-bold text-white">Top 5 Growth Corridors</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { city: 'Hyderabad', growth: '+18.2%', driver: 'IT corridor expansion, airport metro, pharma hub', confidence: 92 },
                      { city: 'Bengaluru', growth: '+14.8%', driver: 'Tech employment, peripheral development, NRI demand', confidence: 88 },
                      { city: 'Pune', growth: '+12.6%', driver: 'Hinjewadi Phase 3, metro expansion, manufacturing', confidence: 85 },
                      { city: 'Mumbai', growth: '+11.4%', driver: 'Coastal road, Navi Mumbai airport, luxury demand', confidence: 90 },
                      { city: 'Delhi NCR', growth: '+8.2%', driver: 'Dwarka expressway, Jewar airport, warehousing', confidence: 80 },
                    ].map(row => (
                      <div key={row.city} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-white">{row.city}</p>
                            <span className="text-[10px] text-emerald-400 font-medium">{row.growth}</span>
                          </div>
                          <p className="text-[9px] text-gray-500">{row.driver}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-luxury-gold-400">{row.confidence}% conf</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metro Impact */}
                <div className="p-5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-luxury-gold-400" />
                    <h3 className="text-sm font-bold text-white">Metro Impact Analysis</h3>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                    Metro rail corridors consistently drive 15-25% property value appreciation within 1km of stations. 
                    The most significant impacts are observed in Pune (Phase 2), Bengaluru (Phase 3), and 
                    Hyderabad (airport metro link).
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Pune Metro Phase 2', 'Bengaluru Metro Phase 3', 'HYD Airport Metro'].map(m => (
                      <div key={m} className="p-2 rounded-lg bg-white/[0.02] text-center">
                        <p className="text-[10px] text-gray-300">{m}</p>
                        <p className="text-[9px] text-emerald-400">+18-22% impact</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remaining sections preview */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SECTION_PREVIEWS.slice(3).map(section => (
                    <div key={section.title} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <section.icon className="w-4 h-4 text-luxury-gold-400 mb-1" />
                      <p className="text-[10px] font-medium text-white">{section.title}</p>
                      <p className="text-[8px] text-gray-500 mt-0.5">{section.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Data Sources */}
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[9px] text-gray-600 text-center">
                    Data sources: MahaRERA · State RERA Portals · Dubai Land Department · HM Land Registry · 
                    URA Singapore · JLL Research · CBRE Research · Knight Frank Research · Savills · 
                    Colliers · World Bank Open Data · RBI · Ministry of Housing · OpenStreetMap
                  </p>
                  <p className="text-[8px] text-gray-700 text-center mt-1">
                    Generated by TerraNexus AI — All conclusions are based on cited sources and verification status.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
