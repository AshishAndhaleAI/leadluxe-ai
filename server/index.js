// ============================================================
// LeadLuxe AI — RSS News Proxy Server
// Fetches RSS feeds server-side to avoid CORS restrictions
// Endpoints:
//   GET /api/proxy/rss?url=...     — Fetch & parse RSS feed
//   GET /api/proxy/google-news?q=... — Google News RSS shortcut
//   GET /api/health                — Health check
//   GET /api/status                — Proxy status / stats
// ============================================================

const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PROXY_PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000';

// Track stats
const stats = {
  totalRequests: 0,
  totalBytesFetched: 0,
  errors: 0,
  uptime: new Date().toISOString(),
  lastRequest: null,
  lastError: null,
  sourcesFetched: {},
};

// =====================
// Middleware
// =====================
app.use(cors({
  origin: ALLOWED_ORIGINS.split(',').map(s => s.trim()),
  methods: ['GET'],
  maxAge: 600,
}));

app.use(express.json({ limit: '1mb' }));

// Simple request logging
app.use((req, res, next) => {
  stats.totalRequests++;
  stats.lastRequest = new Date().toISOString();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// =====================
// RSS Fetch Helper
// =====================
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      },
      timeout: 15000,
    };

    client.get(url, options, (res) => {
      const chunks = [];
      let totalLength = 0;

      res.on('data', (chunk) => {
        chunks.push(chunk);
        totalLength += chunk.length;
      });

      res.on('end', () => {
        const data = Buffer.concat(chunks).toString('utf-8');
        stats.totalBytesFetched += totalLength;

        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          contentType: res.headers['content-type'] || '',
        });
      });
    });

    client.on('error', reject);
    client.on('timeout', () => {
      client.destroy();
      reject(new Error('Request timed out after 15s'));
    });
  });
}

function parseRSSItems(xml) {
  if (!xml || xml.length < 100) return [];

  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = extractTag(content, 'title');
    const link = extractTag(content, 'link');
    const description = extractTag(content, 'description');
    const pubDate = extractTag(content, 'pubDate');
    const source = extractSource(link);

    if (title) {
      items.push({
        title: decodeXML(title),
        link,
        description: stripHTML(decodeXML(description || '')).slice(0, 500),
        pubDate,
        source,
      });
    }
  }

  return items;
}

function extractTag(xml, tag) {
  // Try CDATA first, then regular content
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, 's');
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1];

  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, 's');
  const match = regex.exec(xml);
  return match ? match[1].trim() : '';
}

function extractSource(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function stripHTML(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeXML(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// =====================
// Routes
// =====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: stats.uptime,
    timestamp: new Date().toISOString(),
  });
});

// Proxy stats
app.get('/api/status', (req, res) => {
  res.json({
    ...stats,
    version: '2.0.0',
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'development',
  });
});

// Generic RSS proxy: /api/proxy/rss?url=<encoded-url>
app.get('/api/proxy/rss', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  try {
    const result = await fetchAndParseRSS(url);
    res.json(result);
  } catch (err) {
    stats.errors++;
    stats.lastError = err.message;
    console.error(`[Proxy] Error fetching ${url.slice(0, 80)}: ${err.message}`);

    res.status(502).json({
      success: false,
      source: url,
      error: err.message,
      fetchedAt: new Date().toISOString(),
    });
  }
});

/**
 * Shared function: fetch a URL, parse RSS items, and return standardized response.
 * Used by both /api/proxy/rss and /api/proxy/google-news.
 */
async function fetchAndParseRSS(url) {
  console.log(`[Proxy] Fetching RSS: ${url.slice(0, 100)}...`);
  const result = await fetchUrl(url);
  const items = parseRSSItems(result.data);

  // Track source
  const hostname = extractSource(url);
  stats.sourcesFetched[hostname] = (stats.sourcesFetched[hostname] || 0) + 1;

  return {
    success: true,
    source: url,
    statusCode: result.statusCode,
    contentType: result.contentType,
    totalBytes: result.data.length,
    itemCount: items.length,
    items,
    fetchedAt: new Date().toISOString(),
  };
}

// Google News shortcut: /api/proxy/google-news?q=<query>
app.get('/api/proxy/google-news', async (req, res) => {
  const query = req.query.q || 'real+estate+development+India';
  const googleUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN`;

  try {
    const result = await fetchAndParseRSS(googleUrl);
    res.json(result);
  } catch (err) {
    stats.errors++;
    stats.lastError = err.message;
    res.status(502).json({
      success: false,
      source: googleUrl,
      error: err.message,
      fetchedAt: new Date().toISOString(),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n`);
  console.log(`  ╔══════════════════════════════════════════╗`);
  console.log(`  ║     LeadLuxe AI — RSS Proxy Server      ║`);
  console.log(`  ║──────────────────────────────────────────║`);
  console.log(`  ║  Port:     ${String(PORT).padEnd(32)}║`);
  console.log(`  ║  Origins:  ${ALLOWED_ORIGINS.padEnd(32)}║`);
  console.log(`  ║  Started:  ${new Date().toISOString().padEnd(32)}║`);
  console.log(`  ╚══════════════════════════════════════════╝`);
  console.log(`\n  Endpoints:`);
  console.log(`    GET http://localhost:${PORT}/api/health`);
  console.log(`    GET http://localhost:${PORT}/api/status`);
  console.log(`    GET http://localhost:${PORT}/api/proxy/rss?url=<encoded-url>`);
  console.log(`    GET http://localhost:${PORT}/api/proxy/google-news?q=<query>`);
  console.log(`\n`);
});
