import type { Lead } from '../types';

export interface ScoreResult {
  score: number;
  category: 'hot' | 'warm' | 'warmish' | 'cold';
  factors: {
    budgetScore: number;
    urgencyScore: number;
    engagementScore: number;
    sourceScore: number;
    locationScore: number;
    propertyScore: number;
    completenessScore: number;
  };
  details: string[];
  recommendations: string[];
}

// Weights for each scoring dimension
const WEIGHTS = {
  budget: 0.25,       // 25%
  urgency: 0.20,      // 20%
  engagement: 0.15,   // 15%
  source: 0.10,       // 10%
  location: 0.10,     // 10%
  property: 0.10,     // 10%
  completeness: 0.10, // 10%
};

// Premium property locations in India
const PREMIUM_LOCATIONS = [
  'south mumbai', 'bandra', 'juhu', 'worli', 'malabar hill', 'johar town',
  'dlf', 'gurgaon', 'whitefield', 'indiranagar', 'koramangala',
  'powai', 'thane west', 'wakad', 'hinjewadi', 'baner',
  'gachibowli', 'hitech city', 'kondapur', 'madhapur',
  'salt lake', 'new town', 'rajarhat',
];

const URGENCY_KEYWORDS: [string, number][] = [
  ['immediate', 25], ['asap', 25], ['urgent', 25], ['today', 25],
  ['this week', 22], ['tonight', 22],
  ['this month', 18], ['within 2 week', 18], ['within 15 day', 18],
  ['next month', 14], ['next week', 14],
  ['30 day', 10], ['1 month', 10], ['this quarter', 10],
  ['3 month', 6], ['exploring', 4], ['no rush', 3], ['browsing', 3],
  ['just looking', 2], ['not sure', 2],
];

const LOCATION_PREMIUM_MAP: Record<string, number> = {
  'mumbai': 28, 'bandra': 30, 'juhu': 30, 'worli': 28, 'powai': 25,
  'gurgaon': 26, 'dlf': 28, 'delhi': 25, 'south delhi': 27,
  'bangalore': 24, 'whitefield': 25, 'indiranagar': 26,
  'kolkata': 22, 'new town': 24,
  'pune': 22, 'wakad': 23, 'hinjewadi': 22,
  'hyderabad': 22, 'gachibowli': 24, 'hitech city': 24,
  'chennai': 22, 'noida': 20, 'thane': 20,
};

export function calculateLeadScore(lead: Partial<Lead>): ScoreResult {
  const factors = {
    budgetScore: calculateBudgetScore(lead.budget),
    urgencyScore: calculateUrgencyScore(lead.visit_timeline),
    engagementScore: calculateEngagementScore(lead),
    sourceScore: calculateSourceScore(lead.source, lead),
    locationScore: calculateLocationScore(lead.preferred_location),
    propertyScore: calculatePropertyScore(lead.property_type, lead.budget),
    completenessScore: calculateCompletenessScore(lead),
  };

  const weightedScore = Math.round(
    factors.budgetScore * WEIGHTS.budget +
    factors.urgencyScore * WEIGHTS.urgency +
    factors.engagementScore * WEIGHTS.engagement +
    factors.sourceScore * WEIGHTS.source +
    factors.locationScore * WEIGHTS.location +
    factors.propertyScore * WEIGHTS.property +
    factors.completenessScore * WEIGHTS.completeness
  );

  const details = generateDetails(factors, lead);
  const recommendations = generateRecommendations(factors, weightedScore);

  const score = Math.min(Math.max(weightedScore, 0), 100);
  const category = score >= 75 ? 'hot' : score >= 55 ? 'warm' : score >= 35 ? 'warmish' : 'cold';

  return { score, category, factors, details, recommendations };
}

function calculateBudgetScore(budget?: number): number {
  if (!budget) return 20;
  if (budget >= 50000000) return 95; // 5 Cr+
  if (budget >= 25000000) return 90; // 2.5 Cr+
  if (budget >= 10000000) return 85; // 1 Cr+
  if (budget >= 5000000) return 75;  // 50 L+
  if (budget >= 2000000) return 60;  // 20 L+
  if (budget >= 1000000) return 45;  // 10 L+
  if (budget >= 500000) return 30;   // 5 L+
  return 20;
}

function calculateUrgencyScore(timeline?: string): number {
  if (!timeline) return 25;
  const tl = timeline.toLowerCase();
  for (const [keyword, score] of URGENCY_KEYWORDS) {
    if (tl.includes(keyword)) return score;
  }
  return 12;
}

function calculateEngagementScore(lead: Partial<Lead>): number {
  let score = 30;
  if (lead.email) score += 10;
  if (lead.phone) score += 10;
  if (lead.notes) score += 10;
  if (lead.preferred_location) score += 10;
  if (lead.budget && lead.budget > 0) score += 15;
  if (lead.property_type) score += 10;
  if (lead.visit_timeline) score += 5;
  return Math.min(score, 100);
}

function calculateSourceScore(source?: string, lead?: Partial<Lead>): number {
  switch (source) {
    case 'whatsapp': return 85;
    case 'phone': return 90;
    case 'referral': return 95;
    case 'website': return lead?.email ? 65 : 50;
    case 'social_media': return 55;
    case 'email': return 70;
    default: return 40;
  }
}

function calculateLocationScore(location?: string): number {
  if (!location) return 30;
  const loc = location.toLowerCase();
  for (const [area, score] of Object.entries(LOCATION_PREMIUM_MAP)) {
    if (loc.includes(area)) return score;
  }
  if (PREMIUM_LOCATIONS.some((p) => loc.includes(p))) return 28;
  // Metro cities
  if (loc.includes('mumbai') || loc.includes('delhi') || loc.includes('bangalore')) return 25;
  if (loc.includes('pune') || loc.includes('hyderabad') || loc.includes('chennai')) return 22;
  if (loc.includes('kolkata') || loc.includes('ahmedabad')) return 20;
  return 18;
}

function calculatePropertyScore(propertyType?: string, budget?: number): number {
  let score = 30;
  switch (propertyType?.toLowerCase()) {
    case 'penthouse': score = 90; break;
    case 'villa': score = 80; break;
    case 'bungalow': score = 80; break;
    case 'apartment': score = 60; break;
    case 'studio': score = 40; break;
    case 'commercial': score = 50; break;
    case 'plot': case 'land': score = 35; break;
    default: score = 30;
  }
  // If high budget + luxury type = bonus
  if (budget && budget >= 10000000 && score >= 80) score += 10;
  return Math.min(score, 100);
}

function calculateCompletenessScore(lead: Partial<Lead>): number {
  let filled = 0;
  const fields = ['name', 'phone', 'email', 'budget', 'preferred_location', 'property_type', 'visit_timeline', 'source'];
  for (const field of fields) {
    if (lead[field as keyof typeof lead]) filled++;
  }
  return Math.round((filled / fields.length) * 100);
}

function generateDetails(factors: ScoreResult['factors'], lead: Partial<Lead>): string[] {
  const details: string[] = [];

  if (lead.budget && lead.budget >= 10000000) details.push('💰 Premium budget segment');
  if (lead.budget && lead.budget >= 5000000 && lead.budget < 10000000) details.push('💵 High-value budget');
  if (lead.visit_timeline) {
    const tl = lead.visit_timeline.toLowerCase();
    if (['immediate', 'asap', 'this week'].some((w) => tl.includes(w))) {
      details.push('⏰ Express urgency — immediate visit needed');
    }
  }
  if (lead.source === 'referral') details.push('🤝 Trust-based referral lead');
  if (lead.source === 'whatsapp') details.push('💬 High-intent WhatsApp inquiry');
  if (lead.preferred_location) {
    const loc = lead.preferred_location.toLowerCase();
    if (PREMIUM_LOCATIONS.some((p) => loc.includes(p))) {
      details.push('📍 Premium location interest');
    }
  }
  if (lead.email && lead.phone) details.push('📋 Complete contact information');

  return details;
}

function generateRecommendations(factors: ScoreResult['factors'], score: number): string[] {
  const recs: string[] = [];
  if (score >= 75) {
    recs.push('📞 Call immediately — high conversion probability');
    recs.push('🏗️ Offer exclusive site visit this week');
    recs.push('💎 Share premium project portfolio');
  } else if (score >= 55) {
    recs.push('📱 WhatsApp follow-up within 2 hours');
    recs.push('📧 Send property brochure and pricing');
    recs.push('📅 Suggest weekend site visit');
  } else if (score >= 35) {
    recs.push('📧 Nurture with email sequence');
    recs.push('📱 Connect on WhatsApp for updates');
    recs.push('🏷️ Share ongoing offers and discounts');
  } else {
    recs.push('📧 Add to monthly newsletter');
    recs.push('📱 Retarget with social media ads');
    recs.push('📋 Keep in long-term nurture campaign');
  }
  return recs;
}

export function getLeadCategory(score: number): {
  label: string;
  color: string;
  priority: string;
} {
  if (score >= 75) {
    return {
      label: 'Hot Lead 🔥',
      color: 'text-red-400 bg-red-500/15',
      priority: 'Immediate follow-up within 30 min',
    };
  } else if (score >= 55) {
    return {
      label: 'Warm Lead ⚡',
      color: 'text-amber-400 bg-amber-500/15',
      priority: 'Contact within 2 hours',
    };
  } else if (score >= 35) {
    return {
      label: 'Warm-ish 🌤️',
      color: 'text-yellow-400 bg-yellow-500/15',
      priority: 'Nurture with content sequence',
    };
  } else {
    return {
      label: 'Cold Lead ❄️',
      color: 'text-gray-400 bg-gray-500/15',
      priority: 'Long-term nurture campaign',
    };
  }
}
