// ============================================================
// Google News RSS Connector — Real public source
// Fetches real-time real estate news from Google News RSS
// ============================================================

import { memorySystem } from '../core/memory';
import { knowledgeGraph } from '../core/knowledge-graph';

export interface RawArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  snippet: string;
}

export interface NormalizedSignal {
  type: string;
  title: string;
  description: string;
  sourceUrl: string;
  source: string;
  date: string;
  developerName?: string;
  location?: string;
  rawData: any;
  confidence: number;
  country: string;
  language: string;
  verificationStatus: 'verified' | 'unverified' | 'pending';
}

const RSS_QUERIES = [
  'real+estate+development+India',
  'real+estate+builder+project+launch',
  'RERA+filing+approval',
  'real+estate+land+acquisition',
  'property+market+India+trends',
  'real+estate+funding+investment',
  'construction+project+India',
  'real+estate+partnership+joint+venture',
  'housing+project+approval+clearance',
  'real+estate+commercial+development',
];

const NEWSPAPER_SOURCES = [
  'timesofindia.indiatimes.com',
  'economictimes.indiatimes.com',
  'hindustantimes.com',
  'thehindu.com',
  'business-standard.com',
  'livemint.com',
  'financialexpress.com',
  'indianexpress.com',
  'theprint.in',
  'moneycontrol.com',
];

export class GoogleNewsConnector {
  private baseUrl = 'https://news.google.com/rss/search?hl=en-IN&gl=IN';
  private lastFetchTime = 0;
  private minFetchInterval = 300000; // 5 minutes
  public name = 'Google News Connector';
  public sourceType = 'google_news';
  public totalFetched = 0;
  public totalSignals = 0;
  public lastError: string | null = null;
  public lastSuccessAt: string | null = null;

  /**
   * Check if connector can be called (respect rate limits)
   */
  canFetch(): boolean {
    return Date.now() - this.lastFetchTime >= this.minFetchInterval;
  }

  /**
   * Fetch news from Google News RSS for real estate queries
   */
  async fetchAll(): Promise<NormalizedSignal[]> {
    if (!this.canFetch()) {
      console.log('[GoogleNewsConnector] Rate limited — waiting');
      return [];
    }

    const allSignals: NormalizedSignal[] = [];
    this.lastFetchTime = Date.now();

    for (const query of RSS_QUERIES.slice(0, 3)) { // Limit to 3 per cycle
      try {
        const url = `${this.baseUrl}&q=${query}`;
        console.log(`[GoogleNewsConnector] Fetching: ${url}`);

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });

        if (!response.ok) {
          console.warn(`[GoogleNewsConnector] HTTP ${response.status} for query: ${query}`);
          continue;
        }

        const xml = await response.text();
        const articles = this.parseRSS(xml);
        const normalized = articles
          .map(a => this.normalizeArticle(a))
          .filter((n): n is NormalizedSignal => !!n && memorySystem.trackDiscovery({
            sourceUrl: n.sourceUrl,
            sourceType: 'google_news',
            discoveredAt: new Date().toISOString(),
            alreadyProcessed: false,
            entitiesFound: [n.developerName || n.title],
            hash: this.hashUrl(n.sourceUrl),
          }));

        allSignals.push(...normalized);
      } catch (err: any) {
        this.lastError = err.message;
        console.warn(`[GoogleNewsConnector] Error: ${err.message}`);
      }
    }

    this.totalFetched += allSignals.length;
    this.totalSignals += allSignals.length;
    this.lastSuccessAt = new Date().toISOString();
    console.log(`[GoogleNewsConnector] Fetched ${allSignals.length} new signals`);

    return allSignals;
  }

  private parseRSS(xml: string): RawArticle[] {
    const articles: RawArticle[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const content = match[1];
      const title = this.extractTag(content, 'title');
      const url = this.extractTag(content, 'link');
      const source = this.extractSource(url);
      const pubDate = this.extractTag(content, 'pubDate');
      const snippet = this.extractTag(content, 'description');

      if (title && url) {
        articles.push({
          title: this.decodeXML(title),
          url,
          source: source || 'Google News',
          publishedAt: pubDate || new Date().toISOString(),
          snippet: this.stripHTML(this.decodeXML(snippet || '')),
        });
      }
    }

    return articles;
  }

  private normalizeArticle(article: RawArticle): NormalizedSignal | null {
    // Skip if already in knowledge graph
    const existing = knowledgeGraph.findNodes('news', n => n.sourceUrl === article.url);
    if (existing.length > 0) return null;

    const builderNames = this.extractBuilderNames(article.title + ' ' + article.snippet);
    const locations = this.extractLocations(article.title + ' ' + article.snippet);
    const signalType = this.classifySignalType(article.title + ' ' + article.snippet);

    return {
      type: signalType,
      title: article.title.slice(0, 200),
      description: article.snippet.slice(0, 500),
      sourceUrl: article.url,
      source: article.source,
      date: article.publishedAt,
      developerName: builderNames[0],
      location: locations[0],
      rawData: article,
      confidence: this.calculateConfidence(article),
      country: 'IN',
      language: 'en',
      verificationStatus: NEWSPAPER_SOURCES.some(s => article.url.includes(s)) ? 'verified' : 'unverified',
    };
  }

  private classifySignalType(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('rera') || lower.includes('registration')) return 'rera_filing';
    if (lower.includes('approval') || lower.includes('clearance') || lower.includes('permission')) return 'government_approval';
    if (lower.includes('land') && (lower.includes('acquire') || lower.includes('buy') || lower.includes('purchase'))) return 'land_acquisition';
    if (lower.includes('hiring') || lower.includes('recruit') || lower.includes('job')) return 'builder_hiring';
    if (lower.includes('funding') || lower.includes('investment') || lower.includes('raised') || lower.includes('capital')) return 'funding_raised';
    if (lower.includes('launch') || lower.includes('unveil') || lower.includes('introduce')) return 'project_launch';
    if (lower.includes('partner') || lower.includes('collaboration') || lower.includes('alliance')) return 'partnership';
    if (lower.includes('expand') || lower.includes('new market') || lower.includes('foray')) return 'expansion';
    if (lower.includes('price') || lower.includes('rate') || lower.includes('appreciation')) return 'market_trend';
    if (lower.includes('construction') || lower.includes('build') || lower.includes('development')) return 'construction_start';
    if (lower.includes('permit') || lower.includes('oc') || lower.includes('occupancy')) return 'permit_issued';
    return 'news_coverage';
  }

  private extractBuilderNames(text: string): string[] {
    const known = ['Lodha', 'Godrej', 'Oberoi', 'Prestige', 'Brigade', 'Sobha', 'DLF', 'Kolte Patil',
      'VTP', 'Kumar', 'Patil', 'Shah', 'Mehta', 'Singh', 'Kapoor', 'Bajaj', 'Birla', 'Goenka',
      'Mahindra Lifespace', 'Puravankara', 'Rustomjee', 'Hiranandani', 'Wadhwa', 'K Raheja', 'Runwal'];
    return known.filter(n => text.toLowerCase().includes(n.toLowerCase()));
  }

  private extractLocations(text: string): string[] {
    const cities = ['Mumbai', 'Pune', 'Bengaluru', 'Bangalore', 'Hyderabad', 'Chennai', 'Delhi', 'Noida',
      'Gurgaon', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Thane', 'Navi Mumbai'];
    return cities.filter(c => text.toLowerCase().includes(c.toLowerCase()));
  }

  private calculateConfidence(article: RawArticle): number {
    let score = 50;
    if (article.title && article.title.length > 20) score += 10;
    if (article.snippet && article.snippet.length > 50) score += 10;
    if (NEWSPAPER_SOURCES.some(s => article.url.includes(s))) score += 20;
    if (this.extractBuilderNames(article.title).length > 0) score += 10;
    if (this.extractLocations(article.title).length > 0) score += 10;
    return Math.min(score, 100);
  }

  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash-${Math.abs(hash)}`;
  }

  private extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[(.*?)\\]\\]></${tag}>|<${tag}>(.*?)</${tag}>`, 's');
    const match = regex.exec(xml);
    return match?.[1] || match?.[2] || '';
  }

  private extractSource(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return 'Google News';
    }
  }

  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private decodeXML(text: string): string {
    return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
  }
}

export const googleNewsConnector = new GoogleNewsConnector();
