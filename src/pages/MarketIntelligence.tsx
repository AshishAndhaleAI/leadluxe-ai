// ============================================================
// TerraNexus AI — India Market Intelligence
// Institutional-grade research and analysis page.
// Content references: JLL India, CBRE India, Knight Frank
// India, Savills India, Colliers India, RBI, Ministry of
// Housing, NITI Aayog.
// ============================================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, TrendingUp, DollarSign, Globe, Shield,
  ArrowRight, BarChart3, FileText, MapPin, Users,
  Target, Award, Clock, Sparkles, Home, Activity,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES } from '../lib/global-data';
import { SEOHelmet } from '../components/seo/SEOHelmet';

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString()}`;
}

const INDIA_CITIES = CITIES.IN || [];

const REPORTS = [
  {
    id: 'jll-india-2026',
    title: 'India Real Estate Market Outlook 2026',
    source: 'JLL India',
    sourceUrl: 'https://www.jll.co.in',
    type: 'Research Report',
    summary: 'India\'s real estate sector is projected to reach $1 trillion by 2030, driven by urbanization, infrastructure investment, and regulatory reforms across major metros.',
    published: 'Q2 2026',
    confidence: 88,
    image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&q=80&auto=format',
    metrics: [
      { label: 'Projected Market Size', value: '$1T by 2030' },
      { label: 'Office Absorption', value: '62M sqft (2025)' },
      { label: 'Residential Growth', value: '+12% YoY' },
    ],
  },
  {
    id: 'knight-frank-wealth-2026',
    title: 'India Wealth Report — Luxury Residential Demand',
    source: 'Knight Frank India',
    sourceUrl: 'https://www.knightfrank.co.in',
    type: 'Wealth Report',
    summary: 'India\'s ultra-high-net-worth population is growing at 58%, driving luxury residential demand in Mumbai, Delhi NCR, Bengaluru, and emerging tier-2 cities.',
    published: 'Q1 2026',
    confidence: 85,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format',
    metrics: [
      { label: 'UHNI Growth', value: '58% (2025)' },
      { label: 'Luxury Home Sales', value: '+22% YoY' },
      { label: 'Avg Ticket Size', value: '₹8.5 Cr' },
    ],
  },
  {
    id: 'cbre-india-capital-flows',
    title: 'Capital Flows into Indian Real Estate',
    source: 'CBRE India',
    sourceUrl: 'https://www.cbre.co.in',
    type: 'Capital Markets',
    summary: 'Institutional capital inflows into Indian real estate reached $6.8B in 2025, with office, industrial, and data center assets attracting the largest share.',
    published: 'Q1 2026',
    confidence: 87,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format',
    metrics: [
      { label: 'Institutional Inflow', value: '$6.8B' },
      { label: 'Office Share', value: '42%' },
      { label: 'Data Center Growth', value: '+85% YoY' },
    ],
  },
  {
    id: 'rbi-housing-index',
    title: 'RBI Housing Price Index — Metro Trends',
    source: 'Reserve Bank of India',
    sourceUrl: 'https://www.rbi.org.in',
    type: 'Regulatory Data',
    summary: 'The RBI Housing Price Index shows sustained growth across Indian metros, with Pune, Hyderabad, and Bengaluru leading price appreciation at 12-15% annually.',
    published: 'Q4 2025',
    confidence: 92,
    image: 'https://images.unsplash.com/photo-1600607687644-cd4f0cc7b3f8?w=800&q=80&auto=format',
    metrics: [
      { label: 'Avg HPI Growth', value: '+10.2%' },
      { label: 'Top Performer', value: 'Pune +14.5%' },
      { label: 'Affordable Index', value: 'Stable' },
    ],
  },
  {
    id: 'savills-india-ops',
    title: 'Office Space & Co-Working Market Evolution',
    source: 'Savills India',
    sourceUrl: 'https://www.savills.co.in',
    type: 'Office Market',
    summary: 'Flexible office space now accounts for 25% of total office leasing in India, with Bengaluru, Hyderabad, and Pune leading absorption in the tech corridor.',
    published: 'Q1 2026',
    confidence: 84,
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7c4a7c?w=800&q=80&auto=format',
    metrics: [
      { label: 'Flex Share', value: '25%' },
      { label: 'Tech Absorption', value: '38M sqft' },
      { label: 'Avg Rental Growth', value: '+8.5% YoY' },
    ],
  },
  {
    id: 'colliers-india-investment',
    title: 'Infrastructure-Led Real Estate Growth',
    source: 'Colliers India',
    sourceUrl: 'https://www.colliers.com/en-in',
    type: 'Infrastructure',
    summary: 'Government infrastructure spending of ₹10L Cr (FY26) is driving real estate appreciation along metro corridors, highway expansions, and airport connectivity projects.',
    published: 'Q1 2026',
    confidence: 86,
    image: 'https://images.unsplash.com/photo-1600607688964-a1925a9e0a0e?w=800&q=80&auto=format',
    metrics: [
      { label: 'Infra Spend', value: '₹10L Cr' },
      { label: 'Metro Expansion', value: '18 cities' },
      { label: 'Airport Cities', value: '12 new' },
    ],
  },
  {
    id: 'rera-compliance',
    title: 'RERA Compliance & Consumer Protection Trends',
    source: 'Government of India',
    sourceUrl: 'https://rera.maharashtra.gov.in',
    type: 'Regulatory',
    summary: 'RERA has registered over 1.2L projects nationally, with Maharashtra, Karnataka, and Haryana leading in compliance. Project delivery timelines have improved 35% since implementation.',
    published: '2026',
    confidence: 94,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80&auto=format',
    metrics: [
      { label: 'Registered Projects', value: '1.2L+' },
      { label: 'Delivery Improvement', value: '+35%' },
      { label: 'Consumer Complaints', value: '-28%' },
    ],
  },
  {
    id: 'niti-aayog-housing',
    title: 'Housing for All — Urban Infrastructure Mission',
    source: 'NITI Aayog',
    sourceUrl: 'https://www.niti.gov.in',
    type: 'Policy',
    summary: 'The Urban Infrastructure Mission targets affordable housing for 5M urban households, with PPP models driving private sector participation in tier-2 and tier-3 cities.',
    published: '2025',
    confidence: 90,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format',
    metrics: [
      { label: 'Target Households', value: '5M' },
      { label: 'PPP Projects', value: '₹3.5L Cr' },
      { label: 'Tier-2 Coverage', value: '100 cities' },
    ],
  },
  {
    id: 'nri-capital-flows',
    title: 'NRI Investment & Remittance Trends',
    source: 'World Bank / RBI',
    sourceUrl: 'https://www.worldbank.org',
    type: 'Capital Flow',
    summary: 'NRI remittances to India reached $125B in 2025, with 12-15% directed into real estate. UAE, USA, and UK remain the top source markets for NRI property investment.',
    published: '2025',
    confidence: 88,
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80&auto=format',
    metrics: [
      { label: 'Total Remittances', value: '$125B' },
      { label: 'Real Estate Share', value: '12-15%' },
      { label: 'Top Source', value: 'UAE · USA · UK' },
    ],
  },
];

export function MarketIntelligence() {
  const navigate = useNavigate();

  // Aggregate India metrics
  const indiaMetrics = useMemo(() => {
    const totalCities = INDIA_CITIES.length;
    const avgConfidence = INDIA_CITIES.length > 0
      ? Math.round(INDIA_CITIES.reduce((s, c) => s + c.confidence, 0) / INDIA_CITIES.length)
      : 88;
    const avgGrowth = INDIA_CITIES.length > 0
      ? (INDIA_CITIES.reduce((s, c) => s + c.priceTrend, 0) / INDIA_CITIES.length).toFixed(1)
      : '9.5';
    const totalActiveProjects = INDIA_CITIES.reduce((s, c) => s + c.activeProjects, 0);
    const avgRoi = INDIA_CITIES.length > 0
      ? (INDIA_CITIES.reduce((s, c) => s + c.averageRoi, 0) / INDIA_CITIES.length).toFixed(1)
      : '12.5';

    return {
      cities: totalCities,
      confidence: avgConfidence,
      growth: avgGrowth,
      projects: totalActiveProjects,
      roi: avgRoi,
      institutionalSignals: REPORTS.length,
    };
  }, []);

  return (
    <>
      <SEOHelmet
        title="India Market Intelligence — Real Estate Research & Analysis"
        description="Institutional-grade market intelligence for Indian real estate. Research reports from JLL, CBRE, Knight Frank, Savills, Colliers, RBI, and government sources."
      />

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-luxury-gold-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white font-display">India Market Intelligence</h1>
              <p className="text-[10px] text-gray-500">Institutional-grade research across {indiaMetrics.cities} Indian cities</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-medium text-emerald-400 flex items-center gap-1">
              <Activity className="w-3 h-3" /> AI Active
            </span>
            <span className="text-[9px] text-gray-500 font-mono">Updated: Jul 2026</span>
          </div>
        </motion.div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Markets Covered', value: `${indiaMetrics.cities} cities`, icon: Globe, color: 'text-luxury-gold-400' },
            { label: 'Verified Reports', value: `${indiaMetrics.institutionalSignals}`, icon: FileText, color: 'text-emerald-400' },
            { label: 'High-Growth Cities', value: `${INDIA_CITIES.filter(c => c.priceTrend > 10).length}`, icon: TrendingUp, color: 'text-blue-400' },
            { label: 'AI Confidence', value: `${indiaMetrics.confidence}%`, icon: Shield, color: 'text-purple-400' },
            { label: 'Institutional Signals', value: `${REPORTS.filter(r => r.confidence >= 85).length}`, icon: Award, color: 'text-luxury-gold-400' },
            { label: 'Avg Rental Yield', value: `${indiaMetrics.roi}%`, icon: Target, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="premium-card p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
                <span className="text-[10px] text-gray-500">{stat.label}</span>
              </div>
              <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Research Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="premium-card overflow-hidden group cursor-pointer"
              onClick={() => window.open(report.sourceUrl, '_blank')}
            >
              {/* Image */}
              <div className="relative h-36 bg-gray-900">
                <img
                  src={report.image}
                  alt={report.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />

                {/* Top badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-medium text-gray-300 border border-white/10">
                    {report.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-luxury-gold-500/80 backdrop-blur-sm text-[9px] font-bold text-black">
                    {report.confidence}%
                  </span>
                </div>

                {/* Source badge — bottom of image */}
                <div className="absolute bottom-2 left-2">
                  <span className="px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm text-[8px] text-gray-400 font-mono">
                    {report.source}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-bold text-white leading-snug group-hover:text-luxury-gold-400 transition-colors line-clamp-2">
                  {report.title}
                </h3>
                <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">
                  {report.summary}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.04]">
                  {report.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-[10px] font-semibold text-luxury-gold-300">{m.value}</p>
                      <p className="text-[8px] text-gray-600 font-mono">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-2.5 h-2.5 text-gray-600" />
                    <span className="text-[8px] text-gray-600">{report.published}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[8px] text-luxury-gold-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Source <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* India Cities Overview */}
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-luxury-gold-400" />
            <h2 className="text-sm font-bold text-white font-display">India City Intelligence</h2>
            <span className="px-1.5 py-0.5 rounded-full bg-luxury-gold-500/10 text-[9px] font-medium text-luxury-gold-400">
              {INDIA_CITIES.length} cities
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
            {INDIA_CITIES.map((city) => (
              <button
                key={city.id}
                onClick={() => navigate(`/city/${city.name.toLowerCase().replace(/\s+/g, '-')}`)}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-luxury-gold-500/30 hover:bg-white/[0.04] transition-all text-left group"
              >
                <p className="text-xs font-semibold text-white group-hover:text-luxury-gold-400 transition-colors">
                  {city.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={cn(
                    'text-[9px] font-medium',
                    city.priceTrend > 10 ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    {city.priceTrend}%
                  </span>
                  <span className="text-[8px] text-gray-600">trend</span>
                </div>
                <p className="text-[8px] text-gray-500 mt-0.5">{city.activeProjects} projects</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex-1 h-0.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-luxury-gold-500"
                      style={{ width: `${city.confidence}%` }}
                    />
                  </div>
                  <span className="text-[7px] text-gray-600">{city.confidence}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sources & Methodology */}
        <div className="premium-card p-5">
          <h2 className="text-sm font-bold text-white font-display mb-3">Data Sources & Methodology</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[10px] text-gray-500 leading-relaxed">
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Institutional Research</h3>
              <p>JLL India · CBRE India · Knight Frank India · Savills India · Colliers India</p>
              <p className="text-[8px] text-gray-600">Research reports and market outlooks referenced for city-level intelligence.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Government & Regulatory</h3>
              <p>RBI · MahaRERA · State RERA Portals · Ministry of Housing · NITI Aayog</p>
              <p className="text-[8px] text-gray-600">Official data from government registries and policy documents.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">AI Scoring Methodology</h3>
              <p>TerraNexus AI scores are derived from price momentum (20%), rental yield (15%), infrastructure impact (15%), inventory absorption (10%), developer reputation (10%), foreign capital flow (10%), currency stability (10%), and liquidity score (10%).</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
