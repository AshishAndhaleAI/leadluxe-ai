// ============================================================
// LeadLuxe AI — Investor Story (/investor-story)
// Complete acquisition narrative with 11 sections.
// Reference: JLL Capital Markets, CBRE IM, Knight Frank
// ============================================================

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Globe, Shield, BarChart3, Users,
  ArrowRight, ChevronRight, DollarSign, Target,
  Layers, Zap, Award, TrendingUp, MapPin,
  CheckCircle, ExternalLink, Database, Bot,
  FileText, Home, Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';
import { COUNTRIES, CITIES } from '../lib/global-data';

const SECTIONS = [
  {
    id: 'problem',
    number: '01',
    title: 'The Problem',
    subtitle: 'Real Estate Discovery Is Broken',
    body: 'The global real estate market is $380T, yet the digital tools available to investors and developers are stuck in the listing era. Portals show inventory, not intelligence. Buyers see photos, not pipeline velocity, infrastructure signals, or capital flow momentum.\n\nFor cross-border investors, the problem is worse: no trusted verification layer, no source-attributed data, and no AI that understands their specific investment profile across different regulatory regimes.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85&auto=format',
  },
  {
    id: 'listings',
    number: '02',
    title: 'Why Listings Fail',
    subtitle: 'The Portal Model Cannot Solve Trust',
    body: 'Traditional real estate portals generate revenue through listing fees and advertising. Their incentive is to maximize inventory volume, not data accuracy. This creates a fundamental misalignment: more listings means more noise, not more signal.\n\nA 2025 JLL report found that 68% of cross-border investors cite data trust as their primary barrier to entering new markets. LeadLuxe solves this with source-attributed verification — every data point links back to its original government or institutional source.',
  },
  {
    id: 'verification',
    number: '03',
    title: 'Why Verification Matters',
    subtitle: 'Source-Backed Trust Is the Moat',
    body: 'LeadLuxe does not generate synthetic data. Every property field — developer name, address, RERA number, coordinates, completion date — is either verified against a trusted source or marked as UNVERIFIED. No fabricated contacts, no invented addresses.\n\nThis creates a defensible data asset: verified records that cannot be replicated by a competitor without the same government registry integrations and institutional research partnerships.',
  },
  {
    id: 'nri',
    number: '04',
    title: 'Why NRI Capital Is Inefficient',
    subtitle: '$125B Remittance Market, Poorly Served',
    body: 'NRI remittances to India reached $125B in 2025, with 12-15% directed into real estate. Yet NRIs face: no trusted verification of projects from abroad, currency uncertainty, lack of AI-qualified buyer matching, and no institutional-grade research for Indian markets.\n\nLeadLuxe targets this $15-18B annual NRI real estate segment with: RERA-verified projects, currency-aware intelligence, AI-qualified matching, and a dedicated NRI portal.',
  },
  {
    id: 'architecture',
    number: '05',
    title: 'LeadLuxe Architecture',
    subtitle: 'Intelligence Infrastructure for Real Estate',
    body: 'The platform is built on four layers:\n\n1. Data Ingestion Layer — Government registries (RERA, DLD, Land Registry), institutional research (JLL, CBRE, Knight Frank), macro data (World Bank, RBI), and geospatial (Mapbox, OSM).\n\n2. Verification Engine — Every record is attributed, timestamped, and confidence-scored. Records without verified sources are hidden from featured listings.\n\n3. AI Intelligence Layer — Opportunity scoring, investor matching, capital flow analysis, infrastructure impact assessment, and commission calculation.\n\n4. Deal Infrastructure — Deal Room onboarding, Deal Passport creation, introduction tracking, commission pipeline, and audit trail.',
  },
  {
    id: 'experience',
    number: '06',
    title: 'Zaha-Style Experience',
    subtitle: 'Cinematic, Editorial, Institutional',
    body: 'The public experience is designed in the visual language of Zaha Hadid Architects — slow, cinematic, editorial. The scroll-driven walkthrough moves through 7 architectural spaces: city approach, arrival plaza, lobby intelligence, elevator ascent, sky corridor, evidence chamber, and AI command center.\n\nThis is not a SaaS dashboard. It is an architectural experience that communicates rigor, taste, and institutional quality before the user sees a single data point.',
  },
  {
    id: 'government',
    number: '07',
    title: 'Government Data Layer',
    subtitle: 'Integrated Public Registries',
    body: 'LeadLuxe maintains live integrations with: MahaRERA (Maharashtra), Karnataka RERA, Haryana RERA, Telangana RERA, Dubai Land Department (DLD), HM Land Registry (UK), URA Singapore, and Planning Portal (UK).\n\nAdditional sources include: World Bank Open Data, IMF, OECD, UN Habitat, RBI, Ministry of Housing, NITI Aayog, metro rail authorities, and highway authorities.',
  },
  {
    id: 'deal-room',
    number: '08',
    title: 'Deal Room Infrastructure',
    subtitle: 'Revenue-Capturing Deal Pipeline',
    body: 'The Deal Room is the monetization layer. When a buyer expresses interest, they enter a structured onboarding flow: investor profile → budget → timeline → funding source → digital introduction agreement.\n\nEvery introduction is tracked through the Deal Passport system — a legally bindable record that proves LeadLuxe-originated introductions. Commission is 3% on closed deals, payable only upon successful transaction closing.',
  },
  {
    id: 'revenue',
    number: '09',
    title: 'Revenue Model',
    subtitle: 'Performance-Based, Asset-Light',
    body: 'LeadLuxe operates on a pure success-fee model: 3% commission on closed deals. No subscription fees, no listing fees, no advertising revenue. This aligns incentives — LeadLuxe only earns when the investor buys and the developer sells.\n\nRevenue drivers:\n- Developer partnerships (NRI pipeline, market intelligence, AI scoring)\n- NRI investor matching (qualified buyer introductions)\n- AI investment memos (institutional-grade PDF reports)\n- White-label intelligence API (enterprise partnerships)\n- Data licensing (anonymized market intelligence)',
  },
  {
    id: 'expansion',
    number: '10',
    title: 'Expansion Strategy',
    subtitle: 'India First, Then Global',
    body: 'Phase 1 (Current) — India launch with 27 cities, 25+ developers, RERA verification, institutional research integration, Deal Room infrastructure, and NRI investor portal.\n\nPhase 2 — Expand to UAE, Singapore, UK with local government registry integrations and developer partnerships. Target NRI corridors.\n\nPhase 3 — Southeast Asia (Thailand, Vietnam, Indonesia) and Middle East (Saudi Arabia, Qatar).\n\nPhase 4 — Full global coverage with 50+ countries, white-label platform, and institutional API.',
  },
  {
    id: 'acquisition',
    number: '11',
    title: 'Acquisition Potential',
    subtitle: 'Strategic Value for Proptech & Institutions',
    body: 'LeadLuxe AI has built:\n- A proprietary verification infrastructure (hard to replicate)\n- Government registry integrations (regulatory moat)\n- Institutional research partnerships (trust asset)\n- AI opportunity engine (technology asset)\n- Deal Passport system (legal infrastructure)\n- Commission pipeline (revenue asset)\n- Zaha-style brand experience (brand asset)\n\nStrategic acquirers include: global proptech platforms (Zillow, REA Group, Rightmove, Property Finder), institutional real estate advisors (JLL, CBRE, Savills, Knight Frank), and enterprise software companies seeking real estate vertical intelligence.',
  },
];

export function InvestorStory() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHelmet
        title="Investor Story — LeadLuxe AI Architecture & Acquisition Potential"
        description="LeadLuxe AI is building the verification and transaction infrastructure layer for Indian real estate. 11-section narrative covering problem, architecture, revenue model, and acquisition potential."
        url="https://leadluxe-ai.vercel.app/investor-story"
        canonical="https://leadluxe-ai.vercel.app/investor-story"
      />
      <div className="min-h-screen bg-[#050505]">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=85&auto=format"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/50 to-[#050505]" />
          </div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="editorial-label text-luxury-gold-400/60 mb-6 block">Investment Thesis</span>
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 font-display leading-tight">
                Building the Verification & Transaction{' '}
                <span className="text-gradient-gold">Infrastructure Layer</span>
                {' '}for Indian Real Estate
              </h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                An 11-part narrative on why LeadLuxe AI is positioned to become the definitive 
                intelligence and transaction platform for India's $1T real estate market.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => document.getElementById('story-content')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-arch-filled group text-sm"
                >
                  Read the Full Story
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => navigate('/enterprise')} className="btn-arch text-xs">
                  Start a Conversation
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Story Sections */}
        <section id="story-content" className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-5xl mx-auto space-y-24">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                id={`section-${section.id}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-4xl font-bold text-luxury-gold-500/20 font-display shrink-0">{section.number}</span>
                  <div>
                    <p className="editorial-label text-luxury-gold-400/60 mb-2">{section.title}</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">{section.subtitle}</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 mt-6">
                  <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                    {section.body}
                  </div>
                  <div className="rounded-xl overflow-hidden">
                    <img src={section.image} alt="" className="w-full h-48 sm:h-64 object-cover rounded-xl" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final Vision */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.03]">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-luxury-gold-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-display">
                LeadLuxe is building the verification and transaction infrastructure layer for Indian real estate.
              </h2>
              <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-8">
                Combining architectural experience, government-linked data, AI intelligence, and capital-qualified 
                introductions — across verified Indian cities, for global investors and developers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => navigate('/demo')} className="btn-arch-filled text-sm">
                  Watch the Demo
                </button>
                <button onClick={() => navigate('/enterprise')} className="btn-arch text-xs">
                  Request Investment Memo
                </button>
                <button onClick={() => navigate('/login')} className="btn-arch text-[10px]">
                  Sign In
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
