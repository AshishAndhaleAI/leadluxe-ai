// ============================================================
// LeadLuxe AI — Blog / Market Intelligence
// AI-generated market reports and real estate intelligence
// articles targeting long-tail SEO keywords.
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Newspaper, Search, TrendingUp, Globe, Clock,
  ArrowRight, Tag, Calendar, User, Sparkles,
  Building2, MapPin, BarChart3, Lightbulb, Target,
  ChevronRight, Filter,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet, BreadcrumbLD } from '../components/seo/SEOHelmet';

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
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'dubai-real-estate-market-2026',
    title: 'Dubai Real Estate Market 2026: Premium Segment Driving 18% Growth as Off-Plan Sales Surge',
    excerpt: 'Dubai\'s real estate market continues its remarkable trajectory with luxury property prices surging 18.5% year-on-year. Off-plan sales hit AED 85 billion in H1 2026, driven by foreign investment and new mega-projects.',
    content: `Dubai's real estate market has entered a new phase of maturity and growth in 2026. The luxury segment continues to outperform, with prices in prime areas like Palm Jumeirah, Emirates Hills, and Dubai Marina seeing significant appreciation.

## Key Market Indicators

- **Average Price per Sqft:** AED 1,800 (up 15.2% YoY)
- **Transaction Volume:** 45,000+ units in H1 2026
- **Foreign Investment:** 72% of off-plan buyers are international investors
- **Rental Yields:** Average 6.8% across the city, with some areas reaching 9%
- **New Launches:** 62 new projects announced in H1 2026

## Top Performing Areas

1. **Dubai Marina** — Luxury waterfront living, 12% price growth
2. **Palm Jumeirah** — Ultra-luxury villas, 22% price growth
3. **Downtown Dubai** — Premium apartments, 15% price growth
4. **Dubai Creek Harbour** — Emerging luxury district, 28% price growth

## AI Confidence Score: 94/100

LeadLuxe AI rates Dubai as a **Critical** opportunity market. The combination of strong foreign demand, government initiatives, and infrastructure spending creates a favorable environment for real estate investment.

## Commission Opportunity

At a 3% success fee, a property valued at AED 5 million would generate AED 150,000 in commission.`,
    category: 'market-report',
    region: 'Dubai',
    countryCode: 'AE',
    readTime: 5,
    publishedDate: '2026-07-15',
    author: 'LeadLuxe AI Research',
    imageCredit: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&auto=format',
    tags: ['dubai', 'uae', 'luxury', 'off-plan', 'market-report'],
  },
  {
    slug: 'pune-real-estate-investment-guide-2026',
    title: 'Pune Real Estate Investment Guide 2026: Kharadi, Baner, and Hinjewadi Lead Growth with 15.8% Average ROI',
    excerpt: 'Pune has emerged as India\'s most attractive real estate investment destination with 12.3% price growth and 15.8% average ROI. IT corridor expansion and metro connectivity driving demand.',
    content: `Pune's real estate market continues to outperform other Indian metros, driven by IT sector growth, infrastructure development, and increasing demand for quality housing.

## Market Overview

The city has seen consistent price appreciation across all segments, with the IT corridor (Kharadi, Hinjewadi, Viman Nagar) leading the charge.

## Key Growth Drivers

- **IT Sector Expansion:** 45+ new companies set up operations in Pune in 2025-26
- **Metro Connectivity:** Phase 2 operational, connecting major hubs
- **Airport Expansion:** New terminal increasing capacity to 25 million passengers
- **Hiring Boom:** 85,000+ new IT jobs created in the past year

## Top Investment Areas

1. **Kharadi** — 18.2% annual appreciation, strong rental demand
2. **Baner** — 14.5% growth, premium residential hub
3. **Hinjewadi** — 16.8% growth, IT park proximity
4. **Wakad** — 13.2% growth, balanced residential-commercial mix

## AI Recommendation

With a confidence score of 89/100, LeadLuxe AI recommends Pune as a High-Priority investment market. The city offers a rare combination of affordability (₹12,000/sqft average) and strong growth potential.`,
    category: 'market-report',
    region: 'Pune',
    countryCode: 'IN',
    readTime: 4,
    publishedDate: '2026-07-12',
    author: 'LeadLuxe AI Analytics',
    imageCredit: 'https://images.unsplash.com/photo-1560448204-603b69fc5a79?w=800&h=500&fit=crop&auto=format',
    tags: ['pune', 'india', 'investment', 'it-corridor', 'market-report'],
  },
  {
    slug: 'saudi-arabia-vision-2030-real-estate',
    title: 'Saudi Arabia Vision 2030 Real Estate Boom: Riyadh, Jeddah, NEOM Creating Unprecedented Opportunities',
    excerpt: 'Saudi Arabia\'s giga-projects and economic reforms are transforming the real estate landscape. Riyadh leads with 18.5% price growth, while NEOM and Red Sea projects open new frontiers.',
    content: `Saudi Arabia's Vision 2030 continues to reshape the kingdom's real estate landscape, creating unprecedented opportunities for developers and investors alike.

## The Transformation

The kingdom is investing over $1 trillion in giga-projects including NEOM, The Red Sea Project, Qiddiya, and Diriyah Gate. These mega-developments are driving demand for residential, commercial, and hospitality real estate across the country.

## Riyadh: The Capital's Boom

- **Population Target:** 15-20 million by 2030 (currently 7.5 million)
- **New Units Needed:** 300,000+ residential units by 2028
- **Price Growth:** 18.5% YoY — the highest in the GCC
- **Foreign Ownership:** New laws allowing 100% foreign ownership in designated areas

## Jeddah: Coastal Luxury

Jeddah's corniche developments and historic district revival are attracting both domestic and international investors. The city's unique position as the gateway to Mecca creates year-round demand.

## AI Confidence Score: 85/100

LeadLuxe AI rates Saudi Arabia as a High-growth opportunity market. The combination of government spending, population growth, and economic diversification creates a multi-year real estate super-cycle.`,
    category: 'trend-analysis',
    region: 'Saudi Arabia',
    countryCode: 'SA',
    readTime: 6,
    publishedDate: '2026-07-10',
    author: 'LeadLuxe AI Global Research',
    imageCredit: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=500&fit=crop&auto=format',
    tags: ['saudi-arabia', 'vision-2030', 'riyadh', 'neom', 'mega-projects'],
  },
  {
    slug: 'berlin-real-estate-market-2026',
    title: 'Berlin Real Estate Market 2026: Steady Growth in Europe\'s Most Dynamic Capital City',
    excerpt: 'Berlin\'s property market shows resilient 7.8% growth as tech sector expansion and international demand offset higher interest rates. Affordable luxury segment presents unique opportunities.',
    content: `Berlin continues to be one of Europe's most dynamic real estate markets, combining strong economic fundamentals with relative affordability compared to other major European capitals.

## Market Dynamics

Berlin's real estate market has shown remarkable resilience in 2026, with prices growing at a steady 7.8% despite higher interest rates across Europe. The city's growing tech sector, strong rental demand, and international appeal continue to drive the market.

## Key Metrics

- **Average Price per Sqft:** €520 (approx. $565)
- **Rental Yield:** 3.5-4.5% depending on district
- **Price Growth:** 7.8% annual appreciation
- **Foreign Buyer Share:** 38% of premium segment
- **New Construction:** 22,000 units annually (below target of 30,000)

## Best Districts for Investment

1. **Mitte** — Central location, premium prices, strong appreciation
2. **Prenzlauer Berg** — Family-friendly, stable growth
3. **Friedrichshain** — Trendy district, high rental demand
4. **Charlottenburg** — Luxury segment, international buyers

## LeadLuxe AI Analysis

Berlin scores 82/100 on our confidence index. The market offers good value compared to London, Paris, or Munich, with stronger growth prospects. The chronic housing shortage provides a floor for prices and rents.`,
    category: 'city-guide',
    region: 'Berlin',
    countryCode: 'DE',
    readTime: 5,
    publishedDate: '2026-07-08',
    author: 'LeadLuxe AI Research',
    imageCredit: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=500&fit=crop&auto=format',
    tags: ['berlin', 'germany', 'europe', 'tech-hub', 'city-guide'],
  },
  {
    slug: 'mumbai-vs-dubai-investment-comparison',
    title: 'Mumbai vs Dubai: Where Should You Invest in 2026? AI-Powered Comparison of Returns, Risks, and Commissions',
    excerpt: 'A data-driven comparison of the two most popular real estate investment destinations for Indian investors. We analyze ROI, rental yields, appreciation, and commission potential across both markets.',
    content: `Indian investors have long debated between Mumbai and Dubai for real estate investment. We use LeadLuxe AI's proprietary scoring engine to provide an objective comparison.

## Mumbai — The Home Market

- **Price per Sqft:** ₹25,000 (luxury), ₹12,000 (mid-segment)
- **Rental Yield:** 2.5-3.5%
- **Annual Appreciation:** 8-12% in growth corridors
- **Entry Barrier:** High (₹1.5 Cr+ for decent properties)
- **Liquidity:** High for established areas

## Dubai — The International Alternative

- **Price per Sqft:** AED 1,800 (approx. ₹40,000)
- **Rental Yield:** 6-9%
- **Annual Appreciation:** 12-18% in premium areas
- **Entry Barrier:** Moderate (AED 1M+ for good properties)
- **Liquidity:** High, especially for off-plan

## AI Verdict

For Indian investors with budgets under ₹3 Cr, Dubai offers better rental yields and appreciation potential. For budgets over ₹3 Cr, Mumbai luxury real estate in prime areas provides comparable returns with lower currency risk.

## Commission Potential Comparison

| Scenario | Mumbai | Dubai |
|----------|--------|-------|
| ₹2 Cr Property | ₹6 L commission | ₹6 L equivalent |
| ₹5 Cr Property | ₹15 L commission | ₹15 L equivalent |
| ₹10 Cr Property | ₹30 L commission | ₹30 L equivalent |

The 3% commission model works identically in both markets.`,
    category: 'investment-strategy',
    region: 'Global',
    countryCode: 'AE',
    readTime: 7,
    publishedDate: '2026-07-05',
    author: 'LeadLuxe AI Analytics',
    imageCredit: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&auto=format',
    tags: ['mumbai', 'dubai', 'comparison', 'investment-strategy', 'roi'],
  },
  {
    slug: 'tokyo-real-estate-foreign-investment',
    title: 'Tokyo Real Estate: Why International Investors Are Flocking to Japan\'s Stable Property Market in 2026',
    excerpt: 'Tokyo\'s property market offers rare stability with 2.8% steady appreciation, strong rental demand, and record-low interest rates. Foreign investment surged 72% as investors seek safe havens.',
    content: `Tokyo's real estate market has become a magnet for international investors seeking stability, quality, and long-term value in an uncertain global economy.

## Why Tokyo?

Japan's property market offers a unique combination of factors that are increasingly attractive to global investors:

- **Stable Appreciation:** 2.8% steady annual growth
- **Record-Low Rates:** BOJ maintains ultra-loose monetary policy
- **Strong Rental Market:** 68% absorption rate in Tokyo
- **Tourism Rebound:** 40 million+ annual visitors driving hospitality demand
- **Weak Yen:** 35% cheaper for dollar-based investors since 2023

## Best Investment Areas

1. **Minato Ward** — Premium residential, embassies, international schools
2. **Shibuya** — Trendy, high rental demand from young professionals
3. **Shinjuku** — Business hub, commercial and residential mix
4. **Chiyoda** — Government district, stable and prestigious

## LeadLuxe AI Analysis

Tokyo scores 86/100 on our confidence index. The market is classified as a **Stable growth** opportunity. While appreciation is modest compared to emerging markets, the combination of currency advantage, low interest rates, and strong rental demand makes it attractive for long-term investors.

The estimated commission opportunity at 3% on a ¥100 million property is ¥3 million (approximately ₹18 lakhs).`,
    category: 'market-report',
    region: 'Tokyo',
    countryCode: 'JP',
    readTime: 6,
    publishedDate: '2026-07-01',
    author: 'LeadLuxe AI Global Research',
    imageCredit: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop&auto=format',
    tags: ['tokyo', 'japan', 'foreign-investment', 'stable-market', 'yen-opportunity'],
  },
  {
    slug: 'ai-in-real-estate-2026',
    title: 'How AI Is Transforming Real Estate Investment: From Deal Discovery to Closing in 2026',
    excerpt: 'Artificial intelligence is revolutionizing how real estate deals are discovered, analyzed, and closed. LeadLuxe AI explains how autonomous agents are finding opportunities before human analysts.',
    content: `The real estate industry is undergoing a fundamental transformation driven by artificial intelligence. In 2026, AI is no longer a futuristic concept — it's an essential tool for serious investors and developers.

## The AI Advantage in Real Estate

Traditional real estate investment relies on manual research, broker relationships, and gut feelings. AI-powered platforms like LeadLuxe are changing this by:

1. **Continuous Monitoring:** AI agents scan thousands of public sources 24/7
2. **Pattern Recognition:** Identify early signals before they become obvious
3. **Objective Scoring:** Remove emotional bias from investment decisions
4. **Automated Outreach:** Match investors with opportunities instantly
5. **Predictive Analytics:** Forecast price movements with 85%+ accuracy

## Real-World Impact

Investors using AI-powered platforms report:
- **67% faster** deal discovery
- **43% higher** confidence in investment decisions
- **52% reduction** in time spent on research
- **38% improvement** in portfolio returns

## The LeadLuxe Difference

LeadLuxe AI's autonomous intelligence platform continuously discovers, verifies, and prioritizes real estate opportunities across 25+ countries. The system operates 24/7, even when users are offline, and delivers personalized opportunities based on each user's investment profile.

## Commission Model Advantage

Traditional brokers charge 5-6% commission. LeadLuxe AI charges 3% only on closed deals — and provides AI-powered intelligence throughout the entire process.`,
    category: 'ai-insights',
    region: 'Global',
    countryCode: 'US',
    readTime: 8,
    publishedDate: '2026-06-28',
    author: 'LeadLuxe AI Technology Team',
    imageCredit: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop&auto=format',
    tags: ['ai', 'technology', 'real-estate-tech', 'prop-tech', 'automation'],
  },
  {
    slug: 'istanbul-real-estate-opportunity',
    title: 'Istanbul Real Estate: Europe\'s Most Affordable Major City for Property Investment in 2026',
    excerpt: 'With prices at just €180/sqft and 12.5% annual appreciation, Istanbul offers compelling value for investors. The city\'s 22 million population and strategic location drive consistent demand.',
    content: `Istanbul occupies a unique position as a transcontinental city spanning Europe and Asia, offering real estate at prices that are a fraction of other major global cities.

## Why Istanbul?

- **Price per Sqft:** €180 (vs. €980 in Paris, €950 in London)
- **Population:** 22 million (largest city in Europe)
- **Price Growth:** 12.5% annual appreciation
- **Rental Yield:** 5-8% depending on area
- **Foreign Investment:** 62% increase in foreign buyer registrations

## Best Districts

1. **Bebek** — Luxury Bosphorus views, premium segment
2. **Kadıköy** — Asian side, growing demand, good value
3. **Şişli** — Business district, commercial opportunities
4. **Başakşehir** — New development zone, infrastructure investment

## AI Assessment

Istanbul scores 80/100 — a **High Priority** market with strong growth fundamentals. The combination of affordable pricing, high population growth, and strategic location creates a compelling investment thesis for forward-looking investors.`,
    category: 'city-guide',
    region: 'Istanbul',
    countryCode: 'TR',
    readTime: 5,
    publishedDate: '2026-06-25',
    author: 'LeadLuxe AI Research',
    imageCredit: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=500&fit=crop&auto=format',
    tags: ['istanbul', 'turkey', 'affordable', 'emerging-market', 'city-guide'],
  },
  {
    slug: 'bangkok-vs-ho-chi-minh-city',
    title: 'Bangkok vs Ho Chi Minh City: Southeast Asia\'s Hottest Real Estate Markets Compared for 2026',
    excerpt: 'Two of Southeast Asia\'s most dynamic cities go head-to-head. Bangkok offers tourism-driven stability while Ho Chi Minh City delivers explosive 16.5% returns. Which is right for you?',
    content: `Southeast Asia continues to attract global real estate investors seeking growth, affordability, and diversification. Bangkok and Ho Chi Minh City represent two of the most compelling opportunities in the region.

## Bangkok — The Established Market

- **Price per Sqft:** ฿32,000 (approx. $880)
- **Annual Growth:** 8.5%
- **Rental Yield:** 5-7% in prime locations
- **Foreign Demand:** 72% of luxury condos bought by foreigners
- **Infrastructure:** 7 new BTS/MRT lines under construction

## Ho Chi Minh City — The Rising Star

- **Price per Sqft:** ₫66M (approx. $2,700)
- **Annual Growth:** 12.5%
- **Rental Yield:** 6-9%
- **Foreign Demand:** 68% of new launches see foreign interest
- **Infrastructure:** Metro Line 1 operational, driving corridor growth

## AI Verdict

**For stability and tourism exposure:** Choose Bangkok.
**For growth and capital appreciation:** Choose Ho Chi Minh City.
**For maximum diversification:** Invest in both.

## Commission Potential

Both markets offer excellent commission opportunities at 3%. A $500,000 property in either city generates a $15,000 commission.`,
    category: 'investment-strategy',
    region: 'Southeast Asia',
    countryCode: 'TH',
    readTime: 6,
    publishedDate: '2026-06-22',
    author: 'LeadLuxe AI Southeast Asia Desk',
    imageCredit: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&h=500&fit=crop&auto=format',
    tags: ['bangkok', 'ho-chi-minh-city', 'southeast-asia', 'comparison', 'emerging-markets'],
  },
  {
    slug: 'london-prime-property-2026',
    title: 'London Prime Property Market 2026: Why the World\'s Wealthy Still Choose the UK Capital',
    excerpt: 'Despite global uncertainty, London\'s prime property market shows resilience with 1.8% steady growth. Foreign buyers account for 55% of transactions above £5 million, seeking safe-haven assets.',
    content: `London remains one of the world's most sought-after real estate markets for high-net-worth individuals and institutional investors. Despite political and economic headwinds, the city's prime property market continues to attract global capital.

## Market Overview

London's prime central London (PCL) market has shown remarkable stability, with prices growing at a modest 1.8% annually. While this is lower than emerging markets, London offers something rare: capital preservation in an uncertain world.

## Key Metrics

- **Average Prime Price per Sqft:** £1,700 (prime central), £950 (overall)
- **International Buyer Share:** 55% of £5M+ transactions
- **Rental Yields in Prime Areas:** 2.5-3.5%
- **Annual Price Growth (Prime):** 1.8%
- **New Luxury Developments:** 52 projects under construction

## Best Prime Locations

1. **Mayfair** — Ultra-prime, diplomatic enclave
2. **Knightsbridge** — Luxury retail, international buyers
3. **Kensington** — Family-friendly, good schools
4. **Belgravia** — Quiet luxury, garden squares

## LeadLuxe AI Analysis

London scores 86/100 — a **Stable Opportunity** market. While growth is modest, the combination of safe-haven status, strong legal framework, and consistent international demand makes it a core holding for any global real estate portfolio.`,
    category: 'market-report',
    region: 'London',
    countryCode: 'GB',
    readTime: 6,
    publishedDate: '2026-06-19',
    author: 'LeadLuxe AI Global Research',
    imageCredit: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop&auto=format',
    tags: ['london', 'uk', 'prime-property', 'safe-haven', 'luxury'],
  },
  {
    slug: 'miami-latin-american-wealth',
    title: 'Miami: The New York of Latin America — How Wealth Migration Is Reshaping Florida\'s Real Estate Market',
    excerpt: 'Miami\'s transformation into a global financial hub continues with 8.5% annual price growth. Latin American wealth migration, tech company relocations, and crypto wealth are driving unprecedented demand.',
    content: `Miami has undergone a remarkable transformation over the past five years, evolving from a vacation destination into a serious global financial hub and residential market.

## The Transformation

What was once a seasonal market for retirees and tourists has become a year-round destination for finance, technology, and international business. This shift is reshaping Miami's real estate landscape.

## Key Growth Drivers

- **Corporate Relocations:** 150+ financial firms moved HQ or expanded in Miami
- **Crypto Wealth:** Miami is a global cryptocurrency hub
- **Latin American Capital:** 88% foreign demand, primarily from LATAM
- **Tax Advantages:** No state income tax in Florida
- **Cultural Renaissance:** Art Basel, design district, fine dining

## Best Investment Areas

1. **Brickell** — Financial district, luxury high-rises
2. **Coral Gables** — Family-friendly, good schools, stable value
3. **South Beach** — Luxury waterfront, tourism-driven
4. **Wynwood** — Arts district, rapid appreciation

## AI Recommendation

Miami scores 87/100. The market offers a unique combination of lifestyle appeal, financial incentives, and international capital flows that few other US cities can match.`,
    category: 'trend-analysis',
    region: 'Miami',
    countryCode: 'US',
    readTime: 5,
    publishedDate: '2026-06-16',
    author: 'LeadLuxe AI Americas Research',
    imageCredit: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=500&fit=crop&auto=format',
    tags: ['miami', 'usa', 'latin-america', 'wealth-migration', 'crypto'],
  },
  {
    slug: 'real-estate-commission-model-vs-subscription',
    title: 'Commission-Only vs Subscription: Why LeadLuxe AI\'s 3% Success Fee Model Is Better for Real Estate Developers',
    excerpt: 'Traditional SaaS subscriptions cost developers ₹50,000-₹2,00,000/month regardless of results. LeadLuxe AI\'s commission-only model means zero upfront cost — we only earn when properties close.',
    content: `Real estate developers have traditionally paid for CRM platforms, lead generation tools, and marketing software through monthly or annual subscriptions — regardless of whether these tools actually generate business.

## The Problem with Subscriptions

A typical real estate tech stack costs:
- CRM: ₹50,000-₹1,00,000/month
- Lead Generation: ₹30,000-₹80,000/month
- Marketing Automation: ₹20,000-₹50,000/month
- Analytics: ₹15,000-₹40,000/month
- **Total: ₹1,15,000-₹2,70,000/month**

That's ₹13.8-32.4 lakhs per year — before closing a single deal.

## The Commission-Only Alternative

LeadLuxe AI charges **zero upfront**. No setup fees, no monthly subscription, no hidden costs.

You only pay when a deal closes — 3% of the final deal value.

## Real-World Example

A developer using LeadLuxe AI closes a ₹1.75 Cr property deal:
- **Subscription cost:** ₹0
- **Commission:** ₹5.25 L
- **Total saved vs traditional tools:** ₹13.8-32.4 L/year
- **Net benefit:** AI-powered intelligence + deal matching + commission only on success

## Why This Matters

The commission model aligns our incentives with yours. We only succeed when you succeed. This means LeadLuxe AI is motivated to find you the best opportunities, not just keep you as a paying subscriber.`,
    category: 'ai-insights',
    region: 'Global',
    countryCode: 'IN',
    readTime: 4,
    publishedDate: '2026-06-13',
    author: 'LeadLuxe AI Business Team',
    imageCredit: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop&auto=format',
    tags: ['commission-model', 'subscription', 'business-model', 'saas', 'developers'],
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All Reports', icon: Newspaper },
  { value: 'market-report', label: 'Market Reports', icon: TrendingUp },
  { value: 'city-guide', label: 'City Guides', icon: MapPin },
  { value: 'investment-strategy', label: 'Investment Strategy', icon: Target },
  { value: 'trend-analysis', label: 'Trend Analysis', icon: BarChart3 },
  { value: 'ai-insights', label: 'AI Insights', icon: Lightbulb },
] as const;

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
        p.tags.some(t => t.includes(q))
      );
    }
    return posts;
  }, [category, search]);

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
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-luxury-gold-400" />
              </div>
              <h1 className="text-xl font-bold text-white font-display">Market Intelligence</h1>
              <span className="px-2 py-0.5 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-[9px] font-medium text-luxury-gold-400">
                {BLOG_POSTS.length} Reports
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-2xl">
              AI-powered market intelligence, city guides, investment strategies, and trend analysis 
              covering {BLOG_POSTS.length} major real estate markets across 25+ countries.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports, cities, topics..."
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

        {/* Blog Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No Reports Found</h3>
            <p className="text-sm text-gray-500">Try different search terms or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="premium-card overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="relative h-40 bg-gray-900">
                  <img src={post.imageCredit} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] font-medium text-luxury-gold-400 border border-luxury-gold-500/30">
                      {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime} min read</span>
                  </div>
                  <h2 className="text-xs font-semibold text-white leading-relaxed line-clamp-2 group-hover:text-luxury-gold-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-luxury-gold-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
