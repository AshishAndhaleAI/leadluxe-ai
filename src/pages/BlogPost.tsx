// ============================================================
// LeadLuxe AI — Blog Post Detail Page
// Full article rendering with SEO, related posts, and
// article structured data for Google Rich Results.
// ============================================================

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, User, Tag, Share2,
  ArrowRight, Building2, TrendingUp, Globe, Sparkles,
  ChevronRight,
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

const CATEGORIES: Record<string, { label: string; color: string }> = {
  'market-report': { label: 'Market Report', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'city-guide': { label: 'City Guide', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  'investment-strategy': { label: 'Investment Strategy', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  'trend-analysis': { label: 'Trend Analysis', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'ai-insights': { label: 'AI Insights', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'dubai-real-estate-market-2026',
    title: 'Dubai Real Estate Market 2026: Premium Segment Driving 18% Growth as Off-Plan Sales Surge',
    excerpt: 'Dubai\'s real estate market continues its remarkable trajectory with luxury property prices surging 18.5% year-on-year.',
    content: `## Market Overview\n\nDubai's real estate market has entered a new phase of maturity and growth in 2026. The luxury segment continues to outperform, with prices in prime areas seeing significant appreciation.\n\n## Key Market Indicators\n\n- **Average Price per Sqft:** AED 1,800\n- **Foreign Investment:** 72% of off-plan buyers are international\n- **Rental Yields:** Average 6.8% across the city\n- **New Launches:** 62 new projects in H1 2026\n\n## AI Confidence Score: 94/100\n\nLeadLuxe AI rates Dubai as a **Critical** opportunity market. The combination of strong foreign demand, government initiatives, and infrastructure spending creates a favorable environment for real estate investment.`,
    category: 'market-report',
    region: 'Dubai',
    countryCode: 'AE',
    readTime: 5,
    publishedDate: '2026-07-15',
    author: 'LeadLuxe AI Research',
    imageCredit: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&auto=format',
    tags: ['dubai', 'uae', 'luxury', 'market-report'],
  },
  {
    slug: 'pune-real-estate-investment-guide-2026',
    title: 'Pune Real Estate Investment Guide 2026: Kharadi, Baner, and Hinjewadi Lead Growth with 15.8% Average ROI',
    excerpt: 'Pune has emerged as India\'s most attractive real estate investment destination with 12.3% price growth.',
    content: `## Market Overview\n\nPune's real estate market continues to outperform other Indian metros, driven by IT sector growth, infrastructure development, and increasing demand for quality housing.\n\n## Top Investment Areas\n\n1. **Kharadi** — 18.2% annual appreciation\n2. **Baner** — 14.5% growth, premium residential\n3. **Hinjewadi** — 16.8% growth, IT park proximity\n\n## AI Recommendation\n\nWith a confidence score of 89/100, LeadLuxe AI recommends Pune as a High-Priority investment market.`,
    category: 'market-report',
    region: 'Pune',
    countryCode: 'IN',
    readTime: 4,
    publishedDate: '2026-07-12',
    author: 'LeadLuxe AI Analytics',
    imageCredit: 'https://images.unsplash.com/photo-1560448204-603b69fc5a79?w=800&h=500&fit=crop&auto=format',
    tags: ['pune', 'india', 'investment', 'market-report'],
  },
  {
    slug: 'saudi-arabia-vision-2030-real-estate',
    title: 'Saudi Arabia Vision 2030 Real Estate Boom: Riyadh, Jeddah, NEOM Creating Unprecedented Opportunities',
    excerpt: 'Saudi Arabia\'s giga-projects and economic reforms are transforming the real estate landscape.',
    content: `## The Transformation\n\nSaudi Arabia is investing over $1 trillion in giga-projects including NEOM, The Red Sea Project, Qiddiya, and Diriyah Gate.\n\n## Riyadh: The Capital's Boom\n\n- **Population Target:** 15-20 million by 2030\n- **New Units Needed:** 300,000+ residential units\n- **Price Growth:** 18.5% YoY\n\n## AI Confidence Score: 85/100\n\nLeadLuxe AI rates Saudi Arabia as a High-growth opportunity market.`,
    category: 'trend-analysis',
    region: 'Saudi Arabia',
    countryCode: 'SA',
    readTime: 6,
    publishedDate: '2026-07-10',
    author: 'LeadLuxe AI Global Research',
    imageCredit: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=500&fit=crop&auto=format',
    tags: ['saudi-arabia', 'vision-2030', 'riyadh', 'mega-projects'],
  },
  {
    slug: 'berlin-real-estate-market-2026',
    title: 'Berlin Real Estate Market 2026: Steady Growth in Europe\'s Most Dynamic Capital City',
    excerpt: 'Berlin\'s property market shows resilient 7.8% growth as tech sector expansion drives demand.',
    content: `## Market Dynamics\n\nBerlin's real estate market has shown remarkable resilience in 2026, with prices growing at a steady 7.8%.\n\n## Key Metrics\n\n- **Average Price per Sqft:** €520\n- **Rental Yield:** 3.5-4.5%\n- **Price Growth:** 7.8% annual appreciation\n\n## LeadLuxe AI Analysis\n\nBerlin scores 82/100 on our confidence index. The market offers good value compared to other European capitals.`,
    category: 'city-guide',
    region: 'Berlin',
    countryCode: 'DE',
    readTime: 5,
    publishedDate: '2026-07-08',
    author: 'LeadLuxe AI Research',
    imageCredit: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=500&fit=crop&auto=format',
    tags: ['berlin', 'germany', 'europe', 'city-guide'],
  },
];

const ALL_POSTS = BLOG_POSTS;

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const post = useMemo(() => ALL_POSTS.find(p => p.slug === slug), [slug]);
  const relatedPosts = useMemo(() =>
    ALL_POSTS.filter(p => p.slug !== slug && (p.category === post?.category || p.region === post?.region)).slice(0, 3),
    [slug, post]
  );

  if (!post) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Article Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">This market report isn't available.</p>
          <button onClick={() => navigate('/blog')} className="btn-primary text-xs">Browse All Reports</button>
        </div>
      </div>
    );
  }

  const categoryStyle = CATEGORIES[post.category] || CATEGORIES['market-report'];

  // Format content with simple markdown-like parsing
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-white mt-6 mb-2 font-display">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold text-white mt-4 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) return <li key={i} className="text-xs text-gray-300 ml-4 list-disc mb-1"><strong className="text-white">{match[1]}</strong>{match[2] ? ` — ${match[2]}` : ''}</li>;
      }
      if (line.startsWith('- ')) return <li key={i} className="text-xs text-gray-300 ml-4 list-disc mb-1">{line.slice(2)}</li>;
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        return <li key={i} className="text-xs text-gray-300 ml-4 list-decimal mb-1">{line.slice(3)}</li>;
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-xs text-gray-300 leading-relaxed mb-2">{line}</p>;
    });
  };

  return (
    <>
      <SEOHelmet
        title={post.title}
        description={post.excerpt}
        image={post.imageCredit}
        url={`https://leadluxe-ai.vercel.app/blog/${post.slug}`}
        type="article"
      />
      <BreadcrumbLD items={[
        { name: 'Home', url: '/' },
        { name: 'Market Intelligence', url: '/blog' },
        { name: post.title.slice(0, 50) + '...', url: `/blog/${post.slug}` },
      ]} />
      {/* Article JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          image: post.imageCredit,
          datePublished: post.publishedDate,
          author: { '@type': 'Organization', name: post.author },
          publisher: { '@type': 'Organization', name: 'LeadLuxe AI' },
        })}
      </script>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <button onClick={() => navigate('/blog')} className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Back to Market Intelligence
        </button>

        {/* Article Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-900"
        >
          <img src={post.imageCredit} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border', categoryStyle.color)}>{categoryStyle.label}</span>
              <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-[10px] text-gray-300 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {post.region}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display leading-tight">{post.title}</h1>
          </div>
        </motion.div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} min read</span>
          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-6 sm:p-8"
        >
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            {renderContent(post.content)}
          </div>

          {/* Tags */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3 h-3 text-gray-500" />
              {post.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/blog?search=${tag}`)}
                  className="px-2 py-0.5 rounded-lg bg-gray-800 text-[10px] text-gray-400 hover:text-white transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-white font-display mb-4">Related Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedPosts.map((rp, i) => {
                const rpCat = CATEGORIES[rp.category] || CATEGORIES['market-report'];
                return (
                  <motion.button
                    key={rp.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/blog/${rp.slug}`)}
                    className="premium-card overflow-hidden text-left group"
                  >
                    <div className="relative h-28 bg-gray-900">
                      <img src={rp.imageCredit} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium border bg-black/40 backdrop-blur-sm', rpCat.color)}>{rpCat.label}</span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h3 className="text-[10px] font-semibold text-white leading-relaxed line-clamp-2 group-hover:text-luxury-gold-400 transition-colors">{rp.title}</h3>
                      <p className="text-[9px] text-gray-500 mt-1">{rp.readTime} min read</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="premium-card p-6 text-center bg-gradient-to-br from-gray-900 to-gray-950 border-luxury-gold-500/20">
          <Sparkles className="w-6 h-6 text-luxury-gold-400 mx-auto mb-2" />
          <h2 className="text-base font-bold text-white font-display mb-1">Want Personalized Opportunities?</h2>
          <p className="text-xs text-gray-400 mb-4">Get AI-powered property matches based on your investment profile.</p>
          <button onClick={() => navigate('/login')} className="btn-primary text-xs">
            Get Started Free
          </button>
          <p className="text-[9px] text-gray-600 mt-2">No upfront cost · 3% commission only on closed deals</p>
        </div>
      </div>
    </>
  );
}
