// ============================================================
// LeadLuxe AI — Sitemap Generator
// Run: node scripts/generate-sitemap.js
// Generates public/sitemap.xml for search engine indexing
// ============================================================

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://leadluxe-ai.vercel.app';
const NOW = new Date().toISOString().split('T')[0];

// Static pages
const STATIC_PAGES = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/deal-room', priority: 0.9, changefreq: 'daily' },
  { url: '/global-map', priority: 0.8, changefreq: 'weekly' },
  { url: '/deal-compass', priority: 0.8, changefreq: 'weekly' },
  { url: '/gravity', priority: 0.8, changefreq: 'weekly' },
  { url: '/gravity-engine', priority: 0.8, changefreq: 'weekly' },
  { url: '/match', priority: 0.7, changefreq: 'weekly' },
  { url: '/portfolio', priority: 0.6, changefreq: 'weekly' },
  { url: '/blog', priority: 0.9, changefreq: 'weekly' },
  { url: '/login', priority: 0.3, changefreq: 'monthly' },
  { url: '/experience', priority: 0.9, changefreq: 'weekly' },
  { url: '/opportunities', priority: 0.8, changefreq: 'daily' },
  { url: '/opportunity', priority: 0.7, changefreq: 'daily' },
  { url: '/signals', priority: 0.8, changefreq: 'daily' },
  { url: '/forecasts', priority: 0.7, changefreq: 'weekly' },
  { url: '/commission', priority: 0.7, changefreq: 'weekly' },
  { url: '/competitors', priority: 0.6, changefreq: 'weekly' },
  { url: '/coach', priority: 0.6, changefreq: 'weekly' },
  { url: '/about', priority: 0.5, changefreq: 'monthly' },
  { url: '/contact', priority: 0.5, changefreq: 'monthly' },
  { url: '/dashboard', priority: 0.4, changefreq: 'daily' },
  { url: '/settings', priority: 0.2, changefreq: 'monthly' },
];

// Countries (25 countries)
const COUNTRIES = [
  'in','ae','us','gb','sg','sa','de','fr','jp','kr','th','vn',
  'br','mx','tr','es','it','nl','ca','au','my','qa','za','ng','eg'
];

// Blog posts
const BLOG_POSTS = [
  'dubai-real-estate-market-2026',
  'pune-real-estate-investment-guide-2026',
  'saudi-arabia-vision-2030-real-estate',
  'berlin-real-estate-market-2026',
  'mumbai-vs-dubai-investment-comparison',
  'tokyo-real-estate-foreign-investment',
  'ai-in-real-estate-2026',
  'istanbul-real-estate-opportunity',
  'bangkok-vs-ho-chi-minh-city',
  'london-prime-property-2026',
  'miami-latin-american-wealth',
  'real-estate-commission-model-vs-subscription',
];

function generateSitemap() {
  const urls = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    urls.push(page);
  }

  // Country pages
  for (const code of COUNTRIES) {
    urls.push({ url: `/country/${code}`, priority: 0.7, changefreq: 'weekly' });
  }

  // Blog posts
  for (const slug of BLOG_POSTS) {
    urls.push({ url: `/blog/${slug}`, priority: 0.7, changefreq: 'monthly' });
  }

  // City pages (major cities)
  const CITIES = [
    'mumbai','pune','bengaluru','hyderabad','delhi','chennai','gurgaon','kolkata',
    'dubai','abu-dhabi',
    'new-york-city','san-francisco','los-angeles','miami','chicago','austin',
    'london','manchester',
    'singapore',
    'riyadh','jeddah',
    'toronto','vancouver',
    'sydney','melbourne','brisbane',
    'kuala-lumpur','doha',
    'berlin','munich','frankfurt','hamburg',
    'paris','lyon','nice',
    'tokyo','osaka','kyoto',
    'seoul','busan',
    'bangkok','phuket',
    'ho-chi-minh-city','hanoi',
    'sao-paulo','rio-de-janeiro',
    'mexico-city','cancun',
    'istanbul','antalya',
    'madrid','barcelona',
    'milan','rome',
    'cape-town','johannesburg',
    'lagos','abuja',
    'cairo','alexandria',
  ];

  for (const city of CITIES) {
    urls.push({ url: `/city/${city}`, priority: 0.6, changefreq: 'weekly' });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

  const outputPath = resolve(__dirname, '../public/sitemap.xml');
  writeFileSync(outputPath, xml, 'utf-8');
  console.log(`✅ Sitemap generated: ${outputPath}`);
  console.log(`   ${urls.length} URLs indexed`);
}

generateSitemap();
