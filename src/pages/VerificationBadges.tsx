// ============================================================
// LeadLuxe AI — Verification Badges (/verification)
// Explains the trust badges shown across public pages.
// Government-linked verification, source-attributed data,
// RERA-integrated intelligence, map-verified coordinates,
// AI-generated reports with citations.
// ============================================================

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle, ExternalLink, Globe, MapPin,
  FileText, Database, Award, Building2, Search,
  ChevronRight, BookOpen, Scale, Layers,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';

const BADGES = [
  {
    title: 'Government-Linked Verification',
    icon: Scale,
    desc: 'Every project is cross-checked against official government registries — MahaRERA, state RERA portals, Dubai Land Department, UK Land Registry, and other public databases.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    title: 'Source-Attributed Data',
    icon: Database,
    desc: 'Every field shown on a property page includes its original source URL. You can verify the developer name, address, and registration number by visiting the source directly.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    title: 'RERA-Integrated Intelligence',
    icon: Shield,
    desc: 'Maharashtra RERA, Karnataka RERA, Haryana RERA, and Telangana RERA data is indexed and cross-referenced. Projects without valid RERA registration are marked UNVERIFIED.',
    color: 'text-luxury-gold-400',
    bg: 'bg-luxury-gold-500/10',
    border: 'border-luxury-gold-500/20',
  },
  {
    title: 'Map-Verified Coordinates',
    icon: MapPin,
    desc: 'Project coordinates are resolved from addresses using Mapbox and OpenStreetMap. If an address cannot be geocoded with high confidence, the property is marked with city-level coordinates only.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    title: 'AI Reports with Citations',
    icon: FileText,
    desc: 'Every AI-generated report and investment memo includes a Source Appendix listing the exact institutional reports, government datasets, and market analyses used to generate conclusions.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    title: 'Institutional Research Layer',
    icon: BookOpen,
    desc: 'Market intelligence is enriched with data from JLL, CBRE, Knight Frank, Savills, Colliers, Cushman & Wakefield, and other institutional research sources.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
];

const TRUST_MARKS = [
  { label: 'RERA Records Indexed', value: '247+', source: 'State RERA Portals' },
  { label: 'Verified Developers', value: '25+', source: 'MCA / Official Websites' },
  { label: 'Infrastructure Datasets', value: '27', source: 'Metro Authorities, NHAI' },
  { label: 'Institutional Research Sources', value: '6', source: 'JLL, CBRE, Knight Frank, Savills, Colliers, RBI' },
  { label: 'Cities with Verified Data', value: '27', source: 'Indian Tier-1 & Tier-2 Markets' },
  { label: 'Geocoding Accuracy (City-Level)', value: '98%', source: 'Mapbox + OpenStreetMap' },
];

export function VerificationBadges() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHelmet
        title="Verification — Trust Badges & Data Provenance"
        description="LeadLuxe AI's trust badges explain how every property data point is verified against government registries, institutional research, and official sources. No fabricated data."
        url="https://leadluxe-ai.vercel.app/verification"
        canonical="https://leadluxe-ai.vercel.app/verification"
      />
      <div className="min-h-screen bg-[#050505]">
        {/* Hero */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-display">
                Trust &{' '}
                <span className="text-gradient-gold">Verification</span>
              </h1>
              <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Every badge shown on LeadLuxe AI represents a real verification process — 
                government registry cross-reference, source-attributed data, or institutional 
                research integration. We never display fabricated data.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={() => navigate('/data-provenance')} className="btn-arch text-[10px]">
                  <Database className="w-3.5 h-3.5" /> Full Data Sources
                </button>
                <button onClick={() => navigate('/deal-room')} className="btn-arch-filled text-[10px]">
                  Browse Verified Properties
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Badges Grid */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGES.map((badge, i) => (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={cn('p-5 rounded-xl border', badge.bg, badge.border)}
                >
                  <badge.icon className={cn('w-6 h-6 mb-3', badge.color)} />
                  <h3 className="text-sm font-bold text-white mb-2">{badge.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{badge.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Marks */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6 text-center font-display">Verification Footprint</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {TRUST_MARKS.map((mark, i) => (
                <motion.div
                  key={mark.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center"
                >
                  <p className="text-xl font-bold text-luxury-gold-400 font-display">{mark.value}</p>
                  <p className="text-[10px] text-white font-medium mt-1">{mark.label}</p>
                  <p className="text-[8px] text-gray-600 mt-0.5">{mark.source}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Process */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16 border-t border-white/[0.03]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6 text-center font-display">How Verification Works</h2>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Property Discovery', desc: 'Projects are identified from official developer websites, government project portals, and registered RERA filings. Only publicly listed developments are indexed.' },
                { step: '02', title: 'Government Cross-Reference', desc: 'Each property is cross-referenced against state RERA databases, Dubai Land Department, HM Land Registry, URA Singapore, and other official registries where available.' },
                { step: '03', title: 'Geocoding & Map Verification', desc: 'The official address is geocoded using Mapbox and OpenStreetMap. If the geocoding confidence is below 0.85, the property is marked with city-level coordinates only.' },
                { step: '04', title: 'Developer Verification', desc: 'The developer name is matched against official company registrations (MCA, SEC, Companies House). A verified developer badge is shown only when the match is confirmed.' },
                { step: '05', title: 'Source Storage & Attribution', desc: 'Every verified data point is stored with its source URL, fetch timestamp, and verification status. This audit trail is visible on every property detail page.' },
                { step: '06', title: 'Continuous Re-Verification', desc: 'Verification status is not permanent. Sources are periodically re-checked. If a source becomes unavailable, the record is marked as STALE until re-verified.' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <span className="text-2xl font-bold text-luxury-gold-500/30 font-display shrink-0 w-10">{item.step}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
