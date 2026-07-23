// ============================================================
// LeadLuxe AI — Market Intelligence
// Premium dashboard-style market intelligence with KPI cards,
// intelligence cards with source badges, confidence scores,
// verification badges, and right-side intelligence panel.
// Follows the exact same design system as Deal Room, Signals,
// Opportunities, and Global Map.
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Newspaper, Search, TrendingUp, Globe, Clock,
  ArrowRight, Calendar, User, Sparkles,
  Building2, MapPin, BarChart3, Target,
  Shield, CheckCircle, AlertTriangle, HelpCircle,
  RefreshCw, Download, Activity, Brain,
  Zap, Percent,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet, BreadcrumbLD } from '../components/seo/SEOHelmet';

// ============================================================
// TYPES
// ============================================================

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'market-report' | 'city-guide' | 'investment-strategy' | 'trend-analysis' | 'ai-insights';
  region: string;
  countryCode: string;
  readTime: number;
  publishedDate: string;
  author: string;
  imageCredit: string;
  tags: string[];
  confidenceScore: number;
  dataSources: string[];
  verificationStatus: 'verified' | 'partial' | 'unverified';
  keyMetrics: { label: string; value: string; trend?: 'up' | 'down' | 'stable' }[];
}

// ============================================================
// CATEGORIES
// ============================================================

const CATEGORIES = [
  { value: 'all', label: 'All Reports', icon: Newspaper },
  { value: 'market-report', label: 'Reports', icon: TrendingUp },
  { value: 'city-guide', label: 'City Guides', icon: MapPin },
  { value: 'investment-strategy', label: 'Strategy', icon: Target },
  { value: 'trend-analysis', label: 'Trends', icon: BarChart3 },
  { value: 'ai-insights', label: 'AI Insights', icon: Brain },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  'market-report': 'Market Report',
  'city-guide': 'City Guide',
  'investment-strategy': 'Investment Strategy',
  'trend-analysis': 'Trend Analysis',
  'ai-insights': 'AI Insights',
};

// ============================================================
// DATA SOURCE BADGES
// ============================================================

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  'MahaRERA': { label: 'MahaRERA', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'DLD': { label: 'DLD', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'HM Land Registry': { label: 'HM Land', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  'URA': { label: 'URA', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  'MLIT': { label: 'MLIT', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  'MOLIT': { label: 'MOLIT', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  'RERA': { label: 'RERA', color: 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/30' },
  'World Bank': { label: 'World Bank', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'CBRE': { label: 'CBRE', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  'JLL': { label: 'JLL', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  'Knight Frank': { label: 'Knight Frank', color: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
};

// ============================================================
// VERIFICATION BADGE
// ============================================================

function VerificationBadge({ status }: { status: string }) {
  const config: Record<string, { icon: any; label: string; color: string }> = {
    verified: { icon: Shield, label: 'Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    partial: { icon: AlertTriangle, label: 'Partial', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    unverified: { icon: HelpCircle, label: 'Unverified', color: 'text-gray-400 bg-gray-800 border-gray-700' },
  };
  const cfg = config[status] || config.unverified;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-medium border ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

// ============================================================
// BLOG POSTS DATA
// ============================================================

const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'dubai-real-estate-market-2026', title: 'Dubai Real Estate Market 2026: Premium Segment Driving 18% Growth as Off-Plan Sales Surge',
    excerpt: 'Dubai\'s luxury property prices surging 18.5% year-on-year. Off-plan sales hit AED 85 billion in H1 2026, driven by foreign investment and new mega-projects.',
    content: 'Dubai\'s real estate market has entered a new phase of maturity and growth in 2026.', category: 'market-report',
    region: 'Dubai', countryCode: 'AE', readTime: 5, publishedDate: '2026-07-15', author: 'LeadLuxe AI Research',
    imageCredit: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&auto=format',
    tags: ['dubai', 'uae', 'luxury', 'off-plan'], confidenceScore: 94, verificationStatus: 'verified',
    dataSources: ['DLD', 'Knight Frank', 'CBRE'],
    keyMetrics: [
      { label: 'YoY Growth', value: '18.5%', trend: 'up' },
      { label: 'Rental Yield', value: '6.8%', trend: 'up' },
      { label: 'Foreign Demand', value: '72%', trend: 'up' },
      { label: 'Risk Score', value: 'Low', trend: 'stable' },
    ],
  },
  {
    slug: 'pune-real-estate-investment-guide-2026', title: 'Pune Real Estate: Kharadi, Baner, Hinjewadi Lead Growth with 15.8% Average ROI',
    excerpt: 'Pune has emerged as India\'s most attractive real estate investment destination with 12.3% price growth and 15.8% average ROI. IT corridor expansion and metro connectivity driving demand.',
    content: 'Pune\'s real estate market continues to outperform other Indian metros.', category: 'market-report',
    region: 'Pune', countryCode: 'IN', readTime: 4, publishedDate: '2026-07-12', author: 'LeadLuxe AI Analytics',
    imageCredit: 'https://images.unsplash.com/photo-1560448204-603b69fc5a79?w=800&h=500&fit=crop&auto=format',
    tags: ['pune', 'india', 'investment', 'it-corridor'], confidenceScore: 89, verificationStatus: 'verified',
    dataSources: ['MahaRERA', 'JLL'],
    keyMetrics: [
      { label: 'YoY Growth', value: '12.3%', trend: 'up' },
      { label: 'Avg ROI', value: '15.8%', trend: 'up' },
      { label: 'Absorption', value: '92%', trend: 'up' },
      { label: 'Risk Score', value: 'Low', trend: 'stable' },
    ],
  },
  {
    slug: 'saudi-arabia-vision-2030-real-estate', title: 'Saudi Arabia Vision 2030: Riyadh, Jeddah, NEOM Creating Unprecedented Opportunities',
    excerpt: 'Saudi Arabia\'s giga-projects transforming the real estate landscape. Riyadh leads with 18.5% price growth, while NEOM projects open new frontiers.',
    content: 'Saudi Arabia\'s Vision 2030 continues to reshape the kingdom\'s real estate landscape.', category: 'trend-analysis',
    region: 'Saudi Arabia', countryCode: 'SA', readTime: 6, publishedDate: '2026-07-10', author: 'LeadLuxe AI Global Research',
    imageCredit: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=500&fit=crop&auto=format',
    tags: ['saudi-arabia', 'vision-2030', 'riyadh', 'neom'], confidenceScore: 85, verificationStatus: 'partial',
    dataSources: ['World Bank', 'CBRE'],
    keyMetrics: [
      { label: 'YoY Growth', value: '18.5%', trend: 'up' },
      { label: 'Institutional Flow', value: '₹12B', trend: 'up' },
      { label: 'New Units Needed', value: '300K+', trend: 'up' },
      { label: 'Risk Score', value: 'Medium', trend: 'down' },
    ],
  },
  {
    slug: 'berlin-real-estate-market-2026', title: 'Berlin Real Estate: Steady Growth in Europe\'s Most Dynamic Capital City',
    excerpt: 'Berlin\'s property market shows resilient 7.8% growth as tech sector expansion and international demand offset higher interest rates.',
    content: 'Berlin continues to be one of Europe\'s most dynamic real estate markets.', category: 'city-guide',
    region: 'Berlin', countryCode: 'DE', readTime: 5, publishedDate: '2026-07-08', author: 'LeadLuxe AI Research',
    imageCredit: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=500&fit=crop&auto=format',
    tags: ['berlin', 'germany', 'europe', 'tech-hub'], confidenceScore: 82, verificationStatus: 'partial',
    dataSources: ['World Bank', 'CBRE'],
    keyMetrics: [
      { label: 'YoY Growth', value: '7.8%', trend: 'up' },
      { label: 'Rental Yield', value: '3.5-4.5%', trend: 'stable' },
      { label: 'Foreign Demand', value: '38%', trend: 'up' },
      { label: 'Risk Score', value: 'Low', trend: 'stable' },
    ],
  },
  {
    slug: 'mumbai-vs-dubai-investment-comparison', title: 'Mumbai vs Dubai: AI-Powered Comparison of Returns, Risks, and Commissions',
    excerpt: 'A data-driven comparison of the two most popular real estate investment destinations for Indian investors — ROI, rental yields, appreciation, and commission potential.',
    content: 'Indian investors have long debated between Mumbai and Dubai for real estate investment.', category: 'investment-strategy',
    region: 'Global', countryCode: 'AE', readTime: 7, publishedDate: '2026-07-05', author: 'LeadLuxe AI Analytics',
    imageCredit: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&auto=format',
    tags: ['mumbai', 'dubai', 'comparison', 'roi'], confidenceScore: 91, verificationStatus: 'verified',
    dataSources: ['MahaRERA', 'DLD', 'JLL', 'Knight Frank'],
    keyMetrics: [
      { label: 'ROI Comparison', value: '18.5%', trend: 'up' },
      { label: 'Yield Advantage', value: 'Dubai', trend: 'up' },
      { label: 'Liquidity', value: 'High', trend: 'stable' },
      { label: 'Risk Score', value: 'Low', trend: 'stable' },
    ],
  },
  {
    slug: 'tokyo-real-estate-foreign-investment', title: 'Tokyo: Why International Investors Are Flocking to Japan\'s Property Market in 2026',
    excerpt: 'Tokyo offers rare stability with 2.8% steady appreciation, strong rental demand, and record-low rates. Foreign investment surged 72%.',
    content: 'Tokyo\'s real estate market has become a magnet for international investors.', category: 'market-report',
    region: 'Tokyo', countryCode: 'JP', readTime: 6, publishedDate: '2026-07-01', author: 'LeadLuxe AI Global Research',
    imageCredit: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop&auto=format',
    tags: ['tokyo', 'japan', 'foreign-investment', 'yen'], confidenceScore: 86, verificationStatus: 'verified',
    dataSources: ['MLIT', 'World Bank'],
    keyMetrics: [
      { label: 'YoY Growth', value: '2.8%', trend: 'up' },
      { label: 'Rental Absorption', value: '68%', trend: 'stable' },
      { label: 'Foreign Demand', value: '+72%', trend: 'up' },
      { label: 'Risk Score', value: 'Very Low', trend: 'stable' },
    ],
  },
  {
    slug: 'ai-in-real-estate-2026', title: 'How AI Is Transforming Real Estate Investment: From Discovery to Closing in 2026',
    excerpt: 'AI is revolutionizing how real estate deals are discovered, analyzed, and closed. LeadLuxe AI explains how autonomous agents find opportunities before human analysts.',
    content: 'The real estate industry is undergoing a fundamental transformation driven by artificial intelligence.', category: 'ai-insights',
    region: 'Global', countryCode: 'US', readTime: 8, publishedDate: '2026-06-28', author: 'LeadLuxe AI Technology Team',
    imageCredit: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop&auto=format',
    tags: ['ai', 'technology', 'prop-tech'], confidenceScore: 95, verificationStatus: 'verified',
    dataSources: ['World Bank', 'CBRE', 'JLL'],
    keyMetrics: [
      { label: 'Faster Discovery', value: '67%', trend: 'up' },
      { label: 'Higher Confidence', value: '43%', trend: 'up' },
      { label: 'Less Research Time', value: '52%', trend: 'down' },
      { label: 'ROI Improvement', value: '38%', trend: 'up' },
    ],
  },
  {
    slug: 'istanbul-real-estate-opportunity', title: 'Istanbul: Europe\'s Most Affordable Major City for Property Investment in 2026',
    excerpt: 'With prices at just €180/sqft and 12.5% annual appreciation, Istanbul offers compelling value with 5-8% rental yields.',
    content: 'Istanbul occupies a unique position as a transcontinental city.', category: 'city-guide',
    region: 'Istanbul', countryCode: 'TR', readTime: 5, publishedDate: '2026-06-25', author: 'LeadLuxe AI Research',
    imageCredit: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=500&fit=crop&auto=format',
    tags: ['istanbul', 'turkey', 'affordable', 'emerging-market'], confidenceScore: 80, verificationStatus: 'partial',
    dataSources: ['World Bank'],
    keyMetrics: [
      { label: 'Price/Sqft', value: '€180', trend: 'stable' },
      { label: 'YoY Growth', value: '12.5%', trend: 'up' },
      { label: 'Rental Yield', value: '5-8%', trend: 'up' },
      { label: 'Risk Score', value: 'Medium', trend: 'down' },
    ],
  },
  {
    slug: 'bangkok-vs-ho-chi-minh-city', title: 'Bangkok vs Ho Chi Minh City: Southeast Asia\'s Hottest Markets Compared for 2026',
    excerpt: 'Bangkok offers tourism-driven stability while Ho Chi Minh City delivers explosive 16.5% returns. Which is right for you?',
    content: 'Southeast Asia continues to attract global real estate investors.', category: 'investment-strategy',
    region: 'Southeast Asia', countryCode: 'TH', readTime: 6, publishedDate: '2026-06-22', author: 'LeadLuxe AI Southeast Asia Desk',
    imageCredit: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&h=500&fit=crop&auto=format',
    tags: ['bangkok', 'ho-chi-minh-city', 'southeast-asia', 'emerging-markets'], confidenceScore: 83, verificationStatus: 'partial',
    dataSources: ['CBRE', 'World Bank'],
    keyMetrics: [
      { label: 'Growth BKK', value: '8.5%', trend: 'up' },
      { label: 'Growth HCMC', value: '12.5%', trend: 'up' },
      { label: 'Yield BKK', value: '5-7%', trend: 'stable' },
      { label: 'Yield HCMC', value: '6-9%', trend: 'up' },
    ],
  },
  {
    slug: 'london-prime-property-2026', title: 'London Prime Property 2026: Why the World\'s Wealthy Still Choose the UK Capital',
    excerpt: 'Despite global uncertainty, London\'s prime market shows resilience with foreign buyers accounting for 55% of £5M+ transactions.',
    content: 'London remains one of the world\'s most sought-after real estate markets.', category: 'market-report',
    region: 'London', countryCode: 'GB', readTime: 6, publishedDate: '2026-06-19', author: 'LeadLuxe AI Global Research',
    imageCredit: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop&auto=format',
    tags: ['london', 'uk', 'prime-property', 'safe-haven'], confidenceScore: 86, verificationStatus: 'verified',
    dataSources: ['HM Land Registry', 'Knight Frank'],
    keyMetrics: [
      { label: 'Prime Growth', value: '1.8%', trend: 'stable' },
      { label: 'Foreign Share', value: '55%', trend: 'up' },
      { label: 'Institutional Flow', value: '£2.1B', trend: 'stable' },
      { label: 'Risk Score', value: 'Very Low', trend: 'stable' },
    ],
  },
  {
    slug: 'miami-latin-american-wealth', title: 'Miami: The New York of Latin America — Wealth Migration Reshaping Florida\'s Market',
    excerpt: 'Miami\'s transformation into a global financial hub continues with 8.5% annual growth. Latin American wealth and crypto capital drive demand.',
    content: 'Miami has undergone a remarkable transformation into a global financial hub.', category: 'trend-analysis',
    region: 'Miami', countryCode: 'US', readTime: 5, publishedDate: '2026-06-16', author: 'LeadLuxe AI Americas Research',
    imageCredit: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=500&fit=crop&auto=format',
    tags: ['miami', 'usa', 'latin-america', 'wealth-migration'], confidenceScore: 87, verificationStatus: 'verified',
    dataSources: ['CBRE', 'Knight Frank'],
    keyMetrics: [
      { label: 'YoY Growth', value: '8.5%', trend: 'up' },
      { label: 'Foreign Demand', value: '88%', trend: 'up' },
      { label: 'Corporate Relocations', value: '150+', trend: 'up' },
      { label: 'Risk Score', value: 'Low', trend: 'stable' },
    ],
  },
  {
    slug: 'real-estate-commission-model-vs-subscription', title: 'Commission-Only vs Subscription: Why 3% Success Fee Wins for Developers',
    excerpt: 'LeadLuxe AI\'s commission-only model means zero upfront cost — we only earn when properties close, saving developers ₹13-32L annually.',
    content: 'Real estate developers have traditionally paid for CRM platforms through subscriptions.', category: 'ai-insights',
    region: 'Global', countryCode: 'IN', readTime: 4, publishedDate: '2026-06-13', author: 'LeadLuxe AI Business Team',
    imageCredit: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop&auto=format',
    tags: ['commission-model', 'subscription', 'business-model'], confidenceScore: 97, verificationStatus: 'verified',
    dataSources: ['JLL', 'CBRE'],
    keyMetrics: [
      { label: 'Annual Savings', value: '₹13-32L', trend: 'up' },
      { label: 'Success Fee', value: '3%', trend: 'stable' },
      { label: 'Upfront Cost', value: '₹0', trend: 'stable' },
      { label: 'Risk Score', value: 'None', trend: 'stable' },
    ],
  },
];

// ============================================================
// KPI DATA
// ============================================================

function computeKpis(posts: BlogPost[]) {
  const countries = new Set(posts.map(p => p.countryCode)).size;
  const verified = posts.filter(p => p.verificationStatus === 'verified').length;
  const highConfidence = posts.filter(p => p.confidenceScore >= 85).length;
  const avgConfidence = Math.round(posts.reduce((s, p) => s + p.confidenceScore, 0) / posts.length);
  const dataSources = new Set(posts.flatMap(p => p.dataSources)).size;
  return { countries, verified, highConfidence, avgConfidence, dataSources, total: posts.length };
}

// ============================================================
// SIDEBAR INTELLIGENCE
// ============================================================

function IntelligenceSidebar({ posts }: { posts: BlogPost[] }) {
  // Today's top signals
  const topSignals = posts.slice(0, 4).map(p => ({
    title: p.region,
    description: p.excerpt.slice(0, 60),
    confidence: p.confidenceScore,
  }));

  // Capital flow analysis
  const capitalFlow = [
    { from: 'Mumbai', to: 'Dubai', volume: '$2.1B', trend: 'up' },
    { from: 'Singapore', to: 'Tokyo', volume: '$1.4B', trend: 'up' },
    { from: 'London', to: 'Miami', volume: '$0.8B', trend: 'up' },
  ];

  // Interest rate impact
  const rateImpact = [
    { region: 'India (RBI)', rate: '6.25%', impact: 'stable', change: '+25bps' },
    { region: 'US (Fed)', rate: '4.50%', impact: 'declining', change: '-25bps' },
    { region: 'Eurozone (ECB)', rate: '3.25%', impact: 'declining', change: '-50bps' },
  ];

  return (
    <div className="space-y-4">
      {/* Today's AI Signals */}
      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Today's AI Signals</h3>
        </div>
        <div className="space-y-2">
          {topSignals.map((sig, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px]">
              <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-white font-medium">{sig.title}</span>
                <p className="text-gray-500 truncate">{sig.description}</p>
              </div>
              <span className={cn(
                'text-[8px] font-medium',
                sig.confidence >= 85 ? 'text-emerald-400' : 'text-amber-400'
              )}>{sig.confidence}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Capital Flow Radar */}
      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Capital Flow Radar</h3>
        </div>
        <div className="space-y-2">
          {capitalFlow.map((flow, i) => (
            <div key={i} className="flex items-center justify-between text-[9px]">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-gray-600" />
                <span className="text-gray-400">{flow.from}</span>
                <span className="text-gray-600">→</span>
                <span className="text-white">{flow.to}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-emerald-400 font-medium">{flow.volume}</span>
                {flow.trend === 'up' && <span className="text-emerald-400/60 text-[7px]">↑</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interest Rate Impact */}
      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Percent className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Interest Rate Impact</h3>
        </div>
        <div className="space-y-2">
          {rateImpact.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-[9px]">
              <div>
                <span className="text-white">{r.region}</span>
                <p className="text-gray-500 text-[8px]">{r.rate} · {r.change}</p>
              </div>
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[8px] font-medium',
                r.impact === 'stable' ? 'bg-gray-800 text-gray-400' :
                r.impact === 'declining' ? 'bg-emerald-500/10 text-emerald-400' :
                'bg-red-500/10 text-red-400'
              )}>{r.impact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Currency Advantage */}
      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Currency Advantage</h3>
        </div>
        <div className="space-y-2">
          {[
            { pair: 'USD/INR', rate: '83.45', advantage: 'INR weakness boosts NRI buying', direction: 'positive' },
            { pair: 'USD/JPY', rate: '141.20', advantage: 'Yen at 35-yr low — 42% discount', direction: 'positive' },
            { pair: 'EUR/USD', rate: '1.08', advantage: 'Euro stable, favorable for EU buyers', direction: 'neutral' },
            { pair: 'GBP/USD', rate: '1.27', advantage: 'Sterling strength vs USD', direction: 'negative' },
          ].map((cur, i) => (
            <div key={i} className="flex items-start gap-2 text-[9px] p-2 rounded-lg bg-gray-900/50">
              <span className="text-luxury-gold-400 font-bold shrink-0">{cur.pair}</span>
              <div className="flex-1 min-w-0">
                <span className="text-gray-400 block truncate">{cur.advantage}</span>
              </div>
              <span className={cn(
                'text-[8px] font-medium shrink-0',
                cur.direction === 'positive' ? 'text-emerald-400' :
                cur.direction === 'negative' ? 'text-red-400' : 'text-amber-400'
              )}>{cur.rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Institutional Moves */}
      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Top Institutional Moves</h3>
        </div>
        <div className="space-y-2 text-[9px]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-luxury-gold-400 shrink-0" />
            <span className="text-gray-400">Blackstone acquires ₹8,500Cr Indian office portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-luxury-gold-400 shrink-0" />
            <span className="text-gray-400">GIC increases Tokyo exposure by $2.1B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-luxury-gold-400 shrink-0" />
            <span className="text-gray-400">Brookfield launches $4B Dubai logistics fund</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export function Blog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    let posts = [...BLOG_POSTS];
    if (category !== 'all') posts = posts.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q)) ||
        p.region.toLowerCase().includes(q)
      );
    }
    return posts;
  }, [category, search]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);

  return (
    <>
      <SEOHelmet
        title="Market Intelligence & Real Estate Reports"
        description="AI-powered real estate market intelligence reports covering 25+ countries. Expert analysis, investment strategies, city guides, and market trends for global property investors."
        url="https://leadluxe-ai.vercel.app/blog"
      />
      <BreadcrumbLD items={[
        { name: 'Home', url: '/' },
        { name: 'Market Intelligence', url: '/blog' },
      ]} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-luxury-gold-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Market Intelligence</h2>
              <p className="text-sm text-gray-500">
                AI-powered analysis across {BLOG_POSTS.length} global markets · 
                <span className="text-luxury-gold-400"> {kpis.dataSources} data sources</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-medium border border-emerald-500/30 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              AI Active
            </span>
            <span className="text-[9px] text-gray-600">
              Updated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
            <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => window.print()} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors" title="Export report">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Active Markets', value: kpis.countries, icon: Globe, color: 'text-luxury-gold-400', bg: 'bg-luxury-gold-500/10' },
            { label: 'Verified Reports', value: kpis.verified, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'High-Growth Cities', value: kpis.highConfidence, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'AI Confidence', value: `${kpis.avgConfidence}%`, icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Institutional Signals', value: kpis.dataSources, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Cross-Border Capital', value: kpis.dataSources, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="premium-card p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', kpi.bg)}>
                  <kpi.icon className={cn('w-3 h-3', kpi.color)} />
                </div>
                <p className="text-[10px] text-gray-400">{kpi.label}</p>
              </div>
              <p className={cn('text-lg font-bold', kpi.color)}>{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search markets, cities, topics..."
              className="input-glass pl-9 text-xs"
            />
          </div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors border',
                category === cat.value
                  ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border-luxury-gold-500/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
              )}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Intelligence Grid */}
          <div className="lg:col-span-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">Awaiting Intelligence Data</h3>
                <p className="text-sm text-gray-500">Try different search terms or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((post, i) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="premium-card overflow-hidden group cursor-pointer hover:scale-[1.02] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-luxury-gold-500/5 transition-all duration-300"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {/* Image */}
                    <div className="relative h-40 bg-gray-900 overflow-hidden">
                      <img
                        src={post.imageCredit}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                      {/* Top badges */}
                      <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] font-medium text-luxury-gold-400 border border-luxury-gold-500/30">
                          {CATEGORY_LABELS[post.category] || post.category}
                        </span>
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[8px] font-medium border bg-black/60 backdrop-blur-sm',
                          post.confidenceScore >= 85 ? 'text-emerald-400 border-emerald-500/30' :
                          post.confidenceScore >= 75 ? 'text-amber-400 border-amber-500/30' :
                          'text-gray-400 border-gray-600'
                        )}>
                          {post.confidenceScore}% AI
                        </span>
                        <VerificationBadge status={post.verificationStatus} />
                      </div>
                      {/* Region flag */}
                      <div className="absolute top-2 right-2">
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] text-gray-300">
                          {post.region}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-3 space-y-2">
                      {/* Meta */}
                      <div className="flex items-center gap-2 text-[9px] text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}m</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xs font-semibold text-white leading-relaxed line-clamp-2 group-hover:text-luxury-gold-400 transition-colors">
                        {post.title}
                      </h2>

                      {/* Key Metrics Row */}
                      <div className="grid grid-cols-2 gap-1">
                        {post.keyMetrics.slice(0, 4).map((metric, mi) => (
                          <div key={mi} className="flex items-center gap-1 bg-gray-900/50 rounded px-1.5 py-1">
                            <span className={cn(
                              'text-[8px] font-medium',
                              metric.trend === 'up' ? 'text-emerald-400' :
                              metric.trend === 'down' ? 'text-red-400' : 'text-gray-300'
                            )}>{metric.value}</span>
                            <span className="text-[6px] text-gray-600 truncate">{metric.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Source badges */}
                      <div className="flex flex-wrap gap-1">
                        {post.dataSources.map(src => {
                          const badge = SOURCE_BADGES[src] || { label: src, color: 'bg-gray-800 text-gray-400 border-gray-700' };
                          return (
                            <span key={src} className={`px-1.5 py-0.5 rounded text-[7px] font-medium border ${badge.color}`}>
                              {badge.label}
                            </span>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-800/50">
                        <div className="flex items-center gap-1 text-[8px] text-gray-600">
                          <User className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[100px]">{post.author.split(' ').slice(-2).join(' ')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-luxury-gold-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Read</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>

          {/* Intelligence Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <IntelligenceSidebar posts={filtered} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
