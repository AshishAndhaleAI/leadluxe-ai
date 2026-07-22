// ============================================================
// AI Opportunity Engine
// Generates opportunities from signals with confidence scoring
// ============================================================

import type { Developer, Project, Signal, Opportunity, AIRecommendation, TimelineEvent } from '../types';

const COMMISSION_RATE = 0.03;

interface EngineInput {
  developer: Developer;
  project?: Project;
  signals: Signal[];
}

interface EngineOutput {
  title: string;
  summary: string;
  estimatedValue: number;
  confidenceScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string[];
  recommendedActions: string[];
  nextBestAction: string;
  bestContactDay: string;
  bestContactChannel: string;
  bestFollowupTiming: string;
  closingProbability: number;
  potentialObjections: string[];
  suggestedPitch: string;
  timelineEvents: TimelineEvent[];
  estimatedCommission: number;
}

// =====================
// SCORING WEIGHTS
// =====================
const WEIGHTS = {
  developerStrength: 0.20,
  projectReadiness: 0.20,
  signalStrength: 0.25,
  marketTiming: 0.15,
  financialCapability: 0.10,
  relationshipProximity: 0.10,
};

// =====================
// MAIN ENGINE
// =====================
export function analyzeOpportunity(input: EngineInput): EngineOutput {
  const { developer, project, signals } = input;

  // Calculate individual scores
  const developerScore = scoreDeveloper(developer);
  const projectScore = project ? scoreProject(project) : 50;
  const signalScore = scoreSignals(signals);
  const marketScore = scoreMarketTiming(developer, signals);
  const financialScore = scoreFinancialCapability(developer);
  const relationshipScore = scoreRelationshipProximity(signals);

  // Weighted confidence
  const confidenceScore = Math.round(
    developerScore * WEIGHTS.developerStrength +
    projectScore * WEIGHTS.projectReadiness +
    signalScore * WEIGHTS.signalStrength +
    marketScore * WEIGHTS.marketTiming +
    financialScore * WEIGHTS.financialCapability +
    relationshipScore * WEIGHTS.relationshipProximity
  );

  const clampedScore = Math.min(Math.max(confidenceScore, 0), 100);

  // Determine priority
  const priority = clampedScore >= 85 ? 'critical'
    : clampedScore >= 70 ? 'high'
    : clampedScore >= 50 ? 'medium'
    : 'low';

  // Estimate project value
  const estimatedValue = estimateProjectValue(developer, project, signals);

  // Generate reasoning
  const reasoning = generateReasoning(developer, project, signals, clampedScore);

  // Generate recommendations
  const recommendedActions = generateRecommendations(developer, clampedScore, signals);

  // Generate AI recommendation
  const aiRec = generateAIRecommendation(clampedScore, developer, signals);

  // Generate timeline
  const timelineEvents = generateTimeline(developer, project, signals);

  // Generate title and summary
  const title = generateTitle(developer, project);
  const summary = generateSummary(developer, project, signals, estimatedValue, clampedScore);

  // Best practices
  const { bestContactDay, bestContactChannel, bestFollowupTiming } = getBestPractices(developer, signals);

  // Potential objections
  const potentialObjections = generateObjections(developer, estimatedValue);

  // Suggested pitch
  const suggestedPitch = generatePitch(developer, project, estimatedValue, clampedScore);

  return {
    title,
    summary,
    estimatedValue,
    confidenceScore: clampedScore,
    priority,
    reasoning,
    recommendedActions,
    nextBestAction: recommendedActions[0] || 'Contact developer for initial discussion',
    bestContactDay,
    bestContactChannel,
    bestFollowupTiming,
    closingProbability: clampedScore / 100,
    potentialObjections,
    suggestedPitch,
    timelineEvents,
    estimatedCommission: estimatedValue * COMMISSION_RATE,
  };
}

// =====================
// SCORING FUNCTIONS
// =====================
function scoreDeveloper(dev: Developer): number {
  let score = 50;

  // Builder type
  if (dev.builder_type === 'public') score += 20;
  else if (dev.builder_type === 'private') score += 15;

  // Pricing segment
  if (dev.pricing_segment === 'luxury' || dev.pricing_segment === 'ultra_luxury') score += 15;
  else if (dev.pricing_segment === 'premium') score += 10;

  // Growth rate
  if (dev.growth_rate && dev.growth_rate > 20) score += 15;
  else if (dev.growth_rate && dev.growth_rate > 10) score += 10;

  // Active projects
  if (dev.active_projects >= 5) score += 10;
  else if (dev.active_projects >= 2) score += 5;

  // Hiring trend
  if (dev.hiring_trend === 'increasing') score += 10;

  // Track record
  if (dev.total_units_delivered > 10000) score += 10;
  else if (dev.total_units_delivered > 5000) score += 7;
  else if (dev.total_units_delivered > 1000) score += 5;

  return Math.min(score, 100);
}

function scoreProject(project: Project): number {
  let score = 40;

  if (project.status === 'pre_launch') score += 25;
  else if (project.status === 'launched') score += 20;
  else if (project.status === 'ongoing_construction') score += 15;

  if (project.rera_status === 'approved') score += 20;
  else if (project.rera_status === 'applied') score += 10;

  if (project.price_range_max && project.price_range_max >= 10000000) score += 15;

  return Math.min(score, 100);
}

function scoreSignals(signals: Signal[]): number {
  if (signals.length === 0) return 30;

  let score = 30;
  const highImpact = signals.filter(s => s.impact_level === 'critical' || s.impact_level === 'high').length;
  const recentSignals = signals.filter(s => {
    const days = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  }).length;

  score += highImpact * 8;
  score += recentSignals * 3;
  score += Math.min(signals.length * 2, 20);

  // Signal type bonuses
  const types = new Set(signals.map(s => s.signal_type));
  if (types.has('rera_filing')) score += 10;
  if (types.has('government_approval')) score += 10;
  if (types.has('land_acquisition')) score += 8;
  if (types.has('funding_raised')) score += 12;

  return Math.min(score, 100);
}

function scoreMarketTiming(dev: Developer, signals: Signal[]): number {
  let score = 40;

  if (dev.hiring_trend === 'increasing') score += 15;

  const hasExpansion = dev.expansion_plans && dev.expansion_plans.length > 0;
  if (hasExpansion) score += 15;

  const recentSignals = signals.filter(s => {
    const days = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 14;
  }).length;

  score += recentSignals * 5;

  return Math.min(score, 100);
}

function scoreFinancialCapability(dev: Developer): number {
  let score = 40;

  if (dev.funding_info) score += 20;
  if (dev.builder_type === 'public') score += 20;
  if (dev.growth_rate && dev.growth_rate > 15) score += 15;
  if (dev.annual_revenue && dev.annual_revenue > 500000000) score += 15;

  const hasFundingSignal = dev.funding_info && dev.funding_info.length > 0;
  if (hasFundingSignal) score += 10;

  return Math.min(score, 100);
}

function scoreRelationshipProximity(signals: Signal[]): number {
  if (signals.length === 0) return 30;

  let score = 30;

  const signalCount = Math.min(signals.length, 10);
  score += signalCount * 3;

  const hasDirect = signals.some(s => s.signal_type === 'partnership' || s.signal_type === 'award_recognition');
  if (hasDirect) score += 15;

  const hasHiring = signals.some(s => s.signal_type === 'builder_hiring');
  if (hasHiring) score += 10;

  return Math.min(score, 100);
}

// =====================
// VALUE ESTIMATION
// =====================
function estimateProjectValue(dev: Developer, project?: Project, signals?: Signal[]): number {
  if (project?.price_range_max) return project.price_range_max;

  // Estimate from developer profile
  const baseValues: Record<string, number> = {
    ultra_luxury: 50000000,
    luxury: 25000000,
    premium: 10000000,
    mid_range: 5000000,
    budget: 2000000,
  };

  let base = baseValues[dev.pricing_segment || 'mid_range'] || 5000000;

  // Scale by project count
  if (dev.active_projects > 10) base *= 1.5;
  else if (dev.active_projects > 5) base *= 1.3;

  // Scale by growth
  if (dev.growth_rate && dev.growth_rate > 20) base *= 1.4;
  else if (dev.growth_rate && dev.growth_rate > 10) base *= 1.2;

  return Math.round(base);
}

// =====================
// REASONING GENERATION
// =====================
function generateReasoning(dev: Developer, project: Project | undefined, signals: Signal[], score: number): string[] {
  const reasons: string[] = [];

  if (dev.builder_type === 'public') {
    reasons.push(`${dev.name} is a publicly listed company with strong financial transparency and governance`);
  }

  if (dev.pricing_segment === 'luxury' || dev.pricing_segment === 'ultra_luxury') {
    reasons.push(`${dev.pricing_segment === 'ultra_luxury' ? 'Ultra-luxury' : 'Luxury'} developer — high-value deals with premium margins`);
  }

  if (dev.growth_rate && dev.growth_rate > 15) {
    reasons.push(`Strong growth trajectory (${dev.growth_rate}% YoY) — expanding rapidly`);
  }

  if (dev.hiring_trend === 'increasing') {
    reasons.push(`Actively hiring (${dev.hiring_count} openings) — scaling operations for new projects`);
  }

  if (dev.expansion_plans && dev.expansion_plans.length > 0) {
    reasons.push(`Expanding into new markets: ${dev.expansion_plans.slice(0, 2).join(', ')}`);
  }

  if (project) {
    if (project.status === 'pre_launch') {
      reasons.push(`Project in pre-launch phase — ideal timing for early engagement`);
    }
    if (project.rera_status === 'approved') {
      reasons.push(`RERA approved — regulatory compliance confirmed`);
    }
  }

  const highImpactSignals = signals.filter(s => s.impact_level === 'critical' || s.impact_level === 'high');
  for (const signal of highImpactSignals.slice(0, 3)) {
    reasons.push(`${signal.title} — ${signal.description?.slice(0, 100)}`);
  }

  if (score >= 85) reasons.push('🔥 High confidence opportunity — prioritize immediate action');
  else if (score >= 70) reasons.push('⚡ Strong opportunity — engage within this week');
  else if (score >= 50) reasons.push('📊 Moderate opportunity — nurture and monitor signals');

  return reasons;
}

// =====================
// RECOMMENDATIONS
// =====================
function generateRecommendations(dev: Developer, score: number, signals: Signal[]): string[] {
  const actions: string[] = [];

  if (score >= 85) {
    actions.push('📞 Initiate contact within 24 hours — high-value time-sensitive opportunity');
    actions.push('📄 Prepare customized proposal with commission structure breakdown');
    actions.push('🏗️ Schedule executive meeting to discuss partnership terms');
    if (dev.expansion_plans?.length) actions.push(`📍 Focus on ${dev.expansion_plans[0]} market entry support`);
  } else if (score >= 70) {
    actions.push('📱 Send introduction email and company profile within 3 days');
    actions.push('📊 Share relevant case studies from similar developers');
    actions.push('📅 Suggest exploratory call to understand their pipeline needs');
  } else if (score >= 50) {
    actions.push('📧 Add to monthly monitoring list for signal tracking');
    actions.push('🔍 Research developer background and recent activities');
    actions.push('📋 Prepare preliminary opportunity assessment');
  } else {
    actions.push('👀 Monitor for additional signals before engaging');
    actions.push('📋 Add to long-term watchlist');
  }

  // Signal-based recommendations
  if (signals.some(s => s.signal_type === 'rera_filing')) {
    actions.push('📋 Request project RERA details for due diligence');
  }
  if (signals.some(s => s.signal_type === 'funding_raised')) {
    actions.push('💰 Leverage recent funding — developer has capital for new projects');
  }
  if (signals.some(s => s.signal_type === 'builder_hiring')) {
    actions.push('👥 Connect with new hires on LinkedIn for relationship building');
  }

  return actions.slice(0, 5);
}

// =====================
// AI RECOMMENDATION DETAILS
// =====================
function generateAIRecommendation(score: number, dev: Developer, signals: Signal[]): AIRecommendation {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const channels = ['Email', 'Phone', 'LinkedIn', 'WhatsApp', 'In-Person Meeting'];

  // Best day: mid-week is statistically best for B2B
  const bestContactDay = score >= 80 ? 'Tuesday' : score >= 60 ? 'Wednesday' : 'Thursday';

  // Best channel: depends on signals
  const bestContactChannel = signals.some(s => s.signal_type === 'partnership') ? 'In-Person Meeting'
    : score >= 80 ? 'Phone'
    : 'Email';

  const bestFollowupTiming = score >= 80 ? 'Within 24 hours'
    : score >= 70 ? 'Within 3 days'
    : score >= 50 ? 'Within 1 week'
    : 'Within 2 weeks';

  const closingProbability = Math.round((score / 100) * 100) / 100;

  const potentialObjections = generateObjections(dev, 0);
  const suggestedPitch = generatePitch(dev, undefined, 0, score);

  return {
    bestContactDay,
    bestContactChannel,
    bestFollowupTiming,
    closingProbability,
    potentialObjections,
    suggestedPitch,
    nextBestAction: score >= 70 ? `Contact ${dev.name} via ${bestContactChannel} on ${bestContactDay}`
      : `Monitor ${dev.name}'s activities and wait for stronger signals`,
  };
}

function generateObjections(dev: Developer, estimatedValue: number): string[] {
  const objections: string[] = [];

  if (dev.builder_type === 'public') {
    objections.push('May require formal RFP process and board approval');
    objections.push('Longer decision-making cycle due to Stakeholder alignment');
  }
  if (dev.pricing_segment === 'luxury' || dev.pricing_segment === 'ultra_luxury') {
    objections.push('May already have preferred partner relationships');
    objections.push('Higher expectation for service quality and exclusivity');
  }
  if (dev.annual_revenue && dev.annual_revenue > 1000000000) {
    objections.push('Large organization — may be hard to reach decision-makers');
  }

  objections.push('Competing platforms may already be engaged');
  objections.push('May prefer in-house lead management');

  return objections;
}

function generatePitch(dev: Developer, project: Project | undefined, estimatedValue: number, score: number): string {
  const value = estimatedValue > 0 ? `₹${(estimatedValue / 10000000).toFixed(1)} Cr` : 'your upcoming';
  const segment = dev.pricing_segment?.replace('_', ' ') || 'premium';

  return `"Hello ${dev.name} team,

We've been following your impressive work in ${dev.city || 'the real estate sector'} — especially your ${project?.name || 'recent developments'} in the ${segment} segment.

LeadLuxe AI can help you convert more leads into bookings with zero upfront cost. We only earn a 3% success fee when a deal closes.

With your current growth trajectory (${dev.growth_rate || 'strong'}% YoY), I believe we could add significant value to your sales pipeline.

Would you be open to a 15-minute call this ${score >= 80 ? 'Tuesday' : 'Wednesday'} to explore how we can help close more deals?

Best regards,
[AIM] — LeadLuxe AI"`;
}

function getBestPractices(dev: Developer, signals: Signal[]): { bestContactDay: string; bestContactChannel: string; bestFollowupTiming: string } {
  const score = scoreDeveloper(dev);
  return {
    bestContactDay: score >= 70 ? 'Tuesday' : 'Wednesday',
    bestContactChannel: signals.some(s => s.signal_type === 'partnership') ? 'In-Person Meeting' : 'Email',
    bestFollowupTiming: score >= 70 ? 'Within 48 hours' : 'Within 1 week',
  };
}

// =====================
// TIMELINE GENERATION
// =====================
function generateTimeline(dev: Developer, project: Project | undefined, signals: Signal[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const now = new Date();

  // Add signal-based events
  for (const signal of signals.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
    const days = Math.round((now.getTime() - new Date(signal.created_at).getTime()) / (1000 * 60 * 60 * 24));

    events.push({
      id: `timeline-${signal.id}`,
      type: 'signal',
      title: signal.title,
      description: signal.description || '',
      date: signal.created_at,
      icon: getSignalIcon(signal.signal_type),
      isCompleted: true,
      isCurrent: false,
      impact: signal.impact_level,
    });
  }

  // Add standard milestones
  const milestones = getMilestones(dev, project);
  for (const milestone of milestones) {
    const eventDate = new Date(milestone.date);
    const isPast = eventDate <= now;
    const daysUntil = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isCurrent = daysUntil <= 14 && daysUntil >= 0;

    events.push({
      id: `milestone-${milestone.id}`,
      type: 'milestone',
      title: milestone.title,
      description: milestone.description,
      date: milestone.date,
      icon: milestone.icon,
      isCompleted: isPast,
      isCurrent,
      impact: 'high',
    });
  }

  // Add recommended actions as future events
  events.push({
    id: 'action-contact',
    type: 'action',
    title: 'Initial Contact',
    description: `Reach out to ${dev.name} via preferred channel`,
    date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '📞',
    isCompleted: false,
    isCurrent: true,
    impact: 'high',
  });

  events.push({
    id: 'action-proposal',
    type: 'action',
    title: 'Submit Proposal',
    description: 'Present commission structure and partnership terms',
    date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '📄',
    isCompleted: false,
    isCurrent: false,
    impact: 'high',
  });

  events.push({
    id: 'action-close',
    type: 'action',
    title: 'Expected Closure',
    description: 'Target deal closure based on confidence score',
    date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '🎯',
    isCompleted: false,
    isCurrent: false,
    impact: 'medium',
  });

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getSignalIcon(type: string): string {
  const icons: Record<string, string> = {
    rera_filing: '📋',
    government_approval: '✅',
    land_acquisition: '🏗️',
    builder_hiring: '👥',
    funding_raised: '💰',
    project_launch: '🚀',
    partnership: '🤝',
    expansion: '📈',
    market_trend: '📊',
    news_coverage: '📰',
    permit_issued: '📜',
    construction_start: '🏗️',
    price_change: '💹',
    management_change: '🔄',
    legal_update: '⚖️',
    award_recognition: '🏆',
  };
  return icons[type] || '📌';
}

function getMilestones(dev: Developer, project: Project | undefined): { id: string; title: string; description: string; date: string; icon: string }[] {
  const milestones: { id: string; title: string; description: string; date: string; icon: string }[] = [];
  const now = new Date();

  if (dev.founded_year) {
    milestones.push({
      id: 'founded',
      title: 'Company Founded',
      description: `${dev.name} established in ${dev.founded_year}`,
      date: new Date(dev.founded_year, 0, 1).toISOString(),
      icon: '🏢',
    });
  }

  milestones.push({
    id: 'track-record',
    title: 'Track Record Established',
    description: `Delivered ${dev.total_units_delivered} units across ${dev.total_projects} projects`,
    date: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '📈',
  });

  if (dev.active_projects > 0) {
    milestones.push({
      id: 'active-projects',
      title: `${dev.active_projects} Active Projects`,
      description: `Currently developing ${dev.active_projects} projects across various segments`,
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      icon: '🏗️',
    });
  }

  if (project?.status === 'pre_launch' || project?.status === 'launched') {
    milestones.push({
      id: 'project-milestone',
      title: `${project.name} — ${project.status === 'pre_launch' ? 'Pre-Launch' : 'Launched'}`,
      description: `New project opportunity in ${project.city || 'development'} phase`,
      date: now.toISOString(),
      icon: '🚀',
    });
  }

  return milestones;
}

// =====================
// TITLE AND SUMMARY
// =====================
function generateTitle(dev: Developer, project?: Project): string {
  if (project) {
    return `${project.name} — ${dev.name}`;
  }
  return `${dev.name} — Development Opportunity`;
}

function generateSummary(dev: Developer, project: Project | undefined, signals: Signal[], estimatedValue: number, score: number): string {
  const value = estimatedValue > 0 ? `₹${(estimatedValue / 10000000).toFixed(1)} Cr` : 'significant';
  const signalSummary = signals.length > 0
    ? `${signals.length} signals detected including ${signals.slice(0, 3).map(s => s.signal_type.replace(/_/g, ' ')).join(', ')}`
    : 'Initial opportunity — monitoring for signals';

  return `${dev.name} (${dev.city || 'Location TBD'}) — ${value} estimated deal value. ${signalSummary}. Confidence: ${score}%. ${project ? `Project: ${project.name} (${project.status?.replace(/_/g, ' ') || 'N/A'}).` : ''}`;
}
