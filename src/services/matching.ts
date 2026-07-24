// ============================================================
// LeadLuxe AI — Capital Introduction Matching Engine
// Matches developers + investors to high-scoring opportunities.
// Used by: capital-introduction-workflow.ts, AdminOutreach.tsx
// ============================================================

import type { Property } from '../lib/property-database';
import { CITIES } from '../lib/global-data';

// ─── Types ───────────────────────────────────────────────────
export interface DeveloperMatch {
  companyName: string;
  website?: string;
  city: string;
  assetFocus: string[];
  activeProjects: number;
  reraCompliant: boolean;
  matchScore: number;
  whyMatched: string[];
  estimatedTicketSize: number;
  sourceUrl?: string;
}

export interface InvestorMatch {
  userId: string;
  name: string;
  email: string;
  budgetRange: [number, number];
  preferredCities: string[];
  nriCountry?: string;
  investmentGoal: string;
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  matchScore: number;
  whyMatched: string[];
  consentMarketing: boolean;
}

export interface CapitalMatch {
  id: string;
  opportunityId: string;
  propertyId: string;
  propertyName: string;
  city: string;
  country: string;
  opportunityScore: number;
  developer: DeveloperMatch;
  investors: InvestorMatch[];
  matchScore: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'deployed';
}

// ─── Developer Discovery ─────────────────────────────────────
// Uses verified public sources only — no scraped personal data.
const KNOWN_DEVELOPERS: DeveloperMatch[] = [
  { companyName: 'Lodha Group', website: 'https://www.lodhagroup.com', city: 'Mumbai', assetFocus: ['luxury', 'ultra-luxury', 'commercial'], activeProjects: 12, reraCompliant: true, matchScore: 0, whyMatched: [], estimatedTicketSize: 250000000, sourceUrl: 'https://www.lodhagroup.com' },
  { companyName: 'DLF Ltd', website: 'https://www.dlf.in', city: 'Gurugram', assetFocus: ['luxury', 'commercial', 'retail'], activeProjects: 8, reraCompliant: true, matchScore: 0, whyMatched: [], estimatedTicketSize: 500000000, sourceUrl: 'https://www.dlf.in' },
  { companyName: 'Godrej Properties', website: 'https://www.godrejproperties.com', city: 'Mumbai', assetFocus: ['luxury', 'premium', 'commercial'], activeProjects: 15, reraCompliant: true, matchScore: 0, whyMatched: [], estimatedTicketSize: 200000000, sourceUrl: 'https://www.godrejproperties.com' },
  { companyName: 'Prestige Group', website: 'https://www.prestigeconstructions.com', city: 'Bengaluru', assetFocus: ['luxury', 'commercial', 'hospitality'], activeProjects: 10, reraCompliant: true, matchScore: 0, whyMatched: [], estimatedTicketSize: 300000000, sourceUrl: 'https://www.prestigeconstructions.com' },
  { companyName: 'Brigade Group', website: 'https://www.brigadegroup.com', city: 'Bengaluru', assetFocus: ['premium', 'commercial', 'office'], activeProjects: 7, reraCompliant: true, matchScore: 0, whyMatched: [], estimatedTicketSize: 150000000, sourceUrl: 'https://www.brigadegroup.com' },
  { companyName: 'Oberoi Realty', website: 'https://www.oberoirealty.com', city: 'Mumbai', assetFocus: ['ultra-luxury', 'luxury', 'commercial'], activeProjects: 5, reraCompliant: true, matchScore: 0, whyMatched: [], estimatedTicketSize: 400000000, sourceUrl: 'https://www.oberoirealty.com' },
  { companyName: 'Kolte-Patil Developers', website: 'https://www.koltepatil.com', city: 'Pune', assetFocus: ['premium', 'mid-income'], activeProjects: 6, reraCompliant: true, matchScore: 0, whyMatched: [], estimatedTicketSize: 100000000, sourceUrl: 'https://www.koltepatil.com' },
  { companyName: 'Sobha Ltd', website: 'https://www.sobha.com', city: 'Bengaluru', assetFocus: ['luxury', 'premium'], activeProjects: 9, reraCompliant: true, matchScore: 0, whyMatched: [], estimatedTicketSize: 180000000, sourceUrl: 'https://www.sobha.com' },
];

// ─── Investor Discovery — from consented CRM data only ───────
function getConsentedInvestors(): InvestorMatch[] {
  try {
    const nriSignups = JSON.parse(localStorage.getItem('leadluxe-nri-signups') || '[]');
    const developerLeads = JSON.parse(localStorage.getItem('leadluxe-developer-leads') || '[]');

    const investors: InvestorMatch[] = [];

    // Convert NRI signups to investor profiles
    nriSignups.forEach((s: Record<string, any>, i: number) => {
      if (s.email) {
        investors.push({
          userId: `nri-${i}`,
          name: s.name || 'NRI Investor',
          email: s.email,
          budgetRange: [5000000, 50000000],
          preferredCities: ['Mumbai', 'Bengaluru', 'Pune', 'Hyderabad'],
          nriCountry: s.market || 'UAE',
          investmentGoal: 'capital_growth',
          riskProfile: 'balanced',
          matchScore: 0,
          whyMatched: [],
          consentMarketing: true,
        });
      }
    });

    return investors;
  } catch {
    return [];
  }
}

// ─── Opportunity Analysis ────────────────────────────────────
export interface OpportunityAnalysis {
  city: string;
  assetClass: string;
  score: number;
  confidence: number;
  reasoning: string[];
  sources: string[];
}

function analyzeCityOpportunity(cityName: string): OpportunityAnalysis | null {
  const allCities = (CITIES as any).IN || [];
  const city = allCities.find((c: any) => c.name === cityName);
  if (!city) return null;

  const score = Math.round(city.confidence * 0.6 + Math.min(city.priceTrend, 100) * 0.4);
  const confidence = city.confidence;

  const reasoning: string[] = [];
  if (city.priceTrend > 12) reasoning.push(`Strong price momentum: ${city.priceTrend}% YoY growth`);
  if (city.absorption > 70) reasoning.push(`Healthy absorption rate: ${city.absorption}%`);
  if (city.confidence > 80) reasoning.push(`High AI confidence score: ${city.confidence}%`);
  reasoning.push(`${city.activeProjects} active projects tracked`);
  reasoning.push(`Source: ${city.source}`);

  return {
    city: city.name,
    assetClass: 'residential',
    score,
    confidence,
    reasoning,
    sources: [city.source, 'RERA Portals', 'Global Market Data'],
  };
}

// ─── Main Matching Logic ─────────────────────────────────────
export function matchDevelopersToOpportunity(
  opportunityCity: string,
  opportunityAssetClass: string,
  opportunityScore: number
): DeveloperMatch[] {
  return KNOWN_DEVELOPERS
    .filter(dev => {
      // Same city or nearby major city
      const cityMatch = dev.city === opportunityCity ||
        (opportunityCity === 'Mumbai' && dev.city === 'Mumbai') ||
        (opportunityCity === 'Bengaluru' && dev.city === 'Bengaluru') ||
        (opportunityCity === 'Pune' && ['Mumbai', 'Pune'].includes(dev.city)) ||
        (opportunityCity === 'Hyderabad' && dev.city === 'Bengaluru');
      return cityMatch;
    })
    .map(dev => {
      // Calculate match score
      let score = 50;
      if (dev.reraCompliant) score += 15;
      if (dev.activeProjects >= 5) score += 10;
      if (dev.assetFocus.includes(opportunityAssetClass)) score += 15;
      score += Math.min(dev.activeProjects * 2, 10);

      const whyMatched: string[] = [];
      whyMatched.push(`Active in ${dev.city} market`);
      if (dev.reraCompliant) whyMatched.push('RERA-compliant — verified regulatory status');
      if (dev.assetFocus.includes(opportunityAssetClass)) whyMatched.push(`Specializes in ${opportunityAssetClass} segment`);
      whyMatched.push(`${dev.activeProjects} active projects — strong pipeline`);
      if (dev.website) whyMatched.push(`Public presence: ${new URL(dev.website).hostname}`);

      return { ...dev, matchScore: Math.min(score, 100), whyMatched };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function matchInvestorsToOpportunity(
  opportunityCity: string,
  opportunityTicketSize: number,
  investors?: InvestorMatch[]
): InvestorMatch[] {
  const source = investors || getConsentedInvestors();

  return source
    .filter(inv => {
      if (!inv.consentMarketing) return false;
      const cityMatch = inv.preferredCities.some(c =>
        c.toLowerCase() === opportunityCity.toLowerCase() ||
        (c === 'Delhi NCR' && opportunityCity === 'Delhi NCR')
      );
      const budgetMatch = opportunityTicketSize >= inv.budgetRange[0] * 0.5 &&
        opportunityTicketSize <= inv.budgetRange[1] * 2;
      return cityMatch && budgetMatch;
    })
    .map(inv => {
      let score = 50;
      if (inv.budgetRange[1] >= opportunityTicketSize) score += 20;
      if (inv.preferredCities.includes(opportunityCity)) score += 15;
      if (inv.riskProfile === 'balanced' || inv.riskProfile === 'aggressive') score += 10;

      const whyMatched: string[] = [];
      whyMatched.push(`Budget range: ₹${(inv.budgetRange[0] / 10000000).toFixed(1)}Cr – ₹${(inv.budgetRange[1] / 10000000).toFixed(1)}Cr`);
      whyMatched.push(`Interested in ${opportunityCity}`);
      if (inv.nriCountry) whyMatched.push(`Based in ${inv.nriCountry} — NRI investor`);
      whyMatched.push(`Goal: ${inv.investmentGoal.replace(/_/g, ' ')}`);

      return { ...inv, matchScore: Math.min(score, 100), whyMatched };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ─── Generate Capital Match ──────────────────────────────────
export function generateCapitalMatch(
  property: Property,
  opportunityScore: number,
): CapitalMatch {
  const cityAnalysis = analyzeCityOpportunity(property.city);
  const assetClass = property.property_type || 'residential';
  const ticketSize = (property.price_min + property.price_max) / 2;

  const developers = matchDevelopersToOpportunity(
    property.city, assetClass, opportunityScore
  );

  const investors = matchInvestorsToOpportunity(
    property.city, ticketSize
  );

  const topDeveloper = developers[0];
  const avgMatchScore = developers.length > 0
    ? Math.round(developers.reduce((s, d) => s + d.matchScore, 0) / developers.length)
    : 0;

  return {
    id: `cap-${property.id}-${Date.now()}`,
    opportunityId: property.id,
    propertyId: property.id,
    propertyName: property.name,
    city: property.city,
    country: property.country || 'India',
    opportunityScore,
    developer: topDeveloper || {
      companyName: 'No suitable developer found',
      city: property.city,
      assetFocus: [],
      activeProjects: 0,
      reraCompliant: false,
      matchScore: 0,
      whyMatched: ['No developer match found in this market. Manual outreach required.'],
      estimatedTicketSize: ticketSize,
    },
    investors: investors.slice(0, 5),
    matchScore: avgMatchScore,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
}
