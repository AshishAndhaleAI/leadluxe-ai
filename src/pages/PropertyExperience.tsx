// ============================================================
// LeadLuxe AI — Property Experience (Production Slice)
//
// ONE property through a complete cinematic walkthrough →
// property detail → Deal Room onboarding → AI Deal Report.
//
// This is NOT a general-purpose page. It connects existing
// systems (CinematicWalkthrough, DealRoomOnboarding,
// DealPassport, DealReport) into a single property journey.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, DollarSign, Shield, ChevronRight,
  ExternalLink, CheckCircle, FileText, Download,
  Star, Award, Target, Globe, BarChart3,
  TrendingUp, Clock, X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getPropertyById, getPropertyDatabase } from '../lib/property-database';
import type { VerificationStatus } from '../lib/property-database';
import { COUNTRIES, CITIES } from '../lib/global-data';
import { DealRoomOnboarding } from '../components/deal/DealRoomOnboarding';
import { createDealPassport } from '../components/deal/DealPassport';
import { SEOHelmet } from '../components/seo/SEOHelmet';

// ─── Helpers ────────────────────────────────────────────────
function formatPrice(price: number, cc: string): string {
  if (cc === 'IN') {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  }
  return `$${price >= 1000000 ? (price / 1000000).toFixed(2) + 'M' : price.toLocaleString()}`;
}

function getVerificationBadge(status: VerificationStatus): { label: string; color: string; icon: any } {
  const map: Record<string, { label: string; color: string; icon: any }> = {
    VERIFIED: { label: 'Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
    PARTIAL: { label: 'Partial', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Clock },
    UNVERIFIED: { label: 'Unverified', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30', icon: Shield },
    STALE: { label: 'Stale', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: X },
  };
  return map[status] || map.UNVERIFIED;
}

type Section = 'hero' | 'walkthrough' | 'details' | 'evidence' | 'dealroom' | 'report' | 'map';

export function PropertyExperience() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('hero');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dealPassportId, setDealPassportId] = useState<string | null>(null);

  // Find property by slug — show its actual verification status
  const property = useMemo(() => {
    // Try slug first, then try by property ID
    const found = getPropertyById(slug || '') ||
      getPropertyDatabase().find(p => p.slug === slug) ||
      getPropertyDatabase().find(p => p.countryCode === 'IN'); // fallback to first Indian property
    return found || null;
  }, [slug]);

  // City data from global-data.ts
  const cityData = useMemo(() => {
    if (!property) return null;
    return Object.values(CITIES).flat().find(c =>
      c.name.toLowerCase() === property.city.toLowerCase()
    );
  }, [property]);

  const countryData = useMemo(() => {
    if (!property) return null;
    return COUNTRIES.find(c => c.code === property.countryCode);
  }, [property]);

  // ─── Deal Room Onboarding ────────────────────────────
  const handleExpressInterest = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = useCallback((passportId: string) => {
    setDealPassportId(passportId);
    setShowOnboarding(false);
  }, []);

  // ─── Sections ─────────────────────────────────────────────
  const sections = [
    { id: 'hero' as Section, label: 'Introduction' },
    { id: 'walkthrough' as Section, label: 'Walkthrough' },
    { id: 'details' as Section, label: 'Details' },
    { id: 'evidence' as Section, label: 'Evidence' },
    { id: 'dealroom' as Section, label: 'Deal Room' },
    { id: 'report' as Section, label: 'Report' },
    { id: 'map' as Section, label: 'Location' },
  ];

  if (!property) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Property Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">This property doesn't exist in our database.</p>
          <button onClick={() => navigate('/deal-room')} className="btn-arch text-xs">
            Browse Deal Room
          </button>
        </div>
      </div>
    );
  }

  const p = property;
  const VerifBadge = getVerificationBadge(p.verification.status).icon;

  return (
    <>
      <SEOHelmet
        title={`${p.name} — ${p.developer_name} | LeadLuxe AI`}
        description={`${p.name} by ${p.developer_name} in ${p.city}, ${p.country}. ${p.description?.slice(0, 150)}`}
      />

      <div className="min-h-screen bg-[#050505]">
        {/* ─── Navigation ──────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference pointer-events-none">
          <div className="flex items-center justify-between px-6 sm:px-10 lg:px-16 h-16">
            <button
              onClick={() => navigate('/')}
              className="pointer-events-auto flex items-center gap-2 group"
            >
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full group-hover:bg-white transition-colors" />
              <span className="text-[9px] text-white/40 group-hover:text-white/70 tracking-[0.2em] uppercase font-mono transition-colors">
                LeadLuxe AI
              </span>
            </button>
            <div className="pointer-events-auto flex items-center gap-4">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={cn(
                    'text-[8px] font-mono tracking-[0.15em] uppercase transition-colors hidden lg:block',
                    activeSection === s.id ? 'text-white/60' : 'text-white/20 hover:text-white/40'
                  )}
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => navigate('/login')}
                className="pointer-events-auto text-[9px] text-white/40 hover:text-white/70 tracking-[0.15em] uppercase font-mono transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </nav>

        {/* ─── SECTION 1: Hero ─────────────────────────── */}
        <section id="section-hero" className="relative w-full h-screen">
          <div className="absolute inset-0">
            <img
              src={p.hero_url}
              alt={p.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/20 to-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/50 via-transparent to-[#050505]/30" />
          </div>

          <div className="relative z-10 h-full flex items-end pb-20 sm:pb-24">
            <div className="px-6 sm:px-10 lg:px-16 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                {/* Verification badge — shows real status */}
                <div className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-medium mb-4',
                  getVerificationBadge(p.verification.status).color
                )}>
                  <VerifBadge className="w-3 h-3" />
                  {getVerificationBadge(p.verification.status).label} — Data from property database
                </div>

                <span className="editorial-label text-luxury-gold-400/60 mb-3 block">
                  {p.developer_name}
                </span>
                <h1 className="heading-xl text-white mb-3">
                  {p.name}
                </h1>
                <p className="body-lg text-gray-400 max-w-xl mb-6">
                  {p.city}, {p.country} · {p.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} · {formatPrice(p.price_min, p.countryCode)} — {formatPrice(p.price_max, p.countryCode)}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveSection('details');
                      document.getElementById('section-details')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-arch-filled group text-sm tracking-[0.12em]"
                  >
                    View Property Details
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleExpressInterest}
                    className="btn-arch text-xs tracking-[0.12em]"
                  >
                    Express Interest
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: Walkthrough ──────────────────── */}
        <section id="section-walkthrough" className="py-16 sm:py-20 lg:py-24">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="max-w-5xl mx-auto">
              <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
                Cinematic Walkthrough
              </span>
              <h2 className="heading-lg text-white mb-6">
                Enter {p.name}
              </h2>

              {/* Image gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                {p.images.slice(0, 4).map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-default border border-white/[0.06]"
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="absolute bottom-2 left-2 text-[9px] text-white/80 font-mono">{img.caption}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Walkthrough spaces */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Exterior', desc: `The ${p.property_type} tower rises in the heart of ${p.city}, designed to contemporary architectural standards.` },
                  { label: 'Entrance', desc: 'Grand entrance with concierge service, water features, and landscaped surroundings.' },
                  { label: 'Lobby', desc: `Double-height lobby with ${p.amenities.slice(0, 2).join(' and ').toLowerCase()}.` },
                  { label: 'Residences', desc: `${p.unit_types.length} configurations: ${p.unit_types.map(u => `${u.bedrooms}BHK`).join(', ')}.` },
                  { label: 'Amenities', desc: `${p.amenities.length} amenities including ${p.amenities.slice(0, 3).join(', ')}.` },
                  { label: 'Investment View', desc: `From ${formatPrice(p.price_min, p.countryCode)}. Commission: ${formatPrice(p.estimated_commission, p.countryCode)}.` },
                ].map((space, i) => (
                  <motion.div
                    key={space.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 flex items-center justify-center mb-2">
                      <span className="text-[10px] font-bold text-luxury-gold-400">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{space.label}</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{space.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: Property Details ─────────────── */}
        <section id="section-details" className="py-16 sm:py-20 lg:py-24 bg-[#050505] border-t border-white/[0.03]">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="max-w-5xl mx-auto">
              <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
                Property Data
              </span>
              <h2 className="heading-lg text-white mb-8">
                Database Records
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Data table */}
                <div className="space-y-3">
                  {[
                    { field: 'Developer', value: p.developer_name, source: 'Property database', type: 'data' },
                    { field: 'City', value: `${p.city}, ${p.country}`, source: 'GeoNames coordinates', type: 'data' },
                    { field: 'Coordinates', value: `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`, source: 'City-level', type: 'data' },
                    { field: 'RERA Number', value: p.rera_number || 'Not registered', source: p.rera_number ? 'Database record' : 'Not available', type: p.rera_number ? 'data' : 'pending' },
                    { field: 'Property Type', value: p.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), source: 'Database classification', type: 'data' },
                    { field: 'Status', value: p.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), source: 'Database record', type: 'data' },
                    { field: 'Total Units', value: `${p.total_units}`, source: 'Database estimate', type: 'data' },
                    { field: 'Available', value: `${p.available_units} units (${Math.round(p.available_units / p.total_units * 100)}%)`, source: 'Database estimate', type: 'data' },
                    { field: 'Price Range', value: `${formatPrice(p.price_min, p.countryCode)} — ${formatPrice(p.price_max, p.countryCode)}`, source: 'Database record', type: 'data' },
                    { field: 'Price / Sqft', value: formatPrice(p.price_per_sqft, p.countryCode), source: 'Calculated', type: 'data' },
                    { field: 'Commission (est.)', value: `${formatPrice(p.estimated_commission, p.countryCode)} at ${p.commission_percentage}%`, source: 'Commission model', type: 'data' },
                  ].map((row) => (
                    <div key={row.field} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          row.type === 'data' ? 'bg-emerald-500/50' : 'bg-amber-500/50'
                        )} />
                        <span className="text-[11px] text-gray-400">{row.field}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-white font-medium">{row.value}</p>
                        <p className="text-[8px] text-gray-600 font-mono">{row.source}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Metrics + Developer */}
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'AI Confidence', value: `${p.confidence}%`, icon: Star, color: 'text-luxury-gold-400' },
                      { label: 'Est. Commission', value: formatPrice(p.estimated_commission, p.countryCode), icon: DollarSign, color: 'text-emerald-400' },
                      { label: 'City Score', value: cityData ? `${cityData.confidence}/100` : 'N/A', icon: BarChart3, color: 'text-blue-400' },
                      { label: 'Price Trend', value: cityData ? `${cityData.priceTrend}%` : 'N/A', icon: TrendingUp, color: 'text-purple-400' },
                    ].map((metric) => {
                      const Icon = metric.icon;
                      return (
                        <div key={metric.label} className="premium-card p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={cn('w-3.5 h-3.5', metric.color)} />
                            <span className="text-[10px] text-gray-500">{metric.label}</span>
                          </div>
                          <p className={cn('text-lg font-bold', metric.color)}>{metric.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Developer section */}
                  <div className="premium-card p-5">
                    <h3 className="text-xs font-bold text-white mb-3">Developer</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">Name</span>
                        <span className="text-[11px] text-white font-medium">{p.developer_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">Type</span>
                        <span className="text-[11px] text-white capitalize">{p.developer_type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">Website</span>
                        <span className="text-[11px] text-gray-400">
                          {p.developer_website ? (
                            <a href={p.developer_website} target="_blank" rel="noopener noreferrer" className="text-luxury-gold-400 hover:text-luxury-gold-300">
                              Official Site ↗
                            </a>
                          ) : 'Not independently verified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="premium-card p-5">
                    <h3 className="text-xs font-bold text-white mb-3">Amenities ({p.amenities.length})</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {p.amenities.map((a) => (
                        <span key={a} className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-gray-300">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: Evidence ─────────────────────────── */}
        <section id="section-evidence" className="py-16 sm:py-20 lg:py-24 border-t border-white/[0.03]">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="max-w-5xl mx-auto">
              <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
                Source Verification
              </span>
              <h2 className="heading-lg text-white mb-6">
                Data Provenance
              </h2>
              <p className="body-md text-gray-400 max-w-2xl mb-8">
                This property is currently classified as <strong>{p.verification.status}</strong>. 
                Verification against government registries (MahaRERA, DLD, HM Land Registry, URA) is required 
                for official status. Below are the tracked data sources and their verification status.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Developer Record', source: p.developer_name, url: p.developer_website || '', status: p.developer_website ? 'Available' : 'Pending' },
                  { label: 'Geospatial Data', source: 'City centroid (Mapbox)', url: `https://www.openstreetmap.org/?mlat=${p.latitude}&mlon=${p.longitude}`, status: 'Available' },
                  { label: 'RERA Registration', source: 'State RERA portal', url: 'https://maharera.maharashtra.gov.in', status: p.rera_number ? 'Available' : 'Pending' },
                  { label: 'Market Reference', source: 'JLL India · Knight Frank', url: 'https://www.jll.co.in', status: 'Reference' },
                  { label: 'Verification Status', source: p.verification.status, url: '', status: p.verification.status === 'VERIFIED' ? 'Complete' : 'Requires source confirmation' },
                  { label: 'Database Record', source: 'LeadLuxe property database', url: '', status: 'Available' },
                ].map((source) => (
                  <div key={source.label} className="premium-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">{source.label}</span>
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[8px] font-medium font-mono',
                        source.status === 'Available' || source.status === 'Complete'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      )}>
                        {source.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-1">{source.source}</p>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] text-luxury-gold-400/60 hover:text-luxury-gold-400 transition-colors"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        {source.url.length > 30 ? source.url.slice(0, 30) + '…' : source.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: Deal Room ────────────────────────── */}
        <section id="section-dealroom" className="py-16 sm:py-20 lg:py-24 bg-[#050505] border-t border-white/[0.03]">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="max-w-5xl mx-auto">
              <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
                Deal Room
              </span>
              <h2 className="heading-lg text-white mb-6">
                Introduction & Qualification System
              </h2>
              <p className="body-md text-gray-400 max-w-2xl mb-8">
                Express interest to create a Deal Passport. The Deal Passport tracks your introduction 
                milestones — from qualification through to deal closure — and ensures commission 
                entitlement for LeadLuxe-originated introductions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { step: '01', title: 'Express Interest', desc: 'Submit your investor profile to begin.' },
                  { step: '02', title: 'AI Qualification', desc: 'Buyer profile scored for closing probability.' },
                  { step: '03', title: 'Deal Passport', desc: 'Track every milestone — site visit, offer, closure.' },
                ].map((step) => (
                  <div key={step.step} className="premium-card p-5">
                    <span className="text-2xl font-bold text-luxury-gold-500/30 font-display">{step.step}</span>
                    <h3 className="text-sm font-semibold text-white mt-2 mb-1">{step.title}</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={handleExpressInterest}
                  className="btn-arch-filled group text-sm tracking-[0.12em]"
                >
                  {dealPassportId ? 'View Deal Passport' : 'Unlock Deal Room'}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {dealPassportId && (
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle className="w-3 h-3" />
                    Passport ID: {dealPassportId.slice(0, 8)}…
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 6: Report ─────────────────────────── */}
        <section id="section-report" className="py-16 sm:py-20 lg:py-24 border-t border-white/[0.03]">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="max-w-5xl mx-auto">
              <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
                AI Deal Report
              </span>
              <h2 className="heading-lg text-white mb-6">
                Generate Institutional-Grade Research
              </h2>
              <p className="body-md text-gray-400 max-w-2xl mb-8">
                Download a professional PDF containing: property summary, market analysis, 
                comparable project data, risk assessment, and source attribution.
              </p>

              <div className="premium-card p-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Property', desc: `${p.name} · ${p.developer_name} · ${p.city}` },
                    { label: 'Market', desc: cityData ? `${cityData.priceTrend}% trend · ${cityData.absorptionRate}% absorption` : 'City data available' },
                    { label: 'Returns', desc: cityData ? `${cityData.averageRoi}% avg ROI` : 'Data pending verification' },
                    { label: 'Confidence', desc: `${p.confidence}% AI score · ${countryData?.marketTrend || 'stable'} market` },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] text-luxury-gold-400 font-semibold mb-1">{item.label}</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/report/${p.slug}`)}
                  className="btn-arch-filled group text-sm tracking-[0.12em]"
                >
                  <FileText className="w-4 h-4" />
                  Generate AI Deal Report
                  <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 7: Map ───────────────────────────────── */}
        <section id="section-map" className="py-16 sm:py-20 lg:py-24 border-t border-white/[0.03]">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="max-w-5xl mx-auto">
              <span className="editorial-label text-luxury-gold-400/60 mb-4 block">
                Location
              </span>
              <h2 className="heading-lg text-white mb-6">
                Coordinates
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map — OpenStreetMap-based */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 border border-white/[0.06]">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${p.latitude}&mlon=${p.longitude}&zoom=14`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <img
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.longitude - 0.05},${p.latitude - 0.05},${p.longitude + 0.05},${p.latitude + 0.05}&layer=mapnik&marker=${p.latitude},${p.longitude}`}
                      alt="OpenStreetMap location"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/70 px-4 py-3 rounded-xl text-center">
                        <MapPin className="w-5 h-5 text-luxury-gold-400 mx-auto mb-1" />
                        <p className="text-[10px] text-white font-mono">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</p>
                        <p className="text-[8px] text-gray-500 mt-1">Click to open in OpenStreetMap</p>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Location data */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-white mb-3">Location Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-[11px] text-gray-400">City</span>
                      <span className="text-[11px] text-white font-medium">{p.city}, {p.country}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-[11px] text-gray-400">District</span>
                      <span className="text-[11px] text-white font-medium">{p.district}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-[11px] text-gray-400">Coordinates</span>
                      <span className="text-[11px] text-white font-medium font-mono">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-[11px] text-gray-400">Geo Source</span>
                      <span className="text-[11px] text-gray-400">City centroid · Mapbox</span>
                    </div>
                  </div>

                  <p className="text-[8px] text-gray-600 font-mono mt-4">
                    Coordinates are city-level. Parcel-level geocoding requires verified address from developer or government registry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────── */}
        <section className="py-20 border-t border-white/[0.03] bg-[#050505]">
          <div className="text-center max-w-3xl mx-auto px-6">
            <h2 className="heading-xl text-white mb-4">
              Ready to Invest?
            </h2>
            <p className="body-lg text-gray-400 mb-6 max-w-xl mx-auto">
              This opportunity is presented by LeadLuxe AI. Express interest to unlock the Deal Room 
              and access the full investment workflow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleExpressInterest}
                className="btn-arch-filled group text-sm tracking-[0.12em]"
              >
                Express Interest
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/deal-room')}
                className="btn-arch text-xs tracking-[0.12em]"
              >
                Browse More Properties
              </button>
            </div>
          </div>
        </section>

        {/* ─── Deal Room Onboarding Modal ─────────────────── */}
        <AnimatePresence>
          {showOnboarding && property && (
            <DealRoomOnboarding
              property={{
                id: property.id,
                name: property.name,
                developer_name: property.developer_name,
                developer_website: property.developer_website,
                city: property.city,
                country: property.country,
                countryCode: property.countryCode,
                price_min: property.price_min,
                price_max: property.price_max,
                estimated_commission: property.estimated_commission,
                currency: property.currency,
                currencySymbol: property.currencySymbol,
              }}
              onClose={() => setShowOnboarding(false)}
              onComplete={handleOnboardingComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
