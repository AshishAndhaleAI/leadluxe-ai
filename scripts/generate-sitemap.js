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
  { url: '/login', priority: 0.3, changefreq: 'monthly' },
];

// Generate XML
function generateSitemap() {
  const urls = [...STATIC_PAGES];

  // We can't import the property database here since it uses DOM APIs,
  // but we can still generate a sitemap structure.
  // In production, you'd run this as a build step with the actual data.

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
