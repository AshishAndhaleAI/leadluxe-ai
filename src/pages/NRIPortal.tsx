// ============================================================
// LeadLuxe AI — NRI Investor Portal (/nri)
// Dedicated route for global Indian investors across
// UAE, Singapore, UK, USA, Canada, and Australia.
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Globe, MapPin, TrendingUp, Shield, ChevronRight,
  Check, Star, DollarSign, ArrowRight, ExternalLink,
  Building2, BarChart3, Target, Send, Users, Award,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES } from '../lib/global-data';

const NRI_MARKETS = [
  { code: 'AE', name: 'UAE', flag: '🇦🇪', investors: '850K', capital: '$38B', cities: ['Dubai', 'Abu Dhabi', 'Sharjah'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', investors: '350K', capital: '$18B', cities: ['Singapore'] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', investors: '1.5M', capital: '$22B', cities: ['London', 'Manchester', 'Birmingham'] },
  { code: 'US', name: 'United States', flag: '🇺🇸', investors: '4.4M', capital: '$45B', cities: ['New York', 'San Francisco', 'Chicago', 'Austin'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', investors: '1.2M', capital: '$12B', cities: ['Toronto', 'Vancouver', 'Montreal'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', investors: '700K', capital: '$8B', cities: ['Sydney', 'Melbourne', 'Brisbane'] },
];

const INDIA_HIGHLIGHTS = [
  { city: 'Mumbai', growth: '8.5%', yield: '12.4%', projects: 142, tags: ['luxury', 'commercial'] },
  { city: 'Bengaluru', growth: '10.8%', yield: '14.2%', projects: 156, tags: ['it-hub', 'luxury'] },
  { city: 'Hyderabad', growth: '14.5%', yield: '17.2%', projects: 112, tags: ['it-hub', 'affordable'] },
  { city: 'Pune', growth: '12.3%', yield: '15.8%', projects: 98, tags: ['it-hub', 'luxury'] },
  { city: 'Delhi NCR', growth: '6.2%', yield: '10.5%', projects: 89, tags: ['luxury', 'commercial'] },
  { city: 'Chennai', growth: '9.1%', yield: '13.6%', projects: 76, tags: ['affordable', 'it-hub'] },
];

export function NRIPortal() {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState('AE');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const signups = JSON.parse(localStorage.getItem('leadluxe-nri-signups') || '[]');
    signups.unshift({ email, market: selectedMarket, timestamp: new Date().toISOString() });
    localStorage.setItem('leadluxe-nri-signups', JSON.stringify(signups));
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold-500/30 bg-luxury-gold-500/10 mb-6">
              <Globe className="w-4 h-4 text-luxury-gold-400" />
              <span className="text-[10px] font-medium text-luxury-gold-400">Global Indian Investors</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 font-display">
              Verified Indian Real Estate for{' '}
              <span className="text-gradient-gold">Global Investors</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Explore source-verified opportunities across Mumbai, Bengaluru, Hyderabad, Delhi NCR, Pune, 
              and 22 more Indian cities — backed by RERA records, government data, and institutional research.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/deal-room')}
                className="btn-arch-filled group text-sm tracking-[0.12em]"
              >
                Explore Opportunities
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/report/pune-kharadi-premium')}
                className="btn-arch text-xs tracking-[0.12em]"
              >
                Request AI Deal Report
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── NRI Market Stats ───────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-gray-500 mb-4 text-center">NRI remittances to India reached $125B in 2025 · 12-15% directed into real estate · Source: World Bank / RBI</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {NRI_MARKETS.map((market) => (
              <motion.button
                key={market.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => setSelectedMarket(market.code)}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  selectedMarket === market.code
                    ? 'border-luxury-gold-500/40 bg-luxury-gold-500/10'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                )}
              >
                <span className="text-2xl block mb-1">{market.flag}</span>
                <p className="text-xs font-semibold text-white">{market.name}</p>
                <p className="text-[9px] text-gray-500">{market.investors} investors</p>
              </motion.button>
            ))}
          </div>

          {/* Selected market details */}
          {(() => {
            const m = NRI_MARKETS.find(x => x.code === selectedMarket);
            if (!m) return null;
            return (
              <motion.div
                key={m.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{m.flag}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{m.name}</p>
                    <p className="text-[10px] text-gray-500">{m.investors} investors · {m.capital} capital to India</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-400">
                  <span>Key cities: {m.cities.join(', ')}</span>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </section>

      {/* ─── Indian City Highlights ─────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center font-display">
            High-Growth Indian Markets
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INDIA_HIGHLIGHTS.map((city, i) => {
              const cityData = CITIES.IN?.find(c => c.name === city.city);
              return (
                <motion.button
                  key={city.city}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/city/${city.city.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-luxury-gold-500/20 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-luxury-gold-400 transition-colors">{city.city}</h3>
                    <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-luxury-gold-400 transition-colors" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <p className="text-emerald-400 font-semibold">{city.growth}</p>
                      <p className="text-[8px] text-gray-600">Growth</p>
                    </div>
                    <div>
                      <p className="text-luxury-gold-400 font-semibold">{city.yield}</p>
                      <p className="text-[8px] text-gray-600">Avg Yield</p>
                    </div>
                    <div>
                      <p className="text-blue-400 font-semibold">{city.projects}</p>
                      <p className="text-[8px] text-gray-600">Projects</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {city.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[8px] text-gray-500">{tag}</span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Why NRI Investors Choose LeadLuxe ──────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center font-display">
            Built for Cross-Border Investors
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Verified RERA Data', desc: 'Every project is cross-checked against government registries. No fake listings, no unverifiable claims.' },
              { icon: Globe, title: 'Currency-Aware Intelligence', desc: 'View prices in INR, AED, USD, GBP, SGD. AI calculates currency-adjusted returns for your home market.' },
              { icon: Award, title: 'Source-Backed Evidence', desc: 'Every field — developer, address, RERA number — includes a source URL. You verify before you invest.' },
              { icon: Building2, title: 'Digital Twin Walkthrough', desc: 'Explore properties through 3D digital twins with live market intelligence overlays — from anywhere in the world.' },
              { icon: Target, title: 'AI Investment Memo', desc: 'Generate institutional-grade PDF reports with market analysis, comparable transactions, and risk assessment.' },
              { icon: Users, title: 'Dedicated NRI Support', desc: 'Dedicated relationship managers for cross-border compliance, tax advisory, and developer introductions.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <item.icon className="w-5 h-5 text-luxury-gold-400 mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stay Updated ───────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03] bg-[#050505]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
                For Global Indian Investors
              </span>
              <h2 className="text-2xl font-bold text-white mb-4 font-display">
                Stay Updated on Indian Opportunities
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Get weekly AI-curated opportunities matching your investment preferences — 
                city, budget, asset type, and risk profile. No spam, no irrelevant listings.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-700 focus:border-luxury-gold-500/30 transition-colors"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-arch-filled text-xs tracking-[0.12em] whitespace-nowrap">
                    <Send className="w-3.5 h-3.5" />
                    Subscribe
                  </button>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-400 text-sm">
                  <Check className="w-5 h-5" />
                  You're subscribed. We'll send your first opportunity brief within 24 hours.
                </motion.div>
              )}
              <p className="text-[8px] text-gray-600 mt-3">No spam. Unsubscribe anytime. We respect your inbox.</p>
            </div>

            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[10px] text-gray-500 mb-3">What NRI investors receive weekly</p>
              <div className="space-y-3">
                {[
                  'Top 5 opportunities matching your profile',
                  'Infrastructure & metro project updates',
                  'Developer trust scores & delivery track records',
                  'Currency-adjusted return projections',
                  'Exclusive pre-launch access to verified projects',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ──────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4 font-display">
            Start Exploring
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-lg mx-auto">
            Browse 27 Indian cities, 25+ verified developers, and hundreds of AI-ranked opportunities — 
            all backed by source-verified data and institutional research.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/deal-room')} className="btn-arch-filled group text-sm tracking-[0.12em]">
              Browse Opportunities
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/country/in')} className="btn-arch text-xs tracking-[0.12em]">
              View All Indian Cities
            </button>
          </div>
          <p className="text-[9px] text-white/10 font-mono mt-8">
            Data sources: MahaRERA · State RERA Portals · World Bank · RBI · JLL India · Knight Frank India
          </p>
        </div>
      </section>
    </div>
  );
}
