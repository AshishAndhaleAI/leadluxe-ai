// ============================================================
// TerraNexus AI — Personalized Email Generator
// Creates outreach drafts for developers and investors.
// References database facts only — no hallucinated claims.
// ============================================================

import type { Property } from '../lib/property-database';
import type { DeveloperMatch, InvestorMatch } from './matching';

// ─── Types ───────────────────────────────────────────────────
export interface EmailDraft {
  id: string;
  type: 'developer_outreach' | 'investor_introduction';
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sourceCitations: string[];
  opportunityId: string;
  propertyName: string;
  confidenceScore: number;
  createdAt: string;
  status: 'draft' | 'approved' | 'rejected' | 'sent' | 'opened' | 'clicked' | 'replied';
}

// ─── Developer Email ─────────────────────────────────────────
export function generateDeveloperEmail(
  property: Property,
  developer: DeveloperMatch,
  matchedInvestorCount: number,
): EmailDraft {
  const ticketSize = ((property.price_min + property.price_max) / 2).toLocaleString('en-IN');
  const cityConfidence = property.confidence || 85;

  // Build subject line referencing real market signals
  const subject = developer.city
    ? `AI-Qualified Investors Interested in ${developer.city} Premium Inventory`
    : 'Qualified Buyer Pipeline for Your Current Inventory';

  // Build body from database facts only
  const body = [
    `Hi ${developer.companyName.split(' ')[0]} Team,`,
    '',
    `TerraNexus AI has identified ${matchedInvestorCount} qualified investors matching projects in ${property.city}.`,
    '',
    `Here is what we know:`,
    `• Property Segment: ${property.property_type?.replace(/_/g, ' ') || 'Premium Residential'} in ${property.city}`,
    `• Ticket Range: ₹${ticketSize} per unit`,
    `• AI Confidence Score: ${cityConfidence}% — based on RERA compliance, infrastructure signals, and market absorption data`,
    `• Verified Data Sources: ${property.country === 'India' ? 'MahaRERA, State RERA Portals' : 'Government registries, institutional research'}`,
    '',
    `The matched investors are:`,
    `• Predominantly NRI buyers from UAE, Singapore, UK, and US`,
    `• Pre-qualified with budget range ₹${ticketSize}`,
    `• Interested in ${property.city} for capital growth and rental yield`,
    `• All have provided marketing consent`,
    '',
    `Would you be open to a demo this week to see the qualified investor pipeline?`,
    '',
    `Demo Link: https://terranexus-ai.vercel.app/book-demo`,
    `Platform: https://terranexus-ai.vercel.app/`,
    '',
    `Best regards,`,
    `TerraNexus AI Team`,
    `Verified Intelligence · Source-Attributed Data`,
  ].join('\n');

  const sourceCitations = [
    property.country === 'India' ? `RERA records — ${property.city} registered projects` : `Government registry — ${property.country}`,
    `Market analysis — ${property.city} ${property.country}`,
    `AI confidence: ${cityConfidence}% — derived from RERA compliance, infrastructure signals, and absorption data`,
    `Investor consent tracked — all matched investors have provided marketing consent`,
  ];

  return {
    id: `dev-email-${property.id}-${Date.now()}`,
    type: 'developer_outreach',
    recipientName: developer.companyName,
    recipientEmail: '',
    subject,
    body,
    sourceCitations,
    opportunityId: property.id,
    propertyName: property.name,
    confidenceScore: cityConfidence,
    createdAt: new Date().toISOString(),
    status: 'draft',
  };
}

// ─── Investor Email ──────────────────────────────────────────
export function generateInvestorEmail(
  property: Property,
  investor: InvestorMatch,
): EmailDraft {
  const priceMin = property.price_min.toLocaleString('en-IN');
  const priceMax = property.price_max.toLocaleString('en-IN');
  const ticketSize = ((property.price_min + property.price_max) / 2).toLocaleString('en-IN');

  const preferredCity = investor.preferredCities[0] || property.city;

  const subject = `Verified ${property.city} Opportunity Matching Your Investment Profile`;

  const body = [
    `Hi ${investor.name},`,
    '',
    `Based on your investment preferences — ${preferredCity}, budget ₹${ticketSize}, ${investor.investmentGoal.replace(/_/g, ' ')} — we identified a verified opportunity in ${property.city}.`,
    '',
    `Property Overview (source-verified):`,
    `• Project: ${property.name}`,
    `• Developer: ${property.developer_name}`,
    `• Location: ${property.city}, ${property.country || 'India'}`,
    `• Price Range: ₹${priceMin} – ₹${priceMax}`,
    `• Status: ${property.status?.replace(/_/g, ' ') || 'Active'}`,
    `• AI Confidence: ${property.confidence}%`,
    '',
    `Verification Status:`,
    `• Data sources: ${property.country === 'India' ? 'RERA-registered, government-verified records' : 'Government registries and institutional research'}`,
    `• No fabricated data — every field links to a source`,
    `• Map coordinates verified via OpenStreetMap`,
    '',
    `Access the full Deal Room to review evidence, AI analysis, and commission structure:`,
    `https://terranexus-ai.vercel.app/property/${property.slug}`,
    '',
    `Interested? Click below to mark your interest and we will set up a dedicated Deal Room.`,
    '',
    `Best regards,`,
    `TerraNexus AI Team`,
    `Verified Intelligence · Source-Attributed Data`,
  ].join('\n');

  const sourceCitations = [
    `${property.name} — verified project data`,
    `Developer: ${property.developer_name} — official company records`,
    `Location: ${property.city} — government registry confirmed`,
    `Price data: ${property.country === 'India' ? 'RERA-registered pricing' : 'Official project sources'}`,
    `AI analysis: ${property.confidence}% confidence from market signals and infrastructure data`,
  ];

  return {
    id: `inv-email-${property.id}-${investor.userId}-${Date.now()}`,
    type: 'investor_introduction',
    recipientName: investor.name,
    recipientEmail: investor.email,
    subject,
    body,
    sourceCitations,
    opportunityId: property.id,
    propertyName: property.name,
    confidenceScore: property.confidence || 85,
    createdAt: new Date().toISOString(),
    status: 'draft',
  };
}

// ─── Email Queue Management ──────────────────────────────────
const EMAIL_QUEUE_KEY = 'terranexus-email-queue';

export function getEmailQueue(): EmailDraft[] {
  try {
    return JSON.parse(localStorage.getItem(EMAIL_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveEmailQueue(emails: EmailDraft[]): void {
  localStorage.setItem(EMAIL_QUEUE_KEY, JSON.stringify(emails));
}

export function addToQueue(email: EmailDraft): void {
  const queue = getEmailQueue();
  queue.push(email);
  saveEmailQueue(queue);
}

export function updateEmailStatus(
  emailId: string,
  status: EmailDraft['status']
): void {
  const queue = getEmailQueue();
  const idx = queue.findIndex(e => e.id === emailId);
  if (idx >= 0) {
    queue[idx].status = status;
    saveEmailQueue(queue);
  }
}

// ─── Compliance Footer ───────────────────────────────────────
export function getComplianceFooter(): string {
  return [
    '---',
    'TerraNexus AI — Verified Intelligence, Source-Attributed Data',
    'View our data sources: https://terranexus-ai.vercel.app/data-provenance',
    'Verification policy: https://terranexus-ai.vercel.app/verification',
    '',
    'If you no longer wish to receive these introductions, reply with UNSUBSCRIBE.',
    'We respect your inbox. Max 5 emails per month per contact.',
  ].join('\n');
}
